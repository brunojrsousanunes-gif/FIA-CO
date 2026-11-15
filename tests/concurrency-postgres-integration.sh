#!/usr/bin/env bash
set -euo pipefail
PGHOST="$(printenv PGHOST || printf localhost)"
PGPORT="$(printenv PGPORT || printf 5432)"
PGUSER="$(printenv PGUSER || printf postgres)"
PGDATABASE="$(printenv PGDATABASE || printf fia_inventory_test)"
PGPASSWORD="$(printenv PGPASSWORD || printf postgres)"
export PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD
tmp_dir="$(mktemp -d)"
holder_pid=""
cleanup() { if [[ -n "$holder_pid" ]]; then kill "$holder_pid" 2>/dev/null || true; fi; rm -rf "$tmp_dir"; }
trap cleanup EXIT
psql_admin() { psql -X -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" "$@"; }

# Two authenticated requests race for 7 units each from 10 units of stock.
psql_admin <<'SQL'
insert into public.inventory_items
  (id,organization_id,sku,description,created_by)
values ('40000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000001',
        'SKU-CONCURRENCY','Concurrency test fixture',
        '10000000-0000-0000-0000-000000000001');
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.record_inventory_movement(
  '40000000-0000-0000-0000-000000000003','in',10,
  'Concurrency test opening stock',
  '50000000-0000-0000-0000-000000000021',null);
reset role;
SQL

ready_file="$tmp_dir/inventory-lock-ready"
(
  psql -X -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" >"$tmp_dir/reservation-a.log" 2>&1 <<SQL
begin;
select id from public.inventory_items where id='40000000-0000-0000-0000-000000000003' for update;
\! touch "$ready_file"
select pg_sleep(2);
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select public.reserve_inventory_item(
 '40000000-0000-0000-0000-000000000003',
 '30000000-0000-0000-0000-000000000001',7,
 '50000000-0000-0000-0000-000000000022');
commit;
SQL
) &
holder_pid=$!
for _ in $(seq 1 100); do [[ -f "$ready_file" ]] && break; sleep 0.05; done
[[ -f "$ready_file" ]] || { echo "FAIL: inventory lock holder not ready"; cat "$tmp_dir/reservation-a.log"; exit 1; }

set +e
psql -X -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" >"$tmp_dir/reservation-b.log" 2>&1 <<'SQL' &
set role authenticated;
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select public.reserve_inventory_item(
 '40000000-0000-0000-0000-000000000003',
 '30000000-0000-0000-0000-000000000001',7,
 '50000000-0000-0000-0000-000000000023');
SQL
caller_pid=$!
wait "$holder_pid"; holder_pid=""
wait "$caller_pid"
reservation_b_status=$?
set -e
if [[ "$reservation_b_status" -eq 0 ]] || ! grep -q "INSUFFICIENT_AVAILABLE_STOCK" "$tmp_dir/reservation-b.log"; then
  echo "FAIL: concurrent over-reservation was not rejected"; cat "$tmp_dir/reservation-a.log" "$tmp_dir/reservation-b.log"; exit 1
fi
psql_admin -Atc "select case when count(*)=1 and coalesce(sum(quantity),0)=7 then 'PASS' else 'FAIL' end from public.inventory_reservations where item_id='40000000-0000-0000-0000-000000000003' and status='reserved'" | grep -qx PASS

# Caller passes the first access check, blocks on the operation row, then
# membership is revoked before the RPC's post-lock authorization recheck.
ready_file="$tmp_dir/operation-lock-ready"
(
  psql -X -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" >"$tmp_dir/operation-holder.log" 2>&1 <<SQL
begin;
select id from public.operations where id='30000000-0000-0000-0000-000000000001' for update;
\! touch "$ready_file"
select pg_sleep(4);
commit;
SQL
) &
holder_pid=$!
for _ in $(seq 1 100); do [[ -f "$ready_file" ]] && break; sleep 0.05; done
[[ -f "$ready_file" ]] || { echo "FAIL: operation lock holder not ready"; cat "$tmp_dir/operation-holder.log"; exit 1; }

set +e
PGAPPNAME=fia-revocation-race-caller psql -X -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" >"$tmp_dir/revocation-caller.log" 2>&1 <<'SQL' &
set role authenticated;
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select public.transition_operation(
 '30000000-0000-0000-0000-000000000001','disputed',
 (select version from public.operations where id='30000000-0000-0000-0000-000000000001'),
 '50000000-0000-0000-0000-000000000024');
SQL
caller_pid=$!
set -e

blocked=0
for _ in $(seq 1 100); do
  waiting="$(psql_admin -Atc "select count(*) from pg_stat_activity where application_name='fia-revocation-race-caller' and wait_event_type='Lock'")"
  if [[ "$waiting" -gt 0 ]]; then blocked=1; break; fi
  if ! kill -0 "$caller_pid" 2>/dev/null; then break; fi
  sleep 0.05
done
if [[ "$blocked" -ne 1 ]]; then
  kill "$caller_pid" 2>/dev/null || true
  wait "$caller_pid" 2>/dev/null || true
  wait "$holder_pid" 2>/dev/null || true
  holder_pid=""
  echo "FAIL: caller did not reach expected operation-row lock wait"; cat "$tmp_dir/revocation-caller.log"; exit 1
fi
psql_admin -v ON_ERROR_STOP=1 -c "delete from public.organization_members where organization_id='20000000-0000-0000-0000-000000000001' and user_id='10000000-0000-0000-0000-000000000001'"
wait "$holder_pid"; holder_pid=""
set +e
wait "$caller_pid"
revocation_status=$?
set -e
if [[ "$revocation_status" -eq 0 ]] || ! grep -q "OPERATION_NOT_ACCESSIBLE" "$tmp_dir/revocation-caller.log"; then
  echo "FAIL: transition was not rejected after membership revocation"; cat "$tmp_dir/revocation-caller.log"; exit 1
fi
echo "CONCURRENT INVENTORY RESERVATION + MEMBERSHIP REVOCATION RACE: PASS"

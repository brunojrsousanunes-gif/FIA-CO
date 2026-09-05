# FIA Purchase Search Transparency v1

## Principle

FIA does not treat "more security" as permission to consume every available datum.

The chain is:

**verified security level -> allowed information scope -> necessary authorized inputs -> transparent ranking -> manager-visible explanation**

## Security and information scope

| Security | Information | Search scope |
| --- | --- | --- |
| L0_DEMO | I0_PUBLIC | Query criteria plus public/synthetic information only. |
| L1_ISOLATED | I1_ISOLATED_BUSINESS | May add authorized INTERNAL and COMMERCIAL_CONFIDENTIAL data from one isolated organization. |
| L2_VERIFIED | I2_CONNECTED_INTERNAL | May add approved internal integrations and authorized company data. No cross-organization inputs. |
| L3_SHARED | I3_SHARED_BUSINESS | May add authorized business information received through explicit cross-organization grants. No personal data inter-company. |
| L4_ADVANCED | I4_REVIEWED_PERSONAL | PERSONAL data may be used only when necessary, authorized and the workflow has passed the dedicated review. |

`CRITICAL`, credentials, secrets and payment credentials are excluded from purchase search / AI context at every level.

## What a manager must see

Every result surface must distinguish:

1. security level;
2. information level;
3. information allowed by that level;
4. information actually used in this search;
5. information excluded or unavailable;
6. sources and retrieval timestamps for live candidates;
7. ranking criteria and their weights;
8. score breakdown and missing data;
9. confidence/completeness;
10. declared commercial relationship or sponsorship;
11. explicit statement that sponsorship contributes zero ranking points;
12. actions FIA did not take.

## Ranking

Default demonstrator weights:

- fit: 35%
- total cost: 25%
- risk: 20%
- availability: 10%
- distance: 10%

Weights are visible and must not be silently changed for a sponsor.

A candidate with insufficient information can be scored provisionally but must not be presented as a strong recommendation. `top scored` and `recommended` are separate concepts.

## Source integrity

A live candidate requires:

- source name;
- source URL/reference;
- retrieval timestamp;
- non-synthetic status.

When live sources are not connected, FIA must say so and may only show clearly labelled synthetic examples. It must not invent live offers.

## Permanent boundaries

- FIA does not autonomously purchase.
- FIA does not contact a seller merely because a search ranked an option.
- FIA does not receive, custody or move funds.
- Critical data and credentials do not enter the ranking context.
- A higher level does not automatically activate every permitted data source.

## Current status

`FOUNDATION_IMPLEMENTED / LIVE_PURCHASE_SOURCES_DISABLED`

The current public beta can demonstrate the transparent decision method and security/information relationship with synthetic data. Connecting live external sources requires a separate reviewed implementation.

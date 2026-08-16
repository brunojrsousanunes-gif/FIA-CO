import fs from 'node:fs/promises';
import path from 'node:path';

const INITIAL={clients:{A:{id:'A',name:'Cliente A',balance:1250},B:{id:'B',name:'Cliente B',balance:850}},operations:[],audit:[]};
const clone=v=>JSON.parse(JSON.stringify(v));

export function createDemoStore(filePath=''){
  let state=clone(INITIAL);
  let queue=Promise.resolve();
  const persistent=Boolean(filePath);

  async function load(){
    if(!persistent)return snapshotAll();
    try{
      const raw=await fs.readFile(filePath,'utf8');
      const parsed=JSON.parse(raw);
      if(!parsed?.clients?.A||!parsed?.clients?.B||!Array.isArray(parsed.operations)||!Array.isArray(parsed.audit))throw new Error('BAD_STATE_FILE');
      state=parsed;
    }catch(error){
      if(error?.code!=='ENOENT')throw error;
      await persist();
    }
    return snapshotAll();
  }

  function snapshotAll(){return clone(state)}

  async function persist(){
    if(!persistent)return;
    await fs.mkdir(path.dirname(filePath),{recursive:true});
    const tmp=`${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp,JSON.stringify(state),{encoding:'utf8',mode:0o600});
    await fs.rename(tmp,filePath);
  }

  function transact(mutator){
    const run=async()=>{
      const before=clone(state);
      try{
        const result=await mutator(state);
        await persist();
        return clone(result);
      }catch(error){
        state=before;
        throw error;
      }
    };
    const next=queue.then(run,run);
    queue=next.then(()=>undefined,()=>undefined);
    return next;
  }

  async function reset(){
    return transact(s=>{
      s.clients=clone(INITIAL.clients);s.operations=[];s.audit=[];
      return s;
    });
  }

  return {load,transact,snapshotAll,reset,persistent,filePath};
}

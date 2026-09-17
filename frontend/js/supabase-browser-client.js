const SECRET_KEY_PATTERNS=[/^sb_secret_/i,/service_role/i];

function validatePublicConfig(url,publishableKey){
  let parsed;
  try{parsed=new URL(url);}catch{throw new Error('SUPABASE_URL_INVALID');}
  if(parsed.protocol!=='https:'||!parsed.hostname.endsWith('.supabase.co'))throw new Error('SUPABASE_URL_INVALID');
  if(typeof publishableKey!=='string'||publishableKey.length<20)throw new Error('SUPABASE_PUBLISHABLE_KEY_INVALID');
  if(SECRET_KEY_PATTERNS.some(pattern=>pattern.test(publishableKey)))throw new Error('SUPABASE_SECRET_KEY_FORBIDDEN_IN_BROWSER');
  if(!publishableKey.startsWith('sb_publishable_')&&publishableKey.split('.').length!==3)throw new Error('SUPABASE_PUBLISHABLE_KEY_INVALID');
  return Object.freeze({url:parsed.origin,publishableKey});
}

export function createSupabaseBrowserClient({url,publishableKey,getAccessToken=()=>''}){
  const config=validatePublicConfig(url,publishableKey);
  function headers(extra={}){
    const accessToken=getAccessToken();
    return{apikey:config.publishableKey,Authorization:`Bearer ${accessToken||config.publishableKey}`,...extra};
  }
  async function request(path,options={}){
    if(typeof path!=='string'||!path.startsWith('/'))throw new Error('SUPABASE_PATH_INVALID');
    const response=await fetch(`${config.url}${path}`,{...options,headers:headers(options.headers)});
    const body=response.status===204?null:await response.json().catch(()=>null);
    if(!response.ok){
      const error=new Error(body?.message||body?.error_description||'SUPABASE_REQUEST_FAILED');
      error.status=response.status;
      error.code=body?.code||body?.error_code||'SUPABASE_REQUEST_FAILED';
      throw error;
    }
    return body;
  }
  function signInWithPassword(email,password){
    return request('/auth/v1/token?grant_type=password',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})
    });
  }
  function signUp(email,password,data={}){
    return request('/auth/v1/signup',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,data})
    });
  }
  return Object.freeze({request,signInWithPassword,signUp});
}

export{validatePublicConfig};

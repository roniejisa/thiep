import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
const dir='.sites-runtime/book-check';
for(const name of ['admin-auth','config']){
 const source=await readFile('lib/'+name+'.ts','utf8');
 await writeFile(`${dir}/${name}.mjs`,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replaceAll("'./supabase'","'./supabase.mjs'"));
}
const dom=new JSDOM('<div id="app"></div>',{url:'https://example.com'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,sessionStorage:dom.window.sessionStorage,IS_REACT_ACT_ENVIRONMENT:true});
const auth=await import('../'+dir+'/admin-auth.mjs'),{uploadMusic}=await import('../'+dir+'/supabase.mjs');
const config={url:'https://project.supabase.co',key:'sb_publishable_example'},uid='11111111-1111-4111-8111-111111111111',id='33333333-3333-4333-8333-333333333333';
const session={access_token:'access-token',refresh_token:'refresh-token',expires_at:Date.now()/1000+3600,user:{id:uid}};
let admin=true,requests=[],failUpload=false,refreshes=0;
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,init={})=>{requests.push({url,init});
 if(url.endsWith('/auth/v1/user'))return Response.json({id:uid,email:'admin@example.com'});
 if(url.includes('grant_type=password'))return Response.json(session);
 if(url.includes('grant_type=refresh_token')){refreshes++;return Response.json({...session,access_token:'new-token',refresh_token:'rotated-token'})}
 if(url.endsWith('is_invitation_admin'))return Response.json(admin);
 if(url.includes('/storage/'))return failUpload?Response.json({message:'Storage denied'},{status:403}):Response.json({Key:'file'});
 if(url.includes('/logout'))return new Response(null,{status:204});
 throw Error('Unexpected request '+url);
};
try{
 auth.rememberSession(session);assert.equal(auth.readSession().access_token,session.access_token);
 assert.equal((await auth.verifyAdmin(config,session)).user.email,'admin@example.com');
 admin=false;await assert.rejects(()=>auth.verifyAdmin(config,session),/chưa được cấp quyền quản trị/);
 await assert.rejects(()=>auth.loginAdmin(config,'admin@example.com','not-stored'),/chưa được cấp quyền quản trị/);
 assert.ok(requests.some(r=>r.url.includes('logout?scope=local')));assert.equal(auth.readSession(),null);
 admin=true;const renewed=await auth.verifyAdmin(config,{...session,expires_at:1});assert.equal(renewed.access_token,'new-token');assert.equal(renewed.refresh_token,'rotated-token');assert.equal(refreshes,1);
 await assert.rejects(()=>auth.verifyAdmin(config,{...session,user:{id:'spoof'}}),/không hợp lệ/);
 const file=new File(['music bytes'],'Our song.MP3',{type:''});const stored=await uploadMusic(config,session,id,file);
 assert.ok(stored.startsWith(config.url+'/storage/v1/object/public/wedding-audio/'+uid+'/'+id+'/'));
 const upload=requests.at(-1);assert.equal(upload.init.headers.Authorization,'Bearer access-token');assert.equal(upload.init.headers['Content-Type'],'audio/mpeg');assert.equal(await upload.init.body.text(),'music bytes');
 const before=requests.length;await assert.rejects(()=>uploadMusic(config,session,id,new File(['x'],'bad.exe')));await assert.rejects(()=>uploadMusic(config,session,id,new File([],'empty.mp3')));await assert.rejects(()=>uploadMusic(config,session,'../other',file));assert.equal(requests.length,before);
 failUpload=true;await assert.rejects(()=>uploadMusic(config,session,id,file),/Storage denied/);failUpload=false;
 // Run the real gate, replacing only the dynamically loaded editor with a visible sentinel.
 let gate=ts.transpileModule(await readFile('components/wedding/admin-gate.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 gate=gate.replace("import dynamic from 'next/dynamic';","const dynamic=()=>()=>jsx('div',{'data-editor':true,children:'Editor'});");
 for(const name of ['config','admin-auth'])gate=gate.replaceAll(`'../../lib/${name}'`,`'./${name}.mjs'`);
 // Keep the transpiler's JSX alias independent from import ordering.
 gate=gate.replace("const dynamic=()=>()=>jsx(","const dynamic=()=>()=>_jsx(");
 await writeFile(dir+'/admin-gate.mjs',gate);
 const {default:Gate}=await import('../'+dir+'/admin-gate.mjs');
 const root=createRoot(document.getElementById('app'));
 await act(async()=>root.render(React.createElement(Gate)));
 assert.ok(document.getElementById('admin-email'));assert.equal(document.querySelector('[data-editor]'),null);
 await act(async()=>root.unmount());
 for(const allowed of [false,true]){admin=allowed;auth.rememberSession(session);const app=createRoot(document.getElementById('app'));await act(async()=>{app.render(React.createElement(Gate));await new Promise(r=>setTimeout(r,20))});assert.equal(Boolean(document.querySelector('[data-editor]')),allowed);assert.equal(Boolean(document.getElementById('admin-email')),!allowed);await act(async()=>app.unmount());}
 const page=await readFile('app/page.tsx','utf8');assert.ok(page.includes('isGuestEntry(location.search)'));assert.ok(page.includes('guest?<Invitation/>:<AdminGate/>'));
 console.log('Passed: real admin gate denies missing/non-admin sessions; server user + admin RPC verification; role spoofing rejected; refresh rotation; logout; direct authenticated Storage upload, MIME fallback and failed/invalid files; root guest dispatch.');
}finally{globalThis.fetch=originalFetch;dom.window.close();}

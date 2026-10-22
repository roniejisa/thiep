import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import React,{act,useState} from 'react';
import {createRoot} from 'react-dom/client';

// Run verify-book and verify-invitation first for the shared transpiled modules.
const scratch=path.join(process.cwd(),'.sites-runtime/book-check');
const read=name=>import(pathToFileURL(path.join(scratch,name+'.mjs')));
const dom=new JSDOM('<html><body><div id="app"></div></body></html>',{url:'https://example.com',pretendToBeVisual:true});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,FileReader:dom.window.FileReader,location:dom.window.location,IS_REACT_ACT_ENVIRONMENT:true});
const observers=[];let reduced=false;const mediaListeners=new Set();
window.matchMedia=()=>({get matches(){return reduced},addEventListener:(name,callback)=>mediaListeners.add(callback),removeEventListener:(name,callback)=>mediaListeners.delete(callback)});
class Observer{
 constructor(callback,options){this.callback=callback;this.options=options;this.targets=new Set();this.disconnected=false;observers.push(this)}
 observe(target){this.targets.add(target)}unobserve(target){this.targets.delete(target)}disconnect(){this.disconnected=true;this.targets.clear()}
 emit(target,visible,top=100,bottom=140){if(this.targets.has(target))this.callback([{target,isIntersecting:visible,boundingClientRect:{top,bottom},rootBounds:{top:0,bottom:700}}])}
}
globalThis.IntersectionObserver=Observer;
const {default:Reader}=await read('invitation-reader'),{default:Sheet}=await read('sheet'),{default:Manager}=await read('feature-dashboard');
const {featureDefaults,getFeatures,validateFeatures}=await read('features'),{initial,validateDocument}=await read('document');
const doc=structuredClone(initial);doc.features=featureDefaults();
const {previewLink,readPreviewLink}=await read('preview-link');
for(const kind of ['birds','balloons','hearts-fall','confetti']){const saved=structuredClone(doc);saved.features.effects.kind=kind;const link=await previewLink('https://example.com',saved,'Gia đình Hiếu');assert.ok(link.length<1600);assert.deepEqual(await readPreviewLink(new URL(link).hash),saved)}
assert.equal(getFeatures(doc).effects.text,'rise');assert.equal(getFeatures(doc).effects.repeat,true);
assert.ok(validateFeatures({effects:{kind:'snow',symbol:'♡'},music:{enabled:true,url:'https://example.com/song.mp3',name:'Our song'}}),'legacy saved settings gain compatible defaults');
for(const invalid of [{music:{volume:101}},{music:{loop:'yes'}},{effects:{text:'spin'}},{effects:{repeat:'yes'}},{effects:{density:500}},{effects:{duration:-1}}])assert.equal(validateFeatures(invalid),false);
for(const kind of ['hearts','hearts-fall','birds','balloons','confetti','snow','petals','sparkles','custom'])assert.ok(validateFeatures({effects:{kind}}));
const app=createRoot(document.getElementById('app'));
function reader(value){return React.createElement('main',{className:'preview-overlay'},React.createElement(Reader,{document:value,guestName:'Bạn Hiếu',renderPage:page=>React.createElement(Sheet,{page,theme:value.theme})}))}
const active=()=>observers.filter(observer=>observer.options.rootMargin==='-12px 0px'&&!observer.disconnected).at(-1);
try{
 await act(async()=>app.render(reader(doc)));
 const observer=active(),target=document.querySelector('.element.text'),text=target.textContent;
 assert.ok(observer);assert.equal(observer.options.root.className,'preview-overlay');assert.equal(target.dataset.revealState,'waiting');assert.equal(target.style.top,doc.pages[0].elements[0].y+'%');
 await act(async()=>observer.emit(target,true));assert.equal(target.dataset.revealState,'visible');
 await act(async()=>observer.emit(target,false,-60,-20));assert.equal(target.dataset.revealState,'waiting');assert.equal(target.style.getPropertyValue('--reveal-offset'),'-24px');
 await act(async()=>observer.emit(target,true,10,50));assert.equal(target.dataset.revealState,'visible','scrolling back from above replays text');
 await act(async()=>observer.emit(target,false,740,780));assert.equal(target.dataset.revealState,'waiting');assert.equal(target.style.getPropertyValue('--reveal-offset'),'24px');
 await act(async()=>observer.emit(target,true,620,660));assert.equal(target.dataset.revealState,'visible');assert.equal(target.textContent,text);
 const once=structuredClone(doc);once.features.effects.repeat=false;await act(async()=>app.render(reader(once)));const onceObserver=active(),onceTarget=document.querySelector('.element.text');
 await act(async()=>onceObserver.emit(onceTarget,true));assert.equal(onceObserver.targets.has(onceTarget),false);await act(async()=>onceObserver.emit(onceTarget,false,-60,-20));assert.equal(onceTarget.dataset.revealState,'visible','single-play leaves text visible');
 const off=structuredClone(doc);off.features.effects.text='none';await act(async()=>app.render(reader(off)));assert.equal(document.querySelector('[data-text-effect]'),null);assert.equal(document.querySelector('.text-reveal-target'),null);
 reduced=true;await act(async()=>app.render(reader(doc)));assert.equal(document.querySelector('[data-text-effect]'),null);assert.equal(document.querySelector('.text-reveal-target'),null);
 await act(async()=>{reduced=false;for(const callback of mediaListeners)callback()});assert.ok(active());assert.ok(document.querySelector('[data-text-effect=rise]'));
 await act(async()=>{reduced=true;for(const callback of mediaListeners)callback()});assert.equal(document.querySelector('[data-text-effect]'),null);assert.equal(document.querySelector('.text-reveal-target'),null);
 delete globalThis.IntersectionObserver;await act(async()=>app.render(reader(structuredClone(doc))));assert.equal(document.querySelector('.text-reveal-target'),null,'unsupported browsers retain readable text');
 await act(async()=>app.render(React.createElement(Sheet,{page:doc.pages[0],theme:doc.theme,editing:true})));assert.equal(document.querySelector('.text-reveal-target'),null,'the editor never hides or animates positioned text');
 let current,previewed=false;
 function Harness(){const [value,setValue]=useState(structuredClone(doc));current=value;return React.createElement(Manager,{initialTab:'brand',document:value,id:'33333333-3333-4333-8333-333333333333',config:{url:'https://project.supabase.co',key:'sb_publishable_example'},session:{access_token:'admin-token',user:{id:'11111111-1111-4111-8111-111111111111'}},busy:false,onChange:setValue,onClose:()=>{},onConnect:()=>{},onSave:async()=>{},onPublish:async()=>{},onChooseTemplate:()=>{},onPreview:()=>{previewed=true}})}
 await act(async()=>app.render(React.createElement(Harness)));
 assert.ok(document.querySelector('.music-settings-card'));assert.ok(document.querySelector('.scroll-settings-card'));assert.equal(document.querySelector('.manager-tabs [aria-pressed=true]').textContent,'Nhạc & Hiệu ứng');
 for(const [name,kind] of [['Tim bay','hearts'],['Tuyết rơi','snow'],['Hoa rơi','petals'],['Lấp lánh','sparkles'],['Chim bay','birds'],['Bóng bay','balloons'],['Tim rơi','hearts-fall'],['Pháo giấy','confetti']]){await act(async()=>[...document.querySelectorAll('.atmosphere-options button')].find(button=>button.textContent===name).click());assert.equal(current.features.effects.kind,kind);assert.ok(document.querySelector('.atmosphere-stage .effect-'+kind));assert.equal(document.querySelectorAll('.atmosphere-stage .invitation-effects>span').length,kind==='birds'?6:kind==='balloons'?9:18);if(['birds','balloons','hearts-fall'].includes(kind))assert.ok(document.querySelector('.atmosphere-stage svg'));assert.ok(validateDocument(current))}
 let hidden=false;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});await act(async()=>{hidden=true;document.dispatchEvent(new dom.window.Event('visibilitychange'))});assert.equal(document.querySelector('.atmosphere-stage .invitation-effects').dataset.paused,'true');await act(async()=>{hidden=false;document.dispatchEvent(new dom.window.Event('visibilitychange'))});assert.equal(document.querySelector('.atmosphere-stage .invitation-effects').dataset.paused,'false');
 await act(async()=>[...document.querySelectorAll('.atmosphere-options button')].find(button=>button.textContent==='Tắt').click());assert.equal(document.querySelector('.atmosphere-stage .invitation-effects'),null);
 await act(async()=>[...document.querySelectorAll('.atmosphere-options button')].find(button=>button.textContent==='Chim bay').click());
 await act(async()=>[...document.querySelectorAll('.text-style-options button')].find(button=>button.textContent.includes('Hiện dần')).click());assert.equal(current.features.effects.text,'fade');
 const originalFetch=globalThis.fetch,uploads=[];globalThis.fetch=async(url,init)=>{uploads.push({url,init});return new Response('{}',{status:200})};
 const fileInput=document.querySelector('.music-upload input');Object.defineProperty(fileInput,'files',{configurable:true,value:[new dom.window.File(['audio bytes'],'our-song.mp3',{type:'audio/mpeg'})]});
 await act(async()=>{fileInput.dispatchEvent(new dom.window.Event('change',{bubbles:true}));await new Promise(resolve=>setTimeout(resolve,30))});
 assert.equal(current.features.music.name,'our-song.mp3');assert.equal(current.features.music.enabled,true);assert.ok(current.features.music.url.startsWith('https://project.supabase.co/storage/v1/object/public/wedding-audio/'));assert.equal(uploads.length,1);assert.equal(uploads[0].init.headers.Authorization,'Bearer admin-token');globalThis.fetch=originalFetch;assert.ok(document.querySelector('.selected-music audio'));assert.ok(validateDocument(current));
 const loop=[...document.querySelectorAll('.motion-checkbox')].find(label=>label.textContent.includes('Lặp lại bài nhạc')).querySelector('input');await act(async()=>loop.click());assert.equal(current.features.music.loop,false);
 await act(async()=>document.querySelector('.motion-preview-button').click());assert.equal(previewed,true);await act(async()=>app.render(reader(current)));assert.equal(document.querySelector('.invitation-music audio').loop,false);assert.equal(document.querySelector('.invitation-music audio').volume,.45);assert.equal(document.querySelector('.invitation-music audio').autoplay,false);
}finally{await act(async()=>app.unmount());dom.window.close();delete globalThis.IntersectionObserver}
console.log('Passed: viewport text reveals in both scroll directions, repeat/single-play, readable fallback, reduced-motion changes, editor coordinates, direct music/effects settings, bird/balloon/falling-heart/confetti presets, saved phone links, visibility pause, actual personal audio file input, loop/volume and full-invitation preview.');

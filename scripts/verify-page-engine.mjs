import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import ts from 'typescript';
const root=process.cwd(),scratch=path.join(root,'.sites-runtime/book-check');await mkdir(scratch,{recursive:true});
let source=await readFile(path.join(root,'components/wedding/wedding-book.tsx'),'utf8');
let code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText
 .replaceAll("'../../lib/book-navigation'","'./book-navigation.mjs'")
 .replaceAll("'../../lib/invitation'","'./invitation.mjs'").replaceAll("'./page-activity'","'./page-activity.mjs'").replaceAll("'./media-dialog'","'./media-dialog.mjs'")
 .replaceAll("'../../lib/vendor/page-flip.js'",JSON.stringify(pathToFileURL(path.join(root,'lib/vendor/page-flip.js')).href));
await writeFile(path.join(scratch,'wedding-book.mjs'),code);
for(const name of ['page-activity','media-dialog','widget-renderer','sheet']){const file=await readFile(path.join(root,'components/wedding',name+'.tsx'),'utf8');const result=ts.transpileModule(file,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText.replaceAll("'./page-activity'","'./page-activity.mjs'").replaceAll("'./media-dialog'","'./media-dialog.mjs'").replaceAll("'./widget-renderer'","'./widget-renderer.mjs'").replaceAll("'../../lib/widgets'","'./widgets.mjs'");await writeFile(path.join(scratch,name+'.mjs'),result)}
const dom=new JSDOM('<html><body><div id="app"></div></body></html>',{url:'https://example.com',pretendToBeVisual:true});
let width=780,clock=0,nextId=0;const frames=new Map();
Object.defineProperty(globalThis.performance,'now',{value:()=>clock,configurable:true});
const raf=callback=>{const id=++nextId;frames.set(id,callback);return id},cancel=id=>frames.delete(id);
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,requestAnimationFrame:raf,cancelAnimationFrame:cancel,IS_REACT_ACT_ENVIRONMENT:true,matchMedia:()=>({matches:false})});
dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
dom.window.requestAnimationFrame=raf;dom.window.cancelAnimationFrame=cancel;dom.window.matchMedia=globalThis.matchMedia;
Object.defineProperty(dom.window.HTMLElement.prototype,'clientWidth',{get:()=>width});
Object.defineProperty(dom.window.HTMLElement.prototype,'offsetWidth',{get:()=>width});
Object.defineProperty(dom.window.HTMLElement.prototype,'offsetHeight',{get:()=>width*720/(width<520?390:780)});
Object.defineProperty(dom.window.HTMLElement.prototype,'clientHeight',{get:()=>width*720/(width<520?390:780)});
dom.window.HTMLElement.prototype.getBoundingClientRect=function(){return {x:0,y:0,left:0,top:0,width,height:this.clientHeight,right:width,bottom:this.clientHeight,toJSON(){}}};
const {default:Book}=await import(pathToFileURL(path.join(scratch,'wedding-book.mjs')));
const {initial}=await import(pathToFileURL(path.join(scratch,'document.mjs')));
const app=createRoot(document.getElementById('app'));
await act(async()=>{app.render(React.createElement(React.StrictMode,null,React.createElement(Book,{document:initial,guestName:'Gia đình Hiếu',renderPage:page=>React.createElement('div',{'data-page':page.id},page.title)})))});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,50))});
const click=label=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent===label);assert.ok(button,label);assert.equal(button.disabled,false);button.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}))};
const visible=()=>[...document.querySelectorAll('.physical-page[data-revealed=true]')].map(e=>Number(e.dataset.index));
async function advance(milliseconds){await act(async()=>{for(let elapsed=0;elapsed<milliseconds;elapsed+=16){clock+=16;const batch=[...frames.values()];frames.clear();for(const callback of batch)callback(clock)}})}
assert.deepEqual(visible(),[0]);await advance(64);assert.equal(frames.size,0,'idle book must not keep redrawing');
await act(async()=>click('Mở sách'));await advance(96);assert.deepEqual(visible(),[0],'destination must remain hidden while opening cover');await advance(2200);assert.deepEqual(visible(),[1,2]);
await act(async()=>click('Trang sau'));await advance(96);assert.deepEqual(visible(),[1,2],'next spread must remain hidden during paper curl');await advance(2200);assert.deepEqual(visible(),[3,4]);
await act(async()=>click('Trang trước'));await advance(96);assert.deepEqual(visible(),[3,4],'previous spread must remain hidden during reverse curl');await advance(2200);assert.deepEqual(visible(),[1,2]);
width=380;await act(async()=>window.dispatchEvent(new dom.window.Event('resize')));await advance(64);assert.deepEqual(visible(),[1],'portrait mode shows one leaf');
await act(async()=>click('Trang sau'));await advance(96);assert.deepEqual(visible(),[1]);await advance(2200);assert.deepEqual(visible(),[2]);
await act(async()=>click('Trang trước'));await advance(2200);assert.deepEqual(visible(),[1]);
function touchEvent(target,type,x,y){const event=new dom.window.Event(type,{bubbles:true,cancelable:true});const touches=[{clientX:x,clientY:y}];Object.defineProperty(event,'changedTouches',{value:touches});Object.defineProperty(event,'touches',{value:type==='touchend'?[]:touches});target.dispatchEvent(event)}
const block=document.querySelector('.stf__block');
await act(async()=>{touchEvent(block,'touchstart',280,260);touchEvent(block,'touchmove',210,345);touchEvent(block,'touchend',210,345)});await advance(2200);assert.deepEqual(visible(),[1],'a predominantly vertical gesture must not flip the book');
await act(async()=>{touchEvent(block,'touchstart',280,260);touchEvent(block,'touchend',160,265)});await advance(2200);assert.deepEqual(visible(),[2],'a horizontal touch swipe turns one phone page');
await act(async()=>click('Trang trước'));await advance(2200);assert.deepEqual(visible(),[1]);
for(let index=2;index<8;index++){await act(async()=>click('Trang sau'));await advance(2200);assert.deepEqual(visible(),[index],'every portrait page including back cover is reachable')}
assert.equal([...document.querySelectorAll('button')].find(b=>b.textContent==='Trang sau').disabled,true);assert.equal(frames.size,0,'finished turns return to sleep');
await act(async()=>click('Khép sách'));await advance(18000);assert.deepEqual(visible(),[0],'closing replays the reverse turn');
await act(async()=>app.unmount());assert.equal(frames.size,0,'unmount cancels the engine render loop');
// Exercise widgets inside the real phone book, including the readable alternative.
const {default:Sheet}=await import(pathToFileURL(path.join(scratch,'sheet.mjs')));
const {defaultWidget}=await import(pathToFileURL(path.join(scratch,'widgets.mjs')));
const {readUploadImage}=await import(pathToFileURL(path.join(scratch,'upload-image.mjs')));
globalThis.FileReader=dom.window.FileReader;
const qrFile=new dom.window.File([new Uint8Array([1,2,3,4])],'bank.png',{type:'image/png'});
assert.equal(await readUploadImage(qrFile,true),'data:image/png;base64,AQIDBA==','bank QR upload remains byte-for-byte');
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});let copied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{copied=value}},configurable:true});
const png='data:image/png;base64,AQIDBA==';
const widgets=[{...defaultWidget('gallery'),images:Array.from({length:20},(_,i)=>'https://example.com/photo-'+i+'.jpg')},{...defaultWidget('bank'),qrImage:png,accountNumber:'0123456789',bankName:'Ngân hàng mẫu',accountName:'MINH AN'},{...defaultWidget('map'),address:'Nhà hàng A, Hồ Chí Minh'},{...defaultWidget('video'),url:'https://youtu.be/dQw4w9WgXcQ'}];
const elements=widgets.map((widget,index)=>({id:'widget-'+index,type:'widget',value:'',x:10,y:10,width:80,height:70,fontSize:18,color:'#80643c',font:'serif',align:'center',widget}));
elements.unshift({...initial.pages[1].elements[2],id:'readable-copy',value:'Mỗi lời hẹn là một đời yêu.'});
const fixture={...initial,pages:[{id:'mobile-test',title:'Ngày chung đôi',elements}]};
const second=createRoot(document.getElementById('app'));
await act(async()=>second.render(React.createElement(Book,{document:fixture,guestName:'',presentation:'phone',renderPage:(page,readable)=>React.createElement(Sheet,{page,theme:fixture.theme,readable})})));
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,30))});await advance(64);
assert.equal(document.querySelectorAll('iframe').length,0,'unread maps and videos must not load');assert.ok([...document.querySelectorAll('.gallery-pictures img')].filter(image=>image.getAttribute('src')).length<=2,'only nearby gallery pictures preload');
await act(async()=>click('Mở sách'));await advance(2200);await act(async()=>click('Trang sau'));await advance(2200);
assert.deepEqual(visible(),[2]);assert.equal(document.querySelectorAll('iframe').length,2,'map and video activate on the visible page');
const gallery=document.querySelector('.w-gallery');await act(async()=>{touchEvent(gallery,'touchstart',240,220);touchEvent(gallery,'touchend',130,225)});assert.equal(gallery.querySelector('small').textContent,'2 / 20');assert.deepEqual([...new Set(visible())],[2],'swiping gallery must not flip the book');
await act(async()=>document.querySelector('.gallery-photo-open').click());assert.ok(document.querySelector('.photo-dialog[open]'));await act(async()=>document.querySelector('.photo-dialog header button').click());
await act(async()=>click('Đọc rõ'));assert.ok(document.querySelector('.reading-dialog[open]'));assert.ok(document.querySelector('.readable-sheet').textContent.includes('Mỗi lời hẹn là một đời yêu.'));
await act(async()=>document.querySelector('.readable-sheet .bank-qr-open').click());assert.equal(document.querySelector('.bank-dialog img').getAttribute('src'),png);await act(async()=>[...document.querySelectorAll('.bank-dialog button')].find(button=>button.textContent.includes('Sao chép')).click());assert.equal(copied,'0123456789');
await act(async()=>document.querySelector('.bank-dialog header button').click());await act(async()=>click('Trở về trang sách'));assert.equal(document.querySelector('.reading-dialog'),null);assert.deepEqual([...new Set(visible())],[2],'reading mode preserves the current page');
await act(async()=>second.unmount());assert.equal(frames.size,0);dom.window.close();

console.log('Passed: real page engine mounted through React portals; hard cover and soft paper in both directions; destination hidden during motion; responsive one-page mode; idle rendering stops; vertical/horizontal phone gestures; lazy media; gallery swipe/lightbox; readable mode and QR/account copying; lifecycle cleanup.');

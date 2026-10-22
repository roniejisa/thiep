import {featureAssets} from './features';
import {validateDocument,type Wedding} from './document';
import {normalizeGuestName} from './invitation';
import {catalog,getTemplate} from './templates';
const maxLinkLength=1600;
async function encode(value:unknown){const stream=new Blob([JSON.stringify(value)]).stream().pipeThrough(new CompressionStream('gzip'));const bytes=new Uint8Array(await new Response(stream).arrayBuffer());return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function decode(data:string){
 if(!data||data.length>3000)throw Error('Liên kết xem thử không hợp lệ.');
 const bytes=Uint8Array.from(atob(data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>100000){await reader.cancel();throw Error('Bản thiết kế vượt giới hạn xem thử.')}chunks.push(value)}
 const combined=new Uint8Array(size);let offset=0;for(const chunk of chunks){combined.set(chunk,offset);offset+=chunk.length}return JSON.parse(new TextDecoder().decode(combined));
}
export async function previewLink(origin:string,document:Wedding,guest:string){
 const link=()=>{const u=new URL('/invite/',origin);u.searchParams.set('preview','1');u.searchParams.set('guest',normalizeGuestName(guest));return u};
 const known=catalog.find(t=>JSON.stringify(t.document)===JSON.stringify(document));if(known){const u=link();u.hash='template='+known.id;return u.href}
 if(featureAssets(document.features).some(src=>src.startsWith('data:'))||document.pages.some(p=>p.elements.some(e=>e.type==='image'&&e.value.startsWith('data:')||e.widget?.qrImage?.startsWith('data:')||e.widget?.images?.some(src=>src.startsWith('data:')))))throw Error('Thiệp có ảnh hoặc nhạc tải lên: hãy lưu và chia sẻ qua Supabase để tạo QR.');
 if(new TextEncoder().encode(JSON.stringify(document)).length>100000)throw Error('Thiệp lớn: hãy lưu và chia sẻ qua Supabase để tạo QR.');
 // Store content changes against a known layout, keeping phone QR codes small.
 for(const template of catalog){
  const candidate=structuredClone(template.document);if(candidate.pages.length!==document.pages.length)continue;
  const edits:[number,number,string][]=[];candidate.title=document.title;candidate.features=document.features;
  for(let page=0;page<candidate.pages.length;page++)for(let element=0;element<candidate.pages[page].elements.length;element++){const target=candidate.pages[page].elements[element],current=document.pages[page]?.elements[element];if(current&&target.value!==current.value){target.value=current.value;edits.push([page,element,current.value])}}
  if(JSON.stringify(candidate)===JSON.stringify(document)){const u=link();u.hash='template='+template.id+'&edit='+await encode({t:document.title,e:edits,f:document.features});if(u.href.length<=maxLinkLength)return u.href}
 }
 const u=link();u.hash='book='+await encode(document);if(u.href.length>maxLinkLength)throw Error('Thiệp lớn: hãy lưu và chia sẻ qua Supabase để tạo QR.');return u.href;
}
export async function readPreviewLink(hash:string):Promise<Wedding>{
 const params=new URLSearchParams(hash.replace(/^#/,'')),templateId=params.get('template');
 if(templateId){const template=getTemplate(templateId);if(!template)throw Error('Mẫu thiệp không tồn tại.');const doc=structuredClone(template.document),data=params.get('edit');if(!data)return doc;
  const patch=await decode(data);if(!patch||typeof patch!=='object'||typeof patch.t!=='string'||!Array.isArray(patch.e)||patch.e.length>4500)throw Error('Liên kết xem thử không hợp lệ.');
  doc.title=patch.t;if(patch.f!==undefined)doc.features=patch.f;
  for(const edit of patch.e){if(!Array.isArray(edit)||edit.length!==3||!Number.isInteger(edit[0])||!Number.isInteger(edit[1])||typeof edit[2]!=='string'||!doc.pages[edit[0]]?.elements[edit[1]])throw Error('Liên kết xem thử không hợp lệ.');doc.pages[edit[0]].elements[edit[1]].value=edit[2]}
  if(!validateDocument(doc))throw Error('Bản thiết kế không hợp lệ.');return doc;
 }
 const data=params.get('book');if(!data)throw Error('Liên kết xem thử không hợp lệ.');const doc=await decode(data);if(!validateDocument(doc))throw Error('Bản thiết kế không hợp lệ.');return doc;
}

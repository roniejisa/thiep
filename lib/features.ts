import {validImage} from './widgets';
export const effectKinds=['none','hearts','hearts-fall','birds','balloons','confetti','snow','petals','sparkles','custom'] as const;
export type AtmosphereKind=(typeof effectKinds)[number];
export type GiftAccount={side:'bride'|'groom';bankName:string;accountName:string;accountNumber:string;qrImage:string};
export type Features={
 analytics:boolean;wishes:{enabled:boolean};rsvp:boolean;
 photobook:{enabled:boolean;title:string;images:string[]};
 gifts:{enabled:boolean;accounts:GiftAccount[]};
 family:{enabled:boolean;groomFather:string;groomMother:string;brideFather:string;brideMother:string};
 music:{enabled:boolean;url:string;name:string;volume?:number;loop?:boolean};
 brand:{mode:'default'|'text'|'image'|'hidden';text:string;image:string;hidePlatform:boolean};
 qr:{dark:string;light:string;label:string};
 notice:{enabled:boolean;title:string;message:string;mode:'banner'|'dialog'};
 customCode:{enabled:boolean;html:string;css:string;js:string;height:number};
 effects:{kind:AtmosphereKind;symbol:string;text?:'none'|'fade'|'rise'|'zoom';repeat?:boolean;duration?:number;density?:number};
 domain:{hostname:string};
};
export type ResolvedFeatures=Omit<Features,'music'|'effects'> & {music:Required<Features['music']>;effects:Required<Features['effects']>};
export function featureDefaults():ResolvedFeatures{return {analytics:false,wishes:{enabled:false},rsvp:false,photobook:{enabled:false,title:'Khoảnh khắc của chúng mình',images:[]},gifts:{enabled:false,accounts:[{side:'groom',bankName:'',accountName:'',accountNumber:'',qrImage:''},{side:'bride',bankName:'',accountName:'',accountNumber:'',qrImage:''}]},family:{enabled:false,groomFather:'',groomMother:'',brideFather:'',brideMother:''},music:{enabled:false,url:'',name:'',volume:45,loop:true},brand:{mode:'default',text:'',image:'',hidePlatform:false},qr:{dark:'#15251f',light:'#ffffff',label:'Mở thiệp cưới'},notice:{enabled:false,title:'Lời nhắn từ chúng mình',message:'',mode:'banner'},customCode:{enabled:false,html:'',css:'',js:'',height:360},effects:{kind:'none',symbol:'♡',text:'rise',repeat:true,duration:700,density:18},domain:{hostname:''}}}
export function getFeatures(document:{features?:Partial<Features>}):ResolvedFeatures{const d=featureDefaults(),f=document.features||{};return {...d,...f,wishes:{...d.wishes,...f.wishes},photobook:{...d.photobook,...f.photobook},gifts:{...d.gifts,...f.gifts},family:{...d.family,...f.family},music:{...d.music,...f.music},brand:{...d.brand,...f.brand},qr:{...d.qr,...f.qr},notice:{...d.notice,...f.notice},customCode:{...d.customCode,...f.customCode},effects:{...d.effects,...f.effects},domain:{...d.domain,...f.domain}}}
const object=(v:unknown)=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
const text=(v:unknown,max=2000)=>typeof v==='string'&&v.length<=max;
const image=(v:unknown)=>v===''||validImage(v);
export function validAudio(value:unknown){return typeof value==='string'&&(value===''||/^https:\/\//.test(value)||/^data:audio\/(?:mpeg|mp4|aac|wav|x-wav|ogg|webm);base64,/.test(value))}
export function validDomain(value:string){return value===''||value.length<=253&&/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(value)}
export function colorContrast(dark:string,light:string){function luminance(color:string){const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4));return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722}const a=luminance(dark),b=luminance(light);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}
export function validateFeatures(value:unknown){
 if(value===undefined)return true;if(!object(value))return false;const raw=value as Partial<Features>;
 for(const key of ['wishes','photobook','gifts','family','music','brand','qr','notice','customCode','effects','domain'] as const)if(raw[key]!==undefined&&!object(raw[key]))return false;
 const f=getFeatures({features:raw}),bool=(v:unknown)=>typeof v==='boolean';
 if(![f.analytics,f.rsvp,f.wishes.enabled,f.photobook.enabled,f.gifts.enabled,f.family.enabled,f.music.enabled,f.music.loop,f.effects.repeat,f.brand.hidePlatform,f.notice.enabled,f.customCode.enabled].every(bool))return false;
 if(!text(f.photobook.title,300)||!Array.isArray(f.photobook.images)||f.photobook.images.length>40||!f.photobook.images.every(validImage))return false;
 if(!Array.isArray(f.gifts.accounts)||f.gifts.accounts.length>2||new Set(f.gifts.accounts.map(a=>a?.side)).size!==f.gifts.accounts.length||!f.gifts.accounts.every(a=>a&&['bride','groom'].includes(a.side)&&[a.bankName,a.accountName,a.accountNumber].every(v=>text(v,200))&&image(a.qrImage)))return false;
 if(![f.family.groomFather,f.family.groomMother,f.family.brideFather,f.family.brideMother].every(v=>text(v,200)))return false;
 if(!Number.isFinite(f.music.volume)||f.music.volume<0||f.music.volume>100)return false;
 if(!['none','fade','rise','zoom'].includes(f.effects.text)||!Number.isFinite(f.effects.duration)||f.effects.duration<300||f.effects.duration>1600||!Number.isInteger(f.effects.density)||f.effects.density<8||f.effects.density>32)return false;
 if(!validAudio(f.music.url)||!text(f.music.name,200)||!['default','text','image','hidden'].includes(f.brand.mode)||!text(f.brand.text,150)||!image(f.brand.image))return false;
 if(![f.qr.dark,f.qr.light].every(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c))||!text(f.qr.label,150))return false;
 if(!text(f.notice.title,200)||!text(f.notice.message,2000)||!['banner','dialog'].includes(f.notice.mode))return false;
 if(![f.customCode.html,f.customCode.css,f.customCode.js].every(v=>text(v,30000))||!Number.isFinite(f.customCode.height)||f.customCode.height<100||f.customCode.height>2000)return false;
 return effectKinds.includes(f.effects.kind)&&text(f.effects.symbol,8)&&text(f.domain.hostname,253)&&validDomain(f.domain.hostname);
}
export function customFrame(code:Features['customCode']){return '<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:16px/1.6 system-ui}'+code.css.replace(/<\/style/gi,'<\\/style')+'</style></head><body>'+code.html+'<script>'+code.js.replace(/<\/script/gi,'<\\/script')+'</script></body></html>'}
export function featureAssets(features?:Partial<Features>){const f=getFeatures({features});return [...f.photobook.images,...f.gifts.accounts.map(a=>a.qrImage),f.brand.image,f.music.url].filter(Boolean)}

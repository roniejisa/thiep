export type WidgetKind='bank'|'map'|'gallery'|'countdown'|'calendar'|'timeline'|'dresscode'|'contact'|'video';
export type Widget={kind:WidgetKind;title:string;bankName?:string;accountNumber?:string;accountName?:string;qrImage?:string;address?:string;placeName?:string;images?:string[];effect?:'fade'|'slide'|'zoom';autoplay?:boolean;seconds?:number;date?:string;durationHours?:number;items?:{time:string;label:string}[];colors?:string[];note?:string;phone?:string;url?:string};
export const widgetLabels:Record<WidgetKind,string>={bank:'QR mừng cưới',map:'Bản đồ',gallery:'Album ảnh',countdown:'Đếm ngược',calendar:'Lưu lịch',timeline:'Lịch trình',dresscode:'Dress code',contact:'Liên hệ',video:'Video'};
export function defaultWidget(kind:WidgetKind):Widget{const common={kind,title:widgetLabels[kind]};switch(kind){case 'bank':return {...common,bankName:'',accountNumber:'',accountName:'',qrImage:''};case 'map':return {...common,placeName:'Địa điểm tiệc cưới',address:''};case 'gallery':return {...common,images:['/wedding-photo.jpg'],effect:'fade',autoplay:false,seconds:4};case 'countdown':return {...common,date:'2026-12-20T16:30:00+07:00'};case 'calendar':return {...common,title:'Lễ thành hôn Minh & An',date:'2026-12-20T16:30:00+07:00',durationHours:3,address:''};case 'timeline':return {...common,items:[{time:'16:30',label:'Đón khách'},{time:'17:00',label:'Lễ thành hôn'},{time:'17:30',label:'Khai tiệc'}]};case 'dresscode':return {...common,colors:['#faf6ed','#d8b383','#374f3c'],note:'Trang phục thanh lịch. Chọn một màu bạn yêu thích.'};case 'contact':return {...common,title:'Cần hỗ trợ?',phone:'',note:'Liên hệ với chúng mình để được hướng dẫn.'};case 'video':return {...common,title:'Thước phim của chúng mình',url:''}}}
export const validImage=(value:unknown)=>typeof value==='string'&&/^(https:\/\/|data:image\/(png|jpeg|webp);base64,|\/wedding-photo.jpg$)/.test(value);
export function validateWidget(value:unknown):value is Widget{
 if(!value||typeof value!=='object')return false;
 const w=value as Widget;
 if(typeof w.kind!=='string'||!Object.hasOwn(widgetLabels,w.kind)||typeof w.title!=='string'||w.title.length>300)return false;
 for(const field of ['bankName','accountNumber','accountName','address','placeName','note','phone','url','date','qrImage'] as const)if(w[field]!==undefined&&typeof w[field]!=='string')return false;
 for(const field of ['bankName','accountNumber','accountName','address','placeName','note','phone','url','date'] as const)if(w[field]&&w[field]!.length>2000)return false;
 if(w.qrImage&&!validImage(w.qrImage))return false;
 if(w.images!==undefined&&(!Array.isArray(w.images)||w.images.length>20||!w.images.every(validImage)))return false;
 if(w.effect!==undefined&&!['fade','slide','zoom'].includes(w.effect))return false;
 if(w.seconds!==undefined&&(!Number.isFinite(w.seconds)||w.seconds<2||w.seconds>30))return false;
 if(w.durationHours!==undefined&&(!Number.isFinite(w.durationHours)||w.durationHours<.5||w.durationHours>24))return false;
 if(w.date&&!Number.isFinite(Date.parse(w.date)))return false;
 if(w.autoplay!==undefined&&typeof w.autoplay!=='boolean')return false;
 if(w.colors!==undefined&&(!Array.isArray(w.colors)||w.colors.length>8||!w.colors.every(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c))))return false;
 if(w.items!==undefined&&(!Array.isArray(w.items)||w.items.length>20||!w.items.every(i=>i&&typeof i.time==='string'&&typeof i.label==='string'&&i.time.length<30&&i.label.length<200)))return false;
 if(w.url&&!youtubeEmbed(w.url))return false;
 return true;
}
export function youtubeEmbed(url:string){try{const u=new URL(url);if(u.protocol!=='https:')return null;let id='';if(['www.youtube.com','youtube.com','m.youtube.com'].includes(u.hostname))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})(?:\/|$)/)?.[1]||'';if(u.hostname==='youtu.be')id=u.pathname.slice(1);return /^[\w-]{11}$/.test(id)?'https://www.youtube-nocookie.com/embed/'+id:null}catch{return null}}
export function mapsUrl(address:string){const u=new URL('https://www.google.com/maps/search/');u.searchParams.set('api','1');u.searchParams.set('query',address);return u.href}
export function mapEmbed(address:string){const u=new URL('https://maps.google.com/maps');u.searchParams.set('q',address);u.searchParams.set('z','16');u.searchParams.set('output','embed');return u.href}
export function toPhone(value:string){const phone=value.replace(/[^+\d]/g,'');return /^\+?\d{8,15}$/.test(phone)?phone:''}
const escapeICS=(v:string)=>v.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const stamp=(date:Date)=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function foldICS(line:string){let bytes=0,out='';for(const char of line){const size=new TextEncoder().encode(char).length;if(bytes+size>75){out+='\r\n ';bytes=1}out+=char;bytes+=size}return out}
export function calendarFile(widget:Widget){const start=new Date(widget.date||'');if(!Number.isFinite(start.getTime()))throw Error('Hãy chọn ngày giờ sự kiện.');const end=new Date(start.getTime()+(widget.durationHours||3)*3600000);let hash=0;for(const char of widget.title+(widget.address||''))hash=(hash*31+char.charCodeAt(0))>>>0;return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Loi Hen//Wedding//VI','BEGIN:VEVENT','UID:'+stamp(start)+'-'+hash.toString(36)+'@loi-hen','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(start),'DTEND:'+stamp(end),'SUMMARY:'+escapeICS(widget.title),'LOCATION:'+escapeICS(widget.address||''),'DESCRIPTION:'+escapeICS(widget.note||'Thiệp mời cưới'),'END:VEVENT','END:VCALENDAR',''].map(foldICS).join('\r\n')}
export function dateInput(value:string){const date=new Date(value);if(!Number.isFinite(date.getTime()))return '';return new Date(date.getTime()+7*3600000).toISOString().slice(0,16)}
export function dateFromInput(value:string){return value?value+':00+07:00':''}

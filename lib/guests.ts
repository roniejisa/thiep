export type RSVP='pending'|'attending'|'declined';
export type Guest={id:string;invitation_id:string;public_token:string;name:string;group_name:string;phone:string;email:string;max_party:number;party_size:number;rsvp:RSVP;sent:boolean;last_opened_at?:string|null;created_at:string};
export type Wish={id:string;guest_name:string;message:string;owner_reply:string;approved:boolean;created_at:string};
export type GuestInput=Pick<Guest,'name'|'group_name'|'phone'|'email'|'max_party'>;
export function csvText(headers:string[],rows:(string|number|boolean)[][]){const cell=(value:unknown)=>{let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};return '\ufeff'+[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n')}
export function downloadCSV(name:string,headers:string[],rows:(string|number|boolean)[][]){const url=URL.createObjectURL(new Blob([csvText(headers,rows)],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function parseGuestCSV(source:string):GuestInput[]{
 const rows:string[][]=[];let row:string[]=[],value='',quoted=false;const input=source.replace(/^\ufeff/,'');if(input.length>2000000)throw Error('Tệp CSV quá lớn.');
 for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){value+='"';i++}else quoted=!quoted}else if(!quoted&&(c===','||c===';'||c==='\n')){row.push(value);value='';if(c==='\n'){rows.push(row);row=[]}}else if(c!=='\r'||quoted)value+=c}
 if(quoted)throw Error('CSV có dấu ngoặc kép chưa đóng.');if(value||row.length){row.push(value);rows.push(row)}
 const clean=rows.filter(r=>r.some(c=>c.trim()));if(!clean.length)return [];const first=clean[0].map(c=>c.trim().toLowerCase());const hasHeader=['tên','ten','name','họ tên','ho ten','tên khách mời','ten khach moi'].includes(first[0]);if(hasHeader)clean.shift();if(clean.length>500)throw Error('Mỗi lần nhập tối đa 500 khách.');
 return clean.map((r,index)=>{const guest={name:r[0]?.trim()||'',group_name:r[1]?.trim()||'',phone:r[2]?.trim()||'',email:r[3]?.trim()||'',max_party:Number(r[4]||1)};if(!validGuestInput(guest))throw Error('Thông tin khách ở dòng '+(index+(hasHeader?2:1))+' chưa hợp lệ.');return guest});
}
export function validGuestInput(value:GuestInput){return typeof value.name==='string'&&value.name.trim().length>0&&value.name.length<=120&&value.group_name.length<=120&&value.phone.length<=40&&value.email.length<=254&&(!value.email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))&&Number.isInteger(value.max_party)&&value.max_party>=1&&value.max_party<=20}

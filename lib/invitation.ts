export function normalizeGuestName(value:string){return value.trim().slice(0,120);}
export function isGuestEntry(search:string){const query=new URLSearchParams(search);return query.has('invite')||query.get('preview')==='1';}
export function invitationLink(origin:string,id:string,_config:{url:string;key:string},guestName:string,guestToken?:string){const url=new URL('/',origin);url.searchParams.set('invite',id);const name=normalizeGuestName(guestName);if(name)url.searchParams.set('guest',name);if(guestToken)url.searchParams.set('g',guestToken);return url.href;}

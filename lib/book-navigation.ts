export type BookMode='portrait'|'landscape';
// Cover is a single right page; the final cover is a single left page.
export function bookSpread(page:number,mode:BookMode,count:number):number[]{
 if(page<0||page>=count)return [];
 if(mode==='portrait'||page===0||page===count-1)return [page];
 const left=page%2?page:page-1;
 return [left,left+1].filter(index=>index<count);
}
export function nextBookPage(page:number,direction:-1|1,mode:BookMode,count:number){
 if(mode==='portrait')return Math.max(0,Math.min(count-1,page+direction));
 if(direction===1)return page===0?1:Math.min(count-1,(page%2?page:page-1)+2);
 return page<=2?0:Math.max(0,(page%2?page:page-1)-2);
}
// A flip event can precede the render's final frame. Commit only in the read state.
export function settledBookPage(current:number,pending:number,state:string){return state==='read'?pending:current;}

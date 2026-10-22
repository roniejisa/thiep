export function photoSize(width:number,height:number){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Ảnh không hợp lệ.');
 const ratio=Math.min(1,2048/Math.max(width,height));
 return {width:Math.max(1,Math.round(width*ratio)),height:Math.max(1,Math.round(height*ratio))};
}
const dataURL=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as string);reader.onerror=()=>reject(Error('Không đọc được ảnh. Hãy chọn lại.'));reader.readAsDataURL(blob)});
// Bank-issued QR images are kept byte-for-byte. Wedding photos can be smaller.
export async function readUploadImage(file:File,preserveQR=false){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024)throw Error('Chọn ảnh JPG, PNG hoặc WebP dưới 8 MB.');
 if(preserveQR||file.size<500000||typeof createImageBitmap==='undefined')return dataURL(file);
 let bitmap:ImageBitmap|undefined;
 try{
  bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
  const size=photoSize(bitmap.width,bitmap.height),canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
  const context=canvas.getContext('2d');if(!context)return dataURL(file);
  context.drawImage(bitmap,0,0,size.width,size.height);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.87));
  return dataURL(blob&&blob.size<file.size?blob:file);
 }catch{return dataURL(file)}finally{bitmap?.close()}
}

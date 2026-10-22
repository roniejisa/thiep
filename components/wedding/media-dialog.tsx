'use client';
import {useEffect,useRef,type ReactNode,type KeyboardEventHandler} from 'react';
import {X} from 'lucide-react';
export default function MediaDialog({title,onClose,children,className='',onKeyDown}:{title:string;onClose:()=>void;children:ReactNode;className?:string;onKeyDown?:KeyboardEventHandler<HTMLDialogElement>}){
 const ref=useRef<HTMLDialogElement>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=previous}},[]);
 return <dialog ref={ref} data-book-interactive className={'reader-dialog '+className} aria-label={title} onKeyDown={onKeyDown} onCancel={event=>{event.preventDefault();close.current()}} onClick={event=>{if(event.target===event.currentTarget)close.current()}}><div className="reader-dialog-shell"><header><span>{title}</span><button autoFocus aria-label="Đóng" onClick={()=>close.current()}><X size={22}/></button></header>{children}</div></dialog>
}

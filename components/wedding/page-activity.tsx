'use client';
import {createContext,useContext,useEffect,useState} from 'react';
export const PageActivity=createContext({visible:true,nearby:true});
export function usePageActivity(){return useContext(PageActivity)}
export function useForeground(){const [visible,setVisible]=useState(true);useEffect(()=>{const update=()=>setVisible(!document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[]);return visible}

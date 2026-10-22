'use client';
import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import {isGuestEntry} from '../lib/invitation';
import AdminGate from '../components/wedding/admin-gate';
const Invitation=dynamic(()=>import('./invite/page'),{ssr:false});
export default function Home(){
 const [guest,setGuest]=useState<boolean|null>(null);
 useEffect(()=>{setGuest(isGuestEntry(location.search))},[]);
 if(guest===null)return <main className="auth-loading" role="status">Đang mở Lời Hẹn…</main>;
 return guest?<Invitation/>:<AdminGate/>;
}

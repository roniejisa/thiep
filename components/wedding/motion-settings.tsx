'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Music2,Upload,Eye,Heart,Snowflake,Flower2,Sparkles,Type,RotateCcw,Minus,Bird,Balloon,PartyPopper,HeartHandshake} from 'lucide-react';
import type {Features} from '../../lib/features';
import InvitationAtmosphere from './invitation-atmosphere';

type Props={music:Features['music'];effects:Features['effects'];locked:boolean;onMusic:(patch:Partial<Features['music']>)=>void;onEffects:(patch:Partial<Features['effects']>)=>void;onUpload:(file?:File)=>void;onPreview?:()=>void};
const textStyles=[{id:'none',name:'Tĩnh',detail:'Luôn hiển thị'},{id:'fade',name:'Hiện dần',detail:'Mờ nhẹ → rõ nét'},{id:'rise',name:'Lướt nhẹ',detail:'Theo chiều cuộn'},{id:'zoom',name:'Phóng nhẹ',detail:'Thu nhỏ → đầy đặn'}] as const;
const atmospheres=[{id:'none',name:'Tắt',icon:Minus},{id:'hearts',name:'Tim bay',icon:Heart},{id:'hearts-fall',name:'Tim rơi',icon:HeartHandshake},{id:'birds',name:'Chim bay',icon:Bird},{id:'balloons',name:'Bóng bay',icon:Balloon},{id:'confetti',name:'Pháo giấy',icon:PartyPopper},{id:'snow',name:'Tuyết rơi',icon:Snowflake},{id:'petals',name:'Hoa rơi',icon:Flower2},{id:'sparkles',name:'Lấp lánh',icon:Sparkles},{id:'custom',name:'Ký hiệu riêng',icon:Type}] as const;
export default function MotionSettings({music,effects,locked,onMusic,onEffects,onUpload,onPreview}:Props){
 const previewAudio=useRef<HTMLAudioElement>(null);
 useEffect(()=>{if(previewAudio.current)previewAudio.current.volume=(music.volume??45)/100},[music.volume,music.url]);
 const [replay,setReplay]=useState(0),[audioError,setAudioError]=useState(false);
 const text=effects.text??'rise';
 return <div className="motion-settings">
  <div className="manager-section-heading motion-heading"><div><span className="motion-eyebrow">ÂM THANH & CHUYỂN ĐỘNG</span><h3>Cho lời hẹn thêm rung động</h3><p>Nhạc của bạn, chữ chuyển động theo nhịp cuộn, cùng những điểm nhấn thật nhẹ.</p></div>{onPreview&&<button className="motion-preview-button" disabled={locked} onClick={onPreview}><Eye size={17}/>Xem thử toàn bộ thiệp</button>}</div>
  <div className="manager-grid motion-settings-grid">
   <section className="manager-card music-settings-card">
    <div className="motion-card-title"><Music2 size={23}/><div><h3>Nhạc nền cá nhân</h3><p>{music.url?music.enabled?'Đã bật · khách chạm để phát':'Đã chọn nhạc · đang tắt':'Chưa chọn bài nhạc'}</p></div><label className="motion-switch"><input type="checkbox" aria-label="Bật nhạc nền cá nhân" checked={music.enabled} onChange={e=>onMusic({enabled:e.target.checked})}/><span/></label></div>
    <label className="manager-upload music-upload"><Upload size={23}/><span><strong>Tải bài nhạc của bạn</strong><small>MP3, M4A, AAC, WAV, OGG, WebM · tối đa 20 MB</small></span><input type="file" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.webm" disabled={locked} onChange={e=>{setAudioError(false);onUpload(e.target.files?.[0]);e.target.value=''}}/></label>
    <label>Hoặc dán liên kết nhạc HTTPS<input type="url" aria-label="Liên kết nhạc nền" placeholder="https://…/bai-nhac-cua-ban.mp3" value={music.url.startsWith('data:')?'':music.url} onChange={e=>{setAudioError(false);onMusic({url:e.target.value,name:'',enabled:Boolean(e.target.value)})}}/></label>
    {music.url?<div className="selected-music"><div><Music2 size={17}/><span>{music.name||'Bài nhạc từ liên kết'}</span><button aria-label="Xóa nhạc nền" disabled={locked} onClick={()=>{setAudioError(false);onMusic({url:'',name:'',enabled:false})}}>Xóa</button></div><audio ref={previewAudio} key={music.url} controls src={music.url} preload="none" loop={music.loop??true} onLoadedMetadata={event=>{event.currentTarget.volume=(music.volume??45)/100}} onPlay={()=>setAudioError(false)} onError={()=>setAudioError(true)}/>{audioError&&<p role="alert" className="manager-error">Chưa đọc được bài nhạc. Kiểm tra tệp hoặc liên kết âm thanh.</p>}</div>:<p className="music-empty-note">Chọn bài nhạc trước, rồi nghe thử ngay tại đây.</p>}
    <label>Âm lượng <span className="motion-range-value">{music.volume??45}%</span><input aria-label="Âm lượng nhạc nền" type="range" min={0} max={100} step={5} value={music.volume??45} onChange={e=>onMusic({volume:Number(e.target.value)})}/></label>
    <label className="motion-checkbox"><input type="checkbox" checked={music.loop??true} onChange={e=>onMusic({loop:e.target.checked})}/><span>Lặp lại bài nhạc</span></label>
    <p className="manager-help">Trên điện thoại, nút Phát nhạc luôn ở góc dưới thiệp. Khách chạm để nghe và chạm lại để tạm dừng.</p>
   </section>
   <section className="manager-card scroll-settings-card">
    <div className="motion-card-title"><Type size={23}/><div><h3>Hiệu ứng chữ khi cuộn</h3><p>Cuộn xuống, cuộn lên đều có chuyển động</p></div></div>
    <div className="text-style-options" role="group" aria-label="Kiểu hiệu ứng chữ">{textStyles.map(style=><button key={style.id} type="button" aria-pressed={text===style.id} disabled={locked} onClick={()=>{onEffects({text:style.id});setReplay(value=>value+1)}}><strong>{style.name}</strong><small>{style.detail}</small></button>)}</div>
    <div className="text-motion-demo" data-demo-effect={text} style={{'--demo-duration':(effects.duration??700)+'ms'} as CSSProperties}><div key={text+'-'+replay}><span className="demo-kicker">CHUYỆN CỦA CHÚNG MÌNH</span><p className="demo-names">Minh <i>&</i> An</p><p className="demo-quote">Một đời thương. Một đời bên nhau.</p></div><button disabled={text==='none'} onClick={()=>setReplay(value=>value+1)}><RotateCcw size={14}/>Xem lại hiệu ứng chữ</button></div>
    <label className="motion-checkbox"><input type="checkbox" checked={effects.repeat??true} disabled={text==='none'} onChange={e=>onEffects({repeat:e.target.checked})}/><span>Chạy lại mỗi khi chữ vào màn hình<small>Bật để thấy hiệu ứng cả khi cuộn ngược lên.</small></span></label>
    <label>Thời gian chuyển động <span className="motion-range-value">{((effects.duration??700)/1000).toFixed(2)} giây</span><input aria-label="Thời gian hiệu ứng chữ" type="range" min={300} max={1600} step={50} disabled={text==='none'} value={effects.duration??700} onChange={e=>onEffects({duration:Number(e.target.value)})}/></label>
   </section>
  </div>
  <section className="manager-card atmosphere-settings-card"><div className="motion-card-title"><Sparkles size={23}/><div><h3>Chim, bóng bay & những điều lãng mạn</h3><p>Chọn một hiệu ứng để xem ngay bên dưới.</p></div></div>
   <div className="atmosphere-options" role="group" aria-label="Hiệu ứng nền">{atmospheres.map(item=><button key={item.id} aria-pressed={effects.kind===item.id} disabled={locked} onClick={()=>onEffects({kind:item.id})}><item.icon size={24}/><span>{item.name}</span></button>)}</div>
   {effects.kind==='custom'&&<label>Ký hiệu của bạn<input aria-label="Ký hiệu hiệu ứng" maxLength={8} value={effects.symbol} onChange={e=>onEffects({symbol:e.target.value})} placeholder="♡"/></label>}
   <div className="atmosphere-stage" data-kind={effects.kind}><InvitationAtmosphere effects={effects} preview/><div><span className="motion-eyebrow">MỘT CHÚT LÃNG MẠN</span><p>{effects.kind==='none'?'Bình yên theo cách của mình':atmospheres.find(item=>item.id===effects.kind)?.name}</p><small>{effects.kind==='none'?'Chọn chim bay, bóng bay, tim rơi hoặc một hiệu ứng bạn thích.':'Bản xem thử trực tiếp · không che thao tác chạm của khách'}</small></div></div>
   <label>Mật độ <span className="motion-range-value">{(effects.density??18)<=12?'Nhẹ':(effects.density??18)<=22?'Vừa':'Nhiều'}</span><input aria-label="Mật độ hiệu ứng nền" type="range" min={8} max={32} step={2} value={effects.density??18} disabled={effects.kind==='none'} onChange={e=>onEffects({density:Number(e.target.value)})}/></label>
   <p className="manager-help">Hiệu ứng được lưu cùng thiệp. Mật độ tự giảm trên điện thoại để giữ thao tác mượt. Thiết bị bật Giảm chuyển động sẽ ưu tiên nội dung tĩnh.</p>
  </section>
 </div>;
}

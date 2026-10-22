import type {Metadata,Viewport} from 'next';
import './fonts.css';
import './globals.css';
import './reader.css';
import './features.css';
import './motion.css';
import './celebration.css';
import './invitation.css';
import './editor-scroll.css';
import './auth.css';
export const metadata:Metadata={title:'Lời Hẹn · Wedding Studio',description:'Thiết kế thiệp cưới của riêng bạn. Một câu chuyện tình yêu, mở ra từ những điều đẹp nhất.',icons:{icon:'/favicon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#f4f3eb'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="vi" suppressHydrationWarning><head><link rel="preload" href="/fonts/wedding-serif.woff" as="font" type="font/woff" crossOrigin="anonymous"/><link rel="preload" href="/fonts/wedding-serif-italic.woff" as="font" type="font/woff" crossOrigin="anonymous"/><link rel="preload" href="/fonts/wedding-sans.woff" as="font" type="font/woff" crossOrigin="anonymous"/></head><body>{children}<noscript><p className="javascript-note">Vui lòng bật JavaScript trong trình duyệt để xem thiệp cưới.</p></noscript></body></html>}

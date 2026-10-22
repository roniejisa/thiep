import type {Design,Element,Page} from './document';

export const atelierDesign:Design={id:'fairytale',name:'Cổ tích giấy ngà',accent:'#a88b5c',ink:'#344c40',cover:'#fbf7ef',pattern:'storybook',photoShape:'rect'};
const ink=atelierDesign.ink,gold=atelierDesign.accent,cream='#f6f0e3';
function text(id:string,value:string,x:number,y:number,width:number,fontSize:number,color=ink,font='serif',align:Element['align']='center'):Element{return {id,type:'text',value,x,y,width,height:8,fontSize,color,font,align}}
function photo(id:string,x:number,y:number,width:number,height:number,shape:Element['shape']='rect'):Element{return {id,type:'image',value:'/wedding-photo.jpg',x,y,width,height,fontSize:16,color:ink,font:'serif',align:'center',shape}}
export function atelierPages():Page[]{return [
 {id:'cover',layout:'atelier',title:'Lời mở đầu',elements:[
  text('intro','THE WEDDING CELEBRATION',10,65,80,9,gold,'sans-serif'),
  text('names','Minh & An',5,69,90,59,ink,'cursive'),
  photo('photo',0,0,100,60),
  text('quote','Một đời thương. Một đời bên nhau.',10,87,80,15,ink,'cursive'),
  text('date','20  /  12  /  2026',10,82,80,16,ink,'sans-serif'),
  text('invite','TRÂN TRỌNG KÍNH MỜI',10,94,80,8,gold,'sans-serif')
 ]},
 {id:'story',layout:'atelier',title:'Chuyện chúng mình',background:'#2b4338',elements:[
  text('chapter','01  /  CHUYỆN CHÚNG MÌNH',10,14,80,9,'#c5b387','sans-serif'),
  text('story-title','Từ một lời chào,\nđến một đời bên nhau.',10,27,80,34,cream,'cursive'),
  text('story-copy','Giữa bao người, chúng mình đã gặp nhau.\nTừ những điều nhỏ bé mỗi ngày,\nmột câu chuyện thật đẹp đã bắt đầu.',10,48,80,17,'#e5e2d7'),
  text('story-end','Và từ hôm nay,\nchúng mình viết tiếp cùng nhau.',14,73,72,24,'#d3bd90','cursive')
 ]},
 {id:'event',layout:'atelier',title:'Ngày chung đôi',elements:[
  text('event-label','02  /  NGÀY CHUNG ĐÔI',10,13,80,9,gold,'sans-serif'),
  text('event-title','Trân trọng\nkính mời',12,24,76,42,ink,'cursive'),
  text('event-time','16:30 · Chủ nhật\n20 tháng 12 năm 2026',12,47,76,22),
  text('event-place','Địa điểm tiệc cưới\nĐiền tên nhà hàng và địa chỉ tại đây',13,66,74,16),
  text('event-footer','Sự hiện diện của bạn\nlà món quà quý giá nhất.',12,85,76,17,gold,'cursive')
 ]},
 {id:'thanks',layout:'atelier',title:'Lời cảm ơn',elements:[
  photo('thanks-photo',8,9,84,46),
  text('thanks-label','MỘT KHỞI ĐẦU MỚI',10,61,80,9,gold,'sans-serif'),
  text('thanks-title','Hẹn bạn trong\nngày hạnh phúc.',10,68,80,35,ink,'cursive'),
  text('thanks-copy','Cảm ơn vì đã là một phần\ntrong câu chuyện của chúng mình.',12,83,76,16),
  text('thanks-names','With love, Minh & An',10,93,80,17,gold,'cursive')
 ]}
]}

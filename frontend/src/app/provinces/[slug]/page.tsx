'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, MapPin, ExternalLink, Clock } from 'lucide-react';

interface Place {
  id: string;
  name: string;
  rating?: number;
  type?: string;
  status?: string;
  description: string;
  bullets?: string[];
  image: string;
  mapsUrl?: string;
}

interface ProvinceData {
  id: string;
  nameTh: string;
  nameEn: string;
  subtitle?: string;
  color: string;
  coverImage: string;
  restaurants: Place[];
  attractions: Place[];
  souvenirs?: Place[];
}

const PATTANI_SOUVENIRS: Place[] = [
  {
    "id": "ps1",
    "name": "ร้านยีโอ๊ะ",
    "description": "ร้านของฝากท้องถิ่นในเมืองปัตตานีที่มีสินค้าและขนมพื้นเมืองจำหน่าย\n\nจุดเด่น: ปลาแห้ง, อาหารทะเลแปรรูป, ขนมพื้นบ้าน\n",
    "image": "https://p16-va.lemon8cdn.com/tos-alisg-v-a3e477-sg/ocqVa1gO7iAgwAFyEHAdIXE1PdeDPCBQ4Bz2fi~tplv-tej9nj120t-origin.webp",
    "rating": 4.2,
    "type": "🎁 ร้านค้า",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%A2%E0%B8%B5%E0%B9%82%E0%B8%AD%E0%B9%8A%E0%B8%B0%20%E0%B8%9B%E0%B8%B1%E0%B8%95%E0%B8%95%E0%B8%B2%E0%B8%99%E0%B8%B5"
  },
  {
    "id": "ps2",
    "name": "ร้านตานีของฝาก",
    "description": "แหล่งรวมของฝากประจำจังหวัดที่มีความหลากหลาย เดินทางสะดวก\n\nจุดเด่น: อาหารแห้ง, อาหารทะเลแปรรูป, ขนมท้องถิ่น\n",
    "image": "https://img.wongnai.com/p/1920x0/2023/01/25/3bb0b3e6170743d381fa609cdf98f6f1.jpg",
    "rating": 4.7,
    "type": "🎁 ร้านค้า",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%95%E0%B8%B2%E0%B8%99%E0%B8%B5%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%9D%E0%B8%B2%E0%B8%81%20%E0%B8%9B%E0%B8%B1%E0%B8%95%E0%B8%95%E0%B8%B2%E0%B8%99%E0%B8%B5"
  },
  {
    "id": "ps3",
    "name": "ร้านบุหงาตานี",
    "description": "ร้านของฝากอีกแห่งในปัตตานีที่มีสินค้าท้องถิ่นให้เลือกซื้อ\n\nจุดเด่น: ผลิตภัณฑ์อาหารแปรรูป, ของกินเล่น\n",
    "image": "https://explorelocalcharm.com/wp-content/uploads/2025/08/unnamed.webp",
    "rating": 4.7,
    "type": "🛒 ร้านขายของชำ",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%AB%E0%B8%87%E0%B8%B2%E0%B8%95%E0%B8%B2%E0%B8%99%E0%B8%B5%20%E0%B8%9B%E0%B8%B1%E0%B8%95%E0%B8%95%E0%B8%B2%E0%B8%99%E0%B8%B5"
  },
  {
    "id": "ps4",
    "name": "Farm Outlet Pattani Cafe & Souvenir",
    "description": "ศูนย์จำหน่ายสินค้าเกษตรและของฝากที่ควบคู่กับบรรยากาศร้านกาแฟ\n\nจุดเด่น: สินค้าเกษตรแปรรูป, เครื่องดื่ม\n",
    "image": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=61561401759588",
    "rating": 4.7,
    "type": "🛍️ ร้านค้า",
    "mapsUrl": "https://maps.google.com/?q=Farm%20Outlet%20Pattani%20Cafe%20%26%20Souvenir%20%E0%B8%9B%E0%B8%B1%E0%B8%95%E0%B8%95%E0%B8%B2%E0%B8%99%E0%B8%B5"
  },
  {
    "id": "ps5",
    "name": "ร้านอาซัน ของฝาก",
    "description": "ร้านของฝากในย่านจะบังติกอ\n\nจุดเด่น: ขนมและของฝากพื้นบ้าน\n",
    "image": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=766011841045999",
    "rating": 4.6,
    "type": "🛒 ร้านขายของชำ",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%B2%E0%B8%8B%E0%B8%B1%E0%B8%99%20%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%9D%E0%B8%B2%E0%B8%81%20%E0%B8%9B%E0%B8%B1%E0%B8%95%E0%B8%95%E0%B8%B2%E0%B8%99%E0%B8%B5"
  }
];
const YALA_SOUVENIRS: Place[] = [
  {
    "id": "ys1",
    "name": "ร้านเฮน เบเกอรี่",
    "description": "ร้านขนมและเบเกอรี่เก่าแก่ในเมืองยะลา\n\nจุดเด่น: เบเกอรี่, ขนมของฝาก\n",
    "image": "https://p16-va.lemon8cdn.com/tos-alisg-v-a3e477-sg/7ed69a3eb5894c87916a58b40488113f~tplv-tej9nj120t-origin.webp",
    "rating": 3.9,
    "type": "🛍️ ร้านค้า",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B9%80%E0%B8%AE%E0%B8%99%20%E0%B9%80%E0%B8%9A%E0%B9%80%E0%B8%81%E0%B8%AD%E0%B8%A3%E0%B8%B5%E0%B9%88%20%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2"
  },
  {
    "id": "ys2",
    "name": "ร้านหยกสวย",
    "description": "ร้านจำหน่ายขนมและของฝากประจำเมืองยะลา\n\nจุดเด่น: ขนมท้องถิ่น, ของกินเล่น\n",
    "image": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1219766956929897",
    "rating": 4.6,
    "type": "🛒 ร้านขายของชำ",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AB%E0%B8%A2%E0%B8%81%E0%B8%AA%E0%B8%A7%E0%B8%A2%20%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2"
  },
  {
    "id": "ys3",
    "name": "ร้านแวนด้า บ้านขนมของฝาก",
    "description": "ร้านของฝากที่มีขนมหลากหลายรูปแบบ เหมาะสำหรับเลือกซื้อของขวัญและขนมของฝาก\n\nจุดเด่น: ของขวัญ, ขนมของฝาก\n",
    "image": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=459459484410532",
    "rating": 4.1,
    "type": "🍞 ร้านเบเกอรี่",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B9%81%E0%B8%A7%E0%B8%99%E0%B8%94%E0%B9%89%E0%B8%B2%20%E0%B8%9A%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%82%E0%B8%99%E0%B8%A1%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%9D%E0%B8%B2%E0%B8%81%20%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2"
  },
  {
    "id": "ys4",
    "name": "วุ้นคุณเชียร์ ยะลา WoonKhunCheer",
    "description": "ร้านขนมหวานและวุ้นเป็ดที่มีชื่อเสียง\n\nจุดเด่น: วุ้นเป็ดดีไซน์ต่างๆ\n",
    "image": "https://files.thailandtourismdirectory.go.th/assets/upload/2018/12/13/20181213d4edc67143bd9837fcb2819fe44dbb66163411.jpg",
    "rating": 4.2,
    "type": "🍰 ร้านขนมหวาน",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%A7%E0%B8%B8%E0%B9%89%E0%B8%99%E0%B8%84%E0%B8%B8%E0%B8%93%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%A3%E0%B9%8C%20%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2%20WoonKhunCheer%20%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2"
  },
  {
    "id": "ys5",
    "name": "ส้มโชกุนนวเกษตร",
    "description": "ร้านจำหน่ายผลไม้และส้มโชกุน สินค้าขึ้นชื่อของยะลา\n\nจุดเด่น: ส้มโชกุนสดใหม่จากสวน\n",
    "image": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=577000211918096",
    "rating": 4.6,
    "type": "🎁 ร้านค้า",
    "mapsUrl": "https://maps.google.com/?q=%E0%B8%AA%E0%B9%89%E0%B8%A1%E0%B9%82%E0%B8%8A%E0%B8%81%E0%B8%B8%E0%B8%99%E0%B8%99%E0%B8%A7%E0%B9%80%E0%B8%81%E0%B8%A9%E0%B8%95%E0%B8%A3%20%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2"
  }
];

const PATTANI_RESTAURANTS: Place[] = [
  { id: 'r1', name: 'The Pattanion (เดอะ ปัตตาเนี่ยน)', rating: 4.9, type: '☕ ร้านกาแฟ', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารและคาเฟ่สไตล์โฮมเมด ตกแต่งสวยงามบรรยากาศอบอุ่น', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=522769479989038', mapsUrl: 'https://maps.google.com/?q=The+Pattanion' },
  { id: 'r2', name: 'กาลครั้งหนึ่ง คาเฟ่', rating: 4.4, type: '☕ ร้านกาแฟ', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'คาเฟ่และร้านอาหารตกแต่งสไตล์วินเทจ มีโซนให้เลือกนั่งหลากหลาย', bullets: [], image: 'https://trueid-slsapp-storage-prod.s3-ap-southeast-1.amazonaws.com/partner_files/trueidintrend/15097/_MG_8357_0.JPG', mapsUrl: 'https://maps.google.com/?q=กาลครั้งหนึ่ง+คาเฟ่' },
  { id: 'r3', name: 'กะมา ข้าวยำราชา - Nasi Kerabu Raja', rating: 4.7, type: '🍽️ ร้านอาหาร', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านข้าวยำปัตตานีรสชาติต้นตำรับที่ได้รับความนิยมอย่างมาก', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2022/05/08/31bcf9fb64204c179a7f6f3d67e9edf7.jpg', mapsUrl: 'https://maps.google.com/?q=กะมา+ข้าวยำราชา' },
  { id: 'r4', name: 'ร้านซุปเจ๊ะเยาะ เจ้าเก่า', rating: 4.4, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดเวลา 10:00 ก่อนเที่ยง', description: 'ร้านซุปเนื้อและซุปวัวเจ้าเก่าแก่แห่งเมืองปัตตานี', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1710446597008908', mapsUrl: 'https://maps.google.com/?q=ร้านซุปเจ๊ะเยาะ' },
  { id: 'r5', name: 'โรตีดีฟอเรส ปัตตานี', rating: 4.4, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 11:00 หลังเที่ยง', description: 'ร้านโรตีและชาชักชื่อดัง บรรยากาศร่มรื่น นั่งสบาย', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=707910204944199', mapsUrl: 'https://maps.google.com/?q=โรตีดีฟอเรส' },
  { id: 'r6', name: 'สะเต๊ะ ศรีเมือง (เจ้าเก่า)', rating: 4.4, type: '📍 ภัตตาคารอาหารอินโดนีเซีย', status: 'เปิดเวลา 9:00 ก่อนเที่ยง', description: 'ร้านสะเต๊ะเจ้าดั้งเดิมประจำเมืองปัตตานี ย่างบนเตาถ่านหอมๆ', bullets: [], image: 'https://mpics.mgronline.com/pics/Images/561000013369401.JPEG', mapsUrl: 'https://maps.google.com/?q=สะเต๊ะศรีเมือง' },
  { id: 'r7', name: 'ห้องอาหารบุหงารายา - C.S.Pattani Hotel', rating: 4.5, type: '🍽️ ภัตตาคารโรงแรม', status: 'เปิดอยู่', description: 'ห้องอาหารฮาลาลมาตรฐานระดับโรงแรม ตั้งอยู่ในโรงแรม ซี.เอส. ปัตตานี', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2020/03/09/84c31b4087cf4fa4868c2a56d5f4896f.jpg', mapsUrl: 'https://maps.google.com/?q=C.S.Pattani' },
  { id: 'r8', name: 'DERNDIN HOUSE', rating: 4.8, type: '🍦 ร้านไอศกรีม / คาเฟ่', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารแนวสร้างสรรค์ที่นำเอาวัตถุดิบและอาหารท้องถิ่นมาแปรรูป', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2024/11/02/06be3b251aa54362a5401c5c1025f229.jpg', mapsUrl: 'https://maps.google.com/?q=DERNDIN+HOUSE' },
  { id: 'r9', name: 'LEMU.Co - Halal Steakhouse PATTANI', rating: 4.5, type: '🥩 ร้านสเต๊กฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 8:30 หลังเที่ยง', description: 'ร้านสเต๊กฮาลาลคุณภาพเยี่ยม เอาใจคนรักสายเนื้อ', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122105718002971881', mapsUrl: 'https://maps.google.com/?q=LEMU.Co' },
  { id: 'r10', name: 'ร้านแบมะ ซุป ข้าวต้ม', rating: 4.3, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านซุปและอาหารตามสั่งราคาย่อมเยา น้ำซุปรสชาติเข้มข้น', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2019/08/23/fe0027b500914dcf8654aa60e30231cb.jpg', mapsUrl: 'https://maps.google.com/?q=ร้านแบมะซุป' },
  { id: 'r11', name: 'BlueBird Brasserie Pattani', rating: 4.3, type: '🍽️ ภัตตาคารอาหารอเมริกัน', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารสไตล์บราสเซอรี บรรยากาศดี ตกแต่งร้านสวยงาม', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=483207333254767', mapsUrl: 'https://maps.google.com/?q=BlueBird' },
  { id: 'r12', name: 'โรงปี๊บ', rating: 4.4, type: '🍽️ ภัตตาคารอาหารไทย', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านอาหารบรรยากาศคลาสสิกที่ดัดแปลงมาจากโรงงานทำปี๊บเก่า', bullets: [], image: 'https://img.wongnai.com/p/1600x0/2024/09/13/82d5e5a7d91b45bb9da2cc9d33ba6c2e.jpg', mapsUrl: 'https://maps.google.com/?q=โรงปี๊บ' },
  { id: 'r13', name: 'ซันก้ามปู Sea the Sun', rating: 4.2, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านอาหารทะเลฮาลาลยอดนิยม รสชาติจัดจ้าน', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2024/05/16/1890723b2c804376b8d8a39b07f5fef2.jpg', mapsUrl: 'https://maps.google.com/?q=ซันก้ามปู' },
  { id: 'r14', name: 'LYSM café', rating: 4.9, type: '☕ ร้านกาแฟ', status: 'เปิดอยู่ · ปิดเวลา 10:00 หลังเที่ยง', description: 'คาเฟ่และร้านขนมหวานบรรยากาศนั่งสบาย มีเมนูของหวานให้เลือกทานอย่างจุใจ', bullets: [], image: 'https://img.wongnai.com/p/400x0/2022/03/31/8d58b597e0ae49c7adb16b3b78bddf6b.jpg', mapsUrl: 'https://maps.google.com/?q=LYSM' },
  { id: 'r15', name: 'SA-MI-LAE. Cafe\' & Relax Space', rating: 4.3, type: '☕ ร้านกาแฟ', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'คาเฟ่บรรยากาศสบายๆ ใกล้มหาวิทยาลัย เหมาะสำหรับนักศึกษา', bullets: [], image: 'https://img.wongnai.com/p/624x0/2018/02/20/e43987d7bf3049dc9b4074eed61fa82c.jpg', mapsUrl: 'https://maps.google.com/?q=Samilare' },
  { id: 'r16', name: 'ไก่กอและ "กะเมาะ" รามโกมุท ซอย 4', rating: 4.6, type: '🥩 ร้านอาหาร', status: 'เปิดเวลา 10:00 ก่อนเที่ยง', description: 'ร้านไก่กอและเจ้าดังประจำเมืองปัตตานี ย่างเตาถ่านสดใหม่', bullets: [], image: 'https://www.dailynews.co.th/wp-content/uploads/2026/04/IMG_3543.jpeg', mapsUrl: 'https://maps.google.com/?q=ไก่กอและกะเมาะ' },
  { id: 'r17', name: 'ข้าวมันไก่ โกจิว', rating: 4.0, type: '🍽️ ร้านอาหาร', status: 'เปิดเวลา 7:00 ก่อนเที่ยง', description: 'ร้านข้าวมันไก่ฮาลาลระดับตำนานของปัตตานี ขายมายาวนาน', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1557833634568211', mapsUrl: 'https://maps.google.com/?q=ข้าวมันไก่โกจิว' },
  { id: 'r18', name: 'ร้านแวมะโรตี', rating: 4.4, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านโรตีและชาเช้า-เย็น รสชาติต้นตำรับแบบปัตตานีแท้ๆ', bullets: [], image: 'https://t1.blockdit.com/photos/2020/07/5f09ac50b82c760cc1b003f6_800x0xcover_JkE7ac-a.jpg', mapsUrl: 'https://maps.google.com/?q=แวมะโรตี' },
  { id: 'r19', name: 'สะเต๊ะบังเล๊าะ เจ้าเก่า', rating: 4.2, type: '📍 ภัตตาคารอาหารอินโดนีเซีย', status: 'เปิดเวลา 9:00 ก่อนเที่ยง', description: 'อีกหนึ่งร้านสะเต๊ะเตาถ่านรสเด็ด ย่างหอมๆ ราดน้ำจิ้มรสชาติพอดี', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=341398357304166', mapsUrl: 'https://maps.google.com/?q=สะเต๊ะบังเล๊าะ' },
  { id: 'r20', name: 'เมาะซูซุปช่อมาลี', rating: 4.2, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านซุปช่อมาลีชื่อดังที่ใครมาปัตตานีก็ต้องแวะลอง', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2016/09/05/3512212cf61b47cc919b0f58f75a0918.jpg', mapsUrl: 'https://maps.google.com/?q=เมาะซูซุปช่อมาลี' }
];

const PATTANI_ATTRACTIONS: Place[] = [
  { id: 'a1', name: 'มัสยิดกลางจังหวัดปัตตานี', rating: 4.7, type: '🕌 มัสยิด', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'มัสยิดที่สวยงามที่สุดแห่งหนึ่งในประเทศไทย มีสถาปัตยกรรมโดดเด่น', bullets: [], image: 'https://f.tpkcdn.com/images-source/a8a2c0d32335790796da242195fc2f46.JPG', mapsUrl: 'https://maps.google.com/?q=มัสยิดกลางปัตตานี' },
  { id: 'a2', name: 'ศาลเจ้าแม่ลิ้มกอเหนี่ยว', rating: 4.7, type: '📍 สถานที่ประกอบพิธีกรรมทางศาสนา', status: 'ปิดอยู่ · เปิดเวลา 6:00 ก่อนเที่ยง', description: 'ศาลเจ้าศักดิ์สิทธิ์คู่บ้านคู่เมืองปัตตานี เป็นศูนย์รวมจิตใจ', bullets: [], image: 'https://sayhithailand.com/img/travel/1755931300Sayhithailand01.jpg', mapsUrl: 'https://maps.google.com/?q=ศาลเจ้าแม่ลิ้มกอเหนี่ยว' },
  { id: 'a3', name: 'วัดช้างให้ราษฎร์บูรณาราม หลวงพ่อทวด', rating: 4.7, type: '📍 วัด', status: 'ปิดอยู่ · เปิดเวลา 8:00 ก่อนเที่ยง', description: 'วัดเก่าแก่ต้นกำเนิดของหลวงปู่ทวด เหยียบน้ำทะเลสด', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=100298308247671', mapsUrl: 'https://maps.google.com/?q=วัดช้างให้' },
  { id: 'a4', name: 'มัสยิดกรือเซะ', rating: 4.7, type: '🕌 มัสยิด', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'มัสยิดโบราณอายุกว่า 200 ปี สร้างด้วยอิฐถือปูนที่มีเอกลักษณ์', bullets: [], image: 'https://mpics.mgronline.com/pics/Images/567000001803403.JPEG', mapsUrl: 'https://maps.google.com/?q=มัสยิดกรือเซะ' },
  { id: 'a5', name: 'มัสยิดรายอฟาฏอนี مسجد راج فطاني', rating: 4.7, type: '🕌 มัสยิด', status: 'เปิดอยู่', description: 'มัสยิดประจำย่านจะบังติกอ มีความงดงามตามแบบสถาปัตยกรรมอิสลามดั้งเดิม', bullets: [], image: 'https://i.ytimg.com/vi/1Wg4-ZxAXYc/maxresdefault.jpg', mapsUrl: 'https://maps.google.com/?q=มัสยิดรายอฟาฏอนี' },
  { id: 'a6', name: 'วัดมุจลินทวาปีวิหาร, พระอารามหลวง', rating: 4.7, type: '📍 วัด', status: 'เปิดอยู่', description: 'พระอารามหลวงเก่าแก่ในอำเภอหนองจิก ภายในมีพระอุโบสถและวิหารที่เงียบสงบ', bullets: [], image: 'https://files.thailandtourismdirectory.go.th/assets/upload/2017/11/14/20171114e404427e764c649f38d0c7540767223a094627.jpg', mapsUrl: 'https://maps.google.com/?q=วัดมุจลินทวาปีวิหาร' },
  { id: 'a7', name: 'สวนสมเด็จพระศรีนครินทร์ ปัตตานี', rating: 4.4, type: '🏞️ สวนสาธารณะ', status: 'เปิดอยู่ · ปิดเวลา 11:00 หลังเที่ยง', description: 'สวนสาธารณะริมทะเลขนาดใหญ่ เป็นที่ตั้งของ Skywalk ปัตตานี', bullets: [], image: 'https://novotelbangkokimpact.com/wp-content/uploads/sites/59/2016/11/17-Suan-Somdet-Ya-Srinagarindra-Park.jpg', mapsUrl: 'https://maps.google.com/?q=สวนสมเด็จพระศรีนครินทร์' },
  { id: 'a8', name: 'วังเจ้าเมืองปัตตานี', rating: 4.5, type: '🎓 สถาบันการศึกษา', status: 'ปิดอยู่ · เปิดเวลา 8:00 ก่อนเที่ยง', description: 'อาคารเรือนไม้โบราณในย่านจะบังติกอ สะท้อนประวัติศาสตร์การปกครอง', bullets: [], image: 'https://1.bp.blogspot.com/-4NbeZFsHNfc/WH8UyFS33jI/AAAAAAAADD8/4mzEcDubiAgwYl_qBVqzhLhwT5KVWiPBwCLcB/s1600/%25E0%25B8%259C%25E0%25B8%25B1%25E0%25B8%2587%25E0%25B9%2580%25E0%25B8%25A1%25E0%25B8%25B7%25E0%25B8%25AD%25E0%25B8%2587.jpg', mapsUrl: 'https://maps.google.com/?q=วังเจ้าเมืองปัตตานี' },
  { id: 'a9', name: 'วังยะหริ่ง', rating: 4.5, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 9:00 ก่อนเที่ยง', description: 'วังเก่าแก่ทรงคลาสสิกที่ผสมผสานสถาปัตยกรรมไทย ยุโรป และมลายู', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=100069337658552', mapsUrl: 'https://maps.google.com/?q=วังยะหริ่ง' },
  { id: 'a10', name: 'บ้านเลขที่ 5 กือดาจีนอ', rating: 4.7, type: '🏢 ชุมชนย่านเก่า', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ย่านชุมชนชาวจีนโบราณริมแม่น้ำปัตตานี เต็มไปด้วยอาคารไม้เก่าแก่', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=632313772650461', mapsUrl: 'https://maps.google.com/?q=กือดาจีนอ' },
  { id: 'a11', name: 'บ้านขุนพิทักษ์รายา', rating: 4.6, type: '📜 พิพิธภัณฑ์', status: 'เปิดอยู่', description: 'เรือนโบราณทรงคุณค่าในย่านกือดาจีนอ ที่ได้รับการบูรณะเป็นแหล่งเรียนรู้', bullets: [], image: 'https://lh6.googleusercontent.com/B21GK6KSueAB6IfoQyA2fHtrymxnGctWoLhD2P8muo0vk-4HIZ8NhCgW2h5_Cts6nLRUF21dIlso3FSowWsigTBBvXFrbr9u840FvmU9gX9reUA6muNpQF5XUQqTo10W1dQXSvfoR0BpyVIOqQ_BZAeYElGJMPqiR3nc4UYffZdYD-3dqqULEw=w1280', mapsUrl: 'https://maps.google.com/?q=บ้านขุนพิทักษ์รายา' },
  { id: 'a12', name: 'เมืองโบราณยะรัง', rating: 4.4, type: '🏺 พิพิธภัณฑ์', status: 'ปิดอยู่ · เปิดเวลา 8:30 ก่อนเที่ยง', description: 'แหล่งโบราณคดีสำคัญที่มีร่องรอยอาณาจักรลังกาสุกะโบราณ', bullets: [], image: 'https://f.ptcdn.info/765/090/000/mmoriixchA6xMyCKjzZ-o.jpg', mapsUrl: 'https://maps.google.com/?q=เมืองโบราณยะรัง' },
  { id: 'a13', name: 'สะพานไม้บานา ปัตตานี', rating: 4.3, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 6:00 ก่อนเที่ยง', description: 'สะพานไม้ทอดยาวลงสู่ป่าชายเลนและอ่าวปัตตานี', bullets: [], image: 'https://cdn.spsmartvan.com/wp-content/uploads/2025/03/9.-สะพานไม้บานา.webp', mapsUrl: 'https://maps.google.com/?q=สะพานไม้บานา' },
  { id: 'a14', name: 'หาดตะโละกาโปร์', rating: 4.2, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 7:00 ก่อนเที่ยง', description: 'ชายหาดยอดนิยมที่มีทิวมะพร้าวและทิวสนร่มรื่น', bullets: [], image: 'https://mpics.mgronline.com/pics/Images/560000003646201.JPEG', mapsUrl: 'https://maps.google.com/?q=หาดตะโละกาโปร์' },
  { id: 'a15', name: 'ปลายสุดแหลมตาชี', rating: 4.2, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 10:00 ก่อนเที่ยง', description: 'แหลมทรายที่ยื่นออกไปในอ่าวไทย บรรยากาศเงียบสงบ ลมพัดเย็นสบาย', bullets: [], image: 'https://cms.dmpcdn.com/travel/2021/05/09/a223e0f0-b098-11eb-a753-ed580dade28e_original.jpg', mapsUrl: 'https://maps.google.com/?q=แหลมตาชี' },
  { id: 'a16', name: 'อุทยานแห่งชาติน้ำตกทรายขาว', rating: 4.3, type: '🏞️ อุทยานแห่งชาติ', status: 'ปิดอยู่ · เปิดเวลา 8:30 ก่อนเที่ยง', description: 'น้ำตกธรรมชาติสายน้ำใสเย็น ไหลผ่านผาหิน ท่ามกลางป่าอุดมสมบูรณ์', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=723378459982528', mapsUrl: 'https://maps.google.com/?q=น้ำตกทรายขาว' },
  { id: 'a17', name: 'น้ำตกโผงโผง', rating: 4.2, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 7:00 ก่อนเที่ยง', description: 'น้ำตกขนาดใหญ่ในเขตอำเภอโคกโพธิ์ มีแอ่งน้ำกว้างและกระแสน้ำไหลตลอดปี', bullets: [], image: 'https://i.ytimg.com/vi/psYSqL2gJos/maxresdefault.jpg', mapsUrl: 'https://maps.google.com/?q=น้ำตกโผงโผง' },
  { id: 'a18', name: 'หาดแฆแฆ', rating: 4.3, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 7:00 ก่อนเที่ยง', description: 'ชายหาดที่มีเอกลักษณ์โดดเด่นด้วยโขดหินแกรนิตขนาดใหญ่ตั้งเรียงราย', bullets: [], image: 'https://f.ptcdn.info/545/036/000/nwgmh9l6fPLhtKt2EMC-o.jpg', mapsUrl: 'https://maps.google.com/?q=หาดแฆแฆ' },
  { id: 'a19', name: 'หาดปะนาเระ', rating: 4.4, type: '📍 สถานที่ท่องเที่ยว', status: 'เปิดอยู่', description: 'ชายหาดยาวพร้อมหมู่บ้านประมงพื้นบ้าน สามารถสัมผัสวิถีชีวิตชาวเล', bullets: [], image: 'https://sp-ao.shortpixel.ai/client/to_auto,q_lossy,ret_img,w_600,h_450/https://beachlover.net/wp-content/uploads/2022/04/277575165_343194264508883_370018288536954868_n.jpg', mapsUrl: 'https://maps.google.com/?q=หาดปะนาเระ' },
  { id: 'a20', name: 'Patani Artspace', rating: 4.5, type: '🏛️ พิพิธภัณฑ์', status: 'ปิดอยู่ · เปิดเวลา 10:00 ก่อนเที่ยง', description: 'หอศิลป์ร่วมสมัยที่เป็นศูนย์กลางจัดแสดงผลงานศิลปะของศิลปิน', bullets: [], image: 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1024,h_678/https://www.thaiartnews.com/wp-content/uploads/2022/01/2-1024x678.jpg.webp', mapsUrl: 'https://maps.google.com/?q=Patani+Artspace' }
];

const NARATHIWAT_RESTAURANTS: Place[] = [
  { id: 'nr_restaurants_0', name: 'สวนอาหารริมน้ำ', description: 'ร้านอาหารฮาลาลบรรยากาศดีติดริมแม่น้ำในตัวเมืองนราธิวาส เหมาะสำหรับการรับประทานอาหารเย็นร่วมกับครอบครัวหรือกรุ๊ปทัวร์ มีเมนูอาหารทะเลสด อาหารไทยพื้นบ้าน และเมนูแกงสไตล์ปักษ์ใต้รสชาติจัดจ้าน', rating: 4.5, type: '🍽️ ร้านอาหาร', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_restaurants_1', name: 'ร้านอาหารริมน้ำบางปอ', description: 'ร้านอาหารบรรยากาศริมน้ำอีกหนึ่งแห่งที่ให้บริการอาหารฮาลาลรสชาติดั้งเดิม โดดเด่นด้วยอาหารทะเลสดใหม่ อาหารพื้นบ้านภาคใต้ และบรรยากาศที่สบายๆ', rating: 4.5, type: '🍽️ ร้านอาหาร', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_restaurants_2', name: 'ร้านยะกังโภชนา', description: 'ร้านอาหารมุสลิมเก่าแก่ที่มีชื่อเสียงในย่านยะกัง มีอาหารเช้าและอาหารตามสั่งฮาลาล อาทิ ข้าวยำ โรตี ข้าวหมกไก่ และชาร้อนรสเข้มข้น', rating: 4.6, type: '🍽️ ร้านอาหาร', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_restaurants_3', name: 'ไก่กอและ', description: 'ร้านอาหารฮาลาลต้นตำหรับไก่กอและบนถนนระแงะมรรคา เสิร์ฟไก่กอและราดซอสเข้มข้น รสชาติหวานมันเผ็ดกำลังดี เหมาะสำหรับมื้อเที่ยง', rating: 4.7, type: '🍽️ ร้านอาหาร', image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_restaurants_4', name: 'AKHOO by Nasir', description: 'ร้านอาหารมุสลิมสมัยใหม่ ตกแต่งสไตล์คาเฟ่ บริการอาหารฮาลาลหลากหลายประเภท ทั้งอาหารไทย อาหารตะวันตก และเครื่องดื่ม', rating: 4.5, type: '🍽️ ร้านอาหาร', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_restaurants_5', name: 'เหมือนฝันเบเกอรี่', description: 'ร้านเบเกอรี่และคาเฟ่ฮาลาลยอดนิยมในตัวเมือง มีขนมเค้ก เบเกอรี่อบสดใหม่ และเครื่องดื่มหลากหลายชนิด', rating: 4.4, type: '☕ คาเฟ่', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_restaurants_6', name: 'November Cafe', description: 'คาเฟ่ฮาลาลบรรยากาศอบอุ่น ให้บริการกาแฟ เครื่องดื่มสมูทตี้ ขนมหวาน และอาหารจานเดียว', rating: 4.3, type: '☕ คาเฟ่', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_restaurants_7', name: 'PLAN TWO KITCHEN', description: 'ร้านอาหารฮาลาลสไตล์ฟิวชั่นและอาหารตามสั่ง ตกแต่งร้านทันสมัย เหมาะสำหรับการนั่งรับประทานอาหารและสังสรรค์', rating: 4.6, type: '🍽️ ร้านอาหาร', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_restaurants_8', name: 'ร้าน Md.', description: 'ร้านอาหารฮาลาลยอดนิยมของคนท้องถิ่น เสิร์ฟอาหารจานเดียวและเมนูทานง่ายรสชาติดั้งเดิม', rating: 4.2, type: '🍽️ ร้านอาหาร', image: 'https://images.unsplash.com/photo-1626804475297-41609ea064eb?auto=format&fit=crop&w=600&q=80' }
];

const NARATHIWAT_ATTRACTIONS: Place[] = [
  { id: 'nr_attractions_0', name: 'หาดนราทัศน์', description: 'หาดทรายทอดยาวใกล้ตัวเมืองนราธิวาส มีทิวต้นสนร่มรื่นตลอดแนวหาด เป็นจุดชมวิวทิวทัศน์ทะเล ลมพัดเย็นสบาย และมีร้านค้าของกินท้องถิ่นตั้งอยู่รอบๆ', rating: 4.4, type: '📍 สถานที่ท่องเที่ยว', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_1', name: 'อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง', description: 'ชายหาดโค้งเว้าสวยงามเงียบสงบ ล้อมรอบด้วยธรรมชาติอันร่มรื่นและโขดหิน มีเส้นทางศึกษาธรรมชาติและพื้นที่สำหรับพักผ่อนหย่อนใจ', rating: 4.5, type: '🏞️ อุทยานแห่งชาติ', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_2', name: 'มัสยิดวาดีอัลฮูเซ็น (มัสยิด 300 ปี)', description: 'มัสยิดไม้โบราณสถาปัตยกรรมผสมผสานไทย มลายู และจีน สร้างโดยไม่ใช้ตะปู เป็นศูนย์รวมจิตใจและสถานที่ท่องเที่ยวทางประวัติศาสตร์ที่สำคัญในอำเภอบาเจาะ', rating: 4.7, type: '🕌 มัสยิด', image: 'https://images.unsplash.com/photo-1564507592227-0b0f5c06a33b?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_3', name: 'น้ำตกปาโจ', description: 'น้ำตกขนาดใหญ่ภายในอุทยานแห่งชาติบูโด-สุไหงปาดี มีสายน้ำไหลผ่านผาหินสูง บรรยากาศร่มรื่นด้วยป่าไม้สมบูรณ์', rating: 4.3, type: '📍 สถานที่ท่องเที่ยว', image: 'https://images.unsplash.com/photo-1432405972618-c60b024cb185?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_4', name: 'ผานับดาว', description: 'จุดชมวิวทิวทัศน์ทะเลหมอกและดวงดาวในยามค่ำคืน ตั้งอยู่ในอำเภอสุคิริน เหมาะสำหรับสายแคมป์ปิ้งและผู้ที่ชื่นชอบการท่องเที่ยวธรรมชาติ', rating: 4.6, type: '⛰️ จุดชมวิว', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_5', name: 'พระพุทธทักษิณมิ่งมงคล', description: 'พระพุทธรูปประทับนั่งกลางแจ้งขนาดใหญ่ ประดิษฐานบนยอดเขา เป็นสถานที่ศักดิ์สิทธิ์และจุดแวะสักการะสำคัญของจังหวัด', rating: 4.7, type: '📍 สถานที่ท่องเที่ยว', image: 'https://images.unsplash.com/photo-1582650831627-2ee0f5f70a1f?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_6', name: 'ชุมชนบ้านทอนและหาดบ้านทอน', description: 'ชุมชนประมงพื้นบ้านชายฝั่งทะเลที่มีเอกลักษณ์ด้านการทำเรือกอและ นักท่องเที่ยวสามารถชมการต่อเรือกอและจำลองและวิถีชีวิตชาวประมง', rating: 4.5, type: '📍 สถานที่ท่องเที่ยว', image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_7', name: 'เทวสถานองค์พระพิฆเนศ', description: 'ประดิษฐานองค์พระพิฆเนศขนาดใหญ่ในตัวเมืองนราธิวาส เป็นจุดแวะพักผ่อนและสักการะสิ่งศักดิ์สิทธิ์', rating: 4.5, type: '📍 สถานที่ท่องเที่ยว', image: 'https://images.unsplash.com/photo-1605648831845-a92c01991bb0?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_8', name: 'ศาลเจ้าโก้วเล้งจี่', description: 'ศาลเจ้าเก่าแก่ใจกลางเมืองนราธิวาส มีสถาปัตยกรรมแบบจีนที่สวยงามและประณีต', rating: 4.4, type: '📍 สถานที่ท่องเที่ยว', image: 'https://images.unsplash.com/photo-1549473889-14f364028ce4?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_attractions_9', name: 'ตลาดน้ำยะกัง', description: 'ตลาดน้ำย้อนยุคริมคลองยะกัง จำหน่ายอาหารพื้นบ้าน ขนมโบราณมลายู และสินค้าท้องถิ่น', rating: 4.3, type: '📍 สถานที่ท่องเที่ยว', image: 'https://images.unsplash.com/photo-1582298538104-fe2e74c878f1?auto=format&fit=crop&w=600&q=80' }
];

const NARATHIWAT_SOUVENIRS: Place[] = [
  { id: 'nr_souvenirs_0', name: 'Befish (บีฟิช กรือโป๊ะทอด)', description: 'แบรนด์ของฝากขึ้นชื่อ ผลิตกรือโป๊ะ (ข้าวเกรียบปลา) ทอดกรอบเคลือบซอสหลากรสชาติ ใช้วัตถุดิบปลาสดจากท้องถิ่น อ่าวมะนาว บรรจุภัณฑ์ทันสมัยเหมาะซื้อเป็นของฝาก', rating: 4.8, type: '🎁 ร้านของฝาก', image: 'https://images.unsplash.com/photo-1621939514649-280e2af25f18?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_1', name: 'ร้านมุมสุขภาพ นราธิวาส', description: 'ศูนย์รวมของฝาก ผลิตภัณฑ์ OTOP และสินค้าสุขภาพที่ใหญ่แห่งหนึ่งในตัวเมือง จำหน่ายสินค้าแปรรูป ขนมพื้นบ้าน และของใช้จากชุมชนต่างๆ', rating: 4.5, type: '🎁 ร้านของฝาก', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_2', name: 'ร้านของฝากกลุ่มแม่บ้านเกษตรกรบ้านทอน', description: 'แหล่งจำหน่ายเรือกอและจำลอง ผลิตภัณฑ์จากใบเตยและกระจูด มีสินค้าแฮนด์เมดเอกลักษณ์ท้องถิ่นนราธิวาส', rating: 4.6, type: '🎁 ร้านของฝาก', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_3', name: 'ร้านขายปลากุเลาเค็มตากใบ', description: 'ของฝากระดับพรีเมียม ขึ้นชื่อว่าเป็น "ราชาแห่งปลากุเลาเค็ม" เค็มกำลังดี เนื้อนุ่ม กลิ่นหอมเป็นเอกลักษณ์', rating: 4.9, type: '🎁 ร้านของฝาก', image: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_4', name: 'ร้านขนมฝรั่งและขนมโบราณย่านยะกัง', description: 'แหล่งรวมขนมหวานโบราณสไตล์มลายู อาทิ ขนมกอและ ขนมบูดอ ซื้อรับประทานสดหรือนำกลับเป็นของฝากรสชาติดั้งเดิม', rating: 4.5, type: '🎁 ร้านของฝาก', image: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_5', name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส', description: 'ตลาดสดที่มีโซนจำหน่ายของฝากท้องถิ่น เช่น บูดูสำเร็จรูป กะปิแท้ และกรือโป๊ะแบบดิบ เหมาะสำหรับการเดินเลือกซื้อสินค้าราคาเป็นกันเอง', rating: 4.3, type: '📍 ตลาด', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_6', name: 'ร้านกรือโป๊ะสดอ่าวมะนาว', description: 'แผงจำหน่ายกรือโป๊ะสดและกรือโป๊ะตากแห้งบริเวณทางเข้าอ่าวมะนาว สามารถซื้อไปทอดเองที่บ้านเพื่อความสดใหม่', rating: 4.4, type: '🎁 ร้านของฝาก', image: 'https://images.unsplash.com/photo-1621939514649-280e2af25f18?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_7', name: 'ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส', description: 'ศูนย์รวบรวมผลิตภัณฑ์ชุมชนทั่วทั้งจังหวัดนราธิวาส มีทั้งงานหัตถกรรม ผ้าปาเต๊ะ ผ้าบาติก และอาหารแปรรูป', rating: 4.5, type: '🎁 ร้านของฝาก', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_8', name: 'ร้านเครื่องสานกระจูดบ้านทอน', description: 'จำหน่ายกระเป๋าสาน เสื่อกระจูด และของตกแต่งบ้านจากกระจูด ดีไซน์สวยงาม ฝีมือประณีตจากชาวบ้านในพื้นที่', rating: 4.6, type: '🎁 ร้านของฝาก', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80' },
  { id: 'nr_souvenirs_9', name: 'ร้านจำหน่ายลองกองและผลไม้ตามฤดูกาล', description: 'บริเวณริมถนนสายหลักช่วงฤดูกาลผลไม้ มีลองกองซีมองนราธิวาสแท้ รสชาติหวานอร่อยเป็นของฝากยอดนิยม', rating: 4.5, type: '🎁 ร้านผลไม้', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80' }
];

const YALA_RESTAURANTS: Place[] = [
  { id: 'yr_r1', name: 'ไทยอิสลามโภชนา', rating: 4.5, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 1:00 หลังเที่ยง', description: 'ร้านอาหารเช้าและมะตะบะฮาลาลในตำนานที่อยู่คู่เมืองยะลามานาน เสิร์ฟอาหารมุสลิมรสชาติดั้งเดิม\n\nเมนูเด็ด: มะตะบะเนื้อ-ไก่, ข้าวหมกไก่, ชาร้อน', bullets: [], image: 'https://mpics-cdn.mgronline.com/pics/Images/566000008321801.JPEG', mapsUrl: 'https://maps.google.com/?cid=10361382364133478660&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r2', name: 'เรือนเตี๋ยวเรือสาขาหลักโกตาบารู', rating: 4.7, type: '🍽️ ร้านอาหาร', status: 'เปิดอยู่', description: 'ร้านก๋วยเตี๋ยวเรือฮาลาลเจ้าดังในอำเภอรามัน น้ำซุปเข้มข้นกลมกล่อมและเครื่องแน่นจัดเต็ม\n\nเมนูเด็ด: ก๋วยเตี๋ยวเรือเนื้อเปื่อย, ก๋วยเตี๋ยวเนื้อต้มยำ', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=791640752952015', mapsUrl: 'https://maps.google.com/?cid=11785855735914728724&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r3', name: 'บ้านก๋วยเตี๋ยว หมู่ 3 ลิมุด', rating: 4.3, type: '🍽️ ร้านอาหาร', status: 'เปิดอยู่ · ปิดเวลา 6:00 หลังเที่ยง', description: 'ร้านก๋วยเตี๋ยวฮาลาลบรรยากาศอบอุ่น ให้บรรยากาศรับประทานอาหารสบายๆ สไตล์บ้านสวน\n\nเมนูเด็ด: ก๋วยเตี๋ยวต้มยำโบราณ, เมนูเส้นต่างๆ', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=591625693415866', mapsUrl: 'https://maps.google.com/?cid=9085640759465655630&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r4', name: 'มากิชิ', rating: 4.3, type: '🍽️ ร้านอาหารฮาลาล', status: 'ปิดอยู่ · เปิดเวลา 11:30 ก่อนเที่ยง', description: 'ร้านอาหารสไตล์บุฟเฟต์ชาบูและอาหารญี่ปุ่นสายพานฮาลาล ยอดฮิตของวัยรุ่นและครอบครัวในเมืองยะลา\n\nจุดเด่น: ชาบูสายพาน, วัตถุดิบสดใหม่, น้ำซุปหลากหลาย', bullets: [], image: 'https://us-fbcloud.net/wb/data/1455/1455877-img.vyftn5.45j6o.jpg', mapsUrl: 'https://maps.google.com/?cid=1718838243057484157&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r5', name: 'Anna’s Garden', rating: 4.7, type: '🍽️ ร้านอาหาร', status: 'เปิดอยู่ · ปิดเวลา 10:00 หลังเที่ยง', description: 'ร้านอาหารและคาเฟ่ฮาลาลบรรยากาศดี ให้บริการทั้งอาหารเช้า อาหารจานหลัก และเครื่องดื่มสไตล์คาเฟ่\n\nจุดเด่น: เซตอาหารเช้า, เบเกอรี่, ชากาแฟรสเข้มข้น', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2022/04/13/f562a0debbe24089abe367e7756f372a.jpg', mapsUrl: 'https://maps.google.com/?cid=16679618103819669203&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r6', name: 'ซุกรอนฮาลาฟู๊ด', rating: 5, type: '🍽️ ร้านอาหาร', status: 'เปิดอยู่ · ปิดเวลา 6:00 หลังเที่ยง', description: 'ร้านอาหารฮาลาลริมทางในอำเภอบันนังสตา เหมาะสำหรับแวะเติมพลังระหว่างเดินทางไปเบตง\n\nเมนูเด็ด: อาหารตามสั่ง, ก๋วยเตี๋ยว', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2023/08/10/a46d3264bc0f4d8ab849d837a1ecf11c.jpg', mapsUrl: 'https://maps.google.com/?cid=15798300900016715759&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r7', name: 'อัยยาชิ ชาบูบุฟเฟ่ต์', rating: 4.3, type: '🍽️ ร้านอาหาร', status: 'ปิดอยู่ · เปิดเวลา 11:30 ก่อนเที่ยง', description: 'ร้านบุฟเฟต์ชาบูฮาลาลในเมืองยะลาที่มีเนื้อสัตว์และอาหารทานเล่นให้เลือกหลากหลาย\n\nจุดเด่น: บุฟเฟต์ชาบูเติมได้ไม่อั้น, น้ำจิ้มรสเด็ด', bullets: [], image: 'https://ak-d.tripcdn.com/images/1mi5p224x94sjry4s776E_R_600_400_R5_Q90.jpg?proc=source/trip', mapsUrl: 'https://maps.google.com/?cid=8694035179768709388&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r8', name: 'ร้านอาหารอาบูคอลี', rating: 4.1, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารฮาลาลสไตล์มุสลิมท้องถิ่นรสชาติดั้งเดิม ใกล้สวนสาธารณะในตัวเมืองยะลา\n\nเมนูเด็ด: อาหารตามสั่งพื้นบ้าน, ข้าวหมก', bullets: [], image: 'https://fastly.4sqi.net/img/general/600x600/3999587_OlekE0ONoFoOo6dQCfuZctuVysACi2TbwnLrhH9IO3A.jpg', mapsUrl: 'https://maps.google.com/?cid=9205823316130748629&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r9', name: 'Laotie HotPot Halal Yala : เหลาเถี่ยะหม่าล่าหม้อไฟฮาลาล สาขายะลา', rating: 4, type: '🍽️ ร้านอาหาร', status: 'ปิดอยู่ · เปิดเวลา 12:00 หลังเที่ยง', description: 'ร้านหม่าล่าหม้อไฟฮาลาลสไตล์จีน ให้รสชาติเผ็ดซ่าถึงใจพร้อมวัตถุดิบคุณภาพ\n\nจุดเด่น: น้ำซุปหม่าล่ารสเข้มข้น, ซุปกระดูกเนื้อ', bullets: [], image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122110153970400720', mapsUrl: 'https://maps.google.com/?cid=16953532314926537482&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'yr_r10', name: 'ร้านอาหารต้าเหยิน (กิตติ)', rating: 4.2, type: '📍 ภัตตาคารอาหารจีน', status: 'เปิดอยู่ · ปิดเวลา 9:30 หลังเที่ยง', description: 'ร้านอาหารจีนระดับตำนานในอำเภอเบตง แม้เป็นร้านอาหารจีนดั้งเดิม แต่มีเมนูชูโรงท้องถิ่นหลากหลายที่ใช้วัตถุดิบฮาลาล\n\nเมนูเด็ด: ไก่เบตงสับ, ผักน้ำผัดน้ำมันหอย, เคานุก', bullets: [], image: 'https://static7-th.orstatic.com/userphoto/doorphoto/0/F7/00304631A6FD72BCFB0D78px.jpg', mapsUrl: 'https://maps.google.com/?cid=703096314617113589&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
];

const YALA_ATTRACTIONS: Place[] = [
  { id: 'ya_a1', name: 'สกายวอล์คทะเลหมอกอัยเยอร์เวง', rating: 4.6, type: '📍 จุดชมวิว', status: 'เปิดอยู่ · ปิดเวลา 4:30 หลังเที่ยง', description: 'จุดชมวิวทะเลหมอกยอดนิยมระดับประเทศ มีพื้นกระจกใสให้เดินชมวิวพาโนรามาได้ตลอดทั้งปี\n\nจุดเด่น: ชมทะเลหมอก 360 องศา, พระอาทิตย์ขึ้นยามเช้า', bullets: [], image: 'https://mpics.mgronline.com/pics/Images/563000010161303.JPEG', mapsUrl: 'https://maps.google.com/?cid=12689912305095899502&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a2', name: 'อุโมงค์เบตงมงคลฤทธิ์', rating: 4.6, type: '📍 บริการการขนส่ง', status: 'เปิดอยู่', description: 'อุโมงค์รถยนต์ลอดภูเขาแห่งแรกของประเทศไทย ตั้งอยู่ใจกลางเมืองเบตง ตกแต่งประดับไฟสวยงามในยามค่ำคืน\n\nจุดเด่น: ไฟประดับอุโมงค์, ถ่ายรูปเช็กอินกลางเมืองเบตง', bullets: [], image: 'https://www.gplace.com/include/img_gal/6/94/gp5d89acf3a4b50.jpg', mapsUrl: 'https://maps.google.com/?cid=13813764875897225860&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a3', name: 'อุโมงค์ปิยะมิตร', rating: 4.4, type: '🏛️ พิพิธภัณฑ์', status: 'เปิดอยู่ · ปิดเวลา 5:00 หลังเที่ยง', description: 'อุโมงค์ประวัติศาสตร์อดีตค่ายคอมมิวนิสต์มาลายา ขุดเข้าไปในภูเขา อากาศเย็นสบายและมีพิพิธภัณฑ์เรียนรู้ประวัติศาสตร์\n\nจุดเด่น: เส้นทางเดินธรรมชาติ, ต้นไม้พันปี, ประวัติศาสตร์ค่ายปิยะมิตร', bullets: [], image: 'https://www.gplace.com/include/img_gal/2/69/gp5d85f5cb4dc58.jpg', mapsUrl: 'https://maps.google.com/?cid=14209419586377049517&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a4', name: 'เขื่อนบางลาง', rating: 4.5, type: '📍 สถานที่ท่องเที่ยว', status: 'เปิดอยู่', description: 'เขื่อนเอนกประสงค์แห่งแรกของภาคใต้ ล้อมรอบด้วยภูเขาสูงและผืนป่าอันสมบูรณ์ เหมาะสำหรับการล่องเรือชมธรรมชาติ\n\nจุดเด่น: วิวทิวทัศน์ทะเลสาบ, จุดชมวิวสันเขื่อน', bullets: [], image: 'https://www.tvpoolonline.com/wp-content/uploads/2021/10/270961-sp2-1-768x512.jpg', mapsUrl: 'https://maps.google.com/?cid=10048012102003552553&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a5', name: 'มัสยิดกลางประจำจังหวัดยะลา', rating: 4.7, type: '🕌 มัสยิด', status: 'เปิดอยู่ · ปิดเวลา 10:00 หลังเที่ยง', description: 'ศาสนสถานศูนย์รวมจิตใจของชาวมุสลิมในยะลา สถาปัตยกรรมสวยงามโดดเด่นด้วยยอดโดมขนาดใหญ่\n\nจุดเด่น: สถาปัตยกรรมอิสลามที่งดงาม, บรรยากาศเงียบสงบ', bullets: [], image: 'https://img.wongnai.com/p/1920x0/2022/06/01/c06752dd529a4b8dbd286c0008fae5ec.jpg', mapsUrl: 'https://maps.google.com/?cid=5601836956837092542&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a6', name: 'วัดคูหาภิมุข (วัดหน้าถ้ำ)', rating: 4.6, type: '📍 วัด', status: 'เปิดอยู่', description: 'วัดเก่าแก่คู่บ้านคู่เมืองยะลา ภายในถ้ำประดิษฐานพระพุทธไสยาสน์สมัยศรีวิชัยขนาดใหญ่\n\nจุดเด่น: ถ้ำธรรมชาติ, พระนอนโบราณ, โบราณวัตถุประวัติศาสตร์', bullets: [], image: 'http://3.bp.blogspot.com/-bko8Mnd4dUU/UXPtIuQjt6I/AAAAAAAAANE/-5PUwGZGhx8/s1600/IMG_6619.JPG', mapsUrl: 'https://maps.google.com/?cid=430359212593870832&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a7', name: 'ศาลเจ้าพ่อหลักเมืองจังหวัดยะลา', rating: 4.7, type: '📍 สถานที่ประกอบพิธีกรรมทางศาสนา', status: 'เปิดอยู่', description: 'สิ่งศักดิ์สิทธิ์คู่เมืองยะลา ตั้งอยู่ใจกลางวงเวียนสวนสาธารณะ มีสถาปัตยกรรมแบบไทยประยุกต์สวยงาม\n\nจุดเด่น: สักการะขอพรเพื่อความเป็นสิริมงคล, สวนสาธารณะโดยรอบ', bullets: [], image: 'https://cbtthailand.dasta.or.th/upload-file-api/Resources/RelateAttraction/Images/RAT950004/1.jpeg', mapsUrl: 'https://maps.google.com/?cid=12119254134236258048&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a8', name: 'หอนาฬิกาเบตง', rating: 4.5, type: '📍 สถานที่ท่องเที่ยว', status: 'เปิดอยู่', description: 'สัญลักษณ์ประจำเมืองเบตง ตั้งอยู่บริเวณวงเวียนกลางเมือง ใกล้ตู้ไปรษณีย์โบราณขนาดใหญ่\n\nจุดเด่น: นกแอ่นลมเกาะสายไฟยามเย็น, จุดถ่ายรูปสัญลักษณ์เบตง', bullets: [], image: 'https://cbtthailand.dasta.or.th/upload-file-api/Resources/RelateAttraction/Images/RAT950007/1.jpeg', mapsUrl: 'https://maps.google.com/?cid=12047033595512200672&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a9', name: 'สวนขวัญเมือง', rating: 4.6, type: '📍 พื้นที่ธรรมชาติ', status: 'เปิดอยู่', description: 'สวนสาธารณะขนาดใหญ่ใจกลางเมืองยะลา มีพรุและบึงน้ำขนาดใหญ่ เหมาะสำหรับพักผ่อนและออกกำลังกาย\n\nจุดเด่น: บึงน้ำกว้างใหญ่, ลานกิจกรรมและสวนเขียวขจี', bullets: [], image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEjhHIItOoRcvaAhUsXuXKk6DclVdBt9Lqfo6cxXFc36CnkUiN_Ak8VCAjZG5d6jh90yrWk3yEDgFEpv62KkfKBNw4crtPsIJSSPsgcdpB36sGVk3iffUrsw_Ga7-pK1Vbf2bEMEeD3N8/s1600/1VsRrsD.jpg', mapsUrl: 'https://maps.google.com/?cid=14634911270705628758&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
  { id: 'ya_a10', name: 'เขตรักษาพันธุ์สัตว์ป่าฮาลา-บาลา', rating: 5, type: '📍 ป่าดิบชื้น', status: 'เปิดอยู่', description: "ผืนป่าดิบชื้นที่สมบูรณ์ที่สุดแห่งหนึ่งของภาคใต้ ได้รับขนานนามว่า 'แอมะซอนแห่งอาเซียน'\\n\\nจุดเด่น: ส่องนกเงือก, เดินป่าศึกษาธรรมชาติ, ความอุดมสมบูรณ์ของป่าไม้", bullets: [], image: 'https://www.travel2guide.com/Narathiwat/image/เขตรักษาพันธุ์สัตว์ป่า-ฮาลา-บาลา.jpg', mapsUrl: 'https://maps.google.com/?cid=7576738665185581870&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ' },
];

const PROVINCES: Record<string, ProvinceData> = {
  pattani: {
    id: 'pattani',
    nameTh: 'ปัตตานี',
    nameEn: 'Pattani', subtitle: 'สำรวจปัตตานี เมืองงามสามวัฒนธรรม',
    color: 'emerald',
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Pattani_Central_Mosque.jpg',
    restaurants: PATTANI_RESTAURANTS,
    attractions: PATTANI_ATTRACTIONS,
    souvenirs: PATTANI_SOUVENIRS
  },
  yala: { id: 'yala', nameTh: 'ยะลา', nameEn: 'Yala', subtitle: 'ใต้สุดสยาม เมืองงามชายแดน', color: 'teal', coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/The_Sea_of_Mist_Ai_Yerweng%2C_Betong.jpg/960px-The_Sea_of_Mist_Ai_Yerweng%2C_Betong.jpg', restaurants: YALA_RESTAURANTS, attractions: YALA_ATTRACTIONS, souvenirs: YALA_SOUVENIRS },
  narathiwat: { id: 'narathiwat', nameTh: 'นราธิวาส', nameEn: 'Narathiwat', subtitle: 'มหัศจรรย์นราธิวาส ธรรมชาติและวัฒนธรรม', color: 'cyan', coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg/960px-%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg', restaurants: NARATHIWAT_RESTAURANTS, attractions: NARATHIWAT_ATTRACTIONS, souvenirs: NARATHIWAT_SOUVENIRS }
};

const PlaceCard = ({ place }: { place: Place }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
    {place.image && (
      <div className="relative h-48 w-full overflow-hidden shrink-0">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center shadow-sm text-sm font-bold text-slate-700">
          <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
          {place.rating}
        </div>
      </div>
    )}
    <div className="p-5 flex flex-col flex-1">
      <div className="flex justify-between items-start mb-1">
        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{place.type}</div>
        {!place.image && (
          <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
            <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
            {place.rating}
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">{place.name}</h3>
      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
        <Clock className="w-3.5 h-3.5 mr-1" />
        {place.status}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed whitespace-pre-line">{place.description}</p>
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ' ประเทศไทย')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-2.5 rounded-xl font-bold transition text-sm group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-300">
          <MapPin className="w-4 h-4 mr-2" />
          นำทางด้วย Google Maps
          <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-50" />
        </a>
      </div>
    </div>
  </div>
);

export default function ProvincePage({ params }: { params: { slug: string } }) {
  const province = PROVINCES[params.slug.toLowerCase()];
  if (!province) notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <div className={`w-full h-[400px] relative flex items-center justify-center bg-${province.color}-800`} style={province.coverImage ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${province.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <Link href="/explore" className="absolute top-6 left-6 flex items-center text-white/90 hover:text-white bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm transition">
          <ArrowLeft className="w-5 h-5 mr-2" /> กลับหน้าสำรวจ
        </Link>
        <div className="text-center text-white z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">🕌 {province.nameTh}</h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-md">{province.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Restaurants */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
            <span className="text-4xl mr-3">🍽️</span> 
            ร้านอาหารฮาลาล
          </h2>
        </div>
        {province.restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="text-6xl mb-4">🚧</div><h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">กำลังรวบรวมข้อมูล</h3></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {province.restaurants.map(place => <PlaceCard key={place.id} place={place} />)}
          </div>
        )}

        {/* Attractions */}
        <div className="flex items-center justify-between mb-8 mt-16">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
            <span className="text-4xl mr-3">🏞️</span> 
            สถานที่ท่องเที่ยว
          </h2>
        </div>
        {province.attractions.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-16"><div className="text-6xl mb-4">🚧</div><h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">กำลังรวบรวมข้อมูล</h3></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {province.attractions.map(place => <PlaceCard key={place.id} place={place} />)}
          </div>
        )}

        {/* Souvenirs */}
        {province.souvenirs && province.souvenirs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8 mt-16">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
                <span className="text-4xl mr-3">🎁</span> 
                ร้านของฝาก
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {province.souvenirs.map(place => <PlaceCard key={place.id} place={place} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

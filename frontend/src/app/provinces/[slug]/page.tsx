'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, MapPin, ExternalLink, Clock } from 'lucide-react';

interface Place {
  id: string;
  name: string;
  rating: number;
  type: string;
  status: string;
  description: string;
  bullets: string[];
  image: string;
  mapsUrl: string;
}

interface ProvinceData {
  id: string;
  nameTh: string;
  nameEn: string;
  color: string;
  coverImage: string;
  restaurants: Place[];
  attractions: Place[];
}

const PATTANI_RESTAURANTS: Place[] = [
  { id: 'r1', name: 'The Pattanion (เดอะ ปัตตาเนี่ยน)', rating: 4.9, type: '☕ ร้านกาแฟ', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารและคาเฟ่สไตล์โฮมเมด ตกแต่งสวยงามบรรยากาศอบอุ่น', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r1', mapsUrl: 'https://maps.google.com/?q=The+Pattanion' },
  { id: 'r2', name: 'กาลครั้งหนึ่ง คาเฟ่', rating: 4.4, type: '☕ ร้านกาแฟ', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'คาเฟ่และร้านอาหารตกแต่งสไตล์วินเทจ มีโซนให้เลือกนั่งหลากหลาย', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r2', mapsUrl: 'https://maps.google.com/?q=กาลครั้งหนึ่ง+คาเฟ่' },
  { id: 'r3', name: 'กะมา ข้าวยำราชา - Nasi Kerabu Raja', rating: 4.7, type: '🍽️ ร้านอาหาร', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านข้าวยำปัตตานีรสชาติต้นตำรับที่ได้รับความนิยมอย่างมาก', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r3', mapsUrl: 'https://maps.google.com/?q=กะมา+ข้าวยำราชา' },
  { id: 'r4', name: 'ร้านซุปเจ๊ะเยาะ เจ้าเก่า', rating: 4.4, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดเวลา 10:00 ก่อนเที่ยง', description: 'ร้านซุปเนื้อและซุปวัวเจ้าเก่าแก่แห่งเมืองปัตตานี', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r4', mapsUrl: 'https://maps.google.com/?q=ร้านซุปเจ๊ะเยาะ' },
  { id: 'r5', name: 'โรตีดีฟอเรส ปัตตานี', rating: 4.4, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 11:00 หลังเที่ยง', description: 'ร้านโรตีและชาชักชื่อดัง บรรยากาศร่มรื่น นั่งสบาย', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r5', mapsUrl: 'https://maps.google.com/?q=โรตีดีฟอเรส' },
  { id: 'r6', name: 'สะเต๊ะ ศรีเมือง (เจ้าเก่า)', rating: 4.4, type: '📍 ภัตตาคารอาหารอินโดนีเซีย', status: 'เปิดเวลา 9:00 ก่อนเที่ยง', description: 'ร้านสะเต๊ะเจ้าดั้งเดิมประจำเมืองปัตตานี ย่างบนเตาถ่านหอมๆ', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r6', mapsUrl: 'https://maps.google.com/?q=สะเต๊ะศรีเมือง' },
  { id: 'r7', name: 'ห้องอาหารบุหงารายา - C.S.Pattani Hotel', rating: 4.5, type: '🍽️ ภัตตาคารโรงแรม', status: 'เปิดอยู่', description: 'ห้องอาหารฮาลาลมาตรฐานระดับโรงแรม ตั้งอยู่ในโรงแรม ซี.เอส. ปัตตานี', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r7', mapsUrl: 'https://maps.google.com/?q=C.S.Pattani' },
  { id: 'r8', name: 'DERNDIN HOUSE', rating: 4.8, type: '🍦 ร้านไอศกรีม / คาเฟ่', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารแนวสร้างสรรค์ที่นำเอาวัตถุดิบและอาหารท้องถิ่นมาแปรรูป', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r8', mapsUrl: 'https://maps.google.com/?q=DERNDIN+HOUSE' },
  { id: 'r9', name: 'LEMU.Co - Halal Steakhouse PATTANI', rating: 4.5, type: '🥩 ร้านสเต๊กฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 8:30 หลังเที่ยง', description: 'ร้านสเต๊กฮาลาลคุณภาพเยี่ยม เอาใจคนรักสายเนื้อ', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r9', mapsUrl: 'https://maps.google.com/?q=LEMU.Co' },
  { id: 'r10', name: 'ร้านแบมะ ซุป ข้าวต้ม', rating: 4.3, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านซุปและอาหารตามสั่งราคาย่อมเยา น้ำซุปรสชาติเข้มข้น', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r10', mapsUrl: 'https://maps.google.com/?q=ร้านแบมะซุป' },
  { id: 'r11', name: 'BlueBird Brasserie Pattani', rating: 4.3, type: '🍽️ ภัตตาคารอาหารอเมริกัน', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'ร้านอาหารสไตล์บราสเซอรี บรรยากาศดี ตกแต่งร้านสวยงาม', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r11', mapsUrl: 'https://maps.google.com/?q=BlueBird' },
  { id: 'r12', name: 'โรงปี๊บ', rating: 4.4, type: '🍽️ ภัตตาคารอาหารไทย', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านอาหารบรรยากาศคลาสสิกที่ดัดแปลงมาจากโรงงานทำปี๊บเก่า', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r12', mapsUrl: 'https://maps.google.com/?q=โรงปี๊บ' },
  { id: 'r13', name: 'ซันก้ามปู Sea the Sun', rating: 4.2, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านอาหารทะเลฮาลาลยอดนิยม รสชาติจัดจ้าน', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r13', mapsUrl: 'https://maps.google.com/?q=ซันก้ามปู' },
  { id: 'r14', name: 'LYSM café', rating: 4.9, type: '☕ ร้านกาแฟ', status: 'เปิดอยู่ · ปิดเวลา 10:00 หลังเที่ยง', description: 'คาเฟ่และร้านขนมหวานบรรยากาศนั่งสบาย มีเมนูของหวานให้เลือกทานอย่างจุใจ', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r14', mapsUrl: 'https://maps.google.com/?q=LYSM' },
  { id: 'r15', name: 'SA-MI-LAE. Cafe\' & Relax Space', rating: 4.3, type: '☕ ร้านกาแฟ', status: 'เปิดอยู่ · ปิดเวลา 8:00 หลังเที่ยง', description: 'คาเฟ่บรรยากาศสบายๆ ใกล้มหาวิทยาลัย เหมาะสำหรับนักศึกษา', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r15', mapsUrl: 'https://maps.google.com/?q=Samilare' },
  { id: 'r16', name: 'ไก่กอและ "กะเมาะ" รามโกมุท ซอย 4', rating: 4.6, type: '🥩 ร้านอาหาร', status: 'เปิดเวลา 10:00 ก่อนเที่ยง', description: 'ร้านไก่กอและเจ้าดังประจำเมืองปัตตานี ย่างเตาถ่านสดใหม่', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r16', mapsUrl: 'https://maps.google.com/?q=ไก่กอและกะเมาะ' },
  { id: 'r17', name: 'ข้าวมันไก่ โกจิว', rating: 4.0, type: '🍽️ ร้านอาหาร', status: 'เปิดเวลา 7:00 ก่อนเที่ยง', description: 'ร้านข้าวมันไก่ฮาลาลระดับตำนานของปัตตานี ขายมายาวนาน', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r17', mapsUrl: 'https://maps.google.com/?q=ข้าวมันไก่โกจิว' },
  { id: 'r18', name: 'ร้านแวมะโรตี', rating: 4.4, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านโรตีและชาเช้า-เย็น รสชาติต้นตำรับแบบปัตตานีแท้ๆ', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r18', mapsUrl: 'https://maps.google.com/?q=แวมะโรตี' },
  { id: 'r19', name: 'สะเต๊ะบังเล๊าะ เจ้าเก่า', rating: 4.2, type: '📍 ภัตตาคารอาหารอินโดนีเซีย', status: 'เปิดเวลา 9:00 ก่อนเที่ยง', description: 'อีกหนึ่งร้านสะเต๊ะเตาถ่านรสเด็ด ย่างหอมๆ ราดน้ำจิ้มรสชาติพอดี', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r19', mapsUrl: 'https://maps.google.com/?q=สะเต๊ะบังเล๊าะ' },
  { id: 'r20', name: 'เมาะซูซุปช่อมาลี', rating: 4.2, type: '🍽️ ร้านอาหารฮาลาล', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ร้านซุปช่อมาลีชื่อดังที่ใครมาปัตตานีก็ต้องแวะลอง', bullets: [], image: 'https://loremflickr.com/600/400/food,thailand,restaurant?random=r20', mapsUrl: 'https://maps.google.com/?q=เมาะซูซุปช่อมาลี' }
];

const PATTANI_ATTRACTIONS: Place[] = [
  { id: 'a1', name: 'มัสยิดกลางจังหวัดปัตตานี', rating: 4.7, type: '🕌 มัสยิด', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'มัสยิดที่สวยงามที่สุดแห่งหนึ่งในประเทศไทย มีสถาปัตยกรรมโดดเด่น', bullets: [], image: 'https://loremflickr.com/600/400/mosque?random=a1', mapsUrl: 'https://maps.google.com/?q=มัสยิดกลางปัตตานี' },
  { id: 'a2', name: 'ศาลเจ้าแม่ลิ้มกอเหนี่ยว', rating: 4.7, type: '📍 สถานที่ประกอบพิธีกรรมทางศาสนา', status: 'ปิดอยู่ · เปิดเวลา 6:00 ก่อนเที่ยง', description: 'ศาลเจ้าศักดิ์สิทธิ์คู่บ้านคู่เมืองปัตตานี เป็นศูนย์รวมจิตใจ', bullets: [], image: 'https://loremflickr.com/600/400/temple?random=a2', mapsUrl: 'https://maps.google.com/?q=ศาลเจ้าแม่ลิ้มกอเหนี่ยว' },
  { id: 'a3', name: 'วัดช้างให้ราษฎร์บูรณาราม หลวงพ่อทวด', rating: 4.7, type: '📍 วัด', status: 'ปิดอยู่ · เปิดเวลา 8:00 ก่อนเที่ยง', description: 'วัดเก่าแก่ต้นกำเนิดของหลวงปู่ทวด เหยียบน้ำทะเลสด', bullets: [], image: 'https://loremflickr.com/600/400/temple?random=a3', mapsUrl: 'https://maps.google.com/?q=วัดช้างให้' },
  { id: 'a4', name: 'มัสยิดกรือเซะ', rating: 4.7, type: '🕌 มัสยิด', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'มัสยิดโบราณอายุกว่า 200 ปี สร้างด้วยอิฐถือปูนที่มีเอกลักษณ์', bullets: [], image: 'https://loremflickr.com/600/400/mosque?random=a4', mapsUrl: 'https://maps.google.com/?q=มัสยิดกรือเซะ' },
  { id: 'a5', name: 'มัสยิดรายอฟาฏอนี مسجد راج فطاني', rating: 4.7, type: '🕌 มัสยิด', status: 'เปิดอยู่', description: 'มัสยิดประจำย่านจะบังติกอ มีความงดงามตามแบบสถาปัตยกรรมอิสลามดั้งเดิม', bullets: [], image: 'https://loremflickr.com/600/400/mosque?random=a5', mapsUrl: 'https://maps.google.com/?q=มัสยิดรายอฟาฏอนี' },
  { id: 'a6', name: 'วัดมุจลินทวาปีวิหาร, พระอารามหลวง', rating: 4.7, type: '📍 วัด', status: 'เปิดอยู่', description: 'พระอารามหลวงเก่าแก่ในอำเภอหนองจิก ภายในมีพระอุโบสถและวิหารที่เงียบสงบ', bullets: [], image: 'https://loremflickr.com/600/400/temple?random=a6', mapsUrl: 'https://maps.google.com/?q=วัดมุจลินทวาปีวิหาร' },
  { id: 'a7', name: 'สวนสมเด็จพระศรีนครินทร์ ปัตตานี', rating: 4.4, type: '🏞️ สวนสาธารณะ', status: 'เปิดอยู่ · ปิดเวลา 11:00 หลังเที่ยง', description: 'สวนสาธารณะริมทะเลขนาดใหญ่ เป็นที่ตั้งของ Skywalk ปัตตานี', bullets: [], image: 'https://loremflickr.com/600/400/park,nature?random=a7', mapsUrl: 'https://maps.google.com/?q=สวนสมเด็จพระศรีนครินทร์' },
  { id: 'a8', name: 'วังเจ้าเมืองปัตตานี', rating: 4.5, type: '🎓 สถาบันการศึกษา', status: 'ปิดอยู่ · เปิดเวลา 8:00 ก่อนเที่ยง', description: 'อาคารเรือนไม้โบราณในย่านจะบังติกอ สะท้อนประวัติศาสตร์การปกครอง', bullets: [], image: 'https://loremflickr.com/600/400/house,old?random=a8', mapsUrl: 'https://maps.google.com/?q=วังเจ้าเมืองปัตตานี' },
  { id: 'a9', name: 'วังยะหริ่ง', rating: 4.5, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 9:00 ก่อนเที่ยง', description: 'วังเก่าแก่ทรงคลาสสิกที่ผสมผสานสถาปัตยกรรมไทย ยุโรป และมลายู', bullets: [], image: 'https://loremflickr.com/600/400/house,old?random=a9', mapsUrl: 'https://maps.google.com/?q=วังยะหริ่ง' },
  { id: 'a10', name: 'บ้านเลขที่ 5 กือดาจีนอ', rating: 4.7, type: '🏢 ชุมชนย่านเก่า', status: 'เปิดอยู่ · ปิดเวลา 9:00 หลังเที่ยง', description: 'ย่านชุมชนชาวจีนโบราณริมแม่น้ำปัตตานี เต็มไปด้วยอาคารไม้เก่าแก่', bullets: [], image: 'https://loremflickr.com/600/400/street,old?random=a10', mapsUrl: 'https://maps.google.com/?q=กือดาจีนอ' },
  { id: 'a11', name: 'บ้านขุนพิทักษ์รายา', rating: 4.6, type: '📜 พิพิธภัณฑ์', status: 'เปิดอยู่', description: 'เรือนโบราณทรงคุณค่าในย่านกือดาจีนอ ที่ได้รับการบูรณะเป็นแหล่งเรียนรู้', bullets: [], image: 'https://loremflickr.com/600/400/museum,thailand?random=a11', mapsUrl: 'https://maps.google.com/?q=บ้านขุนพิทักษ์รายา' },
  { id: 'a12', name: 'เมืองโบราณยะรัง', rating: 4.4, type: '🏺 พิพิธภัณฑ์', status: 'ปิดอยู่ · เปิดเวลา 8:30 ก่อนเที่ยง', description: 'แหล่งโบราณคดีสำคัญที่มีร่องรอยอาณาจักรลังกาสุกะโบราณ', bullets: [], image: 'https://loremflickr.com/600/400/ruins,thailand?random=a12', mapsUrl: 'https://maps.google.com/?q=เมืองโบราณยะรัง' },
  { id: 'a13', name: 'สะพานไม้บานา ปัตตานี', rating: 4.3, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 6:00 ก่อนเที่ยง', description: 'สะพานไม้ทอดยาวลงสู่ป่าชายเลนและอ่าวปัตตานี', bullets: [], image: 'https://loremflickr.com/600/400/bridge,nature?random=a13', mapsUrl: 'https://maps.google.com/?q=สะพานไม้บานา' },
  { id: 'a14', name: 'หาดตะโละกาโปร์', rating: 4.2, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 7:00 ก่อนเที่ยง', description: 'ชายหาดยอดนิยมที่มีทิวมะพร้าวและทิวสนร่มรื่น', bullets: [], image: 'https://loremflickr.com/600/400/beach?random=a14', mapsUrl: 'https://maps.google.com/?q=หาดตะโละกาโปร์' },
  { id: 'a15', name: 'ปลายสุดแหลมตาชี', rating: 4.2, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 10:00 ก่อนเที่ยง', description: 'แหลมทรายที่ยื่นออกไปในอ่าวไทย บรรยากาศเงียบสงบ ลมพัดเย็นสบาย', bullets: [], image: 'https://loremflickr.com/600/400/beach?random=a15', mapsUrl: 'https://maps.google.com/?q=แหลมตาชี' },
  { id: 'a16', name: 'อุทยานแห่งชาติน้ำตกทรายขาว', rating: 4.3, type: '🏞️ อุทยานแห่งชาติ', status: 'ปิดอยู่ · เปิดเวลา 8:30 ก่อนเที่ยง', description: 'น้ำตกธรรมชาติสายน้ำใสเย็น ไหลผ่านผาหิน ท่ามกลางป่าอุดมสมบูรณ์', bullets: [], image: 'https://loremflickr.com/600/400/waterfall?random=a16', mapsUrl: 'https://maps.google.com/?q=น้ำตกทรายขาว' },
  { id: 'a17', name: 'น้ำตกโผงโผง', rating: 4.2, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 7:00 ก่อนเที่ยง', description: 'น้ำตกขนาดใหญ่ในเขตอำเภอโคกโพธิ์ มีแอ่งน้ำกว้างและกระแสน้ำไหลตลอดปี', bullets: [], image: 'https://loremflickr.com/600/400/waterfall?random=a17', mapsUrl: 'https://maps.google.com/?q=น้ำตกโผงโผง' },
  { id: 'a18', name: 'หาดแฆแฆ', rating: 4.3, type: '📍 สถานที่ท่องเที่ยว', status: 'ปิดอยู่ · เปิดเวลา 7:00 ก่อนเที่ยง', description: 'ชายหาดที่มีเอกลักษณ์โดดเด่นด้วยโขดหินแกรนิตขนาดใหญ่ตั้งเรียงราย', bullets: [], image: 'https://loremflickr.com/600/400/beach,rocks?random=a18', mapsUrl: 'https://maps.google.com/?q=หาดแฆแฆ' },
  { id: 'a19', name: 'หาดปะนาเระ', rating: 4.4, type: '📍 สถานที่ท่องเที่ยว', status: 'เปิดอยู่', description: 'ชายหาดยาวพร้อมหมู่บ้านประมงพื้นบ้าน สามารถสัมผัสวิถีชีวิตชาวเล', bullets: [], image: 'https://loremflickr.com/600/400/beach,village?random=a19', mapsUrl: 'https://maps.google.com/?q=หาดปะนาเระ' },
  { id: 'a20', name: 'Patani Artspace', rating: 4.5, type: '🏛️ พิพิธภัณฑ์', status: 'ปิดอยู่ · เปิดเวลา 10:00 ก่อนเที่ยง', description: 'หอศิลป์ร่วมสมัยที่เป็นศูนย์กลางจัดแสดงผลงานศิลปะของศิลปิน', bullets: [], image: 'https://loremflickr.com/600/400/art,gallery?random=a20', mapsUrl: 'https://maps.google.com/?q=Patani+Artspace' }
];

const PROVINCES: Record<string, ProvinceData> = {
  pattani: {
    id: 'pattani',
    nameTh: 'ปัตตานี',
    nameEn: 'Pattani',
    color: 'emerald',
    coverImage: 'https://loremflickr.com/1600/400/mosque,architecture?random=cover',
    restaurants: PATTANI_RESTAURANTS,
    attractions: PATTANI_ATTRACTIONS
  },
  yala: { id: 'yala', nameTh: 'ยะลา', nameEn: 'Yala', color: 'teal', coverImage: '', restaurants: [], attractions: [] },
  narathiwat: { id: 'narathiwat', nameTh: 'นราธิวาส', nameEn: 'Narathiwat', color: 'cyan', coverImage: '', restaurants: [], attractions: [] }
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
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 leading-relaxed">{place.description}</p>
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
        <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-2.5 rounded-xl font-bold transition text-sm group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-300">
          <MapPin className="w-4 h-4 mr-2" />
          เปิดใน Google Maps
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
        <Link href="/" className="absolute top-6 left-6 flex items-center text-white/90 hover:text-white bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm transition">
          <ArrowLeft className="w-5 h-5 mr-2" /> กลับหน้าหลัก
        </Link>
        <div className="text-center text-white z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">🕌 {province.nameTh}</h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-md">สำรวจปัตตานี เมืองงามสามวัฒนธรรม</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Restaurants */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
            <span className="text-4xl mr-3">🍽️</span> 
            แนะนำร้านอาหารฮาลาล
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
      </div>
    </div>
  );
}

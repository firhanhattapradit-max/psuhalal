# 🕌 Smart Halal Mobility & Tourism Platform

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

An innovative platform designed to enhance the mobility and tourism experience for Muslims, integrating real-time transportation data, halal food locations, prayer times, and gamification.

แพลตฟอร์มที่เป็นนวัตกรรมใหม่ที่ออกแบบมาเพื่อเพิ่มประสบการณ์การเดินทางและการท่องเที่ยวสำหรับชาวมุสลิม โดยบูรณาการข้อมูลการขนส่งแบบเรียลไทม์ ตำแหน่งอาหารฮาลาล เวลาละหมาด และเกมมิฟิเคชัน

## Architecture
```text
[Frontend (Next.js)] <---> [Backend (Node.js/Express)] <---> [PostgreSQL]
       |                            |
       |                            +---> [Redis (Caching/WebSocket)]
       v
  [Nginx (Reverse Proxy)]
```

## Features
- 🗺️ Live Map Tracking for Public Transport
- 🕌 Nearest Mosques & Halal Food Discovery
- ⏱️ Accurate Prayer Times & Qibla Direction
- 🎮 Gamification: Stamp Books, Badges, and Rewards
- 💸 Cross-Border Payment Integration (PromptPay, DuitNow)
- 🌍 Multi-language Support (EN, TH, MS, AR)

## Tech Stack
| Component | Technology |
|---|---|
| Frontend | Next.js, React, TailwindCSS, Zustand |
| Backend | Node.js, Express, TypeScript, Socket.io |
| Database | PostgreSQL, Redis |
| Containerization | Docker, Docker Compose |

## Quick Start
1. Clone the repository
2. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```
3. Run with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

## Environment Variables
See `.env.example` files in both `frontend` and `backend` directories.

## API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/*` | POST | Authentication and user management |
| `/api/map/*` | GET | Map layers and location data |
| `/api/gamification/*` | GET/POST | Badges, stamps, and rewards |
| `/api/payment/*` | POST | Transaction processing |

## Database Schema Overview
- `users`: User accounts and profiles
- `locations`: POIs like mosques, restaurants, bus stops
- `vehicles`: Real-time tracking data
- `checkins`: Gamification user check-ins
- `rewards`: Earned badges and stamps

## WebSocket Events
| Event | Direction | Description |
|---|---|---|
| `vehicle_update` | Server -> Client | Real-time vehicle location |
| `alert_broadcast` | Server -> Client | System-wide alerts |
| `checkin_status` | Server -> Client | Result of QR scan/check-in |

## Modules
- **Module A**: Authentication & User Profile
- **Module B**: Map & Real-time Tracking
- **Module C**: Prayer & Halal POIs
- **Module D**: Gamification & Cross-border Payments

## Security Features
- JWT-based Authentication
- HMAC-signed QR codes
- Rate limiting on API endpoints
- Helmet for secure HTTP headers

## Contributing
1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License
MIT

---
*Developed for the Thai southern border provinces.*

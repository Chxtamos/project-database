# 🎬 Movie Streaming Admin Panel

ระบบ Admin Dashboard สำหรับจัดการข้อมูลหนัง ผู้ใช้งาน การชำระเงิน และรีวิว พร้อมระบบ Database Monitor ในตัว

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 (Docker) |
| DB UI | Adminer (Docker) |

---

## ⚡ วิธีเริ่มต้นใช้งาน (Quick Start)

### 1. Clone โปรเจค

```bash
git clone -b Beta1 https://github.com/Chxtamos/project-database.git
cd project-database
```

### 2. ตั้งค่า Environment

```bash
# Copy ไฟล์ .env ของ backend
cp backend/.env.example backend/.env
```

ไฟล์ `backend/.env` มีค่าดังนี้ (ใช้ได้เลย ไม่ต้องแก้):

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=pgadmin4
DB_USER=root
DB_PASSWORD=root
PORT=5000
```

---

## 🐳 รัน Database + Adminer ด้วย Docker

> ต้องติดตั้ง [Docker Desktop](https://www.docker.com/products/docker-desktop/) ก่อน

### เปิด Database + Adminer (ครั้งแรก / ทุกครั้งที่เปิดเครื่อง)

```bash
docker-compose up -d
```

คำสั่งนี้จะ:
- ✅ ดึง Image `postgres:16-alpine` และ `adminer` จาก Docker Hub
- ✅ สร้าง Database `pgadmin4` พร้อม user `root`
- ✅ Import Schema ทั้งหมดอัตโนมัติ (จาก `backend/db/schema.sql`)
- ✅ เปิด Adminer UI

### ปิด Containers

```bash
docker-compose down
```

### ตรวจสอบสถานะ

```bash
docker-compose ps
```

---

## 🗄️ เข้าถึง Adminer (Database GUI)

เปิด Browser แล้วไปที่: **http://localhost:8888**

กรอกข้อมูล Login:

| Field | ค่า |
|-------|-----|
| System | `PostgreSQL` |
| Server | `db` |
| Username | `root` |
| Password | `root` |
| Database | `pgadmin4` |

> ⚠️ Server ต้องกรอก **`db`** ไม่ใช่ `localhost` เพราะ Adminer และ PostgreSQL อยู่ใน Docker network เดียวกัน

---

## 🚀 รันเว็บแอปพลิเคชัน

### Backend (API Server)

```bash
cd backend
npm install       # ครั้งแรกเท่านั้น
npm run dev
```

API จะรันที่: **http://localhost:5000**

### Frontend (React App)

```bash
# อยู่ที่ root ของโปรเจค
npm install       # ครั้งแรกเท่านั้น
npm run dev
```

เว็บจะเปิดที่: **http://localhost:5173**

---

## 📋 สรุปคำสั่งทั้งหมด (เปิดใช้งานทุกครั้ง)

```bash
# Terminal 1: เปิด Database
docker-compose up -d

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend
npm run dev
```

---

## 🌐 Services ที่รันอยู่

| Service | URL | คำอธิบาย |
|---------|-----|----------|
| 🖥️ Frontend | http://localhost:5173 | หน้าเว็บหลัก |
| ⚡ Backend API | http://localhost:5000 | REST API |
| 🗄️ Adminer | http://localhost:8888 | จัดการ Database ผ่าน UI |
| 📊 DB Monitor | http://localhost:5173/database | Database Monitor ในเว็บ |
| ❤️ Health Check | http://localhost:5000/api/health | ตรวจสอบสถานะ API |

---

## 🗃️ โครงสร้าง Database (16 ตาราง)

```
users           → ผู้ใช้งาน
movies          → ข้อมูลหนัง
genre           → ประเภทหนัง
actor           → นักแสดง
author          → ผู้กำกับ
library         → คลังหนังของผู้ใช้
cart            → ตะกร้าสินค้า
cart_movies     → หนังในตะกร้า
payment         → การชำระเงิน
playlist        → เพลย์ลิสต์
playlist_movie  → หนังในเพลย์ลิสต์
movie_genre     → หนัง ↔ ประเภท
movie_actor     → หนัง ↔ นักแสดง
movie_author    → หนัง ↔ ผู้กำกับ
review          → รีวิวหนัง
report_review   → รายงานรีวิว
```

---

## 📁 โครงสร้างโปรเจค

```
project-database/
├── backend/
│   ├── db/
│   │   ├── index.js        # Database connection
│   │   └── schema.sql      # Database schema + seed data
│   ├── routes/
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── users.js
│   │   ├── payments.js
│   │   ├── reviews.js
│   │   ├── genres.js
│   │   ├── cart.js
│   │   ├── dashboard.js
│   │   └── database.js     # Database monitor API
│   ├── middleware/
│   ├── .env.example
│   └── server.js
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ManageMovies.jsx
│   │   ├── ManageUsers.jsx
│   │   ├── ManagePayments.jsx
│   │   ├── ManageReviews.jsx
│   │   ├── SystemReport.jsx
│   │   └── DatabaseMonitor.jsx   # หน้า DB Monitor
│   └── App.jsx
├── docker-compose.yml      # PostgreSQL + Adminer
└── README.md
```

---

## 🔑 Login เข้าระบบ (เว็บ)

| Email | Password | Role |
|-------|----------|------|
| admin@movie.com | admin | Admin |

---

## ❓ Troubleshooting

**Database ต่อไม่ได้:**
```bash
# ตรวจสอบ container รันอยู่ไหม
docker-compose ps

# ถ้าไม่รัน ให้สั่ง
docker-compose up -d
```

**Port 5000 ถูกใช้งานอยู่:**
```powershell
# Windows PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess -Force
```

**Reset Database ใหม่ทั้งหมด:**
```bash
docker-compose down -v     # ลบ volume ข้อมูลทั้งหมด
docker-compose up -d       # สร้างใหม่พร้อม schema
```

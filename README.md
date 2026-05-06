# 🎬 MovieAdmin — Streaming Admin Panel

> **สำหรับคนที่จะทำงานต่อ**: อ่าน README นี้ให้ครบก่อนเริ่มครับ

---

## 📦 Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 16 (รันผ่าน Docker) |
| Auth | JWT (jsonwebtoken) + bcryptjs |

---

## 🛠️ สิ่งที่ต้องติดตั้งก่อน

### 1. Node.js
- ดาวน์โหลดที่ https://nodejs.org/
- เลือก **LTS version** (v18 ขึ้นไป)
- ติดตั้งตามขั้นตอนปกติ
- ตรวจสอบ: `node -v` ต้องแสดงเวอร์ชัน

### 2. Docker Desktop ⚠️ สำคัญมาก
Docker คือโปรแกรมที่จะรัน PostgreSQL database บนเครื่องคุณ **โดยไม่ต้องติดตั้ง PostgreSQL เอง**

**วิธีติดตั้ง Docker Desktop:**
1. ไปที่ https://www.docker.com/products/docker-desktop/
2. กด **Download for Windows** (หรือ Mac)
3. ติดตั้งและ **Restart** เครื่อง
4. เปิด Docker Desktop และรอจนไอคอน Docker ใน Taskbar เป็นสีขาว (แปลว่า Ready)
5. ตรวจสอบ: เปิด Terminal แล้วพิมพ์ `docker --version`

> ⚠️ ถ้าใช้ Windows ต้องเปิด **WSL2** ด้วย — Docker Desktop จะแนะนำให้ติดตั้งอัตโนมัติ

---

## 🐳 วิธีสร้างและลง Database ใน Docker Desktop

### ขั้นตอนที่ 1 — สร้าง Container ครั้งแรก (พิมพ์คำสั่งแค่ครั้งเดียว)

เปิด Terminal แล้วไปที่ folder โปรเจกต์ (ที่มีไฟล์ `docker-compose.yml`):

```powershell
cd project-database
docker-compose -p movie_admin up -d
```

**สิ่งที่คำสั่งนี้ทำ:**
- ✅ สร้าง PostgreSQL container ชื่อ `movie_admin_db`
- ✅ สร้าง database ชื่อ `movie_admin_db` ให้อัตโนมัติ
- ✅ รันในพื้นหลัง (Terminal ไม่ค้าง)

> ครั้งแรกจะดาวน์โหลด PostgreSQL image (~105 MB) รอสักครู่

---

### ขั้นตอนที่ 2 — Import โครงสร้าง Database (ทำแค่ครั้งแรกครั้งเดียว)

หลัง container รันแล้ว ต้อง import ไฟล์ `init_db.sql` เข้าไปด้วย:

```powershell
# Windows (PowerShell) — รันจาก folder project-database
Get-Content "init_db.sql" | docker exec -i movie_admin_db psql -U postgres -d movie_admin_db
```

เมื่อเสร็จจะเห็น output เยอะๆ เช่น `CREATE TABLE`, `ALTER TABLE`, `COPY 10` — แปลว่าสำเร็จ ✅

---

### ขั้นตอนที่ 3 — เช็คใน Docker Desktop

เปิด **Docker Desktop** จะเห็น:

```
Containers
└── 🟢 movie_admin          ← project ที่เราสร้าง
      └── movie_admin_db    ← container PostgreSQL กำลังรันอยู่
            port: 5433
```

---

### ครั้งต่อไป — กด Start/Stop ผ่าน Docker Desktop ได้เลย

หลังสร้าง container แล้วครั้งแรก **ไม่ต้องพิมพ์คำสั่งอีก** แค่:

| ต้องการ | วิธี |
|---------|------|
| **เริ่ม** database | เปิด Docker Desktop → Containers → กด ▶ **Start** ที่ `movie_admin` |
| **หยุด** database | เปิด Docker Desktop → Containers → กด ⏹ **Stop** |
| ดู Logs | คลิกที่ container → แท็บ **Logs** |

> หรือจะใช้คำสั่ง `docker-compose -p movie_admin up -d` / `down` ก็ได้เช่นกัน

---

### 3. Git
- ดาวน์โหลดที่ https://git-scm.com/
- ติดตั้งตามขั้นตอนปกติ

---

## 🚀 วิธีเริ่มต้น (ทำครั้งแรกครั้งเดียว)

### ขั้นตอนที่ 1 — Clone โปรเจกต์
```bash
git clone -b Beta1 https://github.com/Chxtamos/project-database.git
cd project-database
```

### ขั้นตอนที่ 2 — ติดตั้ง Frontend dependencies
```bash
npm install
```

### ขั้นตอนที่ 3 — ติดตั้ง Backend dependencies
```bash
cd backend
npm install
cd ..
```

### ขั้นตอนที่ 4 — สร้างไฟล์ .env สำหรับ Backend
```bash
# Windows (PowerShell)
copy backend\.env.example backend\.env

# Mac / Linux
cp backend/.env.example backend/.env
```
> ✅ ไม่ต้องแก้ไขอะไรในไฟล์ .env — ค่าเริ่มต้นตรงกับ Docker แล้ว

---

## ▶️ วิธีรันทุกครั้ง (เปิด Terminal 3 หน้าต่าง)

### Terminal 1 — เริ่ม Docker Database
```bash
# ต้องอยู่ใน folder project-database
docker-compose -p movie_admin up -d
```

**ครั้งแรก** Docker จะ download PostgreSQL image (~105 MB) รอสักครู่
**ครั้งต่อไป** จะเริ่มทันที ไม่ต้อง download ใหม่

ตรวจสอบว่าเริ่มสำเร็จ:
```bash
docker ps
# ต้องเห็น movie_admin_db อยู่ใน list
```

### Terminal 2 — รัน Backend API
```bash
cd backend
npm run dev
```
✅ สำเร็จเมื่อเห็น:
```
🚀 Movie Admin API → http://localhost:5000
✅ Connected to PostgreSQL: movie_admin_db
```

### Terminal 3 — รัน Frontend
```bash
# อยู่ใน folder project-database (root)
npm run dev
```
✅ เปิด browser ไปที่ **http://localhost:5173**

---

## 🛑 วิธีหยุดระบบ

```bash
# หยุด Docker (database)
docker-compose -p movie_admin down

# หยุด Backend และ Frontend: กด Ctrl+C ในแต่ละ Terminal
```

---

## 🌐 Ports ที่ใช้งาน

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| PostgreSQL | localhost:**5433** |

> ⚠️ Database ใช้ port **5433** (ไม่ใช่ 5432 ปกติ) เพื่อไม่ชนกับ PostgreSQL ที่อาจติดตั้งบนเครื่อง

---

## 📁 โครงสร้างโปรเจกต์

```
project-database/
├── src/                    ← Frontend (React)
│   ├── components/         ← Reusable components
│   │   ├── Layout.jsx
│   │   ├── Modal.jsx
│   │   └── ConfirmModal.jsx
│   ├── pages/              ← หน้าต่างๆ
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ManageMovies.jsx
│   │   ├── ManagePayments.jsx
│   │   ├── ManageReviews.jsx
│   │   ├── ManageUsers.jsx
│   │   └── SystemReport.jsx
│   └── App.jsx             ← Routing
│
├── backend/                ← Backend (Express)
│   ├── routes/             ← API Endpoints
│   │   ├── auth.js         ← /api/auth/login, /register
│   │   ├── movies.js       ← /api/movies (CRUD)
│   │   ├── users.js        ← /api/users (CRUD)
│   │   ├── payments.js     ← /api/payments (CRUD)
│   │   ├── reviews.js      ← /api/reviews (CRUD)
│   │   ├── genres.js       ← /api/genres (CRUD)
│   │   ├── cart.js         ← /api/cart
│   │   └── dashboard.js    ← /api/dashboard/stats
│   ├── db/
│   │   └── index.js        ← PostgreSQL connection
│   ├── middleware/
│   │   └── auth.js         ← JWT middleware
│   ├── server.js           ← Entry point
│   └── .env.example        ← ตัวอย่าง config
│
├── docker-compose.yml      ← Docker setup สำหรับ database
├── init_db.sql             ← SQL schema + ข้อมูลตัวอย่าง
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/register` | `{ username, email, telephone, password }` |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | ดึงทั้งหมด (รองรับ `?search=&genre_id=&page=&limit=`) |
| GET | `/api/movies/:id` | ดึงตัวเดียว |
| POST | `/api/movies` | เพิ่ม (ต้อง login) |
| PUT | `/api/movies/:id` | แก้ไข (ต้อง login) |
| DELETE | `/api/movies/:id` | ลบ (ต้อง login) |

### Users, Payments, Reviews, Genres, Cart
> pattern เดียวกัน — ดู `/api/health` สำหรับ list ครบทุก endpoint

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | สถิติรวม |
| GET | `/api/dashboard/top-movies` | Top movies |
| GET | `/api/dashboard/revenue-trend` | รายได้รายเดือน |

---

## 🗄️ Database Schema

Database มี **16 ตาราง** หลักคือ:

| ตาราง | คำอธิบาย |
|-------|---------|
| `users` | ผู้ใช้งาน |
| `movies` | ภาพยนตร์ |
| `genre` | หมวดหมู่ |
| `movie_genre` | ความสัมพันธ์ movie-genre |
| `actor` / `movie_actor` | นักแสดง |
| `author` / `movie_author` | ผู้กำกับ |
| `cart` / `cart_movies` | ตะกร้าสินค้า |
| `payment` | การชำระเงิน |
| `review` / `report_review` | รีวิว / รายงาน |
| `library` / `playlist` | ห้องสมุด / เพลย์ลิสต์ |

---

## 🐛 แก้ปัญหาเบื้องต้น

| ปัญหา | วิธีแก้ |
|-------|---------|
| `EADDRINUSE port 5000` | รัน `npx kill-port 5000` แล้ว `npm run dev` ใหม่ |
| `Cannot connect to Docker` | เปิด Docker Desktop แล้วรอจนพร้อม |
| `Connected to PostgreSQL` ไม่ขึ้น | ตรวจว่า Docker รันอยู่ด้วย `docker ps` |
| Frontend port 5173 ถูกใช้อยู่ | Vite จะเปลี่ยนเป็น 5174 อัตโนมัติ |

---

## 👥 ทีมงาน

- UI Design: Branch `UIโหดมาก`
- Backend + Docker: Branch `Beta1`

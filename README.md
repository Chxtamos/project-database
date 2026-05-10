# Movie Streaming Admin Panel

เว็บแอปสำหรับจัดการระบบขายและรับชมภาพยนตร์ออนไลน์ แบ่งเป็นฝั่ง Admin สำหรับดูแลข้อมูลระบบ และฝั่ง User สำหรับเลือกซื้อ ชำระเงิน จัดการคลังหนัง Playlist และรับชมวิดีโอ

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, lucide-react |
| Backend | Node.js, Express, JWT, bcryptjs, multer, nodemailer |
| Database | PostgreSQL 16 |
| Database UI | Adminer |
| Dev tools | Docker Compose, nodemon |

## ฟีเจอร์หลัก

### Admin

- Dashboard สรุปสถิติ รายได้ หนังยอดนิยม และแนวหนัง
- จัดการหนัง โปสเตอร์ วิดีโอ ราคา ประเภท นักแสดง และผู้กำกับ
- จัดการผู้ใช้
- จัดการเครดิต/เงินคงเหลือ
- ตรวจสอบและอนุมัติการชำระเงิน พร้อมดูสลิปโอนเงิน
- จัดการรีวิวและรายงานรีวิว
- System report และ Database monitor

### User

- สมัครสมาชิก เข้าสู่ระบบ ลืมรหัสผ่าน และเปลี่ยนอีเมล
- Browse หนัง ดูรายละเอียด และเพิ่มลงตะกร้า
- Checkout พร้อม QR PromptPay และอัปโหลดสลิป
- Library สำหรับหนังที่ซื้อแล้ว
- Playlist ส่วนตัว พร้อมเรียงลำดับหนัง
- Video player สำหรับรับชมหนัง
- รีวิวและรายงานรีวิวที่ไม่เหมาะสม
- Profile สำหรับจัดการข้อมูลบัญชี

## Quick Start

### 1. Clone โปรเจกต์

```bash
git clone -b Beta1 https://github.com/Chxtamos/project-database.git
cd project-database
```

### 2. ติดตั้ง dependencies

```bash
npm install

cd backend
npm install
cd ..
```

### 3. ตั้งค่า environment ของ backend

```bash
cp backend/.env.example backend/.env
```

ค่าเริ่มต้นใน `backend/.env.example` ใช้กับ Docker Compose ในโปรเจกต์นี้ได้ทันที:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=pgadmin4
DB_USER=root
DB_PASSWORD=root

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

JWT_SECRET=movie_admin_super_secret_key_2026
JWT_EXPIRES_IN=7d

EASYSLIP_API_KEY=YOUR_EASYSLIP_API_KEY_HERE
```

ถ้าใช้ฟีเจอร์ตรวจสอบสลิปผ่าน EasySlip ให้ใส่ API key จริงใน `EASYSLIP_API_KEY`

### 4. เปิด PostgreSQL และ Adminer

ต้องติดตั้ง Docker Desktop ก่อนใช้งานคำสั่งนี้

```bash
docker-compose up -d
```

คำสั่งนี้จะสร้าง:

- PostgreSQL container ชื่อ `movie_admin_db`
- Database ชื่อ `pgadmin4`
- User `root` และ password `root`
- Adminer ที่พอร์ต `8888`
- Schema และ seed data จาก `backend/db/schema.sql`

### 5. รัน backend

```bash
cd backend
npm run dev
```

Backend API จะรันที่ `http://localhost:5000`

### 6. รัน frontend

เปิด terminal อีกหน้าที่ root ของโปรเจกต์:

```bash
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

## Services

| Service | URL | รายละเอียด |
| --- | --- | --- |
| Frontend | http://localhost:5173 | React app |
| Backend API | http://localhost:5000 | Express REST API |
| Health check | http://localhost:5000/api/health | ตรวจสอบสถานะ backend |
| Adminer | http://localhost:8888 | Database GUI |
| Database monitor | http://localhost:5173/database | หน้า monitor ในเว็บ |
| Static uploads | http://localhost:5000/uploads | รูปโปสเตอร์และสลิป |

## Adminer Login

เปิด `http://localhost:8888` แล้วกรอก:

| Field | Value |
| --- | --- |
| System | `PostgreSQL` |
| Server | `db` |
| Username | `root` |
| Password | `root` |
| Database | `pgadmin4` |

หมายเหตุ: ใน Adminer ให้ใช้ server เป็น `db` เพราะ Adminer และ PostgreSQL อยู่ใน Docker network เดียวกัน

## Login เริ่มต้น

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@movie.com` | `admin` |

User ทั่วไปสามารถสมัครใหม่ได้ที่หน้า `/register`

## เส้นทางหน้าเว็บ

### Admin routes

| Path | Page |
| --- | --- |
| `/` | Login |
| `/dashboard` | Dashboard |
| `/movies` | Manage movies |
| `/payments` | Manage payments |
| `/reviews` | Manage reviews |
| `/users` | Manage users |
| `/credits` | Manage credits |
| `/report` | System report |
| `/database` | Database monitor |

### User routes

| Path | Page |
| --- | --- |
| `/register` | Register |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/verify-email` | Verify email change |
| `/user/home` | User home/catalog |
| `/user/movie/:id` | Movie detail |
| `/user/cart` | Cart |
| `/user/checkout` | Checkout |
| `/user/library` | Library |
| `/user/playlists` | Playlists |
| `/user/playlists/:id/edit` | Playlist editor |
| `/user/playlists/:id/watch` | Watch playlist redirect |
| `/user/watch/:movieId` | Video player |
| `/user/profile` | Profile |

## API routes

Backend mount routes ปัจจุบัน:

```text
/api/auth
/api/movies
/api/users
/api/payments
/api/reviews
/api/dashboard
/api/genres
/api/cart
/api/database
/api/library
/api/playlists
/api/checkout
/api/credits
```

ตรวจสอบ endpoint รายละเอียดเบื้องต้นได้ที่:

```text
GET http://localhost:5000/api/health
```

## Database

Schema หลักอยู่ที่ `backend/db/schema.sql` และจะถูก import อัตโนมัติเมื่อสร้าง volume PostgreSQL ใหม่ผ่าน Docker Compose

ตารางหลักใน schema ปัจจุบัน:

```text
actor
admins
author
cart
cart_movies
genre
library
movie_actor
movie_author
movie_genre
movies
payment
playlist
playlist_movie
report_review
review
transfer_slip
users
```

ไฟล์ migration เพิ่มเติมอยู่ใน `backend/db/`:

```text
001_movie_synopsis.sql
002_add_payment_tables.sql
003_sync_movie_rating_from_reviews.sql
004_playlist_movie_sort_order.sql
005_movie_video_url.sql
006_unique_review_per_user_movie.sql
```

มี helper script สำหรับงาน database บางส่วน:

```bash
cd backend
node run_migration.js
node setupAdminTable.js
node updateAdmin.js
node check_tables.js
node check_fks.js
```

## โครงสร้างโปรเจกต์

```text
project-database/
|-- backend/
|   |-- db/
|   |   |-- schema.sql
|   |   |-- 001_movie_synopsis.sql
|   |   |-- 002_add_payment_tables.sql
|   |   |-- 003_sync_movie_rating_from_reviews.sql
|   |   |-- 004_playlist_movie_sort_order.sql
|   |   |-- 005_movie_video_url.sql
|   |   `-- 006_unique_review_per_user_movie.sql
|   |-- middleware/
|   |   `-- auth.js
|   |-- routes/
|   |   |-- auth.js
|   |   |-- cart.js
|   |   |-- checkout.js
|   |   |-- credits.js
|   |   |-- dashboard.js
|   |   |-- database.js
|   |   |-- genres.js
|   |   |-- library.js
|   |   |-- movies.js
|   |   |-- payments.js
|   |   |-- playlists.js
|   |   |-- reviews.js
|   |   `-- users.js
|   |-- uploads/
|   |   |-- posters/
|   |   `-- slips/
|   |-- .env.example
|   `-- server.js
|-- public/
|   |-- favicon.svg
|   `-- qr_codes/
|-- src/
|   |-- components/
|   |-- context/
|   |-- pages/
|   |   |-- admin/
|   |   `-- user/
|   |-- App.jsx
|   |-- index.css
|   `-- main.jsx
|-- docker-compose.yml
|-- package.json
|-- USER_GUIDE.md
`-- README.md
```

## คำสั่งที่ใช้บ่อย

```bash
# เปิด database และ Adminer
docker-compose up -d

# ปิด containers
docker-compose down

# ปิดและลบ database volume เพื่อสร้างข้อมูลใหม่จาก schema.sql
docker-compose down -v

# ดูสถานะ containers
docker-compose ps

# รัน backend
cd backend
npm run dev

# รัน frontend
npm run dev

# build frontend
npm run build

# preview production build
npm run preview
```

## Troubleshooting

### Database ต่อไม่ได้

ตรวจสอบว่า container ทำงานอยู่:

```bash
docker-compose ps
```

ถ้ายังไม่ทำงาน ให้เปิดใหม่:

```bash
docker-compose up -d
```

### Port 5000 ถูกใช้งานอยู่บน Windows

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess -Force
```

### ต้องการ reset database ใหม่ทั้งหมด

```bash
docker-compose down -v
docker-compose up -d
```

คำสั่งนี้จะลบ volume เดิม และ import `backend/db/schema.sql` ใหม่ตั้งแต่ต้น

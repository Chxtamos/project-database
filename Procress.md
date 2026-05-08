# Progress Log — FilmHub Project

---

## 🗄️ Database ที่ไปแก้

### Tables ที่เพิ่มใหม่
1. **`admins`** — ตารางเก็บข้อมูลผู้ดูแลระบบ แยกออกจาก users (fields: admin_id, username, email, password)
2. **`transfer_slip`** — ตารางเก็บสลิปการโอนเงินจาก user (fields: slip_id, user_id, slip_image, amount, uploaded_at)

### Tables ที่แก้ไข
3. **`payment`** — ลบ column `transaction_ref` (varchar) ออก แล้วเพิ่ม `slip_id` (INTEGER, FK → transfer_slip) แทน เพื่อเชื่อมกับตารางสลิปใหม่

---

## 🔐 ระบบ Login

- แยก Login เป็น 2 Role:
  - **Admin** → ตรวจสอบจากตาราง `admins` → Redirect ไป `/dashboard`
  - **User** → ตรวจสอบจากตาราง `users` → Redirect ไป `/user/home`
- JWT Token เก็บ `role` เอาไว้ด้วย

---

# Progress Log — FilmHub Project

---

## 🗄️ Database ที่ไปแก้

### Tables ที่เพิ่มใหม่
1. **`admins`** — ตารางเก็บข้อมูลผู้ดูแลระบบ แยกออกจาก users (fields: admin_id, username, email, password)
2. **`transfer_slip`** — ตารางเก็บสลิปการโอนเงินจาก user (fields: slip_id, user_id, slip_image, amount, uploaded_at)

### Tables ที่แก้ไข
3. **`payment`** — ลบ column `transaction_ref` (varchar) ออก แล้วเพิ่ม `slip_id` (INTEGER, FK → transfer_slip) แทน เพื่อเชื่อมกับตารางสลิปใหม่

---

## 🔐 ระบบ Login

- แยก Login เป็น 2 Role:
  - **Admin** → ตรวจสอบจากตาราง `admins` → Redirect ไป `/dashboard`
  - **User** → ตรวจสอบจากตาราง `users` → Redirect ไป `/user/home`
- JWT Token เก็บ `role` เอาไว้ด้วย

---

## 👤 ฝั่ง User (Frontend)

- **Home** (`/user/home`) — ดึงหนังจาก Database แสดงผลพร้อมโปสเตอร์และราคา
- **Movie Detail** (`/user/movie/:id`) — ดึงข้อมูลหนัง + รีวิวจาก Database, เขียนรีวิวได้
- **Cart** (`/user/cart`) — ตะกร้าเชื่อมกับ Database (เพิ่ม/ลบหนัง), badge แสดงจำนวนแบบ Real-time
- **Checkout** (`/user/checkout`) — หน้าสแกน QR + อัพโหลดสลิปโอนเงิน (drag & drop)
- **My Library** (`/user/library`) — ดึงหนังที่ซื้อแล้วจาก Database, Toggle ❤️ Favorite ได้
- **Playlists** (`/user/playlists`) — สร้าง/ลบ และจัดการหนังใน Playlist (เลือกหนังจาก Library ด้วย Checkbox)
- **Profile** (`/user/profile`) — ดูข้อมูลส่วนตัว (Username, Email, Phone), แก้ไขข้อมูลได้, ดูสถิติจำนวนหนัง และ Logout

---

## 🛡️ ฝั่ง Admin (Frontend)

- **Manage Payments** — ดูสลิปโอนเงิน, กด **Approve** (สีเขียว) หรือ **Reject** (สีแดง) ได้
  - กด Approve → หนังย้ายเข้า Library ของ User อัตโนมัติ + Cart ถูก Clear
  - กด Reject → Cart ยังคงอยู่ ไม่มีอะไรเปลี่ยน
  - มี Summary Card แสดง Pending / Approved / Rejected

---

## 🔁 Flow การซื้อและจัดการหนัง

1. User เพิ่มหนังลงตะกร้า (บันทึกใน `cart_movies`)
2. User กด **Checkout Now** → เข้าหน้าสแกน QR
3. User โอนเงินแล้วอัพโหลดสลิป → ระบบบันทึกใน `transfer_slip` และสร้าง `payment` (status=0 Pending)
4. Admin เข้า Manage Payments → ดูสลิป → กด **Approve**
5. ระบบย้ายหนังจาก `cart_movies` → `library` อัตโนมัติ
6. User เข้าไปดูหนังใน **My Library** หรือจัดเข้า **Playlists** ของตัวเองได้ตามใจชอบ

---

## 🛠️ Backend Routes ที่เพิ่มใหม่

| Route | Method | คำอธิบาย |
|---|---|---|
| `/api/library/:user_id` | GET | ดึงหนังใน Library ของ User |
| `/api/library` | POST | เพิ่มหนังเข้า Library |
| `/api/library/:id/favorite` | PATCH | Toggle Favorite |
| `/api/playlists/:user_id` | GET | ดึง Playlist ของ User |
| `/api/playlists` | POST | สร้าง Playlist ใหม่ |
| `/api/playlists/:id` | DELETE | ลบ Playlist |
| `/api/playlists/:id/rename` | PATCH | เปลี่ยนชื่อ Playlist |
| `/api/playlists/:id/movies/sync` | PUT | บันทึกหนังใน Playlist ใหม่ทั้งหมด (Sync) |
| `/api/users/:id` | GET | ดึงข้อมูล Profile ของ User |
| `/api/users/:id` | PUT | อัปเดตข้อมูล Profile (Username, Email, Phone) |
| `/api/checkout` | POST | ส่งสลิปและสร้าง Payment |
| `/api/checkout/slip/:slip_id` | GET | ดึงข้อมูลสลิปรายตัว |

---

## 🎨 UI/UX และ Branding ที่ปรับปรุง

- **Rebranding**: เปลี่ยนชื่อโปรเจกต์จาก MovieStream เป็น **FilmHub** (User) และ **FilmHubAdmin** (Admin)
- **Favicon**: เพิ่มไอคอน **FH** ในกล่องสีฟ้า (SVG) เพื่อความเป็นเอกลักษณ์
- **Playlist Editor**: ระบบจัดการหนังใน Playlist แบบ Checkbox บน Grid Poster พร้อมระบบ Search และ Select All
- **Inline Rename**: สามารถกดแก้ไขชื่อ Playlist ได้ทันทีในหน้าจัดการ
- **Profile UI**: ปรับปรุงหน้าโปรไฟล์ให้มี Avatar (อักษรย่อ), Banner ไล่สี, และ Layout ที่ชัดเจนไม่ซ้อนทับกัน
- **Icon Updates**: เปลี่ยนไอคอน Library เป็นรูปฟิล์มหนัง (`Film`) แทนรูปหนังสือ
- **ConfirmModal**: รองรับ `confirmLabel` และ `confirmColor` ครบทุกรูปแบบ
- **Login Page**: ปรับแต่งข้อความต้อนรับและปุ่ม Log In ให้เข้ากับแบรนด์ใหม่

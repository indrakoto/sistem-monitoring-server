# SISTEM MONITORING SERVER

Aplikasi pemantauan server ini dibangun menggunakan **Next.js** (dengan TypeScript), **Prisma** sebagai ORM, dan **SQLite** sebagai database untuk lingkungan pengembangan (Development).

---

## 🌟 Prasyarat (Prerequisites)

Sebelum memulai, pastikan Anda telah menginstal *software* berikut di mesin Anda:

* **Node.js** (Versi LTS disarankan)
* **npm** atau **Yarn** atau **pnpm** (sebagai *package manager*)
* **Git**

---

## 🛠️ Panduan Pengembangan (Development Setup)

Ikuti langkah-langkah ini untuk menjalankan proyek di lingkungan lokal Anda.

### 1. Kloning Repositori

Buka terminal dan *clone* repositori dari GitHub:

```bash
git clone https://github.com/indrakoto/sistem-monitoring-server.git
cd sistem-monitoring-server
```

### 2. Instal Dependensi
Instal semua package yang dibutuhkan oleh proyek:
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Buat file (.env) di root proyek.
Penting: jika ada file .env.example, Anda dapat menyalinnya sebagai dasar:
```bash
cp .env.example .env
```

```bash
# Isi file .env Anda
DATABASE_URL="file:./prisma/dev.db"
```

### 4. Setup Database (Prisma + SQLite)

Jalankan perintah berikut untuk membuat file SQLite (`dev.db`) dan menerapkan skema serta migrasi (jika ada):

#### a. Terapkan Skema dan Migrasi
```bash
npx prisma migrate dev --name init
```
Perintah ini akan membuat file database, menerapkan skema dari prisma/schema.prisma, dan membuat folder migrasi


#### b. Seed Database (opsional)
Data awal (seeding) yang perlu dimasukkan ke database:
```bash
npx prisma db seed
```

### 5. Jalankan Aplikasi
Jalankan development server:
```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
```

Aplikasi akan berjalan di http://localhost:3000

---


## Panduan Produksi (Production Deployment)
Langkah-langkah ini diasumsikan dijalankan di server produksi (VPS, Docker, dsb.).

### 1. Kloning dan Instalasi
Clone repositori dan instal hanya dependensi produksi:
```bash
git clone [git@github.com:indrakoto/sistem-monitoring-server.git](git@github.com:indrakoto/sistem-monitoring-server.git)
cd sistem-monitoring-server

npm install --production 
# atau
yarn install --production
```

### 2. Konfigurasi Lingkungan Produksi
Buat file .env di server Anda dengan konfigurasi yang sesuai. Pastikan NODE_ENV diatur ke production.
```bash
# Contoh file .env di server produksi
DATABASE_URL="file:./prisma/prod.db" 
# Ubah path di atas jika Anda menggunakan database server seperti PostgreSQL/MySQL.

NODE_ENV="production"
```

### 3. Generate dan Terapkan Migrasi Database
a. Generate Prisma Client
Pastikan Prisma Client sudah di-generate agar proses build Next.js tidak gagal:
```bash
npx prisma generate
```

b. Terapkan Migrasi
Terapkan migrasi skema ke database produksi:
```bash
npx prisma migrate deploy
```

### 4. Build dan Start Aplikasi
Bangun aplikasi Next.js:
```
npm run build
```

### 5.Jalankan aplikasi dalam mode produksi:
```bash
npm run start
```

---
Rekomendasi: Gunakan process manager seperti PM2 atau systemd untuk memastikan proses aplikasi (npm run start) tetap berjalan dan me-restart secara otomatis.
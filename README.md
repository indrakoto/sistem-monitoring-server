# 💻 SISTEM-MONITORING-SERVER

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
git clone [git@github.com:indrakoto/sistem-monitoring-server.git](git@github.com:indrakoto/sistem-monitoring-server.git)
cd sistem-monitoring-server

npm install
# atau
yarn install
# atau
pnpm install

#Buat file (.env) di root proyek.
#PENTING: Jika ada file .env.example, Anda dapat menyalinnya sebagai dasar:
cp .env.example .env

# Isi file .env Anda
DATABASE_URL="file:./prisma/dev.db"

---

Berikut adalah bagian ketiga (`Panduan Pengembangan` - Bagian 2 dari 2) dan awal dari `Panduan Produksi`:

## 3. Setup Database, Run Dev, dan Awal Produksi

```markdown
### 4. Setup Database (Prisma + SQLite)

Jalankan perintah berikut untuk membuat file SQLite (`dev.db`) dan menerapkan skema serta migrasi (jika ada):

#### a. Terapkan Skema dan Migrasi

```bash
npx prisma migrate dev --name init

# Perintah ini akan membuat file database, menerapkan skema dari prisma/schema.prisma, dan membuat folder migrasi

# Seed Database
# data awal (seeding) yang perlu dimasukkan ke database:
npx prisma db seed

# Jalankan development server:
npm run dev
# atau
yarn dev
# atau
pnpm dev

# Aplikasi akan berjalan di http://localhost:3000

Panduan Produksi (Production Deployment)
Langkah-langkah ini diasumsikan dijalankan di server produksi (VPS, Docker, dsb.).

1. Kloning dan Instalasi
Clone repositori dan instal hanya dependensi produksi:

git clone [git@github.com:indrakoto/sistem-monitoring-server.git](git@github.com:indrakoto/sistem-monitoring-server.git)
cd sistem-monitoring-server

npm install --production 
# atau
yarn install --production
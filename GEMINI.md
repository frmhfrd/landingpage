# GEMINI.md

## Landing Page Strategy

The Gampang Beres landing page is a separate high-performance project focused on **SEO**, **Speed**, and **Conversion**.

*   **Technology Stack:** Astro + Tailwind CSS.
*   **Core Goal:** Direct users to download the Android APK and build trust through professional presentation.
*   **Key Constraint:** No web registration or login. All user actions must lead to the mobile app.

---

### Implementation Guide for Frontend Team

Tim Landing Page harus mengonsumsi data dari Backend API untuk memastikan informasi (seperti link download dan nomor CS) selalu mutakhir tanpa perlu build ulang website.

#### 1. Required API Endpoints
Gunakan endpoint **Publik** berikut (Tanpa Auth):

*   **`GET /api/app-status`**: Endpoint utama untuk data dinamis aplikasi.
*   **`GET /api/legal/terms`**: Mengambil konten Syarat & Ketentuan.
*   **`GET /api/legal/privacy`**: Mengambil konten Kebijakan Privasi.

#### 2. Data Mapping from `/api/app-status`
Respon dari `/api/app-status` berisi banyak field, silakan gunakan sesuai kategori berikut:

| Kategori | Field | Penempatan di UI |
| :--- | :--- | :--- |
| **Krusial** | `download_url` | Tombol Utama "Download APK" (Hero & Footer). |
| | `contact_whatsapp` | Link tombol "Hubungi CS" & Icon WA di Footer. |
| | `latest_version` | Badge versi (misal: "Versi Terbaru: 1.0.5"). |
| **Opsional** | `changelog` | Seksi "Apa yang Baru?" atau "Catatan Rilis". |
| | `min_deposit` | Seksi FAQ atau Fitur (misal: "Mulai dari Rp 10.000"). |
| | `min_withdrawal` | Seksi FAQ (misal: "Penarikan minimal Rp 50.000"). |
| **Diabaikan** | `force_update` | *Hanya untuk logika internal aplikasi mobile.* |
| | `build_number` | *Data teknis, tidak perlu ditampilkan ke publik.* |
| | `maintenance_mode` | *Hanya gunakan jika ingin menampilkan banner "Sistem Maintenance".* |

---

### Landing Page Structure (10 Sections)

1.  **Navbar:** Menu (Beranda, Fitur, Layanan, Kemitraan, FAQ) + **CTA Download**.
2.  **Hero:** Headline persuasif + Tombol Utama Download (`download_url`) + **Tombol Sekunder "Tanya CS" (`contact_whatsapp`)**.
3.  **Floating Widget:** **Floating WhatsApp Button** di pojok kanan bawah yang selalu muncul (`contact_whatsapp`).
4.  **Social Proof:** Ikon layanan generik (Pulsa, PLN, E-Wallet, PDAM) — *Dilarang menggunakan logo resmi brand.*
5.  **Fitur:** Kecepatan transaksi, Harga reseller, Keamanan saldo.
6.  **Kemitraan:** Penjelasan peran **Reseller** (Personal) vs **Mitra Agen** (Bisnis/Konter).
7.  **Cara Kerja:** Download -> Isi Saldo -> Transaksi.
8.  **FAQ:** Pertanyaan umum, info keamanan, dan syarat minimal (`min_deposit`/`min_withdrawal`).
9.  **Bottom CTA:** Final push untuk download aplikasi.
10. **Footer:** Logo, Slogan, Tautan Legal (Terms/Privacy), dan **WhatsApp CS** (`contact_whatsapp`).

---

### Backend System Notes
*   **Roles:** `reseller` (default) & `agen`.
*   **Markup:** Harga dihitung dinamis berdasarkan role.
*   **Download:** APK di-host secara lokal di `/public/downloads/` dan link-nya diatur via Admin Dashboard.

---

## Global Backend API Endpoints (Full Reference)

#### 1. Public Endpoints (No Token)
*   **Auth:** `POST /login`, `POST /register`
*   **OTP:** `POST /otp/send`, `POST /otp/verify`
*   **Password/Recovery:** `POST /forgot-password/send`, `POST /forgot-password/reset`, `POST /recovery/request-otp`, `POST /recovery/verify`
*   **System:** `GET /app-status`
*   **Legal:** `GET /legal/terms`, `GET /legal/privacy`
*   **Webhooks:** `POST /webhook/qris`, `POST /callback/digiflazz`

#### 2. User Protected Endpoints (Requires Sanctum Token)
*   **Profile:** `GET /profile`, `PUT /profile`, `POST /profile/fcm-token`, `POST /setup-pin`, `PUT /profile/pin`, `PUT /profile/password`
*   **Katalog:** `GET /products`, `GET /products/categories`, `GET /products/brands`, `GET /products/popular`
*   **Transaksi:** `POST /transactions` (Prabayar), `POST /transactions/postpaid/inquiry`, `POST /transactions/postpaid/pay`, `GET /transactions`, `GET /transactions/{id}/receipt`, `POST /transactions/{id}/complain`
*   **Keuangan:** `GET /deposits`, `POST /deposits`, `POST /deposits/{id}/cancel`, `GET /mutations`, `GET /withdrawals`, `POST /withdrawals`
*   **Sosial/Network:** `GET /referrals`, `POST /transfer-balance`
*   **Lainnya:** `GET /notifications`, `GET /announcements`

#### 3. Admin Endpoints (Requires Admin Role)
*   **Dashboard:** `GET /admin/dashboard`, `GET /admin/server-health`, `GET /admin/reports/financial`
*   **Produk:** `GET /admin/products`, `POST /admin/products/sync`, `GET /admin/markups`
*   **Manajemen:** `GET /admin/users`, `PUT /admin/users/{id}/role`, `POST /admin/users/{id}/balance`, `GET /admin/deposits`, `POST /admin/deposits/{id}/approve`, `GET /admin/withdrawals`, `POST /admin/withdrawals/{id}/approve`
*   **Konten & Sistem:** `GET /admin/announcements`, `GET /admin/settings`, `POST /admin/settings/maintenance`, `GET /admin/complaints`

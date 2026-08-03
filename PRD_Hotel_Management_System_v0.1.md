---
title: Hotel Management System
document_type: Product Requirements Document (PRD)
version: "0.1"
status: Draft untuk validasi kebutuhan
date: 2026-08-01
---

# Product Requirements Document

## Hotel Management System

**Room Inventory · Reservation · Payment · Discount Approval · Door Access**  
**Versi 0.1 — Prototype & MVP**

| **Status Dokumen**  | Draft untuk validasi kebutuhan                |
|---------------------|-----------------------------------------------|
| **Tanggal**         | 1 Agustus 2026                                |
| **Pemilik Produk**  | \[Nama Perusahaan/Hotel\]                     |
| **Pemilik Proses**  | Head Office Bandung & Operasional Hotel       |
| **Disiapkan untuk** | Perancangan prototype web dan MVP operasional |

# 0. Kontrol Dokumen

| **Versi** | **Tanggal**    | **Status** | **Perubahan Utama**                                          |
|-----------|----------------|------------|--------------------------------------------------------------|
| 0.1       | 1 Agustus 2026 | Draft      | Baseline kebutuhan prototype dan MVP berdasarkan brief awal. |

## Persetujuan Dokumen

| **Peran**                     | **Nama**  | **Status**           | **Tanggal** |
|-------------------------------|-----------|----------------------|-------------|
| Product Owner / Pemilik Usaha | \[Diisi\] | Menunggu persetujuan | —           |
| Kepala Operasional Hotel      | \[Diisi\] | Menunggu persetujuan | —           |
| Head Office Bandung           | \[Diisi\] | Menunggu persetujuan | —           |
| Tim Teknologi / Vendor        | \[Diisi\] | Menunggu persetujuan | —           |

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang dan Permasalahan](#2-latar-belakang-dan-permasalahan)
3. [Visi, Sasaran, dan Batasan Produk](#3-visi-sasaran-dan-batasan-produk)
4. [Pengguna, Peran, dan Kewenangan](#4-pengguna-peran-dan-kewenangan)
5. [Prinsip Desain dan Keputusan Produk](#5-prinsip-desain-dan-keputusan-produk)
6. [Ruang Lingkup Fungsional](#6-ruang-lingkup-fungsional)
7. [Alur Bisnis Utama](#7-alur-bisnis-utama)
8. [Persyaratan Fungsional dan Kriteria Penerimaan](#8-persyaratan-fungsional-dan-kriteria-penerimaan)
9. [Status dan Aturan Bisnis](#9-status-dan-aturan-bisnis)
10. [Desain Layar Prototype](#10-desain-layar-prototype)
11. [Model Data Tingkat Tinggi](#11-model-data-tingkat-tinggi)
12. [Integrasi Sistem](#12-integrasi-sistem)
13. [Dashboard, Laporan, dan Notifikasi](#13-dashboard-laporan-dan-notifikasi)
14. [Persyaratan Nonfungsional](#14-persyaratan-nonfungsional)
15. [KPI Keberhasilan](#15-kpi-keberhasilan)
16. [Tahapan Implementasi](#16-tahapan-implementasi)
17. [Risiko dan Mitigasi](#17-risiko-dan-mitigasi)
18. [Asumsi dan Pertanyaan Terbuka](#18-asumsi-dan-pertanyaan-terbuka)
19. [Lampiran A — Referensi Tampilan Availability](#lampiran-a-referensi-tampilan-availability-saat-ini)

# 1. Ringkasan Eksekutif

Hotel Management System (HMS) adalah aplikasi web terpusat untuk mengelola ketersediaan kamar, reservasi, pembayaran, check-in/check-out, persetujuan diskon, kartu akses, housekeeping, maintenance, kasir, laporan, dan audit trail. Sistem dirancang untuk menggantikan ketergantungan pada spreadsheet operasional yang rentan terhadap keterlambatan pembaruan, benturan reservasi, dan ketidaksesuaian antara pembayaran, status kamar, serta penggunaan kartu akses.

Kebutuhan paling kritis adalah memastikan kamar otomatis terkunci pada tanggal yang dipesan setelah DP terverifikasi, diskon di luar kewenangan standar hanya dapat digunakan setelah disetujui Head Office Bandung, serta penggunaan kartu akses dapat menjadi mekanisme rekonsiliasi ketika proses penguncian kamar sebelumnya gagal.

> **Keputusan produk inti**  
> “Kamar terkunci” didefinisikan sebagai *inventory lock* per nomor kamar dan tanggal. Status reservasi, status inventori, kondisi operasional kamar, dan status akses pintu disimpan terpisah agar sistem dapat merepresentasikan kondisi nyata tanpa menimbulkan konflik data.

## Hasil yang Diharapkan

- Menghilangkan double booking akibat pembaruan manual atau transaksi paralel.

- Memastikan DP terverifikasi mengunci kamar dalam hitungan detik.

- Menyediakan approval diskon yang terukur, terdokumentasi, dan dapat diaudit.

- Menyelaraskan reservasi, pembayaran, status hunian, serta kartu akses.

- Memberikan dashboard operasional hotel dan dashboard kendali Head Office Bandung.

- Menyediakan audit trail yang tidak dapat dihapus untuk seluruh aktivitas sensitif.

# 2. Latar Belakang dan Permasalahan

## 2.1 Kondisi Saat Ini

Ketersediaan kamar saat ini divisualisasikan dalam format spreadsheet dengan baris berupa nomor kamar dan kolom berupa tanggal. Warna sel digunakan untuk menunjukkan kondisi AVAILABLE atau SOLD. Pendekatan ini mudah dipahami, tetapi kurang aman ketika beberapa staf melakukan perubahan secara bersamaan dan tidak memiliki mekanisme transaksi database, persetujuan, maupun integrasi dengan pembayaran dan kartu akses.

## 2.2 Permasalahan Utama

| **ID**   | **Permasalahan**                                                                                                        |
|----------|-------------------------------------------------------------------------------------------------------------------------|
| **P-01** | Kamar yang telah menerima DP belum selalu otomatis terkunci sehingga berisiko dijual kembali.                           |
| **P-02** | Status kamar dapat berbeda antara spreadsheet, transaksi kasir, resepsionis, dan kondisi fisik.                         |
| **P-03** | Diskon di luar standar dapat diberikan tanpa alur persetujuan pusat yang terdokumentasi.                                |
| **P-04** | Pembayaran langsung di loket berpotensi tidak segera mengubah availability ketika jaringan atau proses staf bermasalah. |
| **P-05** | Kartu akses dapat diterbitkan atau digunakan tanpa rekonsiliasi otomatis terhadap reservasi yang valid.                 |
| **P-06** | Tidak tersedia audit trail lengkap untuk perubahan tarif, pembatalan, refund, atau override.                            |
| **P-07** | Manajemen pusat tidak memperoleh visibilitas real-time atas kinerja dan anomali seluruh hotel.                          |

## 2.3 Akar Masalah

- Data tersebar pada beberapa media dan belum memiliki satu sumber data utama.

- Tidak ada atomic transaction untuk mencegah dua staf mengunci kamar yang sama.

- Definisi status kamar belum dipisahkan antara booking, hunian, kebersihan, maintenance, dan pintu.

- Proses approval masih berpotensi berlangsung melalui kanal informal tanpa SLA dan jejak keputusan.

- Integrasi door lock bergantung pada kemampuan API/SDK dari vendor perangkat.

# 3. Visi, Sasaran, dan Batasan Produk

## 3.1 Visi Produk

> **Visi**  
> Menyediakan satu platform operasional hotel yang akurat, real-time, aman, dan dapat diaudit untuk memastikan setiap kamar, pembayaran, persetujuan, dan akses fisik selalu konsisten.

## 3.2 Sasaran Produk

| **ID**   | **Sasaran**                                                                                  |
|----------|----------------------------------------------------------------------------------------------|
| **G-01** | Mencegah double booking internal melalui room-night inventory lock dan database transaction. |
| **G-02** | Mengunci inventory otomatis setelah DP terverifikasi.                                        |
| **G-03** | Menyediakan approval diskon berdasarkan batas kewenangan dan escalation path.                |
| **G-04** | Mendeteksi serta merekonsiliasi door-access anomaly.                                         |
| **G-05** | Mempercepat proses reservasi, pembayaran, check-in, dan checkout.                            |
| **G-06** | Menyediakan dashboard hotel dan Head Office secara real-time.                                |
| **G-07** | Memastikan seluruh transaksi sensitif memiliki audit trail immutable.                        |

## 3.3 Non-Goals MVP

- Integrasi real-time dengan seluruh OTA dan channel manager.

- Dynamic pricing atau revenue management otomatis berbasis AI.

- General ledger akuntansi lengkap.

- Loyalty program, membership, dan point redemption.

- Mobile key melalui ponsel tamu.

- Aplikasi mobile native; MVP menggunakan responsive web application.

## 3.4 Lingkup Organisasi

Arsitektur dirancang multi-property sejak awal. Struktur organisasi sistem terdiri dari Head Office Bandung, hotel/cabang, gedung, lantai, tipe kamar, dan nomor kamar. Implementasi awal dapat dilakukan pada satu hotel sebagai pilot, tetapi model data tidak boleh membatasi ekspansi ke cabang lain.

# 4. Pengguna, Peran, dan Kewenangan

| **Peran**                    | **Tanggung Jawab Utama**                                                                                                    |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| **Receptionist**             | Membuat reservasi, menahan kamar, melihat availability, melengkapi data tamu, dan memproses check-in/out sesuai kewenangan. |
| **Reservation Staff**        | Menangani reservasi dari telepon, WhatsApp, website, corporate, travel agent, dan OTA manual.                               |
| **Cashier**                  | Mencatat pembayaran, membuka/menutup shift, mencetak kuitansi, dan melakukan rekonsiliasi kas.                              |
| **Front Office Supervisor**  | Menyetujui override operasional terbatas, perpanjangan HOLD, diskon sesuai limit, room move, dan exception handling.        |
| **Housekeeping**             | Memproses status DIRTY → CLEANING → CLEAN serta melaporkan minibar, kerusakan, dan lost and found.                          |
| **Housekeeping Supervisor**  | Melakukan inspeksi kamar dan mengubah status menjadi INSPECTED.                                                             |
| **Engineering**              | Menerima dan mengerjakan tiket maintenance.                                                                                 |
| **Hotel Manager**            | Mengelola operasional cabang, menyetujui diskon tertentu, refund, dan override berisiko tinggi.                             |
| **Finance Hotel**            | Memverifikasi transfer, refund, deposit, serta laporan transaksi hotel.                                                     |
| **Head Office Approver**     | Menyetujui diskon di luar batas cabang dan memantau SLA approval.                                                           |
| **Head Office Finance**      | Mengawasi pendapatan, piutang, refund, dan rekonsiliasi lintas hotel.                                                       |
| **Auditor**                  | Mengakses laporan dan audit trail secara read-only.                                                                         |
| **System Administrator**     | Mengelola konfigurasi teknis, user, role, integrasi, dan parameter sistem.                                                  |
| **Owner / Executive Viewer** | Mengakses dashboard ringkasan dan laporan tanpa mengubah data operasional.                                                  |

## 4.1 Prinsip Hak Akses

- Menggunakan Role-Based Access Control (RBAC) dan pembatasan per hotel/cabang.

- Tindakan sensitif memerlukan alasan, permission khusus, dan pada kondisi tertentu approval PIN atau 2FA.

- Data transaksi tidak dapat dihapus permanen; koreksi dilakukan melalui reversal atau amendment.

- Akses dokumen identitas tamu dibatasi dan dicatat dalam audit log.

## 4.2 Rekomendasi Batas Diskon

| **Level**               | **Batas Rekomendasi** | **Catatan**                                   |
|-------------------------|-----------------------|-----------------------------------------------|
| Receptionist            | ≤ 5%                  | Hanya untuk diskon operasional standar.       |
| Front Office Supervisor | ≤ 10%                 | Wajib alasan dan tercatat di audit log.       |
| Hotel Manager           | ≤ 15%                 | Dapat disesuaikan per hotel.                  |
| Head Office Bandung     | > 15%                | Approval pusat wajib sebelum harga digunakan. |

# 5. Prinsip Desain dan Keputusan Produk

| **ID**   | **Prinsip**         | **Keputusan**                                                                                      |
|----------|---------------------|----------------------------------------------------------------------------------------------------|
| **D-01** | Pemisahan status    | Status reservasi, room-night inventory, kondisi operasional kamar, dan door access harus terpisah. |
| **D-02** | Lock per tanggal    | Inventory dikunci per hotel + nomor kamar + malam menginap, bukan status global kamar.             |
| **D-03** | DP terverifikasi    | BOOKED hanya terbentuk setelah DP memenuhi ketentuan dan pembayaran berstatus VERIFIED.            |
| **D-04** | HOLD terbatas       | Sebelum DP, kamar hanya ditahan sementara dan dilepas otomatis ketika HOLD kedaluwarsa.            |
| **D-05** | No hard delete      | Transaksi keuangan, approval, check-in, dan door event tidak boleh dihapus permanen.               |
| **D-06** | Fail-safe access    | Door event digunakan sebagai sinyal rekonsiliasi, bukan sebagai sumber penciptaan pembayaran.      |
| **D-07** | Configurable policy | Batas DP, diskon, jam check-in/out, dan SLA approval dapat diatur per hotel atau pusat.            |
| **D-08** | Multi-property      | Seluruh entitas operasional membawa hotel_id untuk mendukung banyak cabang.                        |
| **D-09** | Audit by design     | Setiap perubahan penting mencatat before-after value, user, waktu, perangkat, sumber, dan alasan.  |

## 5.1 Ketentuan DP Default

Rekomendasi default adalah DP minimal 30% dari total reservasi atau senilai satu malam, mengikuti nilai yang lebih besar. Kebijakan ini harus configurable berdasarkan hotel, tipe kamar, rate plan, periode ramai, channel, dan corporate contract. Pembayaran di bawah minimum tidak mengunci kamar kecuali mendapatkan override Hotel Manager.

## 5.2 Ketentuan HOLD Default

| **Sumber Reservasi**              | **Durasi HOLD Default** | **Perpanjangan**                           |
|-----------------------------------|-------------------------|--------------------------------------------|
| Online / self-booking             | 30 menit                | Tidak otomatis; mengikuti payment session. |
| Front office / telepon / WhatsApp | 2 jam                   | Hanya oleh supervisor dengan alasan.       |
| Menunggu approval diskon          | 2 jam                   | Reminder 30 menit, eskalasi 60 menit.      |

# 6. Ruang Lingkup Fungsional

| **ID**   | **Modul**                | **Cakupan**                                                               |
|----------|--------------------------|---------------------------------------------------------------------------|
| **M-01** | Identity & Access        | Login, RBAC, 2FA, session, branch restriction.                            |
| **M-02** | Master Data              | Hotel, gedung, lantai, tipe kamar, kamar, fasilitas, rate plan, channel.  |
| **M-03** | Room Availability        | Calendar/grid kamar per tanggal, filter, detail, conflict prevention.     |
| **M-04** | Reservation              | DRAFT, HOLD, guest data, room assignment, group, extension, cancellation. |
| **M-05** | Payment & Deposit        | DP, pelunasan, deposit, payment verification, receipt, refund, reversal.  |
| **M-06** | Inventory Lock           | Atomic lock, expiration, release, room-night allocation.                  |
| **M-07** | Discount Approval        | Threshold, request, approve/reject/revise, SLA, audit.                    |
| **M-08** | Check-in / Checkout      | Eligibility, guest verification, folio, balance, room status transition.  |
| **M-09** | Access Card & Door Event | Card issuance, expiry, replacement, first-entry event, anomaly monitor.   |
| **M-10** | Housekeeping             | Dirty list, cleaning workflow, inspection, minibar, lost and found.       |
| **M-11** | Maintenance              | Ticket, out-of-order, progress, evidence, room release.                   |
| **M-12** | Cashier Shift            | Open/close shift, cash movement, handover, variance.                      |
| **M-13** | Dashboard & Reports      | Hotel dashboard, HO dashboard, operational and financial reports.         |
| **M-14** | Audit & Notification     | Immutable log, internal alert, WhatsApp integration future.               |
| **M-15** | Integration & Sync       | Door lock, payment gateway, accounting, OTA, offline queue.               |

## 6.1 Prioritas MVP

| **Prioritas** | **Cakupan**                                                                                                                                           |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| P0 — Wajib    | Login/RBAC, master kamar, availability, reservasi, HOLD, DP, inventory lock, approval diskon, check-in/out, simulasi kartu & door event, audit trail. |
| P1 — Penting  | Housekeeping dasar, maintenance dasar, shift kasir, dashboard, laporan dasar, notifikasi internal.                                                    |
| P2 — Lanjutan | Payment gateway, WhatsApp, accounting, door lock fisik, OTA/channel manager, OCR identitas.                                                           |

# 7. Alur Bisnis Utama

## 7.1 Reservasi, DP, dan Inventory Lock

> **1.** Staf memilih hotel, tanggal, tipe kamar, dan/atau nomor kamar.
>
> **2.** Sistem memeriksa availability melalui database transaction.
>
> **3.** Reservasi dibuat sebagai DRAFT atau HOLD.
>
> **4.** Pelanggan membayar DP melalui metode yang tersedia.
>
> **5.** Pembayaran diverifikasi manual atau otomatis.
>
> **6.** Sistem mengevaluasi apakah nilai DP memenuhi kebijakan.
>
> **7.** Jika memenuhi, reservasi menjadi CONFIRMED dan room-night inventory menjadi BOOKED.
>
> **8.** Jika gagal, sistem melakukan rollback dan menampilkan alasan tanpa menghasilkan lock parsial.

## 7.2 Approval Diskon di Luar Standar

> **1.** Staf memasukkan harga atau diskon serta alasan.
>
> **2.** Sistem membandingkan nilai diskon dengan limit role.
>
> **3.** Jika melebihi limit, reservasi menjadi PENDING APPROVAL dan kamar tetap HOLD.
>
> **4.** Head Office Bandung menerima notifikasi dan detail perhitungan harga.
>
> **5.** Approver memilih APPROVE, REJECT, atau REQUEST REVISION.
>
> **6.** Setelah disetujui, pembayaran DP dapat diproses.
>
> **7.** Perubahan tanggal, tipe kamar, jumlah kamar, channel, atau harga dasar membatalkan approval sebelumnya.

## 7.3 Pembayaran Loket dan Fail-Safe Door Event

> **1.** Tamu melakukan pembayaran langsung di loket.
>
> **2.** Kasir mencatat pembayaran dan menerbitkan kartu akses.
>
> **3.** Apabila pembaruan inventory gagal karena jaringan atau error, transaksi diberi status PENDING SYNC/EXCEPTION.
>
> **4.** Saat kartu pertama digunakan, door lock mengirim event berisi card UID, nomor kamar, dan timestamp.
>
> **5.** Sistem mencocokkan event dengan kartu dan reservasi.
>
> **6.** Jika reservasi valid ditemukan, sistem menandai CHECKED-IN/OCCUPIED dan mencoba mengunci inventory secara idempotent.
>
> **7.** Jika tidak ditemukan, sistem membuat ACCESS ANOMALY, memblokir penjualan sementara, dan mengirim alert ke supervisor/security.
>
> **8.** Door event tidak pernah menciptakan pembayaran baru secara otomatis.

## 7.4 Checkout dan Housekeeping

> **1.** Sistem menghitung folio akhir termasuk kamar, layanan tambahan, deposit, dan adjustment.
>
> **2.** Staf menyelesaikan pembayaran atau mencatat piutang corporate yang sah.
>
> **3.** Kartu akses dinonaktifkan dan reservasi menjadi CHECKED-OUT.
>
> **4.** Kamar otomatis berubah menjadi DIRTY dan masuk antrean housekeeping.
>
> **5.** Housekeeping mengubah DIRTY → CLEANING → CLEAN.
>
> **6.** Supervisor melakukan inspeksi dan mengubah CLEAN → INSPECTED apabila kebijakan mewajibkan.
>
> **7.** Kamar dapat ditempati berikutnya apabila inventory tersedia dan status operasional memenuhi syarat.

# 8. Persyaratan Fungsional dan Kriteria Penerimaan

Prioritas menggunakan MoSCoW: Must, Should, Could, dan Won’t untuk fase saat ini. Kriteria penerimaan ditulis sebagai kondisi minimum agar kebutuhan dapat diuji pada prototype atau MVP.

| **ID**     | **Prioritas** | **Fitur**             | **Kebutuhan**                                                                                             | **Kriteria Penerimaan**                                                                                     |
|------------|---------------|-----------------------|-----------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| **FR-001** | Must          | Login & RBAC          | Pengguna hanya melihat hotel dan fitur sesuai role.                                                       | User cabang A tidak dapat mengakses data cabang B; aksi tanpa permission ditolak dan dicatat.               |
| **FR-010** | Must          | Master kamar          | Admin mengelola hotel, gedung, lantai, tipe kamar, kamar, dan status aktif.                               | Kamar nonaktif/out-of-order tidak muncul sebagai inventory yang dapat dijual.                               |
| **FR-020** | Must          | Availability calendar | Tampilan grid menampilkan kamar sebagai baris dan tanggal sebagai kolom.                                  | Warna/status sesuai data room-night; filter hotel, tipe, lantai, dan status berfungsi.                      |
| **FR-021** | Must          | Conflict prevention   | Dua pengguna tidak dapat mengunci room-night yang sama.                                                   | Hanya transaksi pertama yang commit; transaksi kedua menerima pesan conflict tanpa data parsial.            |
| **FR-030** | Must          | Reservation & HOLD    | Staf membuat reservasi dan HOLD dengan expiry.                                                            | HOLD otomatis dilepas ketika melewati expiry dan belum ada pembayaran terverifikasi.                        |
| **FR-031** | Should        | Group reservation     | Satu booking dapat memuat beberapa kamar/tamu.                                                            | Setiap kamar memiliki room-night allocation dan guest assignment terpisah.                                  |
| **FR-040** | Must          | Payment recording     | Sistem mencatat beberapa pembayaran pada satu reservasi.                                                  | Total paid, outstanding, method, verifier, receipt number, dan timestamp terlihat.                          |
| **FR-041** | Must          | Payment verification  | Transfer manual memerlukan verifikasi; gateway dapat otomatis.                                            | Bukti unggah tanpa verifikasi tidak mengubah status menjadi BOOKED.                                         |
| **FR-050** | Must          | DP inventory lock     | DP yang memenuhi kebijakan mengubah CONFIRMED dan BOOKED.                                                 | Lock terbentuk maksimal 5 detik setelah pembayaran VERIFIED dan idempotent pada retry.                      |
| **FR-051** | Must          | DP exception          | DP di bawah minimum tidak mengunci tanpa override.                                                        | Sistem menampilkan shortfall dan meminta permission/approval untuk override.                                |
| **FR-060** | Must          | Discount threshold    | Sistem mendeteksi diskon melebihi limit role.                                                             | Harga tidak dapat difinalisasi sebelum approval yang sesuai tersedia.                                       |
| **FR-061** | Must          | Approval workflow     | Approver dapat approve/reject/request revision.                                                           | Keputusan menyimpan alasan, user, waktu, harga awal/akhir, dan SLA.                                         |
| **FR-062** | Must          | Approval invalidation | Perubahan material membatalkan approval lama.                                                             | Status kembali PENDING APPROVAL dan perubahan tercatat.                                                     |
| **FR-070** | Must          | Check-in eligibility  | Check-in hanya aktif bila syarat terpenuhi.                                                               | Kamar harus CLEAN/INSPECTED, pembayaran sesuai, identitas lengkap, dan approval selesai.                    |
| **FR-071** | Should        | Supervisor override   | Supervisor dapat override syarat tertentu.                                                                | Override wajib alasan, permission, dan audit log.                                                           |
| **FR-072** | Must          | Checkout              | Checkout menutup folio, kartu, dan status reservasi.                                                      | Setelah checkout, kartu nonaktif dan kamar menjadi DIRTY.                                                   |
| **FR-080** | Must          | Card issuance         | Sistem mencatat UID, room, reservation, validity, issuer.                                                 | Kartu kedaluwarsa tidak dianggap valid oleh PMS; kartu pengganti menonaktifkan kartu lama sesuai kebijakan. |
| **FR-081** | Must          | Door event simulation | Prototype dapat mensimulasikan first-entry event.                                                         | Event valid mengubah occupancy/check-in sesuai aturan dan menghasilkan log.                                 |
| **FR-082** | Must          | Access anomaly        | Event tanpa reservasi valid menghasilkan alert.                                                           | Kamar diblokir sementara dari penjualan dan alert tampil di dashboard supervisor.                           |
| **FR-090** | Should        | Housekeeping workflow | Kamar berpindah DIRTY → CLEANING → CLEAN/INSPECTED.                                                       | Timestamp dan petugas untuk setiap transisi tersimpan.                                                      |
| **FR-100** | Should        | Maintenance           | Tiket dapat mengubah kamar menjadi MAINTENANCE/OUT OF ORDER.                                              | Room-night terkait tidak dapat dijual selama periode blok.                                                  |
| **FR-110** | Should        | Cashier shift         | Kasir membuka/menutup shift dan merekonsiliasi kas.                                                       | Sistem menghitung expected cash dan variance.                                                               |
| **FR-120** | Should        | Dashboard             | Dashboard menampilkan occupancy, arrivals, departures, dirty, pending payment, pending approval, anomaly. | Data dapat difilter per hotel dan tanggal.                                                                  |
| **FR-121** | Should        | Reports               | Sistem mengekspor laporan dasar ke XLSX/PDF.                                                              | Filter laporan konsisten dengan data transaksi dan memiliki generated timestamp.                            |
| **FR-130** | Must          | Audit trail           | Aksi sensitif disimpan immutable.                                                                         | Audit menampilkan before/after, actor, role, hotel, source, IP/device, reason.                              |
| **FR-140** | Should        | Internal notification | Sistem mengirim alert in-app untuk approval dan anomaly.                                                  | Notifikasi memiliki read/unread, timestamp, dan tautan ke objek terkait.                                    |
| **FR-150** | Could         | Offline queue         | Transaksi darurat dapat diantrikan saat jaringan gagal.                                                   | Data bertanda PENDING SYNC dan direkonsiliasi tanpa duplikasi saat online.                                  |

# 9. Status dan Aturan Bisnis

## 9.1 Status Reservasi

| **Status**       | **Makna**                                       | **Transisi Utama**                             |
|------------------|-------------------------------------------------|------------------------------------------------|
| DRAFT            | Data awal belum menahan inventory.              | → HOLD / CANCELLED                             |
| HOLD             | Inventory ditahan sementara.                    | → PENDING_PAYMENT / PENDING_APPROVAL / EXPIRED |
| PENDING_PAYMENT  | Menunggu pembayaran atau verifikasi.            | → PARTIALLY_PAID / CONFIRMED / EXPIRED         |
| PENDING_APPROVAL | Menunggu keputusan diskon.                      | → HOLD / REJECTED / EXPIRED                    |
| PARTIALLY_PAID   | Pembayaran ada tetapi belum memenuhi kebijakan. | → CONFIRMED / CANCELLED                        |
| CONFIRMED        | DP memenuhi kebijakan dan inventory BOOKED.     | → CHECKED-IN / CANCELLED / NO-SHOW             |
| CHECKED-IN       | Tamu resmi menempati kamar.                     | → CHECKED-OUT / ROOM_MOVE                      |
| CHECKED-OUT      | Stay selesai dan folio ditutup.                 | Final                                          |
| CANCELLED        | Reservasi dibatalkan.                           | Refund/reversal bila diperlukan                |
| NO-SHOW          | Tamu tidak datang sesuai kebijakan.             | Release inventory / charge sesuai policy       |
| EXPIRED          | HOLD habis tanpa pemenuhan syarat.              | Dapat dibuat reservasi baru                    |

## 9.2 Status Room-Night Inventory

| **Status** | **Makna**                                                           |
|------------|---------------------------------------------------------------------|
| AVAILABLE  | Dapat dijual untuk tanggal tersebut.                                |
| HELD       | Ditahan sementara oleh reservasi aktif.                             |
| BOOKED     | Terkunci karena reservasi confirmed.                                |
| OCCUPIED   | Sedang digunakan tamu yang check-in.                                |
| BLOCKED    | Tidak dapat dijual karena owner block, maintenance, atau exception. |

## 9.3 Status Operasional Kamar

| **Status**   | **Makna**                           | **Dapat Check-in?**            |
|--------------|-------------------------------------|--------------------------------|
| CLEAN        | Sudah dibersihkan.                  | Ya, bila inspeksi tidak wajib. |
| INSPECTED    | Sudah diperiksa supervisor.         | Ya.                            |
| DIRTY        | Belum dibersihkan setelah checkout. | Tidak.                         |
| CLEANING     | Sedang dibersihkan.                 | Tidak.                         |
| MAINTENANCE  | Sedang diperbaiki.                  | Tidak.                         |
| OUT OF ORDER | Tidak layak digunakan.              | Tidak.                         |

## 9.4 Aturan Bisnis Utama

| **ID**    | **Aturan**                                                                               |
|-----------|------------------------------------------------------------------------------------------|
| **BR-01** | Room-night hanya boleh dimiliki satu reservasi aktif pada waktu yang sama.               |
| **BR-02** | BOOKED hanya terbentuk setelah payment VERIFIED dan DP threshold terpenuhi.              |
| **BR-03** | Upload bukti transfer bukan verifikasi pembayaran.                                       |
| **BR-04** | Approval diskon terikat pada snapshot harga, tanggal, tipe, channel, dan jumlah kamar.   |
| **BR-05** | Perubahan material menginvalidasi approval.                                              |
| **BR-06** | Door event bersifat idempotent; event yang sama tidak boleh memproses check-in dua kali. |
| **BR-07** | Door event tanpa reservasi valid membuat ACCESS ANOMALY, bukan pembayaran.               |
| **BR-08** | Checkout otomatis membuat kamar DIRTY dan menonaktifkan akses tamu.                      |
| **BR-09** | Refund dilakukan melalui reversal; transaksi asli tetap tersimpan.                       |
| **BR-10** | Setiap override wajib alasan dan permission yang sesuai.                                 |
| **BR-11** | Kamar OUT OF ORDER tidak dapat dijual pada periode blok.                                 |
| **BR-12** | Semua waktu disimpan dengan timezone dan ditampilkan sesuai timezone hotel.              |

# 10. Desain Layar Prototype

| **ID**    | **Layar**                  | **Komponen Kunci**                                                                                          |
|-----------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| **UI-01** | Login                      | Email/employee ID, password, 2FA untuk role tertentu, pemilihan hotel bila multi-property.                  |
| **UI-02** | Operational Dashboard      | Occupancy, available, booked, arrivals, departures, dirty, maintenance, pending payment, approval, anomaly. |
| **UI-03** | Room Availability Calendar | Grid room × date, color legend, filter, sticky header/room column, detail popover, conflict message.        |
| **UI-04** | Create Reservation         | Guest, channel, date, room/type, rate plan, discount, HOLD expiry, estimated total.                         |
| **UI-05** | Reservation Detail         | Timeline, rooms, guests, payments, approval, folio, notes, audit summary, actions.                          |
| **UI-06** | Payment & Receipt          | Method, amount, reference, proof, verifier, deposit type, receipt, reversal/refund.                         |
| **UI-07** | Discount Approval Queue    | Request card, base rate, discount, margin warning, reason, attachment, SLA, approve/reject/revise.          |
| **UI-08** | Check-in / Checkout        | Eligibility checklist, ID verification, card issue, folio settlement, deposit return, room status.          |
| **UI-09** | Access Card Monitor        | Card list, validity, first/last use, door events, anomaly severity, reconciliation action.                  |
| **UI-10** | Housekeeping Board         | Dirty/Cleaning/Clean/Inspected columns, assignee, duration, minibar, damage, photo.                         |
| **UI-11** | Maintenance Board          | Ticket, priority, room block period, technician, progress, estimated completion.                            |
| **UI-12** | Cashier Shift              | Opening cash, transaction list, cash movement, expected balance, actual balance, variance.                  |
| **UI-13** | Reports                    | Preset reports, filter, export, scheduled delivery future.                                                  |
| **UI-14** | Settings                   | Hotel policy, DP rule, discount limit, check-in/out time, rate plan, user, integration.                     |

## 10.1 Pedoman Tampilan Availability

- Baris mewakili nomor kamar; kolom mewakili tanggal.

- Kolom nomor kamar dan header tanggal tetap terlihat saat scroll.

- Warna tidak menjadi satu-satunya indikator; setiap sel memuat label/status atau tooltip.

- Klik sel AVAILABLE membuka pembuatan HOLD/reservasi.

- Klik sel BOOKED/OCCUPIED membuka ringkasan reservasi sesuai permission.

- Drag-and-drop hanya diaktifkan untuk room move/extend dengan validasi konflik dan konfirmasi.

- Legend dan filter harus selalu terlihat pada desktop.

# 11. Model Data Tingkat Tinggi

| **Entitas**            | **Fungsi**                                                      |
|------------------------|-----------------------------------------------------------------|
| **Hotel**              | Cabang/property dan konfigurasi kebijakan.                      |
| **Building / Floor**   | Struktur lokasi kamar.                                          |
| **RoomType**           | Kategori kamar, kapasitas, fasilitas, dan base rate.            |
| **Room**               | Nomor kamar fisik dan status operasional.                       |
| **RatePlan**           | Aturan harga, channel, periode, meal plan, cancellation policy. |
| **Guest**              | Profil tamu dan identitas terenkripsi.                          |
| **Reservation**        | Header booking, channel, status, total, policy snapshot.        |
| **ReservationRoom**    | Alokasi kamar/tamu dalam reservasi.                             |
| **RoomNightInventory** | Status inventory satu kamar untuk satu malam.                   |
| **Payment**            | Transaksi pembayaran, verification, method, receipt, reversal.  |
| **Deposit**            | Security/key/incidental deposit yang dipisahkan dari revenue.   |
| **DiscountRequest**    | Permintaan, limit, approval chain, decision, snapshot harga.    |
| **Stay**               | Check-in/out aktual dan room move history.                      |
| **AccessCard**         | UID, validity, reservation, room, issuer, status.               |
| **DoorEvent**          | Event akses pintu, source device, timestamp, result.            |
| **HousekeepingTask**   | Status cleaning, assignee, timestamps, evidence.                |
| **MaintenanceTicket**  | Issue, room block, priority, progress, resolution.              |
| **CashierShift**       | Opening/closing, cash transaction, variance.                    |
| **AuditLog**           | Immutable event log untuk perubahan data sensitif.              |
| **Notification**       | Alert in-app dan status delivery.                               |

## 11.1 Relasi Kritis

- Satu Reservation memiliki satu atau lebih ReservationRoom.

- Satu ReservationRoom menghasilkan beberapa RoomNightInventory berdasarkan jumlah malam.

- Satu Reservation dapat memiliki banyak Payment dan Deposit.

- Satu DiscountRequest terikat pada snapshot Reservation dan RatePlan.

- Satu Stay dapat memiliki beberapa AccessCard dan DoorEvent.

- Satu Room dapat memiliki banyak HousekeepingTask dan MaintenanceTicket.

- Semua entitas sensitif menghasilkan AuditLog.

# 12. Integrasi Sistem

## 12.1 Door Lock dan Card Encoder

Integrasi produksi membutuhkan dokumentasi vendor yang menjelaskan API/SDK, protokol encoder, kemampuan menerima event pembukaan pintu, identitas perangkat, format card UID, serta mekanisme sinkronisasi waktu. Prototype menggunakan simulator door event agar alur bisnis dapat diuji tanpa perangkat fisik.

| **Data Minimum dari Door System** | **Penggunaan**                                |
|-----------------------------------|-----------------------------------------------|
| card_uid                          | Mencocokkan kartu dengan reservasi dan tamu.  |
| room_code                         | Menentukan kamar yang diakses.                |
| event_time                        | Mencatat first-entry dan urutan kejadian.     |
| device_id / lock_id               | Audit perangkat sumber.                       |
| event_type                        | Guest card, master card, denied, door opened. |
| event_id                          | Menjamin idempotency dan deduplication.       |

## 12.2 Payment Gateway

- Mendukung payment status callback/webhook yang tervalidasi signature.

- Payment reference harus unik dan idempotent.

- Sistem tidak mengandalkan redirect browser sebagai bukti pembayaran berhasil.

- Status minimal: PENDING, PAID/VERIFIED, FAILED, EXPIRED, REFUNDED.

## 12.3 Integrasi Lanjutan

| **Integrasi**         | **Fase** | **Catatan**                                                             |
|-----------------------|----------|-------------------------------------------------------------------------|
| WhatsApp Business     | Fase 3   | Konfirmasi, reminder DP, voucher, invoice, cancellation.                |
| Accounting/ERP        | Fase 3   | Journal export atau API; bukan general ledger di HMS.                   |
| Website Booking       | Fase 3   | Public availability, rate plan, payment, booking lookup.                |
| OTA / Channel Manager | Fase 3–4 | Direkomendasikan melalui channel manager untuk mengurangi kompleksitas. |
| ID Scanner / OCR      | Fase 4   | Membantu input data identitas dengan validasi manual.                   |

# 13. Dashboard, Laporan, dan Notifikasi

## 13.1 Dashboard Operasional Hotel

- Occupancy hari ini dan forecast periode terpilih.

- AVAILABLE, HELD, BOOKED, OCCUPIED, BLOCKED.

- Arrival, departure, stay-over, early check-in, late checkout.

- DIRTY, CLEANING, CLEAN, INSPECTED, MAINTENANCE.

- Pending payment, outstanding balance, refund pending.

- Pending discount approval dan SLA tersisa.

- Access anomaly dan master-card anomaly.

## 13.2 Dashboard Head Office Bandung

- Ringkasan seluruh hotel dan perbandingan cabang.

- Occupancy, room revenue, ADR, RevPAR, discount ratio.

- Approval queue lintas hotel dan turnaround time.

- Refund, void/reversal, cash variance, dan anomaly trend.

- Room downtime akibat maintenance.

## 13.3 Laporan MVP

| **ID**   | **Laporan**                | **Isi**                                            |
|----------|----------------------------|----------------------------------------------------|
| **R-01** | Room Availability          | Ketersediaan per kamar/tanggal.                    |
| **R-02** | Occupancy                  | Occupancy per hari, tipe kamar, dan hotel.         |
| **R-03** | Room Revenue               | Pendapatan kamar berdasarkan stay/payment.         |
| **R-04** | Payment & Outstanding      | Pembayaran, saldo, method, verifier.               |
| **R-05** | Discount                   | Nilai diskon, requester, approver, alasan, SLA.    |
| **R-06** | Cancellation & No-show     | Alasan, fee, release, refund.                      |
| **R-07** | Cashier Shift              | Expected cash, actual cash, variance.              |
| **R-08** | Audit Trail                | Aktivitas sensitif berdasarkan user/objek/tanggal. |
| **R-09** | Door Access Anomaly        | Kartu, kamar, event, severity, resolution.         |
| **R-10** | Housekeeping & Maintenance | Durasi cleaning dan room downtime.                 |

## 13.4 Notifikasi Prioritas

| **Trigger**                             | **Penerima**                           | **Kanal MVP**           |
|-----------------------------------------|----------------------------------------|-------------------------|
| Discount request dibuat                 | Approver sesuai level                  | In-app + email opsional |
| Approval mendekati SLA                  | Approver dan escalation owner          | In-app                  |
| DP verified tetapi inventory lock gagal | FO Supervisor + System Admin           | High-priority in-app    |
| Door access tanpa reservasi valid       | FO Supervisor + Security               | High-priority in-app    |
| Cash variance saat tutup shift          | Cashier Supervisor + Finance           | In-app                  |
| Room out of order melebihi estimasi     | Engineering Supervisor + Hotel Manager | In-app                  |

# 14. Persyaratan Nonfungsional

| **ID**     | **Kategori**  | **Persyaratan**                                                                          |
|------------|---------------|------------------------------------------------------------------------------------------|
| **NFR-01** | Performance   | Availability grid 100 kamar × 31 hari dimuat ≤ 3 detik pada koneksi normal.              |
| **NFR-02** | Transaction   | Inventory lock selesai ≤ 5 detik setelah payment verified.                               |
| **NFR-03** | Concurrency   | Atomic transaction dan unique constraint mencegah double allocation.                     |
| **NFR-04** | Availability  | Target MVP 99,5%; target produksi multi-hotel 99,9%.                                     |
| **NFR-05** | Security      | TLS, encryption at rest untuk PII, password hashing kuat, rate limit, 2FA role sensitif. |
| **NFR-06** | Auditability  | Audit log append-only, retention configurable, akses read-only untuk auditor.            |
| **NFR-07** | Privacy       | Masking nomor identitas, least privilege, akses dokumen dicatat.                         |
| **NFR-08** | Backup        | RPO rekomendasi 15 menit; RTO rekomendasi 4 jam.                                         |
| **NFR-09** | Scalability   | Mendukung multi-property dan penambahan hotel tanpa perubahan struktur inti.             |
| **NFR-10** | Usability     | Desktop-first untuk front office; responsive mobile untuk housekeeping/engineering.      |
| **NFR-11** | Accessibility | Kontras memadai, keyboard navigation dasar, status tidak hanya dibedakan oleh warna.     |
| **NFR-12** | Observability | Centralized logging, error tracking, health check, integration retry metrics.            |
| **NFR-13** | Idempotency   | Payment callback dan door event aman terhadap retry/duplikasi.                           |
| **NFR-14** | Time          | Seluruh timestamp timezone-aware dan sinkron dengan NTP.                                 |
| **NFR-15** | Browser       | Mendukung versi terbaru Chrome, Edge, dan Safari; tablet modern untuk mobile web.        |

## 14.1 Keamanan Tindakan Sensitif

- Refund, perubahan tarif, approval diskon tinggi, master card, dan eksport data tamu memerlukan permission khusus.

- Role pusat, manager, finance, auditor, dan administrator menggunakan 2FA.

- Session timeout dan auto logout dapat dikonfigurasi.

- Setiap akses dokumen identitas dicatat dan dapat ditinjau auditor.

- Tidak ada password default pada lingkungan produksi.

# 15. KPI Keberhasilan

| **ID**     | **Metrik**              | **Target Awal**                                                           |
|------------|-------------------------|---------------------------------------------------------------------------|
| **KPI-01** | Double booking internal | 0 insiden akibat concurrent booking.                                      |
| **KPI-02** | Lock success rate       | ≥ 99,9% DP verified berhasil mengunci room-night tanpa intervensi manual. |
| **KPI-03** | Lock latency            | Median ≤ 2 detik; P95 ≤ 5 detik.                                          |
| **KPI-04** | Approval turnaround     | ≥ 90% approval selesai sebelum SLA.                                       |
| **KPI-05** | Check-in time           | Median ≤ 5 menit untuk reservasi lengkap.                                 |
| **KPI-06** | Payment discrepancy     | \< 0,5% transaksi memerlukan rekonsiliasi manual.                         |
| **KPI-07** | Door anomaly resolution | ≥ 90% anomaly ditindaklanjuti pada shift yang sama.                       |
| **KPI-08** | Data adoption           | ≥ 95% transaksi operasional dicatat melalui HMS setelah pilot stabil.     |
| **KPI-09** | Cash variance           | Penurunan variance kas dibanding baseline sebelum sistem.                 |
| **KPI-10** | System satisfaction     | Skor kepuasan pengguna operasional ≥ 4/5 setelah pilot.                   |

# 16. Tahapan Implementasi

| **Tahap**                                 | **Estimasi**      | **Output**                                                                                          |
|-------------------------------------------|-------------------|-----------------------------------------------------------------------------------------------------|
| Fase 0 — Discovery & Validation           | 1–2 minggu        | Validasi SOP, kebijakan DP/diskon, jumlah hotel/kamar, vendor door lock, role, dan data migrasi.    |
| Fase 1 — Clickable / Functional Prototype | 3–5 minggu        | UI availability, reservasi, DP, approval diskon, check-in, simulator door event, dashboard dummy.   |
| Fase 2 — MVP Operasional                  | 8–12 minggu       | Backend produksi, database, RBAC, payment manual, kasir, housekeeping, maintenance, laporan, audit. |
| Fase 3 — Pilot Satu Hotel                 | 2–4 minggu        | Migrasi awal, training, parallel run, UAT, incident handling, penyempurnaan SOP.                    |
| Fase 4 — Integrasi                        | Bergantung vendor | Door lock, payment gateway, WhatsApp, accounting, website booking.                                  |
| Fase 5 — Multi-Hotel Rollout              | Bertahap          | Rollout cabang, dashboard pusat, monitoring, support, dan optimasi.                                 |

## 16.1 Definition of Done Prototype

- Pengguna dapat menampilkan availability grid dengan data dummy.

- Pengguna dapat membuat HOLD dan mensimulasikan expiry.

- DP verified mengubah room-night menjadi BOOKED.

- Diskon di atas limit memerlukan approval Bandung.

- Check-in menerbitkan kartu dummy dan mencatat first-entry event.

- Door event tanpa reservasi menghasilkan ACCESS ANOMALY.

- Semua aksi penting terlihat pada audit timeline.

- Prototype lolos review alur oleh Front Office, Finance, Head Office, dan teknis.

## 16.2 Definition of Done MVP

- Seluruh P0 requirements lulus UAT.

- Tidak ditemukan double allocation pada concurrency test.

- Backup, restore, logging, dan monitoring diuji.

- Permission matrix divalidasi per role.

- Data pilot berhasil dimigrasikan dan direkonsiliasi.

- SOP operasional, incident response, dan training material tersedia.

# 17. Risiko dan Mitigasi

| **ID**      | **Risiko**                                      | **Dampak** | **Mitigasi**                                                                             |
|-------------|-------------------------------------------------|------------|------------------------------------------------------------------------------------------|
| **RISK-01** | Door lock tidak menyediakan API/event real-time | Tinggi     | Gunakan simulator pada prototype; minta SDK vendor; siapkan adapter atau gateway lokal.  |
| **RISK-02** | Jaringan hotel tidak stabil                     | Tinggi     | Offline queue terbatas, retry idempotent, monitoring koneksi, SOP fallback.              |
| **RISK-03** | Kebijakan harga/DP berbeda antar cabang         | Sedang     | Policy engine configurable dan snapshot aturan pada reservasi.                           |
| **RISK-04** | Resistensi pengguna terhadap perubahan          | Sedang     | Libatkan FO sejak prototype, desain menyerupai grid saat ini, training dan parallel run. |
| **RISK-05** | Migrasi data spreadsheet tidak bersih           | Sedang     | Data mapping, cleansing, dry-run, reconciliation report.                                 |
| **RISK-06** | Scope berkembang terlalu cepat                  | Tinggi     | Kunci P0/P1, gunakan change control, tunda OTA dan accounting penuh.                     |
| **RISK-07** | Data identitas tamu bocor                       | Tinggi     | Encryption, masking, least privilege, audit access, retention policy.                    |
| **RISK-08** | Callback payment/door event duplikat            | Sedang     | Idempotency key, unique event ID, deduplication dan retry policy.                        |
| **RISK-09** | Approval pusat lambat                           | Sedang     | SLA, reminder, escalation, delegation, dashboard queue.                                  |
| **RISK-10** | Override disalahgunakan                         | Tinggi     | Permission, mandatory reason, 2FA/PIN, alert, audit review berkala.                      |

# 18. Asumsi dan Pertanyaan Terbuka

## 18.1 Asumsi Baseline

| **ID**   | **Asumsi**                                                                            |
|----------|---------------------------------------------------------------------------------------|
| **A-01** | Sistem akan digunakan oleh minimal satu hotel dan Head Office Bandung.                |
| **A-02** | Prototype menggunakan data dummy dan simulator door event.                            |
| **A-03** | DP default 30% atau satu malam, mengikuti nilai terbesar, tetapi dapat dikonfigurasi. |
| **A-04** | Batas diskon default 5%/10%/15%/>15% sesuai level.                                   |
| **A-05** | Check-in default pukul 14.00 dan checkout pukul 12.00.                                |
| **A-06** | OTA dicatat manual pada MVP sebelum integrasi channel manager.                        |
| **A-07** | Cloud hosting diprioritaskan dengan server utama di Indonesia.                        |
| **A-08** | Pembayaran tunai dan transfer manual didukung pada MVP.                               |

## 18.2 Pertanyaan yang Harus Dikunci Sebelum Development MVP

| **ID**   | **Pertanyaan**                                                                                 |
|----------|------------------------------------------------------------------------------------------------|
| **Q-01** | Berapa jumlah hotel, kamar, lantai, dan pengguna aktif per shift?                              |
| **Q-02** | Apa merek/model electronic door lock dan apakah tersedia API/SDK/event gateway?                |
| **Q-03** | Apakah nomor kamar dialokasikan saat reservasi atau hanya tipe kamar sampai check-in?          |
| **Q-04** | Berapa kebijakan DP final per channel, periode, dan tipe kamar?                                |
| **Q-05** | Berapa batas diskon dan siapa approver final pada setiap level?                                |
| **Q-06** | Metode pembayaran dan payment gateway apa yang akan digunakan?                                 |
| **Q-07** | Apakah kasir terpisah dari resepsionis dan apakah night audit diperlukan pada MVP?             |
| **Q-08** | Apakah housekeeping/engineering menggunakan ponsel pribadi atau perangkat hotel?               |
| **Q-09** | Apakah terdapat software accounting, channel manager, atau PMS lama yang harus diintegrasikan? |
| **Q-10** | Berapa lama scan identitas, audit log, dan transaksi harus disimpan?                           |
| **Q-11** | Apakah refund/cancellation memiliki approval dan penalti khusus?                               |
| **Q-12** | Apa target tanggal demo, pilot, dan go-live?                                                   |

> **Rekomendasi keputusan berikutnya**  
> Sebelum desain UI final, lakukan workshop 60–90 menit bersama Front Office, Finance, Hotel Manager, Head Office Bandung, dan perwakilan teknis *door lock*. Tujuannya mengunci Q-01 sampai Q-12, memvalidasi alur *exception*, serta menetapkan data dummy untuk prototype.

# Lampiran A. Referensi Tampilan Availability Saat Ini

Tampilan spreadsheet berikut digunakan sebagai referensi mental model pengguna. Prototype mempertahankan pola baris kamar dan kolom tanggal, tetapi menambahkan status yang lebih kaya, filter, detail reservasi, transaksi database, dan audit trail.

![Room availability spreadsheet sebagai referensi awal](assets/room-availability-reference.png)

*Gambar A.1 — Room availability spreadsheet sebagai referensi awal.*

## Legenda Warna Rekomendasi Prototype

| **Status**      | **Makna**                | **Catatan UI**                                      |
|-----------------|--------------------------|-----------------------------------------------------|
| AVAILABLE       | Dapat dijual             | Hijau muda; label AVAIL.                            |
| HELD            | Ditahan sementara        | Kuning; tampilkan countdown expiry.                 |
| BOOKED          | DP terverifikasi         | Merah/rose; tampilkan booking code.                 |
| OCCUPIED        | Tamu check-in            | Biru tua; tampilkan nama singkat sesuai permission. |
| DIRTY/CLEANING  | Operasional housekeeping | Abu-abu/oranye; tidak dapat check-in.               |
| MAINTENANCE/OOS | Tidak dapat dijual       | Gelap/striped; tampilkan reason.                    |
| ACCESS ANOMALY  | Perlu rekonsiliasi       | Ikon peringatan dan border merah.                   |

## Catatan Akhir

Dokumen ini merupakan baseline PRD versi 0.1. Nilai default dan estimasi masih harus divalidasi sebelum development MVP. Perubahan setelah persetujuan baseline sebaiknya dicatat melalui change request agar dampaknya terhadap biaya, waktu, data model, dan integrasi dapat dikendalikan.

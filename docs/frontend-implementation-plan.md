# Rencana Implementasi Frontend — Hotel Management System (Prototype)

Dokumen ini merangkum pemahaman PRD `PRD_Hotel_Management_System_v0.1.md` dan rencana implementasi milestone frontend prototype. Lihat juga `DESIGN.md` untuk kontrak visual.

## 1. Ringkasan Pemahaman PRD
HMS adalah aplikasi web terpusat multi-property untuk mengelola availability kamar, reservasi, pembayaran/DP, inventory lock, approval diskon, check-in/out, kartu akses & door event, housekeeping, maintenance, shift kasir, dashboard, laporan, dan audit trail. Keputusan inti (D-01..D-09): pemisahan status (reservasi vs room-night inventory vs kondisi operasional kamar vs door access), lock per `hotel+room+night`, BOOKED hanya setelah DP VERIFIED memenuhi threshold, HOLD ber-expiry, no hard delete, door event sebagai sinyal rekonsiliasi (bukan sumber pembayaran), kebijakan config, audit by design.

## 2. Scope Milestone Pertama (frontend only, data dummy)
Fokus P0 + DoD prototype:
- Login & RBAC (mock auth, pembatasan per hotel, simulasi 2FA role sensitif).
- Master kamar (baca; dikelola via seed). Availability calendar grid room×date.
- Reservasi: DRAFT?HOLD?PENDING_PAYMENT/PENDING_APPROVAL?CONFIRMED; HOLD expiry otomatis.
- Pembayaran & DP: multi-payment, verifikasi manual, threshold DP (30% vs 1 malam, terbesar), BOOKED lock, exception shortfall + override.
- Approval diskon: deteksi limit per role (=5/=10/=15/>15%), queue, approve/reject/revise, invalidasi saat perubahan material.
- Check-in/out: eligibility checklist, penerbitan kartu, checkout menutup folio + kartu nonaktif + kamar DIRTY.
- Kartu & door event SIMULATOR: first-entry, idempotent, ACCESS ANOMALY bila tanpa reservasi valid, blokir sementara.
- Audit trail immutable (append-only) + notifikasi in-app.
- P1 dasar: Housekeeping board, Maintenance ticket, Dashboard operasional.

Non-goals milestone ini: backend/DB produksi, payment gateway, OTA, WhatsApp, door lock fisik, export XLSX/PDF nyata (disediakan stub UI), mobile key.

## 3. Daftar Halaman (route)
/login, /dashboard, /availability, /reservations, /reservations/new, /reservations/:id, /approvals, /check-in (front desk ops), /access (card & door monitor), /housekeeping, /maintenance, /notifications, /audit, /settings (read-only policy).

## 4. Struktur Komponen
Mengikuti arsitektur feature-based pada brief: `app/` (router, providers, layouts, config), `components/ui` + `shared` + `feedback` + `navigation`, `features/<domain>`, `services/contracts` + `mock` + `query-keys`, `domain/{types,rules,permissions,transitions}`, `data/{seed,fixtures}`, `hooks`, `lib`.

## 5. Struktur Data Frontend (domain/types)
Hotel, Building, Floor, RoomType, Room, RatePlan, Channel, Guest, Reservation, ReservationRoom, RoomNightInventory, Payment, PaymentVerification, DiscountRequest, Stay, AccessCard, DoorEvent, HousekeepingTask, MaintenanceTicket, CashierShift, AuditLog, Notification, User, PolicyConfig. Semua membawa `hotelId` bila operasional (D-08).

## 6. Business Rules yang Disimulasikan (domain/rules)
BR-01..BR-12 sesuai PRD: satu reservasi aktif per room-night; BOOKED hanya setelah DP VERIFIED+threshold; upload bukti ? verifikasi; approval terikat snapshot harga; perubahan material menginvalidasi; door event idempotent; event tanpa reservasi ? anomaly + blokir; checkout ? DIRTY + kartu nonaktif; refund via reversal; override wajib alasan+permission; OOO tidak dijual; timezone hotel.

## 7. Strategi Mock API
`services/contracts` = interface port (ReservationService, PaymentService, AvailabilityService, dll). `services/mock` = implementasi in-memory dari `data/seed` dengan `delay()` untuk mensimulasikan latency; transisi domain divalidasi `domain/transitions` dan dicatat ke `AuditLog`. TanStack Query membaca via `query-keys`; mutasi memanggil service lalu invalidate. Backend produksi nanti tinggal menukar implementasi contract (REST) tanpa mengubah UI.

## 8. Strategi Role & Permission
`domain/permissions` memetakan Role ? permissions + discount limit. `AuthProvider` menyimpan session user mock + hotel scope. Route guard + `Can` component + pengecekan di service (simulasi RBAC). Login menampilkan daftar user dummy per role untuk demo cepat.

## 9. Urutan Implementasi
1) Scaffold & token ? 2) domain types/rules/permissions/transitions ? 3) seed + service layer ? 4) app shell + auth ? 5) dashboard ? 6) availability ? 7) reservasi+payment+lock ? 8) approvals ? 9) check-in/out + door sim + access monitor ? 10) housekeeping/maintenance/notifikasi/audit ? 11) verify & QA.

## 10. Asumsi (didokumentasikan, menunggu penguncian Q-01..Q-12)
- Pilot 1 hotel + konteks Head Office (HO melihat lintas-hotel, tetapi seed hanya 1 property aktif).
- Nomor kamar dialokasikan saat reservasi (asumsi Q-03) — paling memudahkan availability grid.
- DP default 30% atau 1 malam (terbesar), configurable via PolicyConfig.
- Check-in 14:00, checkout 12:00 timezone Asia/Jakarta.
- HOLD default: online 30 mnt, front-office 2 jam, approval 2 jam (PRD 5.2).
- Verifikasi transfer manual oleh Finance/Cashier; tidak ada gateway nyata.
- Semua teks UI Bahasa Indonesia; format rupiah `id-ID`.

## 11. Verifikasi (dijalankan)
- `npx tsc -b` — 0 error (strict mode).
- `npm run build` — sukses (Vite 7).
- `npm test` — 10/10 lulus: aturan DP (5.1), transisi reservasi (9.1), dan integrasi layanan (create/HOLD, DP?BOOKED, BR-03, FR-060, BR-07, BR-08, RBAC).
- Dev server `http://localhost:5173` merender halaman login & shell dashboard (screenshot headless Chrome).
- Catatan: `holdExpiresAt` r3/r5 seed mengikuti waktu `new Date()` saat modul dimuat.

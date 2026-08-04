# Design System - Hotel Management System

Kontrak visual untuk prototype operasional hotel. Desktop-first, tetapi seluruh alur inti harus tetap dapat digunakan pada tablet dan mobile.

## 1. Direction

**Quiet control room.** Antarmuka terasa seperti meja kerja front office yang tenang: rail navigasi berwarna tinta, kanvas netral hangat, garis pemisah tipis, dan status sebagai satu-satunya sumber warna kuat. Pengguna harus dapat mengenali pekerjaan berikutnya dalam beberapa detik tanpa membaca seluruh halaman.

Referensi pola operasional: detail dan aksi tetap kontekstual seperti reservation workspace PMS modern; tidak menyalin merek, aset, atau copy produk lain. Riset eksternal tambahan tidak tersedia karena task riset gagal pada konfigurasi model.

## 2. Users And Tasks

- Resepsionis: mencari kamar, membuat reservasi, check-in/out, dan menangani antrean sambil melayani tamu.
- Supervisor: memindai exception, approval, pembayaran tertunda, dan status lintas departemen.
- Housekeeping/engineering: menemukan pekerjaan berikutnya dengan cepat pada perangkat tablet.
- Pengguna low-vision, keyboard, atau situasional: tetap mendapat label teks, fokus terlihat, target sentuh memadai, dan hierarki yang tidak bergantung warna.

## 3. Tokens

- Font: Inter (Google Fonts di `index.html`, diterapkan pada `body` di `index.css`); angka operasional selalu `tabular-nums`.
- Type: page title `text-2xl`; section title `text-sm font-semibold`; body/control `text-sm`; metadata `text-xs`; micro label `text-[11px]`.
- Radius: container `rounded-lg`; control `rounded-md`; status `rounded-sm`. Hindari pill dan radius besar.
- Spacing: unit dasar 4px. Shell `p-4` mobile / `p-6` desktop; section `gap-4`; dense row `py-2.5`; control height 40px.
- Canvas: `background` sebagai off-white sejuk; `card` sebagai work surface; `foreground` sebagai tinta navy gelap; `primary` sebagai navy; `accent` sebagai selected surface.
- Depth: border dan tonal shift adalah default. Shadow hanya untuk overlay/popover yang benar-benar berada di atas konten.
- Dark mode tetap berbasis class dan seluruh warna berasal dari CSS variables di `src/index.css`.

## 4. Status

Status wajib memakai `src/components/shared/status-tokens.ts`, selalu disertai label teks, dan tidak boleh diganti dengan raw palette.

| Tone | Intent | Contoh |
|---|---|---|
| `positive` | siap dijual / selesai | AVAILABLE, CLEAN, APPROVED |
| `info` | tamu sedang menginap | OCCUPIED, CHECKED_IN |
| `warning` | menunggu tindakan | HELD, CLEANING, PENDING_PAYMENT |
| `committed` | sudah terjual | BOOKED, CONFIRMED |
| `danger` | gagal / anomaly | REJECTED, FAILED |
| `special` | approval / reversal | PENDING_APPROVAL, REFUNDED |
| `inspect` | diverifikasi supervisor | INSPECTED |
| `attention` | perlu dikerjakan | DIRTY |
| `neutral` | terminal / inert | DRAFT, CHECKED_OUT, CANCELLED |
| `inverse` | hard block | BLOCKED, OUT_OF_ORDER |

Availability memakai `cellToneClass(status)` untuk permukaan rack yang padat. Anomaly akses memakai border danger dan ikon, bukan tone baru.

## 5. Primitives

- `AppLayout`: ink rail desktop, top command bar, drawer navigation mobile, dan content canvas dengan lebar terkontrol.
- `PageHeader`: eyebrow opsional, judul, subtitle maksimal sekitar 65 karakter, dan action rail yang dapat wrap.
- `Card`: work surface datar dengan border; elevated hanya untuk overlay.
- `Button`: default, secondary, outline, destructive, ghost; hover tonal, pressed `translate-y-px`, fokus ring jelas.
- `Input`, `Select`, `Textarea`: tinggi 40px, border tenang, fokus ring, disabled jelas.
- `StatusBadge`: label + semantic tone.
- `Operational metric`: label kecil, angka tabular, dan konteks singkat; bukan kumpulan kartu identik tanpa prioritas.
- `Data surface`: table/rack dengan sticky header, sticky identity column, row hover, dan horizontal scroll yang terlihat.
- `EmptyState`, `ConfirmDialog`, `MoneyText`: pola bersama untuk state dan transaksi.

Required states: default, hover, focus-visible, active, disabled, loading, empty, error. Mobile drawer harus dapat ditutup dengan tombol yang berlabel dan setelah memilih tujuan.

## 6. Layout

- Desktop: rail 240px, top bar 56px, content maksimal 1600px. Dashboard memakai satu metric utama dan kelompok exception, bukan grid kartu seragam.
- Exception-first: counter di dashboard dapat diklik dan mengarah ke antrean kerja (work queue) yang relevan.
- Availability rack: di bawah header tanggal, tampilkan micro-metric persen okupansi.
- Front desk hari ini: antrean kedatangan / keberangkatan / in-house dengan strip konteks shift di atas.
- Tablet: rail menjadi drawer; content tetap padat dengan grid 2 kolom bila cukup ruang.
- Mobile: satu kolom, header action wrap penuh, kontrol filter selebar container, tabel/rack horizontal-scroll. Tidak ada content tertutup navigasi.
- Tabel dan availability menjadi pusat visual. Form memakai section sederhana, bukan setiap field dalam kartu terpisah.

## 7. Motion

- 150-220ms untuk hover, drawer, dialog, dan popover; hanya `transform`, `opacity`, atau warna.
- Motion selalu menjelaskan state. Hormati `prefers-reduced-motion`.
- Hold countdown boleh memakai `animate-pulse-soft`; elemen non-interaktif tidak dianimasikan.

## 8. Accessibility And Debt

- Target sentuh minimal 40px, fokus keyboard terlihat, status tidak pernah color-only, landmark semantik tersedia, dan tombol selalu memiliki `type` eksplisit.
- Kontras teks normal minimal AA. Navigation drawer memiliki nama aksesibel dan overlay tidak boleh memerangkap pengguna.
- Bahasa UI Indonesia. Metadata memakai `·`, pending memakai `…`, dan range memakai `–`.
- Accepted debt sementara: custom dialog lama belum memiliki native focus trap; harus ditangani terpisah karena memengaruhi primitive dan seluruh call site.

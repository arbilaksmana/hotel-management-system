# Design System — Hotel Management System (Front Office Prototype)

DESIGN.md ini adalah kontrak visual untuk seluruh komponen prototype. Desktop-first untuk front office, responsif untuk tablet/mobile.

## Prinsip

- Profesional, padat informasi, tenang — tools operasional hotel, bukan landing page.
- Kejelasan status di atas dekorasi: setiap state bisnis punya warna + label teks, tidak hanya warna (PRD 10.1).
- Hierarki data: grid availability dan tabel adalah pusat; dekorasi minimal.
- Status wajib memakai token semantik (`src/components/shared/status-tokens.ts`), bukan palette mentah — agar light/dark theme sinkron dan semantik status bisa direview di satu tempat.

## Token

- Font: Inter (sans). Angka tabular untuk nominal rupiah/status: `tabular-nums`.
- Radius: `--radius: 0.65rem`; kartu besar `rounded-lg`, kontrol `rounded-md`, chip `rounded-sm`.
- Warna semantik (shadcn): background netral sejuk, primary navy `#274690`-ish (hsl 221 56% 32%).
- Spacing: skala Tailwind; padding section `p-6`, kartu `p-4`, gutter grid `gap-3`.
- Dark mode: `darkMode: ["class"]`; token didefinisikan sebagai CSS variables di `:root` dan override `.dark` di `src/index.css`. Komponen tidak boleh hardcode warna — hanya konsumsi variabel via `hsl(var(--...))`.

## Status & Warna (PRD Lampiran A + 9.x)

Token chip status lewat `StatusBadge` — selalu label teks + latar berwarna lembut + border tone.

Sistem tone semantik (10 tone, didefinisikan di `status-tokens.ts`):

| Tone | Intent | Status utama |
|---|---|---|
| `positive` | sellable / clean / settled | AVAILABLE, CLEAN, VERIFIED, APPROVED, ACTIVE, RESOLVED |
| `info` | guest in house | OCCUPIED, CHECKED_IN |
| `warning` | time-boxed / awaiting action | HELD, HOLD, CLEANING, PENDING_PAYMENT, PARTIALLY_PAID, PENDING, REVISION_REQUESTED, IN_PROGRESS, REPLACED |
| `committed` | sold, guest belum tiba | BOOKED, CONFIRMED, OPEN |
| `danger` | failure / rejection / anomaly | REJECTED, FAILED |
| `special` | approval + reversal flow | PENDING_APPROVAL, REFUNDED, REVERSED |
| `inspect` | verified by supervisor | INSPECTED |
| `attention` | perlu kerja housekeeping | DIRTY |
| `neutral` | terminal / inert | DRAFT, CHECKED_OUT, CANCELLED, NO_SHOW, EXPIRED, MAINTENANCE, INVALIDATED, DEACTIVATED, CLOSED |
| `inverse` | hard block, keluar inventory | BLOCKED, OUT_OF_ORDER |

Mapping status → tone ada di `STATUS_TONE`; helper:

- `toneFor(status)` → StatusTone (fallback `neutral` untuk status tak dikenal).
- `badgeToneClass(status)` → kelas badge (bg lembut + fg + border) untuk `StatusBadge`.
- `cellToneClass(status)` → kelas sel densitas tinggi untuk grid availability.
- `TONE_TEXT[tone]` → fg-only untuk emphasis metrik di kartu.

Setiap tone punya 4 varian di Tailwind (`tailwind.config.ts` → `colors.tone.*`): `bg`, `foreground`, `border`, `cell`. CSS variables per tone di `src/index.css` (light + dark).

### Grid availability

- Sel grid memakai `cellToneClass(status)` — densitas tinggi, edge-to-edge.
- Sticky kolom kiri (kamar) + sticky header (tanggal), sel klik-able.
- Anomaly akses: border merah + ikon alert (bukan tone semantik).

## Pola Komponen

- `AppLayout`: sidebar kiri navigasi + header (hotel switcher, user, notifikasi).
- `PageHeader`: judul + aksi utama kanan.
- `StatusBadge`, `MoneyText`, `EmptyState`, `ConfirmDialog`, `DataTable` ringan.
- Availability: grid sticky kolom kiri (kamar) + sticky header (tanggal), sel klik-able.
- Form: React Hook Form + Zod; error inline Bahasa Indonesia.

## Motion

- Fade/slide halus 200ms untuk dialog/popover. Tidak ada animasi besar.
- Hold countdown berdenyut halus (`animate-pulse-soft`).

## Aksesibilitas

- Kontras AA, label teks menyertai warna, fokus terlihat (`ring`), target sentuh >= 40px.
- Status tidak pernah disampaikan hanya lewat warna — selalu ada label teks (PRD 10.1).

## Teks

- Bahasa Indonesia untuk seluruh UI.
- Separator metadata memakai `·` (middle dot); loading/pending memakai ellipsis `…`; range angka memakai en dash `–`.
- Hindari karakter replacement `U+FFFD` (mojibake) — verifikasi dengan scan codepoint sebelum commit.

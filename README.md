# KIOSKID PRO — Kiosk Foto Kartu CR80 / Fargo

Kiosk untuk foto peserta yang otomatis dicetak ke kartu CR80 memakai
printer Fargo. Layar didesain untuk resolusi **1280×1024**.

## Apa yang diperbaiki dari versi sebelumnya

1. **Bug utama:** template PNG kamu tidak transparan di area lingkaran
   foto, jadi setelah foto diambil, gambar template menutupi foto
   peserta sepenuhnya. Sekarang `app.js` **memproses template secara
   otomatis** saat dimuat — melubangi area lingkaran lewat
   `globalCompositeOperation: 'destination-out'` di canvas — sehingga
   kamu **tidak perlu lagi mengedit file PNG manual** untuk membuat
   lubang transparan. Cukup pastikan koordinat `CIRCLE` di `app.js`
   sesuai posisi lingkaran template kamu.
2. **Tampilan dirombak total** mengikuti referensi yang kamu kirim
   (gaya "KIOSKID PRO"): navbar gelap dengan status Camera/Printer,
   panel kamera besar dengan template & panduan wajah langsung
   ditampilkan di atas live camera, panel "Preview Hasil Kartu"
   terpisah di kanan, panel status printer (ribbon, suhu, total
   cetak), pemilih template + tombol unggah template baru.

## Isi folder

```
photo-kiosk/
├─ index.html
├─ style.css
├─ app.js
├─ assets/template.png     template Dukcapil 2026 (bawaan)
├─ electron/
│   ├─ main.js              kiosk window + cetak senyap
│   └─ preload.js
├─ package.json
└─ README.md
```

## Cara menjalankan

### A. Cepat, uji coba di browser

```bash
cd photo-kiosk
npx serve .
```
Buka `http://localhost:3000` di Chrome (kamera perlu `localhost`/`https`),
lalu `F11` untuk fullscreen.

### B. Sebagai aplikasi kiosk sungguhan (Electron)

```bash
cd photo-kiosk
npm install
npm start
```

## Menyesuaikan posisi lingkaran foto

Kalau kamu ganti template dengan posisi/ukuran lingkaran foto yang
beda, ubah di `app.js`:

```js
const CIRCLE = { cx: 350, cy: 535, r: 178 }; // titik tengah & radius, piksel dalam kanvas 679x1046
```

Template lain yang diunggah lewat tombol **Unggah Template** di
aplikasi juga akan diproses otomatis dengan koordinat lingkaran yang
sama — jadi kalau posisi lingkarannya beda, sesuaikan `CIRCLE` dulu
sebelum mengunggah, atau minta saya tambahkan kalibrasi per-template
kalau kamu butuh banyak template dengan posisi berbeda-beda.

## ⚠️ Soal font (Plus Jakarta Sans / Inter)

Font di-load lewat Google Fonts CDN (`<link>` di `index.html`), jadi
**butuh koneksi internet** saat aplikasi dibuka pertama kali (setelahnya
biasanya sudah di-cache browser). Kalau PC kiosk kamu **tidak ada
internet sama sekali** di lokasi acara:

1. Download file `.woff2` untuk **Plus Jakarta Sans** (600/700/800) dan
   **Inter** (400/500/600/700) dari fonts.google.com, taruh di
   `assets/fonts/`.
2. Ganti `<link>` Google Fonts di `index.html` dengan `@font-face` lokal
   di awal `style.css`, contoh:
   ```css
   @font-face{
     font-family:"Inter";
     src:url("assets/fonts/Inter-Regular.woff2") format("woff2");
     font-weight:400;
   }
   ```
   (ulangi untuk tiap berat font yang dipakai).

## ⚠️ Soal angka di "Status Printer CR80"

Browser **tidak bisa membaca status asli printer** (ribbon %, suhu
mesin, dsb) — itu keterbatasan Web API, bukan bug. Panel itu saat ini
menampilkan angka **mock/placeholder**. "Total Cetak" saja yang riil
(dihitung otomatis setiap kali kamu menekan Cetak, tersimpan di
`localStorage`).

Untuk data ribbon/suhu yang asli dari mesin Fargo, dibutuhkan:
- SDK/driver resmi Fargo yang punya API status (biasanya lewat
  Windows SDK / DLL), dan
- sebuah "bridge" native (Node.js addon atau service kecil di
  Electron main process) yang membaca status itu lalu mengirim ke
  halaman web lewat IPC — mirip pola `silent-print` yang sudah ada di
  `electron/main.js`.

Kalau kamu punya SDK Fargo-nya, saya bisa bantu buatkan bridge-nya.

## Setting printer Fargo (CR80)

1. Install driver resmi Fargo (misal HDP5600) dari situs HID Global.
2. Di *Printing Preferences* Windows, set ukuran card **CR80**,
   orientasi **Portrait**.
3. Di `electron/main.js`, ganti:
   ```js
   const PRINTER_NAME = 'Fargo HDP5600 Card Printer';
   ```
   dengan nama persis printer di Windows kamu.
4. `window.print()` di `app.js` (fungsi `cetakKartu`) masih pakai
   dialog print biasa — aman untuk tes pertama. Setelah hasil & posisi
   cetak pas, ganti ke `window.kioskAPI.silentPrint()` supaya tidak
   ada dialog sama sekali.

## Fitur

- Live camera + template & panduan wajah ("POSISI WAJAH") ditampilkan
  langsung di atas kamera untuk framing.
- Countdown 3 detik + efek flash.
- Foto otomatis crop ke lingkaran, template (dengan lubang transparan
  otomatis) ditumpuk di atasnya.
- Satu tombol Ambil Foto/Ulangi + tombol Cetak.
- Panel status Camera Online/Offline (real), Printer Ready (mock),
  Hardware Bridge (mock).
- Panel status printer: ribbon %, suhu mesin (mock), total cetak (real).
- Pemilih template + unggah template PNG baru.
- Auto-save JPG per cetakan (nama file: tanggal + nomor peserta).
- Log setiap pencetakan (tombol **Log Cetak** di footer).
- Nomor/nama peserta lewat scanner barcode/QR (format `NOMOR|NAMA`).
- Shortcut: `F1` Ambil Foto/Ulangi, `F2` Cetak, `Esc` Ulangi.

## Yang perlu kamu sesuaikan sebelum dipakai di lapangan

1. Cek `CIRCLE` di `app.js` cocok dengan template Dukcapil kamu.
2. Set `PRINTER_NAME` di `electron/main.js`.
3. Tes cetak dengan dialog biasa dulu, baru pindah ke `silentPrint()`.
4. Kalau butuh data printer/kamera yang beneran real-time, siapkan SDK
   Fargo dan minta saya bantu buat bridge-nya di Electron.

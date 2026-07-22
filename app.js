/* =========================================================
   KIOSKID PRO — Foto Kartu CR80
   Perbaikan utama dari versi sebelumnya:
   - Template PNG diproses otomatis untuk "melubangi" area foto
     (canvas destination-out) sehingga foto peserta betul-betul
     tampil di baliknya, walau file PNG aslinya tidak transparan.
   - Live camera menampilkan template + panduan wajah langsung
     di atas video (bukan panel terpisah), sesuai desain baru.
   ========================================================= */

// Koordinat lingkaran foto pada template asli (piksel 679x1046).
// Ubah 3 angka ini kalau kamu ganti template dengan posisi lingkaran berbeda.
const CIRCLE = { cx: 350, cy: 535, r: 178 };
const CARD_W = 679;
const CARD_H = 1046;

const video          = document.getElementById('video');
const canvas         = document.getElementById('cardCanvas');
const ctx            = canvas.getContext('2d');
const placeholder    = document.getElementById('placeholder');
const countdownEl    = document.getElementById('countdown');
const flashEl        = document.getElementById('flash');
const btnCapture     = document.getElementById('btnCapture');
const btnPrint       = document.getElementById('btnPrint');
const btnExit        = document.getElementById('btnExit');
const btnLog         = document.getElementById('btnLog');
const btnCloseLog    = document.getElementById('btnCloseLog');
const logOverlay     = document.getElementById('logOverlay');
const logTableBody   = document.querySelector('#logTable tbody');
const pillCamera     = document.getElementById('pillCamera');
const uploadTemplate = document.getElementById('uploadTemplate');
const templateList   = document.getElementById('templateList');
const ribbonPctEl    = document.getElementById('ribbonPct');
const ribbonFillEl   = document.getElementById('ribbonFill');
const totalCetakEl   = document.getElementById('totalCetak');

let state = 'live';        // 'live' | 'captured'
let capturedFrame = null;  // canvas offscreen berisi frame video hasil capture
let punchedTemplate = null; // Image: template dengan lubang transparan di lingkaran foto
let rawTemplateSrc = 'assets/template.png';

let currentPeserta = { nomor: '-', nama: '-' };

// ---------------------------------------------------------
// 1. Proses template: lubangi area lingkaran foto (transparan)
// ---------------------------------------------------------
function loadAndPunchTemplate(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const off = document.createElement('canvas');
      off.width = CARD_W;
      off.height = CARD_H;
      const octx = off.getContext('2d');
      octx.drawImage(img, 0, 0, CARD_W, CARD_H);
      octx.globalCompositeOperation = 'destination-out';
      octx.beginPath();
      octx.arc(CIRCLE.cx, CIRCLE.cy, CIRCLE.r, 0, Math.PI * 2);
      octx.closePath();
      octx.fill();
      octx.globalCompositeOperation = 'source-over';

      const punched = new Image();
      punched.onload = () => resolve(punched);
      punched.src = off.toDataURL('image/png');
    };
    img.src = src;
  });
}

async function setActiveTemplate(src) {
  rawTemplateSrc = src;
  punchedTemplate = await loadAndPunchTemplate(src);
  // catatan: live camera sekarang hanya menampilkan grid + panduan wajah (bukan gambar template),
  // template asli (dengan lubang transparan) tetap dipakai untuk hasil akhir di panel kanan & saat cetak.
  if (state === 'captured' && capturedFrame) drawCard(capturedFrame);
}

// ---------------------------------------------------------
// 2. Kamera
// ---------------------------------------------------------
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 1024 } },
      audio: false
    });
    video.srcObject = stream;
    setPill(pillCamera, true, 'Camera: Online');
  } catch (err) {
    setPill(pillCamera, false, 'Camera: Offline');
    console.error(err);
  }
}

function setPill(el, ok, label) {
  el.textContent = '● ' + label;
  el.classList.toggle('off', !ok);
}

// ---------------------------------------------------------
// 3. Menggambar kartu final: background -> foto (clip lingkaran) -> template berlubang
// ---------------------------------------------------------
function drawCard(source) {
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  if (source) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(CIRCLE.cx, CIRCLE.cy, CIRCLE.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const sw = source.width, sh = source.height;
    const boxSize = CIRCLE.r * 2;
    const scale = Math.max(boxSize / sw, boxSize / sh);
    const dw = sw * scale, dh = sh * scale;
    const dx = CIRCLE.cx - dw / 2, dy = CIRCLE.cy - dh / 2;
    ctx.drawImage(source, dx, dy, dw, dh);
    ctx.restore();
  }

  if (punchedTemplate) ctx.drawImage(punchedTemplate, 0, 0, CARD_W, CARD_H);
}

// ---------------------------------------------------------
// 4. Ambil Foto / Ulangi (satu tombol, berganti fungsi)
// ---------------------------------------------------------
let capturing = false;
function onCaptureButton() {
  if (state === 'captured') { ulangiFoto(); return; }
  ambilFoto();
}

function ambilFoto() {
  if (capturing || state !== 'live') return;
  capturing = true;
  let n = 3;
  countdownEl.textContent = n;
  countdownEl.classList.remove('hidden');

  const tick = setInterval(() => {
    n -= 1;
    if (n > 0) {
      countdownEl.textContent = n;
    } else {
      clearInterval(tick);
      countdownEl.classList.add('hidden');
      doCapture();
    }
  }, 1000);
}

function doCapture() {
  flashEl.classList.remove('hidden');
  flashEl.classList.add('fire');
  setTimeout(() => flashEl.classList.remove('fire', 'hidden'), 350);

  const off = document.createElement('canvas');
  off.width = video.videoWidth;
  off.height = video.videoHeight;
  off.getContext('2d').drawImage(video, 0, 0); // TIDAK mirror -> hasil cetak normal
  capturedFrame = off;

  state = 'captured';
  drawCard(capturedFrame);

  placeholder.classList.add('hidden');
  canvas.classList.remove('hidden');
  btnPrint.disabled = false;
  btnCapture.textContent = '↺ ULANGI FOTO';
  capturing = false;
}

function ulangiFoto() {
  state = 'live';
  capturedFrame = null;
  placeholder.classList.remove('hidden');
  canvas.classList.add('hidden');
  btnPrint.disabled = true;
  btnCapture.textContent = '📷 AMBIL FOTO (3 Detik)';
}

// ---------------------------------------------------------
// 5. Cetak + auto-save JPG + log + statistik printer (mock)
// ---------------------------------------------------------
function cetakKartu() {
  if (state !== 'captured') return;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const printArea = document.getElementById('printArea');
  printArea.innerHTML = '';
  const img = new Image();
  img.src = dataUrl;
  printArea.appendChild(img);

  img.onload = () => {
    window.print(); // ganti ke window.kioskAPI.silentPrint() di Electron kalau sudah siap cetak senyap
    autoSaveJpg(dataUrl);
    logCetak('Berhasil');
    bumpPrintCounter();
  };
}

function autoSaveJpg(dataUrl) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const folder = now.toISOString().slice(0, 10);
  const filename = `${folder}_${currentPeserta.nomor}_${stamp}.jpg`;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function logCetak(statusText) {
  const now = new Date().toLocaleString('id-ID');
  const row = { waktu: now, nomor: currentPeserta.nomor, file: currentPeserta.nomor + '.jpg', status: statusText };
  const logs = JSON.parse(localStorage.getItem('kiosk_print_log') || '[]');
  logs.unshift(row);
  localStorage.setItem('kiosk_print_log', JSON.stringify(logs.slice(0, 500)));
  renderLog();
}

function renderLog() {
  const logs = JSON.parse(localStorage.getItem('kiosk_print_log') || '[]');
  logTableBody.innerHTML = logs.map(r =>
    `<tr><td>${r.waktu}</td><td>${r.nomor}</td><td>${r.file}</td><td>${r.status}</td></tr>`
  ).join('');
}

// Catatan: ribbon %, suhu mesin, dan status printer TIDAK BISA dibaca langsung
// dari browser — angka di panel ini masih placeholder/mock. Untuk data asli,
// perlu jembatan (bridge) lewat Electron + SDK resmi Fargo (lihat README).
function bumpPrintCounter() {
  let total = parseInt(localStorage.getItem('kiosk_total_cetak') || '0', 10) + 1;
  localStorage.setItem('kiosk_total_cetak', total);
  totalCetakEl.textContent = `Total Cetak: ${total.toLocaleString('id-ID')} Kartu`;
}

function restorePrintCounter() {
  const total = parseInt(localStorage.getItem('kiosk_total_cetak') || '0', 10);
  totalCetakEl.textContent = `Total Cetak: ${total.toLocaleString('id-ID')} Kartu`;
}

// ---------------------------------------------------------
// 6. Template selector + upload template baru
// ---------------------------------------------------------
templateList.addEventListener('click', (e) => {
  const item = e.target.closest('.template-item');
  if (!item) return;
  document.querySelectorAll('.template-item').forEach(el => el.classList.remove('selected'));
  item.classList.add('selected');
  setActiveTemplate(item.dataset.src);
});

uploadTemplate.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const src = reader.result;
    // tambahkan sebagai item baru di daftar template
    const div = document.createElement('div');
    div.className = 'template-item selected';
    div.dataset.src = src;
    div.innerHTML = `<img src="${src}" /><div class="template-name">${file.name}<br><small>Kustom</small></div>`;
    document.querySelectorAll('.template-item').forEach(el => el.classList.remove('selected'));
    templateList.insertBefore(div, uploadTemplate.closest('.template-upload'));
    setActiveTemplate(src);
  };
  reader.readAsDataURL(file);
});

// ---------------------------------------------------------
// 7. Input nomor peserta via scanner barcode/QR (USB, mengetik + Enter)
// ---------------------------------------------------------
let scanBuffer = '';
let scanTimer = null;
window.addEventListener('keydown', (e) => {
  if (e.key === 'F1') { e.preventDefault(); onCaptureButton(); return; }
  if (e.key === 'F2') { e.preventDefault(); cetakKartu(); return; }
  if (e.key === 'Escape') { e.preventDefault(); if (state === 'captured') ulangiFoto(); return; }

  if (e.key === 'Enter') {
    if (scanBuffer.length >= 3) applyScannedCode(scanBuffer);
    scanBuffer = '';
    return;
  }
  if (e.key.length === 1) {
    scanBuffer += e.key;
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => { scanBuffer = ''; }, 300);
  }
});

function applyScannedCode(code) {
  const parts = code.split('|');
  currentPeserta.nomor = parts[0] || code;
  currentPeserta.nama = parts[1] || '-';
}

// ---------------------------------------------------------
// 8. Tombol UI
// ---------------------------------------------------------
btnCapture.addEventListener('click', onCaptureButton);
btnPrint.addEventListener('click', cetakKartu);
btnLog.addEventListener('click', () => { renderLog(); logOverlay.classList.remove('hidden'); });
btnCloseLog.addEventListener('click', () => logOverlay.classList.add('hidden'));
btnExit.addEventListener('click', () => {
  if (window.kioskAPI && window.kioskAPI.exitApp) {
    window.kioskAPI.exitApp();
  } else if (confirm('Keluar dari aplikasi kiosk?')) {
    window.close();
  }
});

// ---------------------------------------------------------
// Start
// ---------------------------------------------------------
restorePrintCounter();
setActiveTemplate(rawTemplateSrc);
startCamera();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent Central Data Store for Multi-Device Synchronization
const DATA_STORE_PATH = path.resolve(__dirname, 'data_store.json');

const DEFAULT_STORE = {
  lastUpdated: new Date().toISOString(),
  config: {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbysRKWrUAYAzjnj3kc7OXHdfVaHioXO1G_aZ8Aan-mVuduGo_S4hiNDG0hFT_hVhZTSAg/exec',
    spreadsheetId: '1LzIYYbpT5wEuCwW1nmaC1ZZyuPeQBjUowEorTS6W0jc',
    autoSync: true,
    lastSync: ''
  },
  atlet: [
    {
      id: 'ATL-001',
      nama: 'I Putu Arya Satria',
      jenisKelamin: 'Laki-laki',
      tanggalLahir: '2010-04-15',
      kelompokUmur: 'KU II (13-14 th)',
      klub: 'Garuda SC Buleleng',
      pelatih: 'Coach Wayan Sudira',
      status: 'Aktif'
    },
    {
      id: 'ATL-002',
      nama: 'Ni Kadek Ayu Lestari',
      jenisKelamin: 'Perempuan',
      tanggalLahir: '2012-08-22',
      kelompokUmur: 'KU III (11-12 th)',
      klub: 'Garuda SC Buleleng',
      pelatih: 'Coach Wayan Sudira',
      status: 'Aktif'
    },
    {
      id: 'ATL-003',
      nama: 'Andi Pratama',
      jenisKelamin: 'Laki-laki',
      tanggalLahir: '2008-11-03',
      kelompokUmur: 'KU I (15-17 th)',
      klub: 'Garuda SC Buleleng',
      pelatih: 'Coach Made Arimbawa',
      status: 'Aktif'
    },
    {
      id: 'ATL-004',
      nama: 'Siti Rahmawati',
      jenisKelamin: 'Perempuan',
      tanggalLahir: '2011-02-19',
      kelompokUmur: 'KU III (11-12 th)',
      klub: 'Garuda SC Buleleng',
      pelatih: 'Coach Made Arimbawa',
      status: 'Aktif'
    },
    {
      id: 'ATL-005',
      nama: 'Komang Bagus Raditya',
      jenisKelamin: 'Laki-laki',
      tanggalLahir: '2014-06-10',
      kelompokUmur: 'KU IV (≤10 th)',
      klub: 'Garuda SC Buleleng',
      pelatih: 'Coach Wayan Sudira',
      status: 'Aktif'
    }
  ],
  lomba: [
    {
      id: 'LMB-001',
      namaLomba: 'MOLA MOLA CUP II 2026',
      penyelenggara: 'Pengkab Akuatik Buleleng & Bali Swimming',
      lokasi: 'Kolam Renang Nirmala Asri Buleleng',
      tanggal: '2026-03-14',
      keterangan: 'Kejuaraan Renang Antar Perkumpulan se-Bali & Nasional'
    },
    {
      id: 'LMB-002',
      namaLomba: 'KEJURDA RENANG BALI 2026',
      penyelenggara: 'Akuatik Indonesia Pengprov Bali',
      lokasi: 'Kolam Renang Tirta Arum Blahkiuh',
      tanggal: '2026-06-20',
      keterangan: 'Seleksi Atlet Porprov & Kejurnas'
    },
    {
      id: 'LMB-003',
      namaLomba: 'PIALA BUPATI BULELENG OPEN',
      penyelenggara: 'KONI Buleleng',
      lokasi: 'Kolam Renang Kolam Kolam Seririt',
      tanggal: '2026-01-25',
      keterangan: 'Kejuaraan terbuka kategori kelompok umur'
    }
  ],
  catatanWaktu: [
    {
      id: 'WKT-101',
      tanggal: '2026-01-10',
      atlet: 'Andi Pratama',
      jenis: 'Latihan',
      namaLomba: '',
      gaya: 'Bebas',
      jarak: '50 m',
      waktu: '00:35.20',
      waktuDetik: 35.20,
      catatan: 'Latihan sprint awal tahun'
    },
    {
      id: 'WKT-102',
      tanggal: '2026-01-18',
      atlet: 'Andi Pratama',
      jenis: 'Latihan',
      namaLomba: '',
      gaya: 'Bebas',
      jarak: '50 m',
      waktu: '00:34.80',
      waktuDetik: 34.80,
      catatan: 'Fokus tolakan balok start'
    },
    {
      id: 'WKT-103',
      tanggal: '2026-01-25',
      atlet: 'Andi Pratama',
      jenis: 'Lomba',
      namaLomba: 'PIALA BUPATI BULELENG OPEN',
      gaya: 'Bebas',
      jarak: '50 m',
      waktu: '00:34.25',
      waktuDetik: 34.25,
      catatan: 'Babak penyisihan'
    },
    {
      id: 'WKT-104',
      tanggal: '2026-02-10',
      atlet: 'Andi Pratama',
      jenis: 'Latihan',
      namaLomba: '',
      gaya: 'Bebas',
      jarak: '50 m',
      waktu: '00:34.60',
      waktuDetik: 34.60,
      catatan: 'Interval 6x50m'
    },
    {
      id: 'WKT-105',
      tanggal: '2026-03-14',
      atlet: 'Andi Pratama',
      jenis: 'Lomba',
      namaLomba: 'MOLA MOLA CUP II 2026',
      gaya: 'Bebas',
      jarak: '50 m',
      waktu: '00:33.95',
      waktuDetik: 33.95,
      catatan: 'Final - Tembus Personal Best!',
      isPb: true
    },
    {
      id: 'WKT-106',
      tanggal: '2026-03-14',
      atlet: 'Andi Pratama',
      jenis: 'Lomba',
      namaLomba: 'MOLA MOLA CUP II 2026',
      gaya: 'Kupu-kupu',
      jarak: '50 m',
      waktu: '00:36.10',
      waktuDetik: 36.10,
      catatan: 'Penyisihan 50m butterfly'
    },
    {
      id: 'WKT-107',
      tanggal: '2026-03-14',
      atlet: 'I Putu Arya Satria',
      jenis: 'Lomba',
      namaLomba: 'MOLA MOLA CUP II 2026',
      gaya: 'Dada',
      jarak: '50 m',
      waktu: '00:38.45',
      waktuDetik: 38.45,
      catatan: 'Medali Perak KU II',
      isPb: true
    },
    {
      id: 'WKT-108',
      tanggal: '2026-02-28',
      atlet: 'I Putu Arya Satria',
      jenis: 'Latihan',
      namaLomba: '',
      gaya: 'Dada',
      jarak: '50 m',
      waktu: '00:39.80',
      waktuDetik: 39.80,
      catatan: 'Simulasi race pace'
    },
    {
      id: 'WKT-109',
      tanggal: '2026-03-14',
      atlet: 'Ni Kadek Ayu Lestari',
      jenis: 'Lomba',
      namaLomba: 'MOLA MOLA CUP II 2026',
      gaya: 'Bebas',
      jarak: '50 m',
      waktu: '00:36.20',
      waktuDetik: 36.20,
      catatan: 'Personal best 50m gaya bebas putri',
      isPb: true
    },
    {
      id: 'WKT-110',
      tanggal: '2026-03-14',
      atlet: 'Ni Kadek Ayu Lestari',
      jenis: 'Lomba',
      namaLomba: 'MOLA MOLA CUP II 2026',
      gaya: 'Punggung',
      jarak: '50 m',
      waktu: '00:41.50',
      waktuDetik: 41.50,
      catatan: 'Penyisihan 50m punggung'
    }
  ],
  programLatihan: []
};

// Helper to read data store safely
function readDataStore() {
  try {
    if (!fs.existsSync(DATA_STORE_PATH)) {
      fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
      return DEFAULT_STORE;
    }
    const raw = fs.readFileSync(DATA_STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data store:', err);
    return DEFAULT_STORE;
  }
}

// Helper to write data store safely
function writeDataStore(data: any) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing data store:', err);
    return false;
  }
}

// Ensure store exists on startup
readDataStore();

// API Route: Get Central Data (Multi-Device Shared State)
app.get('/api/data', (_req, res) => {
  const store = readDataStore();
  return res.json({ success: true, data: store });
});

// API Route: Multi-Device Sync (Merge incoming items and persist)
app.post('/api/data/sync', (req, res) => {
  try {
    const incoming = req.body || {};
    const store = readDataStore();

    // 1. Merge Atlet (keyed by ID or Nama)
    if (Array.isArray(incoming.atlet) && incoming.atlet.length > 0) {
      const existingMap = new Map<string, any>(store.atlet.map((a: any) => [a.id, a]));
      for (const item of incoming.atlet) {
        if (item && item.id) {
          const prev = existingMap.get(item.id) || {};
          existingMap.set(item.id, Object.assign({}, prev, item));
        }
      }
      store.atlet = Array.from(existingMap.values());
    }

    // 2. Merge Lomba
    if (Array.isArray(incoming.lomba) && incoming.lomba.length > 0) {
      const existingMap = new Map<string, any>(store.lomba.map((l: any) => [l.id, l]));
      for (const item of incoming.lomba) {
        if (item && item.id) {
          const prev = existingMap.get(item.id) || {};
          existingMap.set(item.id, Object.assign({}, prev, item));
        }
      }
      store.lomba = Array.from(existingMap.values());
    }

    // 3. Merge Catatan Waktu
    if (Array.isArray(incoming.catatanWaktu) && incoming.catatanWaktu.length > 0) {
      const existingMap = new Map<string, any>(store.catatanWaktu.map((c: any) => [c.id, c]));
      for (const item of incoming.catatanWaktu) {
        if (item && item.id) {
          const prev = existingMap.get(item.id) || {};
          existingMap.set(item.id, Object.assign({}, prev, item));
        }
      }
      store.catatanWaktu = Array.from(existingMap.values());
    }

    // 4. Merge Program Latihan
    if (Array.isArray(incoming.programLatihan) && incoming.programLatihan.length > 0) {
      const existingMap = new Map<string, any>((store.programLatihan || []).map((p: any) => [p.id, p]));
      for (const item of incoming.programLatihan) {
        if (item && item.id) {
          const prev = existingMap.get(item.id) || {};
          existingMap.set(item.id, Object.assign({}, prev, item));
        }
      }
      store.programLatihan = Array.from(existingMap.values());
    }

    // 5. Update Config if provided (protect non-empty server values from being wiped by uninitialized clients)
    if (incoming.config) {
      const incomingUrl = typeof incoming.config.webAppUrl === 'string' ? incoming.config.webAppUrl.trim() : '';
      const incomingId = typeof incoming.config.spreadsheetId === 'string' ? incoming.config.spreadsheetId.trim() : '';
      
      store.config = {
        webAppUrl: incomingUrl || store.config?.webAppUrl || '',
        spreadsheetId: incomingId || store.config?.spreadsheetId || '',
        autoSync: incoming.config.autoSync !== undefined ? incoming.config.autoSync : (store.config?.autoSync ?? true),
        lastSync: incoming.config.lastSync || store.config?.lastSync || ''
      };
    }

    writeDataStore(store);

    return res.json({
      success: true,
      message: 'Sinkronisasi server multi-device berhasil.',
      data: store
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API Route: Push/Pull Proxy to Google Apps Script (Bypasses browser CORS & secures multi-device)
app.post('/api/sheets/proxy-pull', async (req, res) => {
  try {
    const store = readDataStore();
    const webAppUrl = req.body?.webAppUrl || store.config?.webAppUrl;

    if (!webAppUrl) {
      return res.status(400).json({ success: false, error: 'URL Google Apps Script Web App belum diatur.' });
    }

    // Pull Atlet
    const [resA, resL, resW, resP] = await Promise.allSettled([
      fetch(`${webAppUrl}?action=getAtlet`).then(r => r.json()),
      fetch(`${webAppUrl}?action=getLomba`).then(r => r.json()),
      fetch(`${webAppUrl}?action=getCatatanWaktu`).then(r => r.json()),
      fetch(`${webAppUrl}?action=getProgramLatihan`).then(r => r.json()).catch(() => [])
    ]);

    let updated = false;

    if (resA.status === 'fulfilled' && Array.isArray(resA.value)) {
      store.atlet = resA.value;
      updated = true;
    }
    if (resL.status === 'fulfilled' && Array.isArray(resL.value)) {
      store.lomba = resL.value;
      updated = true;
    }
    if (resW.status === 'fulfilled' && Array.isArray(resW.value)) {
      store.catatanWaktu = resW.value;
      updated = true;
    }
    if (resP.status === 'fulfilled' && Array.isArray(resP.value)) {
      store.programLatihan = resP.value;
      updated = true;
    }

    if (updated) {
      store.config.lastSync = new Date().toISOString();
      writeDataStore(store);
    }

    return res.json({
      success: true,
      message: 'Rekapan data dari Google Spreadsheet berhasil ditarik dan disinkronkan ke semua perangkat!',
      data: store
    });
  } catch (err: any) {
    console.error('Sheets Proxy Pull error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Gagal menarik data dari Google Apps Script' });
  }
});

app.post('/api/sheets/proxy-push', async (req, res) => {
  try {
    const store = readDataStore();
    const webAppUrl = req.body?.webAppUrl || store.config?.webAppUrl;

    if (!webAppUrl) {
      return res.status(400).json({ success: false, error: 'URL Google Apps Script Web App belum diatur.' });
    }

    const payload = {
      action: 'batchSync',
      atlet: store.atlet,
      lomba: store.lomba,
      catatanWaktu: store.catatanWaktu,
      programLatihan: store.programLatihan || []
    };

    const resp = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => ({}));
    store.config.lastSync = new Date().toISOString();
    writeDataStore(store);

    return res.json({
      success: true,
      message: data.message || 'Semua rekapan berhasil dikirim dan tersimpan di Google Spreadsheet!',
      data: store
    });
  } catch (err: any) {
    console.error('Sheets Proxy Push error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Gagal mengirim data ke Google Apps Script' });
  }
});

// Initialize GoogleGenAI server-side with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: AI Swimming Training Program Breakdown & Coaching Explanation
app.post('/api/ai/pembahasan-program', async (req, res) => {
  try {
    const {
      atlet,
      gaya,
      jarak,
      pbWaktu,
      pbDetik,
      waktuTerakhir,
      waktuTerakhirDetik,
      targetWaktu,
      targetDetik,
      lamaMinggu,
      statusLabel,
      items
    } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: false,
        error: 'GEMINI_API_KEY belum dikonfigurasi, menggunakan mesin analisis kepelatihan lokal.'
      });
    }

    const prompt = `Anda adalah Kepala Pelatih Renang Internasional (World Aquatics / ASCA Level 5) dan Pakar Fisiologi Olahraga Akuatik.
Tugas Anda adalah membuat PEMBAHASAN PROGRAM LATIHAN RENANG yang sangat komprehensif, terstruktur, ilmiah namun MUDAT DIPAHAMI oleh pelatih di tepi kolam, atlet renang (anak-anak/remaja/senior), maupun orang tua atlet.

PROFIL ATLET & REKOR:
- Nama Atlet: ${atlet || 'Atlet'}
- Nomor Spesialisasi: Gaya ${gaya} ${jarak}
- Personal Best (PB): ${pbWaktu} (${pbDetik} detik)
- Catatan Waktu Terakhir: ${waktuTerakhir} (${waktuTerakhirDetik} detik)
- Target Waktu yang Dituju: ${targetWaktu} (${targetDetik} detik)
- Periode Program: ${lamaMinggu || 1} Minggu (${items?.length || 5} Sesi)
- Evaluasi Status Kondisi: ${statusLabel || 'Evaluasi Performa'}

RANGKUMAN SESI LATIHAN YANG DIRANCANG:
${(items || []).map((it: any, i: number) => `Sesi ${i + 1} (${it.hari || 'Hari ' + (i + 1)}): Fokus: ${it.fokusLatihan} | Set: ${it.set} x ${it.repetisi} | Target: ${it.targetWaktu} | Istirahat: ${it.istirahat} | Intensitas: ${it.intensitas} | Catatan: ${it.catatan || it.tujuan}`).join('\n')}

Format keluaran WAJIB berupa JSON murni dengan struktur berikut:
{
  "ringkasanStrategi": "Penjelasan mendalam mengapa program ini dirancang seperti ini berdasarkan perbandingan waktu terakhir atlet dengan PB dan target waktu. Bahasa jelas, mendidik, profesional, dan meyakinkan.",
  "analisisFisiologi": "Penjelasan sistem energi utama yang dilatih (ATP-CP, glikolitik asam laktat, atau kapasitas aerobik), adaptasi pembuangan asam laktat (lactate clearance), dan rasio waktu kerja berbanding istirahat (work-to-rest ratio) dengan bahasa analogi yang mudah dipahami.",
  "bedahSesiHarian": [
    {
      "sesi": "Nama Hari / Sesi (misal: Senin - Teknik)",
      "fokus": "Fokus latihan",
      "target": "Target waktu",
      "penjelasan": "Alasan kenapa set & repetisi ini diberikan dan manfaat fisiologisnya.",
      "tipsKunci": "Tips kunci kayuhan atau teknik saat berenang sesi ini"
    }
  ],
  "petunjukTepiKolam": [
    "Instruksi teknis praktis #1 (misal: posisi kepala, catch siku tinggi / high elbow catch)",
    "Instruksi teknis praktis #2 (misal: tolakan dinding pembalikan / turn dan underwater dolphin kick)",
    "Instruksi teknis praktis #3 (misal: ritme pernapasan atau pacing kecepatan)"
  ],
  "panduanPemulihan": "Saran pemulihan otot, hidrasi berelektrolit, asupan nutrisi protein/karbohidrat pasca latihan di kolam, dan durasi istirahat agar tidak overtraining.",
  "pesanMotivasi": "Kalimat penyemangat yang kuat dan menginspirasi untuk atlet dan orang tua tentang proses memecahkan Personal Best baru."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        ringkasanStrategi: text,
        analisisFisiologi: 'Analisis sistem energi aerobik dan anaerobik.',
        petunjukTepiKolam: ['Fokus pada efisiensi kayuhan dan posisi tubuh lurus.'],
        panduanPemulihan: 'Pastikan hidrasi dan tidur cukup.',
        pesanMotivasi: 'Teruslah konsisten berlatih!'
      };
    }

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(200).json({
      success: false,
      error: error.message || 'Gagal memanggil Gemini AI'
    });
  }
});

// API Route: Coach Q&A / Konsultasi AI Program Renang
app.post('/api/ai/konsultasi', async (req, res) => {
  try {
    const { pertanyaan, konteks } = req.body;
    if (!ai) {
      return res.status(200).json({
        success: false,
        error: 'GEMINI_API_KEY belum dikonfigurasi.'
      });
    }

    const prompt = `Anda adalah Asisten AI Pelatih Renang Internasional (World Aquatics).
Jawab pertanyaan pelatih atau orang tua atlet berikut dengan ramah, profesional, praktis, dan mudah dipahami.

KONTEKS ATLET & PROGRAM:
${JSON.stringify(konteks || {}, null, 2)}

PERTANYAAN:
"${pertanyaan}"

Berikan jawaban terstruktur dalam bahasa Indonesia yang ringkas (2-3 paragraf), aplikatif untuk di tepi kolam renang, dan memberikan solusi konkret.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      jawaban: response.text || 'Tidak ada tanggapan dari AI.'
    });
  } catch (error: any) {
    console.error('Gemini Q&A Error:', error);
    return res.status(200).json({
      success: false,
      error: error.message || 'Gagal memproses pertanyaan dengan AI'
    });
  }
});

// Setup Vite middleware in dev or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SWIM TIME TRACKER server running on port ${PORT}`);
  });
}

startServer();

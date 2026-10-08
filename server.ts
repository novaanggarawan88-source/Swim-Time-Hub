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
      nama: 'I Putu Arya Diva Erlangga',
      jenisKelamin: 'Laki-laki',
      tanggalLahir: '2015-12-30',
      kelompokUmur: 'KU IV (≤10 th - 10 th)',
      klub: 'Garuda SC Buleleng',
      pelatih: 'Coach Rahmat Jumali',
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
      keterangan: 'Kejuaraan Renang Antar Perkumpulan se-Bali'
    },
    {
      id: 'LMB-002',
      namaLomba: 'AMREG REGIS TAHUNAN KE-4 2026',
      penyelenggara: 'Akuatik Indonesia Pengprov Bali',
      lokasi: 'Kolam Renang Amarta Regis Denpasar',
      tanggal: '2026-10-02',
      keterangan: 'Open Kompetisi'
    },
    {
      id: 'LMB-732215',
      namaLomba: 'FESTIVAL RENANG MAHAJAYA',
      penyelenggara: 'MAHAJAYA',
      lokasi: 'Kolam Renang Mahajaya, Ubung, Denpasan Utara',
      tanggal: '2026-05-09',
      keterangan: 'Open Kompetisi'
    },
    {
      id: 'LMB-833275',
      namaLomba: 'AMREG HOLIDAY FUN & SWIMMING COMPETITION #3',
      penyelenggara: 'Amarta Regis',
      lokasi: 'Kolam Amarta Regis Denpasar',
      tanggal: '2026-07-04',
      keterangan: ''
    },
    {
      id: 'LMB-003',
      namaLomba: 'KEJUARAAN BUPATI BADUNG CUP XI 2026',
      penyelenggara: 'KONI Badung',
      lokasi: 'Kolam Renang Blahkiuh',
      tanggal: '2026-08-07',
      keterangan: 'Kejuaraan terbuka kategori kelompok umur'
    }
  ],
  catatanWaktu: [
    { id: 'WKT-633832', tanggal: '2026-08-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'KEJUARAAN BUPATI BADUNG CUP XI 2026', gaya: 'Dada', jarak: '50 m', waktu: '00:38.57', waktuDetik: 38.57, catatan: '', isPb: true },
    { id: 'WKT-602809', tanggal: '2026-08-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'KEJUARAAN BUPATI BADUNG CUP XI 2026', gaya: 'Dada', jarak: '50 m', waktu: '00:46.53', waktuDetik: 46.53, catatan: '' },
    { id: 'WKT-565224', tanggal: '2026-08-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'KEJUARAAN BUPATI BADUNG CUP XI 2026', gaya: 'Dada', jarak: '100 m', waktu: '01:42.48', waktuDetik: 102.48, catatan: '' },
    { id: 'WKT-508504', tanggal: '2026-08-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'KEJUARAAN BUPATI BADUNG CUP XI 2026', gaya: 'Bebas', jarak: '100 m', waktu: '01:25.67', waktuDetik: 85.67, catatan: '' },
    { id: 'WKT-407759', tanggal: '2026-08-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'KEJUARAAN BUPATI BADUNG CUP XI 2026', gaya: 'Kupu-kupu', jarak: '50 m', waktu: '00:48.79', waktuDetik: 48.79, catatan: '', isPb: true },
    { id: 'WKT-353631', tanggal: '2026-08-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'KEJUARAAN BUPATI BADUNG CUP XI 2026', gaya: 'Dada', jarak: '200 m', waktu: '00:03.52', waktuDetik: 3.52, catatan: '' },
    { id: 'WKT-036358', tanggal: '2026-05-09', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'FESTIVAL RENANG MAHAJAYA', gaya: 'Bebas', jarak: '50 m', waktu: '00:43.57', waktuDetik: 43.57, catatan: '' },
    { id: 'WKT-004598', tanggal: '2026-05-09', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'FESTIVAL RENANG MAHAJAYA', gaya: 'Kupu-kupu', jarak: '50 m', waktu: '00:56.58', waktuDetik: 56.58, catatan: '' },
    { id: 'WKT-953987', tanggal: '2026-05-09', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'FESTIVAL RENANG MAHAJAYA', gaya: 'Punggung', jarak: '50 m', waktu: '00:58.40', waktuDetik: 58.40, catatan: '', isPb: true },
    { id: 'WKT-089609', tanggal: '2026-05-09', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'FESTIVAL RENANG MAHAJAYA', gaya: 'Dada', jarak: '50 m', waktu: '00:56.60', waktuDetik: 56.60, catatan: '' },
    { id: 'WKT-441076', tanggal: '2026-10-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'AMREG REGIS TAHUNAN KE-4 2026', gaya: 'Bebas', jarak: '50 m', waktu: '00:37.39', waktuDetik: 37.39, catatan: '', isPb: true },
    { id: 'WKT-419252', tanggal: '2026-10-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'AMREG REGIS TAHUNAN KE-4 2026', gaya: 'Bebas', jarak: '200 m', waktu: '03:01.99', waktuDetik: 181.99, catatan: '', isPb: true },
    { id: 'WKT-394515', tanggal: '2026-10-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'AMREG REGIS TAHUNAN KE-4 2026', gaya: 'Dada', jarak: '100 m', waktu: '01:36.90', waktuDetik: 96.90, catatan: '', isPb: true },
    { id: 'WKT-361443', tanggal: '2026-10-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'AMREG REGIS TAHUNAN KE-4 2026', gaya: 'Bebas', jarak: '100 m', waktu: '01:23.29', waktuDetik: 83.29, catatan: '', isPb: true },
    { id: 'WKT-330420', tanggal: '2026-10-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'AMREG REGIS TAHUNAN KE-4 2026', gaya: 'Dada', jarak: '50 m', waktu: '00:43.33', waktuDetik: 43.33, catatan: '' },
    { id: 'WKT-300022', tanggal: '2026-10-07', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'AMREG REGIS TAHUNAN KE-4 2026', gaya: 'Dada', jarak: '200 m', waktu: '03:27.73', waktuDetik: 207.73, catatan: '', isPb: true },
    { id: 'WKT-008888', tanggal: '2026-09-20', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'MOLA MOLA CUP II 2026', gaya: 'Bebas', jarak: '100 m', waktu: '01:25.83', waktuDetik: 85.83, catatan: '' },
    { id: 'WKT-989035', tanggal: '2026-09-20', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'MOLA MOLA CUP II 2026', gaya: 'Bebas', jarak: '50 m', waktu: '00:38.01', waktuDetik: 38.01, catatan: '' },
    { id: 'WKT-968588', tanggal: '2026-09-20', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'MOLA MOLA CUP II 2026', gaya: 'Dada', jarak: '50 m', waktu: '00:44.77', waktuDetik: 44.77, catatan: '' },
    { id: 'WKT-953500', tanggal: '2026-09-20', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'MOLA MOLA CUP II 2026', gaya: 'Dada', jarak: '100 m', waktu: '01:39.92', waktuDetik: 99.92, catatan: '' },
    { id: 'WKT-927478', tanggal: '2026-09-20', atlet: 'I Putu Arya Diva Erlangga', jenis: 'Lomba', namaLomba: 'MOLA MOLA CUP II 2026', gaya: 'Dada', jarak: '200 m', waktu: '03:31.35', waktuDetik: 211.35, catatan: '' }
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

// Helper function to push individual updates directly to Google Apps Script in real-time
async function pushItemToGoogleSheets(webAppUrl: string, action: string, item: any) {
  try {
    if (!webAppUrl || !item) return;
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, data: item })
    });
    const text = await res.text();
    console.log(`[Google Sheets Real-Time Auto-Save] Action ${action} completed:`, text.slice(0, 120));
  } catch (err) {
    console.warn(`[Google Sheets Real-Time Auto-Save] Error forwarding ${action} to Google Sheets:`, err);
  }
}

// Helper to silently pull latest updates from Google Spreadsheet into central store
async function pullFromGoogleSheetsSilent() {
  try {
    const store = readDataStore();
    const webAppUrl = store.config?.webAppUrl;
    if (!webAppUrl) return;

    const [resA, resL, resW] = await Promise.allSettled([
      fetch(`${webAppUrl}?action=getAtlet`).then(r => r.json()),
      fetch(`${webAppUrl}?action=getLomba`).then(r => r.json()),
      fetch(`${webAppUrl}?action=getCatatanWaktu`).then(r => r.json())
    ]);

    let updated = false;

    if (resA.status === 'fulfilled' && Array.isArray(resA.value) && resA.value.length > 0) {
      store.atlet = resA.value;
      updated = true;
    }

    if (resL.status === 'fulfilled' && Array.isArray(resL.value) && resL.value.length > 0) {
      store.lomba = resL.value;
      updated = true;
    }

    if (resW.status === 'fulfilled' && Array.isArray(resW.value) && resW.value.length > 0) {
      store.catatanWaktu = resW.value;
      updated = true;
    }

    if (updated) {
      store.config.lastSync = new Date().toISOString();
      writeDataStore(store);
    }
  } catch (err) {
    // Silent background pull catch
  }
}

// Initial background sync from Google Sheets on server boot & periodic interval (every 10s)
pullFromGoogleSheetsSilent();
setInterval(pullFromGoogleSheetsSilent, 10000);

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

    // Handle Deletions
    if (incoming.deleteType && incoming.deleteId) {
      if (incoming.deleteType === 'catatanWaktu') {
        store.catatanWaktu = store.catatanWaktu.filter((c: any) => c.id !== incoming.deleteId);
      } else if (incoming.deleteType === 'atlet') {
        store.atlet = store.atlet.filter((a: any) => a.id !== incoming.deleteId);
      } else if (incoming.deleteType === 'lomba') {
        store.lomba = store.lomba.filter((l: any) => l.id !== incoming.deleteId);
      }
    }

    // Handle Granular Add/Update Actions
    if (incoming.action && incoming.item) {
      if (incoming.action === 'saveCatatanWaktu') {
        const idx = store.catatanWaktu.findIndex((c: any) => c.id === incoming.item.id);
        if (idx >= 0) {
          store.catatanWaktu[idx] = incoming.item;
        } else {
          store.catatanWaktu.unshift(incoming.item);
        }
      } else if (incoming.action === 'saveAtlet') {
        const idx = store.atlet.findIndex((a: any) => a.id === incoming.item.id);
        if (idx >= 0) {
          store.atlet[idx] = incoming.item;
        } else {
          store.atlet.push(incoming.item);
        }
      } else if (incoming.action === 'saveLomba') {
        const idx = store.lomba.findIndex((l: any) => l.id === incoming.item.id);
        if (idx >= 0) {
          store.lomba[idx] = incoming.item;
        } else {
          store.lomba.unshift(incoming.item);
        }
      } else if (incoming.action === 'saveProgramLatihan') {
        store.programLatihan = Array.isArray(incoming.item) ? [...incoming.item, ...(store.programLatihan || [])] : store.programLatihan;
      }
    } else {
      // Background full sync only for genuinely new records (not old dummy seeds)
      if (Array.isArray(incoming.catatanWaktu) && incoming.catatanWaktu.length > 0) {
        const validNew = incoming.catatanWaktu.filter((c: any) => 
          c && c.id && !c.id.startsWith('WKT-10') && !c.id.startsWith('WKT-110') && !store.catatanWaktu.some((sc: any) => sc.id === c.id)
        );
        if (validNew.length > 0) {
          store.catatanWaktu = [...validNew, ...store.catatanWaktu];
        }
      }
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

    // REAL-TIME AUTO-SAVE TO GOOGLE SPREADSHEET:
    // When coach adds/updates an athlete, competition, swim time, or program,
    // immediately forward it to the Google Apps Script Web App without requiring manual "Kirim" clicks!
    const webAppUrl = store.config?.webAppUrl;
    if (webAppUrl) {
      if (incoming.action && incoming.item) {
        // Asynchronously forward to Google Sheets in background
        pushItemToGoogleSheets(webAppUrl, incoming.action, incoming.item);
      }
    }

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

    // If GAS doesn't have batchSync action, fallback to individual endpoints
    if (data && data.error) {
      for (const a of store.atlet) {
        await pushItemToGoogleSheets(webAppUrl, 'saveAtlet', a);
      }
      for (const l of store.lomba) {
        await pushItemToGoogleSheets(webAppUrl, 'saveLomba', l);
      }
      for (const c of store.catatanWaktu) {
        await pushItemToGoogleSheets(webAppUrl, 'saveCatatanWaktu', c);
      }
    }

    store.config.lastSync = new Date().toISOString();
    writeDataStore(store);

    return res.json({
      success: true,
      message: 'Semua rekapan berhasil disinkronkan dan tersimpan di Google Spreadsheet!',
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

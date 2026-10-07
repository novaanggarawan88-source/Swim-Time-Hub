import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

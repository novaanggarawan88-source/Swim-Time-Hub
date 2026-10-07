import { AIPembahasanOutput, GayaRenang, JarakRenang, ProgramLatihanItem } from '../types/swim';

export interface RequestPembahasanParams {
  atlet: string;
  gaya: GayaRenang;
  jarak: JarakRenang;
  pbWaktu: string;
  pbDetik: number;
  waktuTerakhir: string;
  waktuTerakhirDetik: number;
  targetWaktu: string;
  targetDetik: number;
  lamaMinggu: number;
  statusKondisi: string;
  statusLabel: string;
  items: ProgramLatihanItem[];
}

/**
 * Generate AI-powered Coaching Breakdown and Physiology Explanation
 * Calls server-side Gemini API (/api/ai/pembahasan-program) with intelligent fallback
 */
export async function fetchAIPembahasan(params: RequestPembahasanParams): Promise<AIPembahasanOutput> {
  try {
    const res = await fetch('/api/ai/pembahasan-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        return {
          ringkasanStrategi: d.ringkasanStrategi || 'Program latihan dirancang untuk mengoptimalkan potensi atlet.',
          analisisFisiologi: d.analisisFisiologi || 'Fokus pada sistem energi aerobik dan anaerobik sesuai jarak lomba.',
          petunjukTepiKolam: Array.isArray(d.petunjukTepiKolam)
            ? d.petunjukTepiKolam
            : [d.petunjukTepiKolam || 'Perhatikan streamline dan efisiensi kayuhan.'],
          panduanPemulihan: d.panduanPemulihan || 'Pastikan hidrasi cukup dan istirahat minimal 8 jam.',
          pesanMotivasi: d.pesanMotivasi || 'Konsistensi latihan adalah kunci memecahkan Personal Best baru!'
        };
      }
    }
  } catch (err) {
    console.warn('Fallback to local intelligent AI knowledge engine:', err);
  }

  // Fallback intelligent coaching analysis
  return generateExpertCoachingBreakdown(params);
}

function generateExpertCoachingBreakdown(params: RequestPembahasanParams): AIPembahasanOutput {
  const { atlet, gaya, jarak, pbWaktu, pbDetik, waktuTerakhir, waktuTerakhirDetik, targetWaktu, targetDetik, statusKondisi } = params;
  const selisih = Number((waktuTerakhirDetik - pbDetik).toFixed(2));
  const gapTarget = Number((waktuTerakhirDetik - targetDetik).toFixed(2));

  let ringkasanStrategi = '';
  let analisisFisiologi = '';
  let petunjukTepiKolam: string[] = [];
  let panduanPemulihan = '';
  let pesanMotivasi = '';

  if (statusKondisi === 'Slower') {
    ringkasanStrategi = `Catatan waktu terakhir ${atlet} (${waktuTerakhir}) berada ${selisih} detik lebih lambat dari rekor terbaiknya (${pbWaktu}). Hal ini wajar terjadi setelah jeda latihan atau fase transisi. Strategi program ini BUKAN langsung membebani tubuh dengan sprint maksimal, melainkan merekonstruksi "Distance Per Stroke" (DPS), efisiensi catch-pull bawah air, dan fondasi kapasitas aerobik agar daya tahan kayuhan tidak drop di paruh akhir jarak ${jarak}.`;
    
    analisisFisiologi = `Program berfokus pada zona Aerobik Threshold (A1-A2) dengan detak jantung 60-75% denyut maksimal. Tujuannya adalah memperbanyak kapilerisasi otot, meningkatkan efisiensi enzim mitokondria, dan melatih otot tetap rileks saat mengayuh. Istirahat 30-45 detik dirancang agar pembentukan asam laktat tetap minimal sehingga atlet dapat menyempurnakan biomekanika tanpa kompensasi otot akibat lelah.`;

    petunjukTepiKolam = [
      `Gaya ${gaya}: Amati sudut pergelangan tangan saat "Catch" awal. Pastikan siku tetap tinggi (High Elbow Catch) untuk menjangkau volume air sebesar mungkin.`,
      `Posisi Tubuh: Jaga kepala dan pinggul tetap horizontal di permukaan air (streamline datar) agar hambatan frontal (frontal drag) berkurang drastis.`,
      `Pacing: Instruksikan atlet berenang dengan irama kayuhan tenang namun bertenaga, jangan biarkan atlet sprint di 25 meter pertama lalu kehabisan tenaga.`
    ];

    panduanPemulihan = `Berikan perhatian khusus pada hidrasi (minimal 500ml air berelektrolit selama sesi) dan peregangan bahu/otot latissimus dorsi pasca renang. Tidur berkualitas 8-9 jam wajib untuk sintesis glikogen otot baru.`;

    pesanMotivasi = `Jangan berkecil hati jika catatan waktu sempat turun. Langkah mundur satu langkah adalah persiapan untuk melompat dua langkah melampaui Personal Best!`;
  } else if (statusKondisi === 'Approaching') {
    ringkasanStrategi = `${atlet} sedang dalam momentum luar biasa! Selisih waktu dengan PB hanya ${selisih > 0 ? selisih : 0} detik dan terpaut ${gapTarget} detik menuju target impian ${targetWaktu}. Program latihan difokuskan pada "Race Pace Simulation" dan toleransi asam laktat. Kita memprogram sistem saraf motorik atlet agar terbiasa mengayuh pada kecepatan target kompetisi.`;

    analisisFisiologi = `Latihan ini menstimulasi sistem Asam Laktat (Anaerobic Glycolysis) dan kapasitas ATP-PC. Pada intensitas 85-95%, otot menghasilkan akumulasi ion H+ dan laktat tinggi. Dengan repetisi terkontrol dan istirahat 45-75 detik, tubuh atlet dilatih meningkatkan "Lactate Clearance Rate" (kemampuan membuang dan mentoleransi rasa terbakar di otot) sehingga daya tahan kecepatan sprint di nomor ${jarak} tetap tajam hingga garis finis.`;

    petunjukTepiKolam = [
      `Start & Turn: Kemenangan sprint ditentukan di dinding. Pantau tolakan kaki sekuat tenaga di dinding kolam dan dolphin kick 4-6 kayuhan underwater sebelum breakout.`,
      `Breakout: Jangan bernapas pada 1-2 kayuhan pertama setelah keluar dari bawah air. Bernapas saat breakout merusak momentum kecepatan tolakan dinding.`,
      `Stroke Rate & DPS: Hitung frekuensi kayuhan stopwatch. Cari kombinasi optimal antara kayuhan cepat dan panjang tarikan tangan.`
    ];

    panduanPemulihan = `Konsumsi kombinasi karbohidrat sederhana + protein (rasio 3:1) dalam rentang 30 menit setelah keluar dari kolam (seperti susu cokelat rendah lemak atau pisang + whey/telur). Mandi air dingin/kontras membantu meredakan inflamasi mikro jaringan otot.`;

    pesanMotivasi = `Kamu sudah berada tepat di ambang rekor baru! Fokus pada detail kecil di setiap sesi, target waktu ${targetWaktu} pasti bisa ditembus!`;
  } else if (statusKondisi === 'NewPB') {
    ringkasanStrategi = `${atlet} baru saja mencetak rekor Personal Best fenomenal (${pbWaktu})! Program ini dirancang sebagai fase "Tapering & Peak Power Maintenance". Tujuannya bukan menambah volume mil latihan secara berlebihan, melainkan menjaga kesiapan sistem saraf pusat (CNS), ledakan tenaga start balok, dan kestabilan kecepatan lomba.`;

    analisisFisiologi = `Volume latihan dipangkas sekitar 20-30%, namun intensitas kualitas tetap tinggi pada sistem Alaktat / ATP-CP murni (<10 detik ledakan tenaga). Istirahat diperpanjang hingga 75-120 detik untuk memastikan pemulihan total cadangan kreatin fosfat di setiap repetisi sprint.`;

    petunjukTepiKolam = [
      `Ledakan Daya (Explosive Start): Latih reaksi mendengar peluit/beeper balok start. Pastikan tolakan tungkai eksplosif dengan lintasan masuk air runcing seperti jarum.`,
      `Finishing Touch: Latih atlet menyentuh pad/dinding finis dengan dorongan kayuhan penuh tanpa melambat atau melihat ke samping pada 5 meter terakhir.`,
      `Mental State: Jaga kepercayaan diri atlet agar tetap rileks dan tidak tegang.`
    ];

    panduanPemulihan = `Fokus pada fleksibilitas dinamis, teknik pernapasan diafragma, hidrasi dingin, dan nutrisi kaya antioksidan (sayur hijau, buah beri/jeruk) untuk mencegah stres oksidatif pada puncak performa.`;

    pesanMotivasi = `Pencapaian rekor Personal Best ini adalah bukti kerja kerasmu di kolam renang. Jadikan ini pijakan baru untuk prestasi yang lebih tinggi lagi!`;
  } else {
    // Fatigued
    ringkasanStrategi = `Evaluasi tren catatan waktu menunjukkan atlet mengalami kelelahan akumulatif (overreaching). Program latihan ini sengaja diturunkan volumenya ke arah Active Recovery & Hydrotherapy Drills. Memaksa atlet sprint dalam kondisi sistem saraf lelah hanya akan merusak memori gerak teknis dan berisiko cedera bahu.`;

    analisisFisiologi = `Aktivitas difokuskan pada pemulihan parasimpatis, sirkulasi darah tanpa pembentukan asam laktat (detak jantung <130 bpm). Latihan berirama santai dengan drill papan pelampung dan gaya ganti ringan merangsang pelepasan endorfin dan merestorasi kepekaan reseptor otot.`;

    petunjukTepiKolam = [
      `Fokus rasa air (Feel for water): Berikan drill sculling dan berenang rileks tanpa stopwatch untuk menghilangkan tekanan psikologis atlet.`,
      `Pernapasan: Latih pernapasan bilateral (dua sisi kanan & kiri) untuk menyeimbangkan ketegangan otot leher dan bahu.`,
      `Pantau ekspresi dan postur atlet. Jika atlet tampak letih, kurangi repetisi set tanpa ragu.`
    ];

    panduanPemulihan = `Sangat prioritaskan asupan magnesium, kalium (buah pisang, air kelapa murni), dan tidur nyenyak 9 jam. Batasi aktivitas fisik berat di luar kolam selama minggu pemulihan ini.`;

    pesanMotivasi = `Istirahat yang cerdas adalah bagian penting dari latihan juara dunia. Beri tubuh waktu beradaptasi, dan kamu akan kembali jauh lebih kuat!`;
  }

  return {
    ringkasanStrategi,
    analisisFisiologi,
    petunjukTepiKolam,
    panduanPemulihan,
    pesanMotivasi
  };
}

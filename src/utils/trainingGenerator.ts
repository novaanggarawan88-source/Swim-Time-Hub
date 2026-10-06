import { CatatanWaktu, GayaRenang, JarakRenang, ProgramLatihanItem } from '../types/swim';
import { computePBForEvent, formatSecondsToTime, timeStringToSeconds } from './timeUtils';

export interface TrainingRecommendationOutput {
  statusKondisi: 'Slower' | 'Approaching' | 'NewPB' | 'Fatigued';
  statusLabel: string;
  penjelasanPelatih: string;
  pbWaktu: string;
  pbDetik: number;
  waktuTerakhir: string;
  waktuTerakhirDetik: number;
  rataRataDetik: number;
  selisihDetik: number;
  targetWaktu: string;
  targetDetik: number;
  items: ProgramLatihanItem[];
}

export function generateTrainingProgram(
  allRecords: CatatanWaktu[],
  atlet: string,
  gaya: GayaRenang,
  jarak: JarakRenang,
  targetWaktuStr: string,
  lamaMinggu: number
): TrainingRecommendationOutput {
  const pbInfo = computePBForEvent(allRecords, atlet, gaya, jarak);
  
  const pbDetik = pbInfo ? pbInfo.pbDetik : (timeStringToSeconds(targetWaktuStr) || 35.0);
  const pbWaktu = pbInfo ? pbInfo.pbWaktu : formatSecondsToTime(pbDetik);
  const waktuTerakhirDetik = pbInfo ? pbInfo.waktuTerakhirDetik : pbDetik;
  const waktuTerakhir = pbInfo ? pbInfo.waktuTerakhir : pbWaktu;
  const rataRataDetik = pbInfo ? pbInfo.rataRataDetik : pbDetik;
  const selisihDetik = Number((waktuTerakhirDetik - pbDetik).toFixed(2));
  
  const targetDetik = timeStringToSeconds(targetWaktuStr) > 0 
    ? timeStringToSeconds(targetWaktuStr) 
    : Number((pbDetik * 0.98).toFixed(2));
  const finalTargetWaktu = formatSecondsToTime(targetDetik);

  // Check if multiple recent times are declining (fatigue check)
  const history = pbInfo ? pbInfo.history : [];
  let isFatigued = false;
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    if (last3[2].waktuDetik > last3[1].waktuDetik && last3[1].waktuDetik > last3[0].waktuDetik) {
      isFatigued = true;
    }
  }

  let statusKondisi: 'Slower' | 'Approaching' | 'NewPB' | 'Fatigued' = 'Approaching';
  let statusLabel = 'Performa Mendekati PB';
  let penjelasanPelatih = '';

  if (isFatigued && selisihDetik > 1.0) {
    statusKondisi = 'Fatigued';
    statusLabel = 'Tren Penurunan / Kelelahan';
    penjelasanPelatih = 'Catatan waktu dalam 3 sesi terakhir menunjukkan tren penurunan. Fokuskan pada pemulihan aktif (active recovery), koreksi efisiensi tarikan kayuhan tanpa beban asam laktat berlebih, lalu naikkan intensitas secara bertahap.';
  } else if (selisihDetik <= 0) {
    statusKondisi = 'NewPB';
    statusLabel = 'Puncak Performa (Personal Best Baru)';
    penjelasanPelatih = 'Atlet berada dalam performa puncak dan melampaui PB! Program difokuskan pada maintenance power, penyempurnaan turn (pembalikan) & breakout, serta sprint spesifik race-pace.';
  } else if (selisihDetik > 2.0) {
    statusKondisi = 'Slower';
    statusLabel = 'Lebih Lambat Signifikan (>2 detik dari PB)';
    penjelasanPelatih = 'Catatan waktu terakhir masih terpaut cukup jauh dari Personal Best. Rekomendasi: Perkuat fondasi aerobik, drill teknik efisiensi kayuhan (catch & pull), pacing split, dan recovery teratur.';
  } else {
    statusKondisi = 'Approaching';
    statusLabel = 'Mendekati PB (<2 detik selisih)';
    penjelasanPelatih = 'Atlet mendekati waktu terbaiknya! Rekomendasi: Latihan kecepatan race pace, interval intensitas tinggi (anaerobic threshold), simulasi start dan finis.';
  }

  const items: ProgramLatihanItem[] = [];
  const daysPerWeek = 5;
  const totalDays = lamaMinggu * daysPerWeek;
  const daysName = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 0; i < totalDays; i++) {
    const weekNum = Math.floor(i / daysPerWeek) + 1;
    const dayName = `${daysName[i % daysPerWeek]} (M${weekNum})`;
    const dayIdx = i % daysPerWeek;

    let item: ProgramLatihanItem;

    if (statusKondisi === 'Slower') {
      if (dayIdx === 0) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Teknik Dasar & Efisiensi Catch',
          set: 4,
          repetisi: 4,
          targetWaktu: `${formatSecondsToTime(pbDetik * 1.15)} (Rileks)`,
          istirahat: '30 dtk',
          intensitas: '65% Aerobic',
          tujuan: 'Memperbaiki catch & pull, streamline posisi badan lurus di air.',
          catatan: 'Gunakan pullbuoy di set 2 & 4 untuk fokus kayuhan tangan.',
          hari: dayName
        };
      } else if (dayIdx === 1) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Aerobic Base & Pacing Steady',
          set: 4,
          repetisi: 6,
          targetWaktu: `${formatSecondsToTime(pbDetik * 1.10)}`,
          istirahat: '35 dtk',
          intensitas: '70% Endurance',
          tujuan: 'Membangun daya tahan kardio dan menjaga frekuensi kayuhan rata.',
          catatan: 'Split per lap tidak boleh melambat lebih dari 1.5 detik.',
          hari: dayName
        };
      } else if (dayIdx === 2) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Recovery Aktif & Drill Kelenturan',
          set: 3,
          repetisi: 4,
          targetWaktu: 'Pace Santai',
          istirahat: '45 dtk',
          intensitas: '50% Recovery',
          tujuan: 'Pelepasan asam laktat dan penyelarasan pernapasan ritmis.',
          catatan: 'Kombinasi gaya punggung rileks / sculling.',
          hari: dayName
        };
      } else if (dayIdx === 3) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Threshold & Descending Pace',
          set: 4,
          repetisi: 4,
          targetWaktu: `${formatSecondsToTime(pbDetik * 1.05)}`,
          istirahat: '45 dtk',
          intensitas: '80% Threshold',
          tujuan: 'Adaptasi kecepatan bertahap mendekati target lomba.',
          catatan: 'Rep 1-2 santai, rep 3-4 kencang (descending).',
          hari: dayName
        };
      } else {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Simulasi Sprint Terkontrol',
          set: 5,
          repetisi: 2,
          targetWaktu: `${formatSecondsToTime(pbDetik * 1.02)}`,
          istirahat: '60 dtk',
          intensitas: '85% Sub-Max',
          tujuan: 'Uji kecepatan dengan teknik yang tetap rapi dan tidak panik.',
          catatan: 'Mulai dengan dive start berkualitas.',
          hari: dayName
        };
      }
    } else if (statusKondisi === 'Approaching') {
      if (dayIdx === 0) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Race Pace Tempo & Stroke Rate',
          set: 5,
          repetisi: 4,
          targetWaktu: `${formatSecondsToTime(targetDetik * 1.03)}`,
          istirahat: '40 dtk',
          intensitas: '80-85% Race Pace',
          tujuan: 'Mengunci ritme kayuhan stabil sesuai target race time.',
          catatan: 'Gunakan tempo trainer jika tersedia.',
          hari: dayName
        };
      } else if (dayIdx === 1) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Anaerobic Lactic Interval',
          set: 4,
          repetisi: 4,
          targetWaktu: `${formatSecondsToTime(targetDetik * 1.01)}`,
          istirahat: '50 dtk',
          intensitas: '90% High Intensity',
          tujuan: 'Mendorong ambang batas laktat dan daya tahan sprint.',
          catatan: 'Pertahankan tarikan kuat saat 15 meter terakhir.',
          hari: dayName
        };
      } else if (dayIdx === 2) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Active Recovery & Core Alignment',
          set: 3,
          repetisi: 4,
          targetWaktu: 'Kayuhan Halus',
          istirahat: '45 dtk',
          intensitas: '55% Recovery',
          tujuan: 'Menjaga rasa air (feel for water) tanpa membebani otot.',
          catatan: 'Drill underwater dolphin kicks & stretching di pinggir kolam.',
          hari: dayName
        };
      } else if (dayIdx === 3) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Explosive Start, Turn & Breakout',
          set: 6,
          repetisi: 2,
          targetWaktu: `${formatSecondsToTime(targetDetik)}`,
          istirahat: '75 dtk',
          intensitas: '95% Speed Power',
          tujuan: 'Mengasah reaksi start balok dan tolakan dinding kuat.',
          catatan: 'Breakout 15m eksplosif, jangan ambil napas saat breakout.',
          hari: dayName
        };
      } else {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Time Trial: Tembus Personal Best',
          set: 3,
          repetisi: 1,
          targetWaktu: `${finalTargetWaktu} (Target PB)`,
          istirahat: '120 dtk',
          intensitas: '100% Maksimal',
          tujuan: 'Uji simulasi perlombaan resmi menuju Personal Best baru.',
          catatan: 'Pemanasan 800m lengkap sebelum mulai.',
          hari: dayName
        };
      }
    } else if (statusKondisi === 'NewPB') {
      if (dayIdx === 0) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Peak Maintenance & Speed Play',
          set: 4,
          repetisi: 4,
          targetWaktu: `${formatSecondsToTime(pbDetik * 1.02)}`,
          istirahat: '45 dtk',
          intensitas: '85% Controlled Fast',
          tujuan: 'Mempertahankan neuromuscular memory pada kecepatan PB.',
          catatan: 'Fokus jarak kayuhan per putaran (DPS).',
          hari: dayName
        };
      } else if (dayIdx === 1) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Over-speed Training (Power Fused)',
          set: 5,
          repetisi: 2,
          targetWaktu: `${formatSecondsToTime(targetDetik)}`,
          istirahat: '90 dtk',
          intensitas: '95% Peak Speed',
          tujuan: 'Stimulasi saraf motorik untuk kecepatan melebihi rekor.',
          catatan: 'Gunakan fins pendek (zoomac) untuk set over-speed.',
          hari: dayName
        };
      } else if (dayIdx === 2) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Regenerasi Aktif & Fleksibilitas',
          set: 3,
          repetisi: 4,
          targetWaktu: 'Mudah',
          istirahat: '60 dtk',
          intensitas: '50% Relaxed',
          tujuan: 'Mencegah kelelahan saraf dan cedera bahu.',
          catatan: 'Renang gaya dada / punggung santai.',
          hari: dayName
        };
      } else if (dayIdx === 3) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'High-Velocity Race Splits',
          set: 4,
          repetisi: 3,
          targetWaktu: `${finalTargetWaktu}`,
          istirahat: '60 dtk',
          intensitas: '90-95%',
          tujuan: 'Kestabilan kecepatan tinggi di paruh kedua lomba.',
          catatan: 'Negative split di repetisi 3.',
          hari: dayName
        };
      } else {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Championship Taper & Sharp Sprint',
          set: 3,
          repetisi: 2,
          targetWaktu: `${finalTargetWaktu}`,
          istirahat: '120 dtk',
          intensitas: '100% Sprint Sharp',
          tujuan: 'Persiapan kejuaraan renang besar mendatang.',
          catatan: 'Reaksi start peluit tajam.',
          hari: dayName
        };
      }
    } else {
      // Fatigued
      if (dayIdx === 0 || dayIdx === 2) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Active Rest & Hydrotherapy Drills',
          set: 3,
          repetisi: 4,
          targetWaktu: 'Sangat Santai',
          istirahat: '60 dtk',
          intensitas: '45-50% Light',
          tujuan: 'Pemulihan sistem muskuloskeletal dan perbaikan rasa air.',
          catatan: 'Hindari sprint, fokus pernapasan panjang.',
          hari: dayName
        };
      } else if (dayIdx === 1 || dayIdx === 3) {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Drill Koreksi Teknis Halus',
          set: 4,
          repetisi: 4,
          targetWaktu: 'Kecepatan Terkontrol',
          istirahat: '45 dtk',
          intensitas: '60% Easy Aerobic',
          tujuan: 'Menghilangkan kebiasaan salah saat lelah.',
          catatan: 'Koreksi posisi kepala dan timing tendangan kaki.',
          hari: dayName
        };
      } else {
        item = {
          id: `PRG-${Date.now()}-${i}`,
          tanggal: todayStr,
          atlet,
          gaya,
          jarak,
          fokusLatihan: 'Re-activation Sub-Maximal',
          set: 4,
          repetisi: 2,
          targetWaktu: `${formatSecondsToTime(pbDetik * 1.08)}`,
          istirahat: '60 dtk',
          intensitas: '75% Moderat',
          tujuan: 'Mengembalikan kesiapan kompetitif tanpa memicu overtraining.',
          catatan: 'Hentikan set jika teknik mulai goyah.',
          hari: dayName
        };
      }
    }

    items.push(item);
  }

  return {
    statusKondisi,
    statusLabel,
    penjelasanPelatih,
    pbWaktu,
    pbDetik,
    waktuTerakhir,
    waktuTerakhirDetik,
    rataRataDetik,
    selisihDetik,
    targetWaktu: finalTargetWaktu,
    targetDetik,
    items
  };
}

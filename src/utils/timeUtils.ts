import { CatatanWaktu, GayaRenang, JarakRenang, PersonalBestInfo } from '../types/swim';

/**
 * Converts formatted time "MM:SS.hh" or "SS.hh" to total seconds
 * e.g. "00:35.42" -> 35.42
 * e.g. "01:12.30" -> 72.30
 */
export function timeStringToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(',', '.');
  
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return Number((minutes * 60 + seconds).toFixed(2));
  } else {
    return Number(parseFloat(cleaned).toFixed(2)) || 0;
  }
}

/**
 * Converts total seconds to "MM:SS.hh" format
 * e.g. 35.42 -> "00:35.42"
 * e.g. 72.30 -> "01:12.30"
 */
export function secondsToTimeString(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '00:00.00';
  
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const wholeSec = Math.floor(remainingSeconds);
  const hundredths = Math.round((remainingSeconds - wholeSec) * 100);
  
  const mm = String(minutes).padStart(2, '0');
  const ss = String(wholeSec).padStart(2, '0');
  const hh = String(hundredths >= 100 ? 99 : hundredths).padStart(2, '0');
  
  return `${mm}:${ss}.${hh}`;
}

export const formatSecondsToTime = secondsToTimeString;
export const parseTimeToSeconds = timeStringToSeconds;

/**
 * Automatically formats time input as the user types digits.
 * Otomatis menyisipkan tanda titik dua (:) dan koma/titik (.) saat mengetik angka.
 * Mendukung input koma (,) dan titik (.) serta angka murni tanpa simbol.
 * Contoh:
 * - "003542" -> "00:35.42"
 * - "3542"   -> "00:35.42"
 * - "35,42"  -> "00:35.42"
 * - "011230" -> "01:12.30"
 */
export function autoFormatTimeInput(raw: string, prev: string = ''): string {
  if (!raw) return '';

  // Standarisasi koma (,) menjadi titik (.)
  let input = raw.replace(/,/g, '.');

  // Jika pengguna sedang menekan Backspace (menghapus karakter), jangan paksa auto-insert
  if (prev && input.length < prev.length) {
    return input.replace(/[^0-9:.]/g, '');
  }

  // Buang karakter yang tidak diizinkan
  input = input.replace(/[^0-9:.]/g, '');

  // KASUS 1: Mengandung titik dua (:)
  if (input.includes(':')) {
    const parts = input.split(':');
    const mm = parts[0].slice(0, 2);
    const rest = parts.slice(1).join(':');

    if (rest === '') {
      return `${mm}:`;
    }

    if (rest.includes('.')) {
      const secParts = rest.split('.');
      const ss = secParts[0].slice(0, 2);
      const hh = secParts.slice(1).join('').slice(0, 2);
      return `${mm}:${ss}.${hh}`;
    }

    // Bagian detik belum ada titik
    if (rest.length > 2) {
      const ss = rest.slice(0, 2);
      const hh = rest.slice(2, 4);
      return `${mm}:${ss}.${hh}`;
    } else if (rest.length === 2 && !input.endsWith(':')) {
      return `${mm}:${rest}.`;
    }

    return `${mm}:${rest}`;
  }

  // KASUS 2: Mengandung titik (.) atau koma yang diubah
  if (input.includes('.')) {
    const [secPart, hundredthPart] = input.split('.');
    const cleanSec = secPart || '00';
    const cleanHund = (hundredthPart || '').slice(0, 2);

    if (cleanSec.length <= 2) {
      const ss = cleanSec.padStart(2, '0');
      return `00:${ss}.${cleanHund}`;
    } else {
      const mm = cleanSec.slice(0, cleanSec.length - 2).padStart(2, '0');
      const ss = cleanSec.slice(-2);
      return `${mm}:${ss}.${cleanHund}`;
    }
  }

  // KASUS 3: Pengguna hanya mengetik digit angka murni
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length <= 2) {
    // 1-2 digit: misal "0", "00", atau "35"
    if (digits === '00') {
      return '00:';
    }
    return digits;
  }

  if (digits.length === 3) {
    // misal "003" -> "00:3" atau "354" -> "00:35.4"
    if (digits.startsWith('00')) {
      return `00:${digits.slice(2)}`;
    }
    return `00:${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length === 4) {
    // misal "3542" -> "00:35.42"
    // misal "0035" -> "00:35."
    if (digits.startsWith('00')) {
      return `00:${digits.slice(2, 4)}.`;
    }
    return `00:${digits.slice(0, 2)}.${digits.slice(2, 4)}`;
  }

  if (digits.length === 5) {
    // misal "00354" -> "00:35.4"
    // misal "11230" -> 1 menit 12.30 detik -> "01:12.30"
    if (digits.startsWith('00')) {
      return `00:${digits.slice(2, 4)}.${digits.slice(4)}`;
    }
    return `0${digits.slice(0, 1)}:${digits.slice(1, 3)}.${digits.slice(3, 5)}`;
  }

  if (digits.length >= 6) {
    // misal "003542" -> "00:35.42"
    // misal "011230" -> "01:12.30"
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}.${digits.slice(4, 6)}`;
  }

  return input;
}

/**
 * Normalisasi format waktu menjadi MM:SS.hh sempurna saat blur / submit
 */
export function normalizeSwimTime(val: string): string {
  if (!val) return '';
  const seconds = timeStringToSeconds(val);
  if (seconds > 0) {
    return secondsToTimeString(seconds);
  }
  return val;
}

/**
 * Validates and sanitizes user input into MM:SS.hh pattern
 */
export function sanitizeTimeInput(input: string, prev?: string): string {
  return autoFormatTimeInput(input, prev);
}

/**
 * Determines Age Group (Kelompok Umur / KU) in Swimming (PRSI / Aquatics Indonesia standard):
 * KU IV: 10 tahun ke bawah
 * KU III: 11 - 12 tahun
 * KU II: 13 - 14 tahun
 * KU I: 15 - 17 tahun
 * Senior: 18 tahun ke atas
 */
export function calculateKelompokUmur(tanggalLahir: string): string {
  if (!tanggalLahir) return 'KU III';
  const birthDate = new Date(tanggalLahir);
  if (isNaN(birthDate.getTime())) return 'KU III';
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age <= 10) return `KU IV (≤10 th - ${age} th)`;
  if (age <= 12) return `KU III (11-12 th - ${age} th)`;
  if (age <= 14) return `KU II (13-14 th - ${age} th)`;
  if (age <= 17) return `KU I (15-17 th - ${age} th)`;
  return `Senior (18+ th - ${age} th)`;
}

/**
 * Format date string YYYY-MM-DD to Indonesian human format
 */
export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate Personal Best (PB) and performance analytics for a specific Swimmer + Stroke + Distance
 */
export function computePBForEvent(
  allRecords: CatatanWaktu[],
  atlet: string,
  gaya: GayaRenang,
  jarak: JarakRenang
): PersonalBestInfo | null {
  const filtered = allRecords.filter(
    r => r.atlet.trim().toLowerCase() === atlet.trim().toLowerCase() &&
         r.gaya === gaya &&
         r.jarak === jarak
  );

  if (filtered.length === 0) return null;

  // sort chronological for last time
  const chronological = [...filtered].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  
  // lowest seconds is Personal Best
  let best = filtered[0];
  let totalSec = 0;
  let countLatihan = 0;
  let countLomba = 0;

  for (const r of filtered) {
    if (r.waktuDetik < best.waktuDetik) {
      best = r;
    }
    totalSec += r.waktuDetik;
    if (r.jenis === 'Latihan') countLatihan++;
    if (r.jenis === 'Lomba') countLomba++;
  }

  const lastRecord = chronological[chronological.length - 1];
  const avgSec = Number((totalSec / filtered.length).toFixed(2));
  const selisih = Number((lastRecord.waktuDetik - best.waktuDetik).toFixed(2));

  return {
    atlet,
    gaya,
    jarak,
    pbWaktu: best.waktu,
    pbDetik: best.waktuDetik,
    waktuTerakhir: lastRecord.waktu,
    waktuTerakhirDetik: lastRecord.waktuDetik,
    rataRataDetik: avgSec,
    selisihPbDetik: selisih,
    jumlahLatihan: countLatihan,
    jumlahLomba: countLomba,
    totalCatatan: filtered.length,
    history: chronological
  };
}

/**
 * Retrieve all unique PBs across all swimmers and events
 */
export function getAllPersonalBests(allRecords: CatatanWaktu[]): PersonalBestInfo[] {
  const map = new Map<string, PersonalBestInfo>();

  for (const r of allRecords) {
    const key = `${r.atlet.trim().toLowerCase()}|${r.gaya}|${r.jarak}`;
    if (!map.has(key)) {
      const pb = computePBForEvent(allRecords, r.atlet, r.gaya, r.jarak);
      if (pb) {
        map.set(key, pb);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.atlet.localeCompare(b.atlet));
}

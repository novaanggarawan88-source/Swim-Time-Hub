import {
  Atlet,
  Lomba,
  CatatanWaktu,
  ProgramLatihanItem,
  PersonalBestInfo,
  GoogleSheetsConfig
} from '../types/swim';
import { timeStringToSeconds, formatSecondsToTime, computePBForEvent } from '../utils/timeUtils';

const STORAGE_KEYS = {
  ATLET: 'swim_tracker_atlet_v1',
  LOMBA: 'swim_tracker_lomba_v1',
  CATATAN_WAKTU: 'swim_tracker_catatan_waktu_v1',
  PROGRAM_LATIHAN: 'swim_tracker_program_latihan_v1',
  GAS_CONFIG: 'swim_tracker_gas_config_v1'
};

// Initial Seed Data (Realistic Swimming Club Data)
const SEED_ATLET: Atlet[] = [
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
];

const SEED_LOMBA: Lomba[] = [
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
];

const SEED_CATATAN: CatatanWaktu[] = [
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
    catatan: 'Final - Tembus Personal Best!'
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
    catatan: 'Medali Perak KU II'
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
    catatan: 'Personal best 50m gaya bebas putri'
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
];

export class SwimDataService {
  // ATLET
  static getAtlet(): Atlet[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATLET);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(SEED_ATLET));
      return SEED_ATLET;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_ATLET;
    }
  }

  static saveAtlet(atlet: Partial<Atlet>): { status: string; id: string; item: Atlet } {
    const list = this.getAtlet();
    const id = atlet.id || `ATL-${Date.now().toString().slice(-6)}`;
    const nowItem: Atlet = {
      id,
      nama: atlet.nama || 'Tanpa Nama',
      jenisKelamin: atlet.jenisKelamin || 'Laki-laki',
      tanggalLahir: atlet.tanggalLahir || '',
      kelompokUmur: atlet.kelompokUmur || 'KU III',
      klub: atlet.klub || 'Garuda SC Buleleng',
      pelatih: atlet.pelatih || 'Coach Pelatih',
      status: atlet.status || 'Aktif'
    };

    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) {
      list[idx] = nowItem;
    } else {
      list.push(nowItem);
    }

    localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(list));
    this.syncBackground('saveAtlet', nowItem);
    return { status: 'success', id, item: nowItem };
  }

  static toggleStatusAtlet(id: string): Atlet | null {
    const list = this.getAtlet();
    const item = list.find(a => a.id === id);
    if (item) {
      item.status = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(list));
      this.syncBackground('saveAtlet', item);
      return item;
    }
    return null;
  }

  // LOMBA
  static getLomba(): Lomba[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOMBA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOMBA, JSON.stringify(SEED_LOMBA));
      return SEED_LOMBA;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_LOMBA;
    }
  }

  static saveLomba(lomba: Partial<Lomba>): { status: string; id: string; item: Lomba } {
    const list = this.getLomba();
    const id = lomba.id || `LMB-${Date.now().toString().slice(-6)}`;
    const nowItem: Lomba = {
      id,
      namaLomba: lomba.namaLomba || '',
      penyelenggara: lomba.penyelenggara || '',
      lokasi: lomba.lokasi || '',
      tanggal: lomba.tanggal || new Date().toISOString().split('T')[0],
      keterangan: lomba.keterangan || ''
    };

    const idx = list.findIndex(l => l.id === id);
    if (idx >= 0) {
      list[idx] = nowItem;
    } else {
      list.unshift(nowItem);
    }

    localStorage.setItem(STORAGE_KEYS.LOMBA, JSON.stringify(list));
    this.syncBackground('saveLomba', nowItem);
    return { status: 'success', id, item: nowItem };
  }

  // CATATAN WAKTU
  static getCatatanWaktu(): CatatanWaktu[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATATAN_WAKTU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(SEED_CATATAN));
      return SEED_CATATAN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_CATATAN;
    }
  }

  static saveCatatanWaktu(catatan: Partial<CatatanWaktu>): { status: string; id: string; item: CatatanWaktu; isNewPb: boolean } {
    const list = this.getCatatanWaktu();
    const id = catatan.id || `WKT-${Date.now().toString().slice(-6)}`;
    
    // Parse time to seconds
    const waktuDetik = catatan.waktuDetik !== undefined && catatan.waktuDetik > 0
      ? catatan.waktuDetik
      : timeStringToSeconds(catatan.waktu || '00:00.00');
    
    // Check if this is a new Personal Best for this swimmer + stroke + distance
    const prevPB = computePBForEvent(
      list,
      catatan.atlet || '',
      catatan.gaya || 'Bebas',
      catatan.jarak || '50 m'
    );
    const isNewPb = !prevPB || waktuDetik < prevPB.pbDetik;

    const nowItem: CatatanWaktu = {
      id,
      tanggal: catatan.tanggal || new Date().toISOString().split('T')[0],
      atlet: catatan.atlet || '',
      jenis: catatan.jenis || 'Latihan',
      namaLomba: catatan.jenis === 'Lomba' ? (catatan.namaLomba || '') : '',
      gaya: catatan.gaya || 'Bebas',
      jarak: catatan.jarak || '50 m',
      waktu: catatan.waktu || formatSecondsToTime(waktuDetik),
      waktuDetik,
      catatan: catatan.catatan || '',
      isPb: isNewPb
    };

    list.unshift(nowItem);
    localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(list));
    this.syncBackground('saveCatatanWaktu', nowItem);

    return { status: 'success', id, item: nowItem, isNewPb };
  }

  static deleteCatatanWaktu(id: string): boolean {
    const list = this.getCatatanWaktu();
    const filtered = list.filter(r => r.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  // PROGRAM LATIHAN
  static getProgramLatihan(): ProgramLatihanItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRAM_LATIHAN);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveProgramLatihan(items: ProgramLatihanItem[]): { status: string; count: number } {
    const list = this.getProgramLatihan();
    const updated = [...items, ...list];
    localStorage.setItem(STORAGE_KEYS.PROGRAM_LATIHAN, JSON.stringify(updated));
    this.syncBackground('saveProgramLatihan', items);
    return { status: 'success', count: items.length };
  }

  // GOOGLE SPREADSHEET CONFIG
  static getConfig(): GoogleSheetsConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.GAS_CONFIG);
    if (!raw) {
      return {
        webAppUrl: '',
        spreadsheetId: '',
        autoSync: true
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { webAppUrl: '', spreadsheetId: '', autoSync: true };
    }
  }

  static saveConfig(config: GoogleSheetsConfig): void {
    localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(config));
  }

  // Background Sync to GAS if URL is configured
  private static async syncBackground(action: string, data: any) {
    const cfg = this.getConfig();
    if (!cfg.webAppUrl || !cfg.autoSync) return;

    try {
      await fetch(cfg.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data })
      });
    } catch (err) {
      console.warn('Sync background to Google Apps Script failed:', err);
    }
  }

  // Full Push to Google Spreadsheet
  static async pushAllToGas(webAppUrl: string): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        action: 'batchSync',
        atlet: this.getAtlet(),
        lomba: this.getLomba(),
        catatanWaktu: this.getCatatanWaktu(),
        programLatihan: this.getProgramLatihan()
      };

      const res = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { success: true, message: data.message || 'Semua data berhasil disinkronkan ke Google Spreadsheet!' };
    } catch (e: any) {
      return { success: false, message: 'Gagal menghubungi Google Apps Script: ' + e.message };
    }
  }

  // Full Pull from Google Spreadsheet
  static async pullAllFromGas(webAppUrl: string): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Ambil Atlet
      const resA = await fetch(`${webAppUrl}?action=getAtlet`);
      const dataA = await resA.json();
      if (Array.isArray(dataA)) {
        localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(dataA));
      }

      // 2. Ambil Lomba
      const resL = await fetch(`${webAppUrl}?action=getLomba`);
      const dataL = await resL.json();
      if (Array.isArray(dataL)) {
        localStorage.setItem(STORAGE_KEYS.LOMBA, JSON.stringify(dataL));
      }

      // 3. Ambil Catatan Waktu
      const resW = await fetch(`${webAppUrl}?action=getCatatanWaktu`);
      const dataW = await resW.json();
      if (Array.isArray(dataW)) {
        localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(dataW));
      }

      return { success: true, message: 'Data terbaru berhasil dimuat dari Google Spreadsheet!' };
    } catch (e: any) {
      return { success: false, message: 'Gagal mengambil data dari Google Apps Script: ' + e.message };
    }
  }

  // Reset to default sample data
  static resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(SEED_ATLET));
    localStorage.setItem(STORAGE_KEYS.LOMBA, JSON.stringify(SEED_LOMBA));
    localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(SEED_CATATAN));
    localStorage.removeItem(STORAGE_KEYS.PROGRAM_LATIHAN);
  }
}

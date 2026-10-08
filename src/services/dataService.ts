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

// Initial Seed Data (Real Swimmer Data)
const SEED_ATLET: Atlet[] = [
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
];

const SEED_LOMBA: Lomba[] = [
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
];

const SEED_CATATAN: CatatanWaktu[] = [
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
];

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export class SwimDataService {
  private static subscribers: Array<() => void> = [];
  private static statusSubscribers: Array<(status: SyncStatus) => void> = [];
  private static currentSyncStatus: SyncStatus = 'idle';

  // Register state change listener for cross-tab or server-sync updates
  static subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Register real-time sync status listener (saving/saved/idle)
  static subscribeSyncStatus(callback: (status: SyncStatus) => void) {
    this.statusSubscribers.push(callback);
    callback(this.currentSyncStatus);
    return () => {
      this.statusSubscribers = this.statusSubscribers.filter(cb => cb !== callback);
    };
  }

  static getSyncStatus(): SyncStatus {
    return this.currentSyncStatus;
  }

  private static setSyncStatus(status: SyncStatus) {
    this.currentSyncStatus = status;
    this.statusSubscribers.forEach(cb => {
      try {
        cb(status);
      } catch (e) {
        console.error('Status subscriber error:', e);
      }
    });
  }

  private static notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  }

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
    this.syncWithServer({ action: 'saveAtlet', item: nowItem });
    this.syncBackground('saveAtlet', nowItem);
    this.notifySubscribers();
    return { status: 'success', id, item: nowItem };
  }

  static toggleStatusAtlet(id: string): Atlet | null {
    const list = this.getAtlet();
    const item = list.find(a => a.id === id);
    if (item) {
      item.status = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(list));
      this.syncWithServer({ action: 'saveAtlet', item });
      this.syncBackground('saveAtlet', item);
      this.notifySubscribers();
      return item;
    }
    return null;
  }

  static deleteAtlet(id: string): boolean {
    const list = this.getAtlet();
    const filtered = list.filter(a => a.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(filtered));
      this.syncWithServer({ deleteType: 'atlet', deleteId: id });
      this.notifySubscribers();
      return true;
    }
    return false;
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
    this.syncWithServer({ action: 'saveLomba', item: nowItem });
    this.syncBackground('saveLomba', nowItem);
    this.notifySubscribers();
    return { status: 'success', id, item: nowItem };
  }

  static deleteLomba(id: string): boolean {
    const list = this.getLomba();
    const filtered = list.filter(l => l.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.LOMBA, JSON.stringify(filtered));
      this.syncWithServer({ deleteType: 'lomba', deleteId: id });
      this.notifySubscribers();
      return true;
    }
    return false;
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
    // Real-time auto-sync to server and Google Spreadsheet
    this.syncWithServer({ action: 'saveCatatanWaktu', item: nowItem });
    this.syncBackground('saveCatatanWaktu', nowItem);
    this.notifySubscribers();

    return { status: 'success', id, item: nowItem, isNewPb };
  }

  static deleteCatatanWaktu(id: string): boolean {
    const list = this.getCatatanWaktu();
    const filtered = list.filter(r => r.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(filtered));
      this.syncWithServer({ deleteType: 'catatanWaktu', deleteId: id });
      this.notifySubscribers();
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
    this.syncWithServer({ action: 'saveProgramLatihan', item: items });
    this.syncBackground('saveProgramLatihan', items);
    this.notifySubscribers();
    return { status: 'success', count: items.length };
  }

  // GOOGLE SPREADSHEET CONFIG
  static readonly DEFAULT_CONFIG: GoogleSheetsConfig = {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbysRKWrUAYAzjnj3kc7OXHdfVaHioXO1G_aZ8Aan-mVuduGo_S4hiNDG0hFT_hVhZTSAg/exec',
    spreadsheetId: '1LzIYYbpT5wEuCwW1nmaC1ZZyuPeQBjUowEorTS6W0jc',
    autoSync: true
  };

  static getConfig(): GoogleSheetsConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.GAS_CONFIG);
    if (!raw) {
      return { ...this.DEFAULT_CONFIG };
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        webAppUrl: parsed.webAppUrl || this.DEFAULT_CONFIG.webAppUrl,
        spreadsheetId: parsed.spreadsheetId || this.DEFAULT_CONFIG.spreadsheetId,
        autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
        lastSync: parsed.lastSync
      };
    } catch {
      return { ...this.DEFAULT_CONFIG };
    }
  }

  static async saveConfig(config: GoogleSheetsConfig): Promise<boolean> {
    localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(config));
    this.notifySubscribers();
    try {
      await this.syncWithServer();
      return true;
    } catch {
      return false;
    }
  }

  // Multi-Device Server Synchronization: Initial Load & Seamless Real-Time Update
  static async initSync(): Promise<boolean> {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) return false;
      const json = await res.json();
      if (!json.success || !json.data) return false;

      const serverData = json.data;
      let hasChanges = false;

      // 1. Catatan Waktu (Central Server & Google Sheets Authority)
      const serverRecords = Array.isArray(serverData.catatanWaktu) ? serverData.catatanWaktu : [];
      const curRecordsRaw = localStorage.getItem(STORAGE_KEYS.CATATAN_WAKTU);
      if (serverRecords.length > 0) {
        if (!curRecordsRaw || JSON.stringify(serverRecords) !== curRecordsRaw) {
          localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(serverRecords));
          hasChanges = true;
        }
      }

      // 2. Atlet
      const serverAtlets = Array.isArray(serverData.atlet) ? serverData.atlet : [];
      const curAtletsRaw = localStorage.getItem(STORAGE_KEYS.ATLET);
      if (serverAtlets.length > 0) {
        if (!curAtletsRaw || JSON.stringify(serverAtlets) !== curAtletsRaw) {
          localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(serverAtlets));
          hasChanges = true;
        }
      }

      // 3. Lomba
      const serverLomba = Array.isArray(serverData.lomba) ? serverData.lomba : [];
      const curLombaRaw = localStorage.getItem(STORAGE_KEYS.LOMBA);
      if (serverLomba.length > 0) {
        if (!curLombaRaw || JSON.stringify(serverLomba) !== curLombaRaw) {
          localStorage.setItem(STORAGE_KEYS.LOMBA, JSON.stringify(serverLomba));
          hasChanges = true;
        }
      }

      // 4. Program Latihan
      const serverPrograms = Array.isArray(serverData.programLatihan) ? serverData.programLatihan : [];
      const curProgramsRaw = localStorage.getItem(STORAGE_KEYS.PROGRAM_LATIHAN);
      if (serverPrograms.length > 0) {
        if (!curProgramsRaw || JSON.stringify(serverPrograms) !== curProgramsRaw) {
          localStorage.setItem(STORAGE_KEYS.PROGRAM_LATIHAN, JSON.stringify(serverPrograms));
          hasChanges = true;
        }
      }

      // 5. Config (Google Apps Script Web App URL & Spreadsheet ID)
      if (serverData.config) {
        const curConfig = this.getConfig();
        const serverCfg = serverData.config;
        if (serverCfg.webAppUrl || serverCfg.spreadsheetId) {
          if (curConfig.webAppUrl !== serverCfg.webAppUrl || curConfig.spreadsheetId !== serverCfg.spreadsheetId) {
            localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify({
              ...curConfig,
              ...serverCfg
            }));
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        this.notifySubscribers();
      }

      return true;
    } catch (err) {
      console.warn('Initial server sync failed (operating offline cache):', err);
      return false;
    }
  }

  // Background Push to Server (so all other devices get it immediately)
  static async syncWithServer(extraPayload: any = {}): Promise<boolean> {
    try {
      this.setSyncStatus('saving');
      const payload = {
        atlet: this.getAtlet(),
        lomba: this.getLomba(),
        catatanWaktu: this.getCatatanWaktu(),
        programLatihan: this.getProgramLatihan(),
        config: this.getConfig(),
        ...extraPayload
      };

      const res = await fetch('/api/data/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (json && json.success) {
        this.setSyncStatus('saved');
        setTimeout(() => {
          if (this.currentSyncStatus === 'saved') {
            this.setSyncStatus('idle');
          }
        }, 2500);
        return true;
      }
      this.setSyncStatus('idle');
      return false;
    } catch (err) {
      console.warn('Sync to server failed:', err);
      this.setSyncStatus('idle');
      return false;
    }
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

  // Full Push to Google Spreadsheet (via server proxy or direct fetch)
  static async pushAllToGas(webAppUrl?: string): Promise<{ success: boolean; message: string }> {
    const url = webAppUrl || this.getConfig().webAppUrl;
    if (!url) {
      return { success: false, message: 'URL Google Apps Script Web App belum diisi.' };
    }

    try {
      // 1. Try server proxy push first
      const proxyRes = await fetch('/api/sheets/proxy-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl: url })
      });
      const proxyJson = await proxyRes.json();
      if (proxyJson.success) {
        return { success: true, message: proxyJson.message || 'Semua data berhasil disinkronkan ke Google Spreadsheet!' };
      }
    } catch {
      // Fallback to direct fetch
    }

    try {
      const payload = {
        action: 'batchSync',
        atlet: this.getAtlet(),
        lomba: this.getLomba(),
        catatanWaktu: this.getCatatanWaktu(),
        programLatihan: this.getProgramLatihan()
      };

      const res = await fetch(url, {
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

  // Full Pull from Google Spreadsheet (via server proxy or direct fetch)
  static async pullAllFromGas(webAppUrl?: string): Promise<{ success: boolean; message: string }> {
    const url = webAppUrl || this.getConfig().webAppUrl;
    if (!url) {
      return { success: false, message: 'URL Google Apps Script Web App belum diisi.' };
    }

    try {
      // 1. Try server proxy pull first
      const proxyRes = await fetch('/api/sheets/proxy-pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl: url })
      });
      const proxyJson = await proxyRes.json();
      if (proxyJson.success && proxyJson.data) {
        const d = proxyJson.data;
        if (Array.isArray(d.atlet)) localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(d.atlet));
        if (Array.isArray(d.lomba)) localStorage.setItem(STORAGE_KEYS.LOMBA, JSON.stringify(d.lomba));
        if (Array.isArray(d.catatanWaktu)) localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(d.catatanWaktu));
        if (Array.isArray(d.programLatihan)) localStorage.setItem(STORAGE_KEYS.PROGRAM_LATIHAN, JSON.stringify(d.programLatihan));
        this.notifySubscribers();
        return { success: true, message: proxyJson.message || 'Data terbaru berhasil dimuat dari Google Spreadsheet!' };
      }
    } catch {
      // Fallback to direct client fetch
    }

    try {
      // Ambil Atlet
      const resA = await fetch(`${url}?action=getAtlet`);
      const dataA = await resA.json();
      if (Array.isArray(dataA)) {
        localStorage.setItem(STORAGE_KEYS.ATLET, JSON.stringify(dataA));
      }

      // Ambil Lomba
      const resL = await fetch(`${url}?action=getLomba`);
      const dataL = await resL.json();
      if (Array.isArray(dataL)) {
        localStorage.setItem(STORAGE_KEYS.LOMBA, JSON.stringify(dataL));
      }

      // Ambil Catatan Waktu
      const resW = await fetch(`${url}?action=getCatatanWaktu`);
      const dataW = await resW.json();
      if (Array.isArray(dataW)) {
        localStorage.setItem(STORAGE_KEYS.CATATAN_WAKTU, JSON.stringify(dataW));
      }

      // Sync freshly pulled items back to central server
      this.syncWithServer();
      this.notifySubscribers();

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
    this.syncWithServer();
    this.notifySubscribers();
  }
}

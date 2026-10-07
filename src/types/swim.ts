export type JenisKelamin = 'Laki-laki' | 'Perempuan';
export type StatusAtlet = 'Aktif' | 'Nonaktif';

export interface Atlet {
  id: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  kelompokUmur: string;
  klub: string;
  pelatih: string;
  status: StatusAtlet;
}

export interface Lomba {
  id: string;
  namaLomba: string;
  penyelenggara: string;
  lokasi: string;
  tanggal: string;
  keterangan: string;
}

export type JenisCatatan = 'Latihan' | 'Lomba';

export type GayaRenang = 'Bebas' | 'Dada' | 'Punggung' | 'Kupu-kupu' | 'Gaya Ganti';

export type JarakRenang = '25 m' | '50 m' | '100 m' | '200 m' | '400 m' | '800 m' | '1500 m';

export interface CatatanWaktu {
  id: string;
  tanggal: string;
  atlet: string;
  jenis: JenisCatatan;
  namaLomba: string;
  gaya: GayaRenang;
  jarak: JarakRenang;
  waktu: string;        // format MM:SS.hh, e.g. "00:35.42"
  waktuDetik: number;   // e.g. 35.42
  catatan: string;
  isPb?: boolean;
}

export interface ProgramLatihanItem {
  id: string;
  tanggal: string;
  atlet: string;
  gaya: GayaRenang;
  jarak: JarakRenang;
  fokusLatihan: string;
  set: number;
  repetisi: number;
  targetWaktu: string;
  istirahat: string;
  intensitas: string;
  tujuan: string;
  catatan: string;
  hari?: string;
}

export interface PersonalBestInfo {
  atlet: string;
  gaya: GayaRenang;
  jarak: JarakRenang;
  pbWaktu: string;
  pbDetik: number;
  waktuTerakhir: string;
  waktuTerakhirDetik: number;
  rataRataDetik: number;
  selisihPbDetik: number; // waktuTerakhirDetik - pbDetik
  jumlahLatihan: number;
  jumlahLomba: number;
  totalCatatan: number;
  history: CatatanWaktu[];
}

export interface AIPembahasanOutput {
  ringkasanStrategi: string;
  analisisFisiologi: string;
  petunjukTepiKolam: string[];
  panduanPemulihan: string;
  pesanMotivasi: string;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetId: string;
  lastSync?: string;
  autoSync: boolean;
}

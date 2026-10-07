import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  ExternalLink, 
  Settings, 
  Search, 
  Download, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Timer, 
  Users, 
  ClipboardList, 
  Filter,
  Flame,
  Smartphone,
  Laptop
} from 'lucide-react';
import { Atlet, Lomba, CatatanWaktu, ProgramLatihanItem, GoogleSheetsConfig } from '../types/swim';
import { SwimDataService } from '../services/dataService';
import Swal from 'sweetalert2';

interface RekapanSpreadsheetViewProps {
  athletes: Atlet[];
  competitions: Lomba[];
  records: CatatanWaktu[];
  programs: ProgramLatihanItem[];
  config?: GoogleSheetsConfig;
  onOpenSettings: () => void;
  onRefreshData: () => void;
}

export const RekapanSpreadsheetView: React.FC<RekapanSpreadsheetViewProps> = ({
  athletes,
  competitions,
  records,
  programs,
  config: propConfig,
  onOpenSettings,
  onRefreshData
}) => {
  const [activeSheet, setActiveSheet] = useState<'CATATAN_WAKTU' | 'ATLET' | 'LOMBA' | 'PROGRAM_LATIHAN'>('CATATAN_WAKTU');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGaya, setFilterGaya] = useState('Semua');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const config: GoogleSheetsConfig = propConfig || SwimDataService.getConfig();
  const isConnected = Boolean(config.webAppUrl);

  // Manual Trigger: Pull from Google Spreadsheet
  const handlePullFromSheets = async () => {
    if (!config.webAppUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Belum Diatur',
        text: 'Silakan atur URL Google Apps Script Web App terlebih dahulu melalui tombol Pengaturan.',
        confirmButtonColor: '#06b6d4',
        background: '#0f172a',
        color: '#f8fafc'
      });
      return;
    }

    setIsSyncing(true);
    const res = await SwimDataService.pullAllFromGas();
    setIsSyncing(false);

    if (res.success) {
      onRefreshData();
      Swal.fire({
        icon: 'success',
        title: 'Rekapan Berhasil Dimuat!',
        text: res.message,
        confirmButtonColor: '#06b6d4',
        background: '#0f172a',
        color: '#f8fafc'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Rekapan',
        text: res.message,
        confirmButtonColor: '#ef4444',
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
  };

  // Manual Trigger: Push to Google Spreadsheet
  const handlePushToSheets = async () => {
    if (!config.webAppUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Belum Diatur',
        text: 'Silakan atur URL Google Apps Script Web App terlebih dahulu melalui tombol Pengaturan.',
        confirmButtonColor: '#06b6d4',
        background: '#0f172a',
        color: '#f8fafc'
      });
      return;
    }

    setIsSyncing(true);
    const res = await SwimDataService.pushAllToGas();
    setIsSyncing(false);

    if (res.success) {
      onRefreshData();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dikirim!',
        text: res.message,
        confirmButtonColor: '#06b6d4',
        background: '#0f172a',
        color: '#f8fafc'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim Data',
        text: res.message,
        confirmButtonColor: '#ef4444',
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
  };

  // Export current table to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `rekapan_${activeSheet.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeSheet === 'CATATAN_WAKTU') {
      const headers = ['No', 'ID', 'Tanggal', 'Nama Atlet', 'Jenis', 'Nama Lomba', 'Gaya', 'Jarak', 'Waktu', 'Waktu Detik', 'Personal Best', 'Catatan'];
      const rows = records.map((r, i) => [
        i + 1,
        `"${r.id}"`,
        `"${r.tanggal}"`,
        `"${r.atlet}"`,
        `"${r.jenis}"`,
        `"${r.namaLomba || '-'}"`,
        `"${r.gaya}"`,
        `"${r.jarak}"`,
        `"${r.waktu}"`,
        r.waktuDetik,
        r.isPb ? 'Ya (PB)' : 'Bukan',
        `"${(r.catatan || '').replace(/"/g, '""')}"`
      ]);
      csvContent += [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    } else if (activeSheet === 'ATLET') {
      const headers = ['No', 'ID Atlet', 'Nama Lengkap', 'Jenis Kelamin', 'Tanggal Lahir', 'Kelompok Umur', 'Klub', 'Pelatih', 'Status'];
      const rows = athletes.map((a, i) => [
        i + 1,
        `"${a.id}"`,
        `"${a.nama}"`,
        `"${a.jenisKelamin}"`,
        `"${a.tanggalLahir || '-'}"`,
        `"${a.kelompokUmur}"`,
        `"${a.klub}"`,
        `"${a.pelatih}"`,
        `"${a.status}"`
      ]);
      csvContent += [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    } else if (activeSheet === 'LOMBA') {
      const headers = ['No', 'ID Lomba', 'Nama Lomba', 'Penyelenggara', 'Lokasi Kolam', 'Tanggal Pelaksanaan', 'Keterangan'];
      const rows = competitions.map((l, i) => [
        i + 1,
        `"${l.id}"`,
        `"${l.namaLomba}"`,
        `"${l.penyelenggara}"`,
        `"${l.lokasi}"`,
        `"${l.tanggal}"`,
        `"${(l.keterangan || '').replace(/"/g, '""')}"`
      ]);
      csvContent += [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    } else {
      const headers = ['No', 'ID', 'Tanggal', 'Nama Atlet', 'Gaya', 'Jarak', 'Fokus Latihan', 'Set', 'Repetisi', 'Target Waktu', 'Istirahat', 'Intensitas', 'Catatan'];
      const rows = programs.map((p, i) => [
        i + 1,
        `"${p.id}"`,
        `"${p.tanggal}"`,
        `"${p.atlet}"`,
        `"${p.gaya}"`,
        `"${p.jarak}"`,
        `"${p.fokusLatihan}"`,
        p.set,
        p.repetisi,
        `"${p.targetWaktu}"`,
        `"${p.istirahat}"`,
        `"${p.intensitas}"`,
        `"${(p.catatan || '').replace(/"/g, '""')}"`
      ]);
      csvContent += [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Records
  const filteredRecords = records.filter(r => {
    const matchSearch = r.atlet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.namaLomba && r.namaLomba.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.catatan && r.catatan.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchGaya = filterGaya === 'Semua' || r.gaya === filterGaya;
    return matchSearch && matchGaya;
  });

  const filteredAthletes = athletes.filter(a => 
    a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.kelompokUmur.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.pelatih.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompetitions = competitions.filter(c =>
    c.namaLomba.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.penyelenggara.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPrograms = programs.filter(p =>
    p.atlet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.fokusLatihan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const googleSpreadsheetDirectUrl = config.spreadsheetId 
    ? `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit` 
    : '';

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0 shadow-lg shadow-emerald-500/10">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Rekapan Database Google Spreadsheet
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  isConnected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isConnected ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Tersambung ke Spreadsheet
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      Mode Offline / Belum Terhubung
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Cek langsung data rekapan yang tersimpan di Google Spreadsheet Anda tanpa perlu bolak-balik membuka dokumen terpisah.
              </p>
            </div>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <button
              onClick={handlePullFromSheets}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menarik...' : 'Tarik dari Spreadsheet'}</span>
            </button>

            <button
              onClick={handlePushToSheets}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Kirim ke Spreadsheet</span>
            </button>

            {googleSpreadsheetDirectUrl && (
              <a
                href={googleSpreadsheetDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buka Sheet</span>
              </a>
            )}

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan</span>
            </button>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kenapa Beda Device?</span>
            </button>
          </div>
        </div>

        {/* Multi-Device Sync Explanation Banner */}
        {showExplanation && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-xs text-slate-200 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300 flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Mengapa di Perangkat Lain Datanya Sempat Tidak Ada?
              </span>
              <button 
                onClick={() => setShowExplanation(false)}
                className="text-slate-400 hover:text-white font-bold text-xs px-2 py-0.5 rounded bg-slate-800"
              >
                Tutup
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-red-400 block mb-1">Penyebab Sebelumnya:</span>
                <p>
                  Sebelumnya, data hanya disimpan di memori lokal peramban (<b>localStorage</b>) perangkat (HP atau Laptop) tempat Anda mengetik. Setiap perangkat memiliki memori lokal terisolasi, sehingga perangkat kedua tidak otomatis mengetahui data yang diketik di perangkat pertama.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-900/50">
                <span className="font-bold text-emerald-400 block mb-1">Solusi yang Telah Diterapkan:</span>
                <p>
                  Kini kami telah menambahkan <b>Sinkronisasi Otomatis Server & Google Spreadsheet</b>! Setiap waktu latihan atau atlet baru yang Anda simpan, otomatis dikirim ke server pusat dan spreadsheet, sehingga ketika Anda membuka di HP lain, tablet, atau laptop, seluruh data langsung muncul secara realtime!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Multi-Device Status Notification Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>HP</span>
              <span>↔</span>
              <Laptop className="w-3.5 h-3.5" />
              <span>Laptop</span>
            </div>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-300 font-medium">
              Sinkronisasi Cloud Aktif: Data otomatis tersimpan bersama antar-perangkat.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Terakhir disinkronkan:</span>
            <span className="font-mono text-cyan-300">
              {config.lastSync ? new Date(config.lastSync).toLocaleString('id-ID') : 'Baru saja'}
            </span>
          </div>
        </div>
      </div>

      {/* Unconnected Warning Card */}
      {!isConnected && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-300 text-sm">
                Google Spreadsheet Belum Terhubung
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Tautan Web App & Spreadsheet ID belum tersimpan di server pusat. Cukup masukkan sekali via tombol <b>Hubungkan Sekarang</b> di bawah (bisa dari HP atau Laptop), maka semua perangkat akan otomatis terhubung!
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Hubungkan Sekarang</span>
          </button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setActiveSheet('CATATAN_WAKTU')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSheet === 'CATATAN_WAKTU' 
              ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/30' 
              : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sheet Waktu</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">{records.length}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 mt-1">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{records.filter(r => r.isPb).length} Rekor PB</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveSheet('ATLET')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSheet === 'ATLET' 
              ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/30' 
              : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sheet Atlet</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">{athletes.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {athletes.filter(a => a.status === 'Aktif').length} Atlet Aktif
          </span>
        </div>

        <div 
          onClick={() => setActiveSheet('LOMBA')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSheet === 'LOMBA' 
              ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/30' 
              : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sheet Lomba</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">{competitions.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Agenda Kejuaraan</span>
        </div>

        <div 
          onClick={() => setActiveSheet('PROGRAM_LATIHAN')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSheet === 'PROGRAM_LATIHAN' 
              ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/30' 
              : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sheet Program</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">{programs.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Sesi Latihan Tersimpan</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="p-4 sm:p-6 bg-slate-800/80 rounded-3xl border border-slate-700/60 shadow-xl space-y-4">
        {/* Sheet Selection Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveSheet('CATATAN_WAKTU')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeSheet === 'CATATAN_WAKTU'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Sheet CATATAN_WAKTU</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                activeSheet === 'CATATAN_WAKTU' ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-700 text-slate-300'
              }`}>
                {records.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSheet('ATLET')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeSheet === 'ATLET'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Sheet ATLET</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                activeSheet === 'ATLET' ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-700 text-slate-300'
              }`}>
                {athletes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSheet('LOMBA')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeSheet === 'LOMBA'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Sheet LOMBA</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                activeSheet === 'LOMBA' ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-700 text-slate-300'
              }`}>
                {competitions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSheet('PROGRAM_LATIHAN')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeSheet === 'PROGRAM_LATIHAN'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Sheet PROGRAM</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                activeSheet === 'PROGRAM_LATIHAN' ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-700 text-slate-300'
              }`}>
                {programs.length}
              </span>
            </button>
          </div>

          {/* Quick Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
            title="Download CSV Rekapan Sheet Ini"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Cari data pada Sheet ${activeSheet}...`}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {activeSheet === 'CATATAN_WAKTU' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterGaya}
                onChange={e => setFilterGaya(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:border-cyan-400 focus:outline-none"
              >
                <option value="Semua">Semua Gaya Renang</option>
                <option value="Bebas">Gaya Bebas</option>
                <option value="Dada">Gaya Dada</option>
                <option value="Punggung">Gaya Punggung</option>
                <option value="Kupu-kupu">Gaya Kupu-kupu</option>
                <option value="Gaya Ganti">Gaya Ganti (IM)</option>
              </select>
            </div>
          )}
        </div>

        {/* TABLE CONTENT BASED ON ACTIVE SHEET */}
        {activeSheet === 'CATATAN_WAKTU' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-cyan-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-3.5">Tanggal</th>
                  <th className="py-3 px-3.5">Nama Atlet</th>
                  <th className="py-3 px-3.5">Jenis</th>
                  <th className="py-3 px-3.5">Nomor (Gaya & Jarak)</th>
                  <th className="py-3 px-3.5">Waktu</th>
                  <th className="py-3 px-3.5 text-center">Rekor PB</th>
                  <th className="py-3 px-3.5">Keterangan / Lomba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada catatan waktu yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-300 font-mono text-xs">{r.tanggal}</td>
                      <td className="py-3 px-3.5 font-bold text-white whitespace-nowrap">{r.atlet}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.jenis === 'Lomba' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {r.jenis}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-cyan-300 font-semibold">
                        Gaya {r.gaya} {r.jarak}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-black text-amber-300 text-sm">
                        {r.waktu}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">({r.waktuDetik}s)</span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {r.isPb ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-bold">
                            <Flame className="w-3 h-3 text-amber-400" />
                            PB Baru
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-300 max-w-xs truncate text-xs">
                        {r.namaLomba ? (
                          <span className="text-amber-300/90 font-medium">{r.namaLomba}</span>
                        ) : (
                          r.catatan || '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeSheet === 'ATLET' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-cyan-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-3.5">ID Atlet</th>
                  <th className="py-3 px-3.5">Nama Lengkap</th>
                  <th className="py-3 px-3.5">Gender</th>
                  <th className="py-3 px-3.5">Kelompok Umur</th>
                  <th className="py-3 px-3.5">Klub Renang</th>
                  <th className="py-3 px-3.5">Pelatih</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredAthletes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data atlet yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredAthletes.map((a, i) => (
                    <tr key={a.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="py-3 px-3.5 font-mono text-cyan-400 text-xs whitespace-nowrap">{a.id}</td>
                      <td className="py-3 px-3.5 font-bold text-white whitespace-nowrap">{a.nama}</td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">{a.jenisKelamin}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-900/40 text-cyan-300 border border-cyan-800 text-xs font-semibold">
                          {a.kelompokUmur}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">{a.klub}</td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">{a.pelatih}</td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'Aktif'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeSheet === 'LOMBA' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-cyan-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-3.5">ID Lomba</th>
                  <th className="py-3 px-3.5">Nama Kejuaraan / Lomba</th>
                  <th className="py-3 px-3.5">Penyelenggara</th>
                  <th className="py-3 px-3.5">Lokasi Kolam</th>
                  <th className="py-3 px-3.5">Tanggal</th>
                  <th className="py-3 px-3.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredCompetitions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data lomba yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredCompetitions.map((l, i) => (
                    <tr key={l.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="py-3 px-3.5 font-mono text-cyan-400 text-xs whitespace-nowrap">{l.id}</td>
                      <td className="py-3 px-3.5 font-bold text-white whitespace-nowrap">{l.namaLomba}</td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">{l.penyelenggara}</td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">{l.lokasi}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-300 whitespace-nowrap">{l.tanggal}</td>
                      <td className="py-3 px-3.5 text-slate-400 text-xs">{l.keterangan || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeSheet === 'PROGRAM_LATIHAN' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-cyan-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-3.5">Hari / Sesi</th>
                  <th className="py-3 px-3.5">Atlet</th>
                  <th className="py-3 px-3.5">Nomor</th>
                  <th className="py-3 px-3.5">Fokus Latihan</th>
                  <th className="py-3 px-3.5">Set x Reps</th>
                  <th className="py-3 px-3.5">Target Waktu</th>
                  <th className="py-3 px-3.5">Istirahat</th>
                  <th className="py-3 px-3.5">Intensitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Belum ada rekapan program latihan tersimpan di spreadsheet.
                    </td>
                  </tr>
                ) : (
                  filteredPrograms.map((p, i) => (
                    <tr key={p.id || i} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="py-3 px-3.5 font-semibold text-cyan-300 whitespace-nowrap">{p.hari || `Sesi ${i + 1}`}</td>
                      <td className="py-3 px-3.5 font-bold text-white whitespace-nowrap">{p.atlet}</td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">Gaya {p.gaya} {p.jarak}</td>
                      <td className="py-3 px-3.5 text-amber-300 font-medium whitespace-nowrap">{p.fokusLatihan}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-200 whitespace-nowrap">{p.set} x {p.repetisi}</td>
                      <td className="py-3 px-3.5 font-mono font-bold text-cyan-300 whitespace-nowrap">{p.targetWaktu}</td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">{p.istirahat}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200">
                          {p.intensitas}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

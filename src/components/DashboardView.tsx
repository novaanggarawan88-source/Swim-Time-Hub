import React from 'react';
import { Atlet, CatatanWaktu, Lomba } from '../types/swim';
import { getAllPersonalBests, formatDateIndo } from '../utils/timeUtils';
import { SwimProgressChart } from './SwimProgressChart';
import { 
  Users, 
  Trophy, 
  Timer, 
  Award, 
  PlusCircle, 
  ChevronRight, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Smartphone,
  Laptop
} from 'lucide-react';
import { SwimDataService } from '../services/dataService';

interface DashboardViewProps {
  athletes: Atlet[];
  competitions: Lomba[];
  records: CatatanWaktu[];
  onNavigate: (tab: string) => void;
  onSelectAthlete: (nama: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  athletes,
  competitions,
  records,
  onNavigate,
  onSelectAthlete
}) => {
  const pbs = getAllPersonalBests(records);
  const recentRecords = records.slice(0, 7);

  // Distinct athlete names from records
  const athleteNames = Array.from(new Set(athletes.map(a => a.nama)));

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900 via-cyan-900 to-blue-900 border border-cyan-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Garuda Swimming Club Buleleng"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain bg-slate-950/80 p-1 border-2 border-amber-400/60 shadow-2xl shadow-amber-500/30 shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-1.5 border border-amber-400/40">
                <Sparkles className="w-3.5 h-3.5" />
                GARUDA SWIMMING CLUB BULELENG
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                SWIM TIME TRACKER
              </h1>
              <p className="text-xs sm:text-sm text-cyan-100/90 mt-1 max-w-xl">
                Aplikasi pencatat waktu latihan & kejuaraan lomba renang, pemantauan rekor Personal Best (PB), dan rekomendasi program latihan berbasis AI & Google Spreadsheet.
              </p>
            </div>
          </div>

          {/* Big Poolside Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onNavigate('catat')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
            >
              <Timer className="w-5 h-5" />
              <span>Catat Waktu Sekarang</span>
            </button>
            <button
              onClick={() => onNavigate('program')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-sm sm:text-base shadow active:scale-95 transition-all"
            >
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Program Latihan</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background water elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Atlet */}
        <div 
          onClick={() => onNavigate('atlet')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah Atlet</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{athletes.length}</span>
            <span className="text-xs text-cyan-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Total Lomba */}
        <div 
          onClick={() => onNavigate('lomba')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah Lomba</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{competitions.length}</span>
            <span className="text-xs text-amber-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Total Catatan Waktu */}
        <div 
          onClick={() => onNavigate('riwayat')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catatan Waktu</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{records.length}</span>
            <span className="text-xs text-emerald-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Riwayat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Total Personal Best */}
        <div 
          onClick={() => onNavigate('pb')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-yellow-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personal Best</span>
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{pbs.length}</span>
            <span className="text-xs text-yellow-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Analisis <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Rekapan Google Spreadsheet & Multi-Device Sync Shortcut Card */}
      {(() => {
        const cfg = SwimDataService.getConfig();
        const hasSheets = Boolean(cfg.webAppUrl);
        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-850 to-slate-900 border border-emerald-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    Rekapan Database Google Spreadsheet
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    hasSheets ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {hasSheets ? '● Terhubung ke Spreadsheet' : '○ Belum Dikonfigurasi'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                  <span className="text-cyan-300 font-medium">
                    {records.length} Catatan Waktu • {athletes.length} Atlet • {competitions.length} Lomba
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <Smartphone className="w-3 h-3" />
                    <span>HP ↔ Laptop Tersinkronisasi Otomatis</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('spreadsheet')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Cek Rekapan Spreadsheet</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        );
      })()}

      {/* Interactive Swim Progression Chart */}
      <SwimProgressChart records={records} athletes={athleteNames} />

      {/* Two Main Tables: Catatan Terbaru & Personal Best */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabel Catatan Terbaru */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">CATATAN TERBARU</h2>
              </div>
              <button
                onClick={() => onNavigate('riwayat')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase text-[11px] font-semibold">
                    <th className="py-2.5 px-2">Tanggal</th>
                    <th className="py-2.5 px-2">Atlet</th>
                    <th className="py-2.5 px-2">Jenis</th>
                    <th className="py-2.5 px-2">Nomor</th>
                    <th className="py-2.5 px-2 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {recentRecords.length > 0 ? (
                    recentRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/40 transition-colors">
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">
                          {formatDateIndo(item.tanggal)}
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-100">
                          <button
                            onClick={() => onSelectAthlete(item.atlet)}
                            className="hover:text-cyan-400 text-left underline-offset-2 hover:underline transition-colors"
                          >
                            {item.atlet}
                          </button>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            item.jenis === 'Lomba'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {item.jenis}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {item.gaya} {item.jarak}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-cyan-300">
                          {item.waktu}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Belum ada catatan waktu renang.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-700/50 flex justify-end">
            <button
              onClick={() => onNavigate('catat')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <PlusCircle className="w-4 h-4" /> Tambah Catatan Waktu
            </button>
          </div>
        </div>

        {/* Tabel Personal Best */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">PERSONAL BEST (PB)</h2>
              </div>
              <button
                onClick={() => onNavigate('pb')}
                className="text-xs text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-1"
              >
                Analisis Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase text-[11px] font-semibold">
                    <th className="py-2.5 px-2">Atlet</th>
                    <th className="py-2.5 px-2">Gaya</th>
                    <th className="py-2.5 px-2">Jarak</th>
                    <th className="py-2.5 px-2 text-right">Rekor PB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {pbs.length > 0 ? (
                    pbs.slice(0, 7).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/40 transition-colors">
                        <td className="py-3 px-2 font-bold text-slate-100">
                          <button
                            onClick={() => onSelectAthlete(item.atlet)}
                            className="hover:text-yellow-400 text-left underline-offset-2 hover:underline transition-colors"
                          >
                            {item.atlet}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {item.gaya}
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {item.jarak}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/30">
                            ★ {item.pbWaktu}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Belum ada data Personal Best.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
            <span>Otomatis dihitung dari waktu tercepat atlet</span>
            <button
              onClick={() => onNavigate('pb')}
              className="text-yellow-400 font-bold hover:underline"
            >
              Lihat Matriks Lengkap →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

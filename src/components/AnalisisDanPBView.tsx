import React, { useState } from 'react';
import { CatatanWaktu, GayaRenang, JarakRenang } from '../types/swim';
import { getAllPersonalBests, secondsToTimeString } from '../utils/timeUtils';
import { TrendingUp, Award, Search, Filter, Clock, Activity } from 'lucide-react';

interface AnalisisDanPBViewProps {
  records: CatatanWaktu[];
  onSelectAthlete: (nama: string) => void;
  onNavigate: (tab: string) => void;
}

export const AnalisisDanPBView: React.FC<AnalisisDanPBViewProps> = ({
  records,
  onSelectAthlete,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGaya, setFilterGaya] = useState<string>('Semua');
  const [filterJarak, setFilterJarak] = useState<string>('Semua');

  const pbs = getAllPersonalBests(records);

  const filteredPBs = pbs.filter(p => {
    const matchSearch = p.atlet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGaya = filterGaya === 'Semua' || p.gaya === filterGaya;
    const matchJarak = filterJarak === 'Semua' || p.jarak === filterJarak;
    return matchSearch && matchGaya && matchJarak;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-yellow-400" />
            Analisis & Personal Best (PB)
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Rekapitulasi otomatis waktu tercepat (PB), waktu terakhir, rata-rata, selisih delta, dan frekuensi latihan & lomba atlet.
          </p>
        </div>

        <button
          onClick={() => onNavigate('program')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
        >
          <span>Buat Program dari PB Atlet →</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atlet..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-yellow-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterGaya}
            onChange={e => setFilterGaya(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:border-yellow-400 focus:outline-none"
          >
            <option value="Semua">Semua Gaya</option>
            <option value="Bebas">Bebas</option>
            <option value="Dada">Dada</option>
            <option value="Punggung">Punggung</option>
            <option value="Kupu-kupu">Kupu-kupu</option>
            <option value="Gaya Ganti">Gaya Ganti</option>
          </select>

          <select
            value={filterJarak}
            onChange={e => setFilterJarak(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:border-yellow-400 focus:outline-none"
          >
            <option value="Semua">Semua Jarak</option>
            <option value="25 m">25 m</option>
            <option value="50 m">50 m</option>
            <option value="100 m">100 m</option>
            <option value="200 m">200 m</option>
            <option value="400 m">400 m</option>
            <option value="800 m">800 m</option>
            <option value="1500 m">1500 m</option>
          </select>
        </div>
      </div>

      {/* PB Table */}
      <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase text-[11px] font-bold">
                <th className="py-3 px-4">Nama Atlet</th>
                <th className="py-3 px-4">Gaya</th>
                <th className="py-3 px-4">Jarak</th>
                <th className="py-3 px-4 text-center">Personal Best (PB)</th>
                <th className="py-3 px-4 text-center">Waktu Terakhir</th>
                <th className="py-3 px-4 text-center">Rata-Rata</th>
                <th className="py-3 px-4 text-center">Selisih Terakhir dgn PB</th>
                <th className="py-3 px-4 text-center">Frekuensi Sesi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredPBs.length > 0 ? (
                filteredPBs.map((p, idx) => {
                  const isMatchPB = p.selisihPbDetik <= 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <button
                          onClick={() => onSelectAthlete(p.atlet)}
                          className="hover:text-yellow-400 transition-colors text-left"
                        >
                          {p.atlet}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {p.gaya}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {p.jarak}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/30">
                          <Award className="w-3.5 h-3.5" />
                          {p.pbWaktu} ({p.pbDetik}s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-cyan-300">
                        {p.waktuTerakhir} ({p.waktuTerakhirDetik}s)
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {secondsToTimeString(p.rataRataDetik)} ({p.rataRataDetik}s)
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          isMatchPB 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isMatchPB ? '0.00s (Sama dgn PB)' : `+${p.selisihPbDetik}s`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                        <span className="text-cyan-400 font-semibold">{p.jumlahLatihan} Latihan</span>
                        <span className="mx-1">•</span>
                        <span className="text-amber-400 font-semibold">{p.jumlahLomba} Lomba</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectAthlete(p.atlet)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-300 text-xs font-semibold"
                        >
                          Profil →
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Tidak ada data Personal Best yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

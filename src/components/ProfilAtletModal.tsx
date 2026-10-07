import React from 'react';
import { Atlet, CatatanWaktu } from '../types/swim';
import { computePBForEvent, formatDateIndo } from '../utils/timeUtils';
import { SwimProgressChart } from './SwimProgressChart';
import { 
  User, 
  X, 
  Award, 
  Calendar, 
  Building, 
  Sparkles, 
  TrendingUp,
  Layers
} from 'lucide-react';

interface ProfilAtletModalProps {
  athleteName: string;
  athletes: Atlet[];
  records: CatatanWaktu[];
  onClose: () => void;
  onNavigateToProgram: (atlet: string) => void;
}

export const ProfilAtletModal: React.FC<ProfilAtletModalProps> = ({
  athleteName,
  athletes,
  records,
  onClose,
  onNavigateToProgram
}) => {
  const athlete = athletes.find(a => a.nama.toLowerCase() === athleteName.toLowerCase()) || {
    id: 'unknown',
    nama: athleteName,
    jenisKelamin: 'Laki-laki',
    tanggalLahir: '',
    kelompokUmur: 'KU II',
    klub: 'Garuda SC Buleleng',
    pelatih: 'Coach Pelatih',
    status: 'Aktif'
  };

  const athleteRecords = records.filter(
    r => r.atlet.toLowerCase() === athleteName.toLowerCase()
  );

  // Group by Stroke + Distance to get the table: Gaya | Jarak | PB | Waktu Terakhir
  const uniqueEvents = new Map<string, { gaya: any; jarak: any }>();
  athleteRecords.forEach(r => {
    const key = `${r.gaya}_${r.jarak}`;
    if (!uniqueEvents.has(key)) {
      uniqueEvents.set(key, { gaya: r.gaya, jarak: r.jarak });
    }
  });

  const eventStats = Array.from(uniqueEvents.values()).map(ev => {
    const pb = computePBForEvent(athleteRecords, athleteName, ev.gaya, ev.jarak);
    return pb;
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Swimmer Header Profile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-500/20">
              {athlete.nama.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {athlete.nama}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  athlete.status === 'Aktif'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {athlete.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span>{athlete.jenisKelamin}</span>
                <span>•</span>
                <span className="text-cyan-400 font-semibold">{athlete.kelompokUmur}</span>
                <span>•</span>
                <span>Lahir: {formatDateIndo(athlete.tanggalLahir)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigateToProgram(athlete.nama);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Rancang Program Atlet Ini</span>
          </button>
        </div>

        {/* Club & Coach Card */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs">
          <div>
            <span className="text-slate-400 block">Klub Renang:</span>
            <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5 mt-0.5">
              <img src="/logo.png" alt="Garuda SC" className="w-5 h-5 object-contain rounded-md" />
              {athlete.klub}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Pelatih Pembina:</span>
            <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5 mt-0.5">
              <User className="w-4 h-4 text-cyan-400" />
              {athlete.pelatih}
            </span>
          </div>
        </div>

        {/* Section 8 Table: Gaya | Jarak | PB | Waktu Terakhir */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Rekap Catatan Waktu & Personal Best
            </h3>
            <span className="text-xs text-slate-400">
              Total {athleteRecords.length} Catatan Masuk
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700 text-slate-400 uppercase text-[11px] font-bold">
                  <th className="py-2.5 px-3">Gaya</th>
                  <th className="py-2.5 px-3">Jarak</th>
                  <th className="py-2.5 px-3 text-center">PB (Personal Best)</th>
                  <th className="py-2.5 px-3 text-center">Waktu Terakhir</th>
                  <th className="py-2.5 px-3 text-center">Selisih</th>
                  <th className="py-2.5 px-3 text-center">Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {eventStats.length > 0 ? (
                  eventStats.map((item: any, i) => {
                    const diff = item.selisihPbDetik;
                    return (
                      <tr key={i} className="hover:bg-slate-700/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{item.gaya}</td>
                        <td className="py-3 px-3 text-slate-300">{item.jarak}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                          ★ {item.pbWaktu} ({item.pbDetik}s)
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-cyan-300">
                          {item.waktuTerakhir} ({item.waktuTerakhirDetik}s)
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            diff <= 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'
                          }`}>
                            {diff <= 0 ? '0.00s' : `+${diff}s`}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 text-xs">
                          {item.totalCatatan}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Belum ada catatan waktu untuk atlet ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Embedded Progression Chart for this athlete */}
        <SwimProgressChart records={records} athletes={[athlete.nama]} />
      </div>
    </div>
  );
};

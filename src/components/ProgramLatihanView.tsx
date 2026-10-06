import React, { useState, useEffect } from 'react';
import { 
  Atlet, 
  CatatanWaktu, 
  GayaRenang, 
  JarakRenang, 
  ProgramLatihanItem 
} from '../types/swim';
import { computePBForEvent, formatSecondsToTime, secondsToTimeString, sanitizeTimeInput } from '../utils/timeUtils';
import { generateTrainingProgram, TrainingRecommendationOutput } from '../utils/trainingGenerator';
import Swal from 'sweetalert2';
import { 
  ClipboardList, 
  Sparkles, 
  CheckCircle2, 
  Save, 
  Printer, 
  Award, 
  Clock, 
  Activity, 
  Edit3, 
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  ListOrdered
} from 'lucide-react';

interface ProgramLatihanViewProps {
  athletes: Atlet[];
  records: CatatanWaktu[];
  savedPrograms: ProgramLatihanItem[];
  onSaveProgram: (items: ProgramLatihanItem[]) => { status: string; count: number };
}

export const ProgramLatihanView: React.FC<ProgramLatihanViewProps> = ({
  athletes,
  records,
  savedPrograms,
  onSaveProgram
}) => {
  const activeAthletes = athletes.filter(a => a.status === 'Aktif');

  // Input Parameters
  const [selectedAtlet, setSelectedAtlet] = useState<string>(activeAthletes[0]?.nama || '');
  const [gaya, setGaya] = useState<GayaRenang>('Bebas');
  const [jarak, setJarak] = useState<JarakRenang>('50 m');
  const [lamaMinggu, setLamaMinggu] = useState<number>(1);
  const [targetWaktu, setTargetWaktu] = useState<string>('');

  // Generated Plan State
  const [recommendation, setRecommendation] = useState<TrainingRecommendationOutput | null>(null);
  const [editableRows, setEditableRows] = useState<ProgramLatihanItem[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'riwayat'>('generator');

  // When Swimmer or Event changes, recalculate default target
  useEffect(() => {
    if (selectedAtlet) {
      const pb = computePBForEvent(records, selectedAtlet, gaya, jarak);
      if (pb) {
        // default target slightly faster than PB (e.g. 1-2% faster)
        const suggestedTarget = Number((pb.pbDetik * 0.985).toFixed(2));
        setTargetWaktu(formatSecondsToTime(suggestedTarget));
      } else {
        setTargetWaktu('00:33.50');
      }
    }
  }, [selectedAtlet, gaya, jarak, records]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtlet) return;

    const result = generateTrainingProgram(
      records,
      selectedAtlet,
      gaya,
      jarak,
      targetWaktu,
      lamaMinggu
    );

    setRecommendation(result);
    setEditableRows([...result.items]);

    Swal.fire({
      icon: 'success',
      title: 'Rekomendasi Dibuat!',
      html: `
        <div style="font-size: 14px;">
          Program latihan <b>${lamaMinggu} Minggu</b> untuk <b>${selectedAtlet}</b> (${gaya} ${jarak}) berhasil dirancang.<br>
          <span style="color: #38bdf8;">Status: ${result.statusLabel}</span><br>
          <small style="color: #94a3b8; margin-top: 6px; display: block;">Pelatih dapat mengubah set, repetisi, target waktu, dan istirahat di tabel sebelum menyimpan.</small>
        </div>
      `,
      timer: 2500,
      showConfirmButton: false,
      background: '#0f172a',
      color: '#f8fafc'
    });
  };

  const handleRowChange = (index: number, field: keyof ProgramLatihanItem, value: any) => {
    const updated = [...editableRows];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setEditableRows(updated);
  };

  const handleSaveToSpreadsheet = () => {
    if (editableRows.length === 0) return;

    Swal.fire({
      title: 'Simpan Program Latihan?',
      text: `Menyimpan ${editableRows.length} sesi program latihan ke sheet PROGRAM_LATIHAN?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
      background: '#1e293b',
      color: '#f8fafc'
    }).then((res) => {
      if (res.isConfirmed) {
        onSaveProgram(editableRows);
        Swal.fire({
          icon: 'success',
          title: 'Program Berhasil Disimpan!',
          text: `${editableRows.length} sesi latihan berhasil disimpan ke database.`,
          timer: 2000,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#f8fafc'
        });
        setActiveTab('riwayat');
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const pbCurrent = selectedAtlet ? computePBForEvent(records, selectedAtlet, gaya, jarak) : null;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-cyan-400" />
            Program Latihan Otomatis
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Analisis catatan waktu dan Personal Best (PB) untuk membuat rekomendasi periodisasi latihan yang dapat disesuaikan pelatih.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'generator'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Generator Rekomendasi
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'riwayat'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Program Tersimpan ({savedPrograms.length})
          </button>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="space-y-6">
          {/* Builder Form */}
          <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-5 sm:p-7 shadow-2xl">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 1. Pilih Atlet */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nama Atlet *
                  </label>
                  <select
                    required
                    value={selectedAtlet}
                    onChange={e => setSelectedAtlet(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white font-semibold rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    {activeAthletes.map(a => (
                      <option key={a.id} value={a.nama}>
                        {a.nama} ({a.kelompokUmur})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Gaya */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Gaya Renang *
                  </label>
                  <select
                    value={gaya}
                    onChange={e => setGaya(e.target.value as GayaRenang)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Bebas">Bebas</option>
                    <option value="Dada">Dada</option>
                    <option value="Punggung">Punggung</option>
                    <option value="Kupu-kupu">Kupu-kupu</option>
                    <option value="Gaya Ganti">Gaya Ganti</option>
                  </select>
                </div>

                {/* 3. Jarak */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Jarak *
                  </label>
                  <select
                    value={jarak}
                    onChange={e => setJarak(e.target.value as JarakRenang)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="25 m">25 m</option>
                    <option value="50 m">50 m</option>
                    <option value="100 m">100 m</option>
                    <option value="200 m">200 m</option>
                    <option value="400 m">400 m</option>
                    <option value="800 m">800 m</option>
                    <option value="1500 m">1500 m</option>
                  </select>
                </div>

                {/* 4. Target Waktu */}
                <div>
                  <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1.5">
                    Target Waktu (MM:SS.hh) *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetWaktu}
                    onChange={e => setTargetWaktu(sanitizeTimeInput(e.target.value))}
                    placeholder="00:33.50"
                    className="w-full bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono font-bold rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* 5. Lama Program */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Lama Program *
                  </label>
                  <select
                    value={lamaMinggu}
                    onChange={e => setLamaMinggu(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value={1}>1 Minggu (5 Sesi)</option>
                    <option value={2}>2 Minggu (10 Sesi)</option>
                    <option value={4}>4 Minggu (20 Sesi)</option>
                  </select>
                </div>
              </div>

              {/* Read Swimmer Performance Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Personal Best (PB):</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">
                    {pbCurrent ? `${pbCurrent.pbWaktu} (${pbCurrent.pbDetik}s)` : 'Belum Ada'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Waktu Terakhir:</span>
                  <span className="text-cyan-400 font-bold font-mono text-sm">
                    {pbCurrent ? `${pbCurrent.waktuTerakhir} (${pbCurrent.waktuTerakhirDetik}s)` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Rata-Rata Waktu:</span>
                  <span className="text-slate-200 font-bold font-mono text-sm">
                    {pbCurrent ? `${pbCurrent.rataRataDetik} detik` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gap ke Target:</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    {pbCurrent ? `${(pbCurrent.waktuTerakhirDetik - (parseFloat(targetWaktu.split(':')[1]) || pbCurrent.pbDetik)).toFixed(2)}s` : 'Baru'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>BUAT REKOMENDASI PROGRAM LATIHAN</span>
                </button>
              </div>
            </form>
          </div>

          {/* Result: Recommendation Plan */}
          {recommendation && (
            <div className="space-y-4">
              {/* Coach Advisory Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {recommendation.statusLabel}
                      </span>
                      <span className="text-xs text-slate-400">
                        Atlet: <b className="text-white">{recommendation.items[0]?.atlet}</b> | Nomor: <b className="text-white">{gaya} {jarak}</b> | Target: <b className="text-cyan-300">{recommendation.targetWaktu}</b>
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                      💡 <b>Analisis Pelatih:</b> {recommendation.penjelasanPelatih}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      * Program ini berupa rekomendasi pelatih. Anda bebas menyunting angka set, repetisi, target waktu, dan intensitas di tabel di bawah sebelum menyetujui & menyimpan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePrint}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Cetak Program (Print)"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSaveToSpreadsheet}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>SIMPAN PROGRAM</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Editable Training Sessions Table */}
              <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 bg-slate-900/80 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-cyan-400" />
                    Jadwal Sesi Latihan ({editableRows.length} Sesi)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Klik teks pada kolom untuk menyunting
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 uppercase text-[11px] font-bold">
                        <th className="py-3 px-3">Hari</th>
                        <th className="py-3 px-3">Fokus Latihan</th>
                        <th className="py-3 px-2 text-center">Set</th>
                        <th className="py-3 px-2 text-center">Rep</th>
                        <th className="py-3 px-3">Target Waktu</th>
                        <th className="py-3 px-3">Istirahat</th>
                        <th className="py-3 px-3">Intensitas</th>
                        <th className="py-3 px-4">Tujuan & Catatan Khusus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {editableRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-3 font-bold text-cyan-300 whitespace-nowrap">
                            {row.hari}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.fokusLatihan}
                              onChange={e => handleRowChange(idx, 'fokusLatihan', e.target.value)}
                              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={row.set}
                              onChange={e => handleRowChange(idx, 'set', Number(e.target.value))}
                              className="w-14 text-center bg-slate-900/90 border border-slate-700 rounded-lg py-1.5 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={row.repetisi}
                              onChange={e => handleRowChange(idx, 'repetisi', Number(e.target.value))}
                              className="w-14 text-center bg-slate-900/90 border border-slate-700 rounded-lg py-1.5 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.targetWaktu}
                              onChange={e => handleRowChange(idx, 'targetWaktu', e.target.value)}
                              className="w-28 bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-300 font-mono font-bold focus:border-cyan-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.istirahat}
                              onChange={e => handleRowChange(idx, 'istirahat', e.target.value)}
                              className="w-20 bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.intensitas}
                              onChange={e => handleRowChange(idx, 'intensitas', e.target.value)}
                              className="w-24 bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-cyan-300 font-semibold focus:border-cyan-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={row.catatan || row.tujuan}
                              onChange={e => handleRowChange(idx, 'catatan', e.target.value)}
                              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-900/80 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Selesai menyunting? Klik Simpan Program untuk menyimpan ke Google Spreadsheet.
                  </span>
                  <button
                    onClick={handleSaveToSpreadsheet}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>SIMPAN PROGRAM</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Riwayat Program Tersimpan */
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-cyan-400" />
              Daftar Program Latihan yang Pernah Disimpan
            </h3>
            <span className="text-xs text-slate-400">
              Total {savedPrograms.length} Sesi Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 uppercase text-[11px] font-bold">
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Atlet</th>
                  <th className="py-3 px-3">Nomor</th>
                  <th className="py-3 px-3">Fokus Latihan</th>
                  <th className="py-3 px-2 text-center">Set x Rep</th>
                  <th className="py-3 px-3 text-center">Target Waktu</th>
                  <th className="py-3 px-3">Istirahat</th>
                  <th className="py-3 px-3">Intensitas</th>
                  <th className="py-3 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {savedPrograms.length > 0 ? (
                  savedPrograms.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{p.tanggal}</td>
                      <td className="py-3 px-3 font-bold text-white">{p.atlet}</td>
                      <td className="py-3 px-3 text-cyan-300">{p.gaya} {p.jarak}</td>
                      <td className="py-3 px-3 font-medium text-slate-200">{p.fokusLatihan}</td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-200">{p.set} x {p.repetisi}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-300">{p.targetWaktu}</td>
                      <td className="py-3 px-3 text-slate-300">{p.istirahat}</td>
                      <td className="py-3 px-3 text-cyan-400">{p.intensitas}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs italic">{p.catatan || p.tujuan}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      Belum ada program latihan yang disimpan. Buat rekomendasi program di tab "Generator Rekomendasi".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

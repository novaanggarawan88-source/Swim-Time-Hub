import React, { useState, useEffect } from 'react';
import { 
  Atlet, 
  CatatanWaktu, 
  GayaRenang, 
  JarakRenang, 
  ProgramLatihanItem,
  AIPembahasanOutput
} from '../types/swim';
import { 
  computePBForEvent, 
  formatSecondsToTime, 
  secondsToTimeString, 
  autoFormatTimeInput,
  normalizeSwimTime,
  sanitizeTimeInput 
} from '../utils/timeUtils';
import { generateTrainingProgram, TrainingRecommendationOutput } from '../utils/trainingGenerator';
import { fetchAIPembahasan, askAIKonsultasi } from '../utils/aiPembahasan';
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
  ListOrdered,
  Bot,
  Brain,
  Zap,
  Check,
  Copy,
  RefreshCw,
  Flame,
  HeartPulse,
  BookOpen,
  MessageSquare,
  Send
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
  const [pembahasanAI, setPembahasanAI] = useState<AIPembahasanOutput | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [isCopiedAI, setIsCopiedAI] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'riwayat'>('generator');

  // Interactive AI Q&A Consultation State
  const [pertanyaanAI, setPertanyaanAI] = useState<string>('');
  const [jawabanAI, setJawabanAI] = useState<string>('');
  const [isLoadingTanya, setIsLoadingTanya] = useState<boolean>(false);

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

  // Pre-generate initial program & AI discussion if none exists yet
  useEffect(() => {
    if (!recommendation && selectedAtlet) {
      const pb = computePBForEvent(records, selectedAtlet, gaya, jarak);
      const defaultTarget = pb ? formatSecondsToTime(Number((pb.pbDetik * 0.985).toFixed(2))) : '00:33.50';
      const result = generateTrainingProgram(records, selectedAtlet, gaya, jarak, defaultTarget, lamaMinggu);
      setRecommendation(result);
      setEditableRows([...result.items]);
      setIsLoadingAI(true);
      fetchAIPembahasan({
        atlet: selectedAtlet,
        gaya,
        jarak,
        pbWaktu: result.pbWaktu,
        pbDetik: result.pbDetik,
        waktuTerakhir: result.waktuTerakhir,
        waktuTerakhirDetik: result.waktuTerakhirDetik,
        targetWaktu: result.targetWaktu,
        targetDetik: result.targetDetik,
        lamaMinggu,
        statusKondisi: result.statusKondisi,
        statusLabel: result.statusLabel,
        items: result.items
      }).then(aiRes => {
        setPembahasanAI(aiRes);
      }).catch(err => {
        console.warn('Initial AI fetch error:', err);
      }).finally(() => {
        setIsLoadingAI(false);
      });
    }
  }, [selectedAtlet]);

  const handleAskAI = async (customPrompt?: string) => {
    const q = (customPrompt || pertanyaanAI).trim();
    if (!q) return;
    setIsLoadingTanya(true);
    setJawabanAI('');
    try {
      const ans = await askAIKonsultasi(q, {
        atlet: selectedAtlet,
        gaya,
        jarak,
        pb: recommendation?.pbWaktu,
        waktuTerakhir: recommendation?.waktuTerakhir,
        target: recommendation?.targetWaktu,
        status: recommendation?.statusLabel,
        sesi: editableRows
      });
      setJawabanAI(ans);
    } catch {
      setJawabanAI('Gagal mendapatkan respon AI saat ini. Silakan coba kembali.');
    } finally {
      setIsLoadingTanya(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
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

    // Automatically trigger AI Coaching Breakdown
    setIsLoadingAI(true);
    setPembahasanAI(null);

    try {
      const aiResult = await fetchAIPembahasan({
        atlet: selectedAtlet,
        gaya,
        jarak,
        pbWaktu: result.pbWaktu,
        pbDetik: result.pbDetik,
        waktuTerakhir: result.waktuTerakhir,
        waktuTerakhirDetik: result.waktuTerakhirDetik,
        targetWaktu: result.targetWaktu,
        targetDetik: result.targetDetik,
        lamaMinggu,
        statusKondisi: result.statusKondisi,
        statusLabel: result.statusLabel,
        items: result.items
      });
      setPembahasanAI(aiResult);
    } catch (err) {
      console.warn('Gagal memuat pembahasan AI:', err);
    } finally {
      setIsLoadingAI(false);
    }

    Swal.fire({
      icon: 'success',
      title: 'Program & Pembahasan AI Siap!',
      html: `
        <div style="font-size: 14px;">
          Program latihan <b>${lamaMinggu} Minggu</b> untuk <b>${selectedAtlet}</b> (${gaya} ${jarak}) berhasil dirancang.<br>
          <span style="color: #38bdf8;">Status: ${result.statusLabel}</span><br>
          <small style="color: #94a3b8; margin-top: 6px; display: block;">Pembahasan berbasis AI & sains renang telah disertakan di bawah tabel latihan.</small>
        </div>
      `,
      timer: 2500,
      showConfirmButton: false,
      background: '#0f172a',
      color: '#f8fafc'
    });
  };

  const handleRefreshAI = async () => {
    if (!recommendation) return;
    setIsLoadingAI(true);
    try {
      const aiResult = await fetchAIPembahasan({
        atlet: selectedAtlet,
        gaya,
        jarak,
        pbWaktu: recommendation.pbWaktu,
        pbDetik: recommendation.pbDetik,
        waktuTerakhir: recommendation.waktuTerakhir,
        waktuTerakhirDetik: recommendation.waktuTerakhirDetik,
        targetWaktu: recommendation.targetWaktu,
        targetDetik: recommendation.targetDetik,
        lamaMinggu,
        statusKondisi: recommendation.statusKondisi,
        statusLabel: recommendation.statusLabel,
        items: editableRows
      });
      setPembahasanAI(aiResult);
      Swal.fire({
        icon: 'success',
        title: 'Pembahasan AI Diperbarui!',
        timer: 1500,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#f8fafc'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleCopyAIText = () => {
    if (!pembahasanAI || !recommendation) return;
    const text = `📋 PEMBAHASAN PROGRAM LATIHAN RENANG (AI COACHING INSIGHT)
Atlet: ${selectedAtlet}
Nomor: Gaya ${gaya} ${jarak}
Target Waktu: ${recommendation.targetWaktu} (PB Saat Ini: ${recommendation.pbWaktu})
Status Performa: ${recommendation.statusLabel}

1. RINGKASAN STRATEGI & PERIODISASI:
${pembahasanAI.ringkasanStrategi}

2. ANALISIS FISIOLOGI & SISTEM ENERGI:
${pembahasanAI.analisisFisiologi}
${pembahasanAI.bedahSesiHarian && pembahasanAI.bedahSesiHarian.length > 0 ? `
3. PEMBAHASAN DETAIL SESI DEMI SESI:
${pembahasanAI.bedahSesiHarian.map((s, i) => `${i + 1}. ${s.sesi} (Fokus: ${s.fokus} | Target: ${s.target})
   - Alasan & Manfaat: ${s.penjelasan}
   - Tips Kunci: ${s.tipsKunci}`).join('\n\n')}
` : ''}
4. PETUNJUK TEKNIS DI PINGGIR KOLAM (COACHING CUES):
${pembahasanAI.petunjukTepiKolam.map((c, i) => `${i + 1}. ${c}`).join('\n')}

5. PANDUAN PEMULIHAN & NUTRISI:
${pembahasanAI.panduanPemulihan}

6. PESAN MOTIVASI ATLET:
"${pembahasanAI.pesanMotivasi}"

Disusun oleh Swim Time Tracker AI System`;

    navigator.clipboard.writeText(text);
    setIsCopiedAI(true);
    setTimeout(() => setIsCopiedAI(false), 2000);
    Swal.fire({
      icon: 'success',
      title: 'Tersalin ke Clipboard!',
      text: 'Pembahasan program siap dibagikan ke WhatsApp atlet atau orang tua.',
      timer: 1800,
      showConfirmButton: false,
      background: '#0f172a',
      color: '#f8fafc'
    });
  };

  const handleRowChange = (index: number, field: keyof ProgramLatihanItem, value: any) => {
    const updated = [...editableRows];
    let val = value;
    if (field === 'targetWaktu') {
      val = autoFormatTimeInput(value, updated[index]?.targetWaktu || '');
    }
    updated[index] = {
      ...updated[index],
      [field]: val
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
            Program Latihan Otomatis & Analisis AI
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Rekomendasi periodisasi latihan lengkap dengan pembahasan mendalam berbasis Gemini AI agar mudah dipahami pelatih, atlet, dan orang tua.
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
            Generator & AI
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Target Waktu *
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">Otomatis : & .</span>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9:.,]*"
                    required
                    value={targetWaktu}
                    onChange={e => setTargetWaktu(autoFormatTimeInput(e.target.value, targetWaktu))}
                    onBlur={() => setTargetWaktu(normalizeSwimTime(targetWaktu))}
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
                  disabled={isLoadingAI}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>BUAT PROGRAM & PEMBAHASAN LENGKAP DENGAN AI</span>
                </button>
              </div>
            </form>
          </div>

          {/* Result: Recommendation Plan & AI Coaching Breakdown */}
          {recommendation && (
            <div className="space-y-6">
              {/* Coach Advisory Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {recommendation.statusLabel}
                      </span>
                      <span className="text-xs text-slate-400">
                        Atlet: <b className="text-white">{recommendation.items[0]?.atlet}</b> | Nomor: <b className="text-white">{gaya} {jarak}</b> | Target: <b className="text-cyan-300">{recommendation.targetWaktu}</b>
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                      💡 <b>Logika Pelatih:</b> {recommendation.penjelasanPelatih}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePrint}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Cetak Program & Pembahasan (Print)"
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
                    Pelatih bebas menyunting angka pada tabel
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
                    Setelah diedit, simpan program ke Google Spreadsheet
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

              {/* SPECIAL SECTION: PEMBAHASAN PROGRAM LATIHAN BERBASIS AI */}
              <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                      <Brain className="w-6 h-6 animate-pulse text-yellow-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                          PEMBAHASAN PROGRAM LATIHAN (ANALISIS AI)
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Gemini AI & Swim Science
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Penjelasan ilmiah dan panduan praktis agar program mudah dipahami oleh pelatih, atlet, dan orang tua.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleRefreshAI}
                      disabled={isLoadingAI}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
                      title="Minta AI menghasilkan analisis ulang"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
                      <span>{isLoadingAI ? 'Menganalisis...' : 'Analisis Ulang AI'}</span>
                    </button>

                    <button
                      onClick={handleCopyAIText}
                      disabled={!pembahasanAI}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isCopiedAI ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopiedAI ? 'Tersalin!' : 'Salin Pembahasan'}</span>
                    </button>
                  </div>
                </div>

                {isLoadingAI ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-cyan-300">
                      Gemini AI sedang menganalisis biomekanika kayuhan dan fisiologi energi atlet...
                    </p>
                    <p className="text-xs text-slate-500">
                      Menghubungkan catatan waktu {selectedAtlet} dengan standar periodisasi World Aquatics.
                    </p>
                  </div>
                ) : pembahasanAI ? (
                  <div className="space-y-5 pt-5">
                    {/* 1. Ringkasan Strategi & Periodisasi */}
                    <div className="p-4 sm:p-5 bg-slate-800/80 rounded-2xl border border-cyan-900/50 space-y-2">
                      <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm uppercase tracking-wider">
                        <TargetIcon className="w-4 h-4" />
                        <span>1. Mengapa Program Ini Dirancang Seperti Ini? (Strategi Pelatih)</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {pembahasanAI.ringkasanStrategi}
                      </p>
                    </div>

                    {/* 2. Bedah Fisiologi & Sistem Energi */}
                    <div className="p-4 sm:p-5 bg-slate-800/80 rounded-2xl border border-cyan-900/50 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                        <Zap className="w-4 h-4" />
                        <span>2. Bedah Fisiologi, Asam Laktat & Sistem Energi</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {pembahasanAI.analisisFisiologi}
                      </p>
                    </div>

                    {/* 3. Pembahasan Rinci Sesi Demi Sesi Latihan (Bedah Sesi Harian) */}
                    {pembahasanAI.bedahSesiHarian && pembahasanAI.bedahSesiHarian.length > 0 && (
                      <div className="p-4 sm:p-5 bg-slate-800/80 rounded-2xl border border-cyan-900/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sky-400 font-extrabold text-sm uppercase tracking-wider">
                            <BookOpen className="w-4 h-4" />
                            <span>3. Pembahasan Rinci Sesi Demi Sesi Latihan (Tujuan & Alasan Latihan)</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {pembahasanAI.bedahSesiHarian.length} Sesi Teranalisis
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pembahasanAI.bedahSesiHarian.map((sesiItem, sIdx) => (
                            <div key={sIdx} className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-2 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    {sesiItem.sesi}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-amber-300">
                                    Target: {sesiItem.target}
                                  </span>
                                </div>
                                <div className="text-xs font-bold text-white mb-1">
                                  Fokus: <span className="text-cyan-300">{sesiItem.fokus}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {sesiItem.penjelasan}
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-800/70 text-[11px] text-emerald-400 flex items-start gap-1.5">
                                <span className="font-bold shrink-0">💡 Kunci:</span>
                                <span className="text-slate-300">{sesiItem.tipsKunci}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Petunjuk Teknis di Tepi Kolam (Poolside Coaching Cues) */}
                    <div className="p-4 sm:p-5 bg-slate-800/80 rounded-2xl border border-cyan-900/50 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                        <EyeIcon className="w-4 h-4" />
                        <span>4. Petunjuk Praktis di Tepi Kolam (Apa yang Harus Diamati Pelatih)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {pembahasanAI.petunjukTepiKolam.map((cue, idx) => (
                          <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-300 leading-normal">
                              {cue}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5 & 6: Pemulihan & Motivasi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pemulihan */}
                      <div className="p-4 sm:p-5 bg-slate-800/80 rounded-2xl border border-cyan-900/50 space-y-2">
                        <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider">
                          <HeartPulse className="w-4 h-4" />
                          <span>5. Panduan Pemulihan & Nutrisi Atlet</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {pembahasanAI.panduanPemulihan}
                        </p>
                      </div>

                      {/* Motivasi */}
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-cyan-950/60 to-slate-800/90 rounded-2xl border border-cyan-500/40 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-yellow-300 font-extrabold text-sm uppercase tracking-wider">
                            <Flame className="w-4 h-4 text-amber-400" />
                            <span>6. Pesan Motivasi & Edukasi untuk Atlet</span>
                          </div>
                          <p className="text-xs sm:text-sm text-cyan-100 italic leading-relaxed mt-2">
                            "{pembahasanAI.pesanMotivasi}"
                          </p>
                        </div>
                        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/50 mt-2">
                          <span>Kunci Sukses: Konsistensi & Evaluasi Waktu</span>
                          <span className="text-cyan-400 font-semibold font-mono">Target: {recommendation.targetWaktu}</span>
                        </div>
                      </div>
                    </div>

                    {/* 7. KONSULTASI INTERAKTIF: TANYA AI SEPUTAR PROGRAM RENANG INI */}
                    <div className="p-5 bg-gradient-to-br from-slate-900 via-sky-950/70 to-slate-900 rounded-2xl border-2 border-cyan-500/50 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                            <Bot className="w-5 h-5 text-cyan-300" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                              Tanya AI Seputar Program Ini
                              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-normal">Gemini 3.8 Flash</span>
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Konsultasikan pacing, drill teknik, penyesuaian beban jika lelah, atau pertanyaan orang tua atlet.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Prompt Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] text-slate-400 self-center mr-1">Tanya Cepat:</span>
                        {[
                          `Bagaimana strategi pacing 50m/100m untuk ${selectedAtlet}?`,
                          `Apa yang harus dilakukan jika atlet tampak lelah di set ke-4?`,
                          `Bagaimana drill terbaik untuk high elbow catch gaya ${gaya}?`,
                          `Berapa stroke rate ideal untuk target ${recommendation.targetWaktu}?`
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPertanyaanAI(chip);
                              handleAskAI(chip);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] border border-slate-700 transition-all text-left"
                          >
                            💬 {chip}
                          </button>
                        ))}
                      </div>

                      {/* Input form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pertanyaanAI}
                          onChange={e => setPertanyaanAI(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAskAI();
                            }
                          }}
                          placeholder={`Ketik pertanyaan Anda seputar program ${selectedAtlet}...`}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAskAI()}
                          disabled={isLoadingTanya || !pertanyaanAI.trim()}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all disabled:opacity-50 shrink-0"
                        >
                          {isLoadingTanya ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>{isLoadingTanya ? 'Menjawab...' : 'Tanya AI'}</span>
                        </button>
                      </div>

                      {/* AI Answer Display */}
                      {jawabanAI && (
                        <div className="p-4 bg-slate-950/90 rounded-xl border border-cyan-500/40 text-xs text-slate-200 leading-relaxed space-y-2">
                          <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-2">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                              Jawaban Konsultan Pelatih Renang AI:
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">World Aquatics Standard</span>
                          </div>
                          <div className="whitespace-pre-line text-slate-300 pt-1">
                            {jawabanAI}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <p>Klik tombol di bawah untuk membuat pembahasan mendalam dengan AI.</p>
                    <button
                      onClick={handleRefreshAI}
                      className="mt-3 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                    >
                      Muat Pembahasan AI
                    </button>
                  </div>
                )}
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
                      Belum ada program latihan yang disimpan. Buat rekomendasi program di tab "Generator & AI".
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

function TargetIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" strokeWidth="2" />
    </svg>
  );
}

function EyeIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </svg>
  );
}

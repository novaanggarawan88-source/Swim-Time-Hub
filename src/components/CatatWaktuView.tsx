import React, { useState, useEffect, useRef } from 'react';
import { 
  Atlet, 
  Lomba, 
  CatatanWaktu, 
  GayaRenang, 
  JarakRenang 
} from '../types/swim';
import { 
  timeStringToSeconds, 
  secondsToTimeString, 
  computePBForEvent, 
  autoFormatTimeInput,
  normalizeSwimTime,
  sanitizeTimeInput 
} from '../utils/timeUtils';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { 
  Timer, 
  Play, 
  Square, 
  RotateCcw, 
  Check, 
  Award, 
  Sparkles, 
  Flame, 
  Save, 
  Info,
  Calendar,
  User,
  Activity,
  Layers,
  FileText
} from 'lucide-react';

interface CatatWaktuViewProps {
  athletes: Atlet[];
  competitions: Lomba[];
  allRecords: CatatanWaktu[];
  onSaveRecord: (catatan: Partial<CatatanWaktu>) => { status: string; id: string; item: CatatanWaktu; isNewPb: boolean };
  onNavigate: (tab: string) => void;
}

export const CatatWaktuView: React.FC<CatatWaktuViewProps> = ({
  athletes,
  competitions,
  allRecords,
  onSaveRecord,
  onNavigate
}) => {
  const activeAthletes = athletes.filter(a => a.status === 'Aktif');

  // Form Fields
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedAtlet, setSelectedAtlet] = useState<string>(activeAthletes[0]?.nama || '');
  const [jenis, setJenis] = useState<'Latihan' | 'Lomba'>('Latihan');
  const [namaLomba, setNamaLomba] = useState<string>(competitions[0]?.namaLomba || '');
  const [gaya, setGaya] = useState<GayaRenang>('Bebas');
  const [jarak, setJarak] = useState<JarakRenang>('50 m');
  const [waktuInput, setWaktuInput] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');

  // Built-in Poolside Stopwatch
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false);
  const [stopwatchTimeMs, setStopwatchTimeMs] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (stopwatchRunning) {
      const startTime = Date.now() - stopwatchTimeMs;
      timerRef.current = setInterval(() => {
        setStopwatchTimeMs(Date.now() - startTime);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopwatchRunning]);

  const formatStopwatchDisplay = (ms: number) => {
    const totalSec = ms / 1000;
    return secondsToTimeString(totalSec);
  };

  const handleUseStopwatchTime = () => {
    if (stopwatchTimeMs > 0) {
      const formatted = formatStopwatchDisplay(stopwatchTimeMs);
      setWaktuInput(formatted);
      setStopwatchRunning(false);
    }
  };

  const handleResetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTimeMs(0);
  };

  // Convert current input to seconds
  const currentSeconds = timeStringToSeconds(waktuInput);

  // Compute existing PB info for this swimmer + stroke + distance
  const existingPB = selectedAtlet 
    ? computePBForEvent(allRecords, selectedAtlet, gaya, jarak)
    : null;

  const isFasterThanPB = existingPB && currentSeconds > 0 && currentSeconds < existingPB.pbDetik;
  const isFirstRecord = !existingPB && currentSeconds > 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAtlet) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Atlet',
        text: 'Silakan pilih atlet terlebih dahulu!',
        background: '#1e293b',
        color: '#f8fafc'
      });
      return;
    }

    if (!waktuInput || currentSeconds <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Waktu Tidak Valid',
        text: 'Masukkan catatan waktu dengan format MM:SS.hh (contoh: 00:35.42)!',
        background: '#1e293b',
        color: '#f8fafc'
      });
      return;
    }

    const payload: Partial<CatatanWaktu> = {
      tanggal,
      atlet: selectedAtlet,
      jenis,
      namaLomba: jenis === 'Lomba' ? namaLomba : '',
      gaya,
      jarak,
      waktu: waktuInput,
      waktuDetik: currentSeconds,
      catatan
    };

    const res = onSaveRecord(payload);

    if (res.isNewPb) {
      // Fire celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      Swal.fire({
        icon: 'success',
        title: '🎉 PERSONAL BEST BARU!',
        html: `
          <div style="font-size: 15px; margin-top: 8px;">
            <b>${selectedAtlet}</b> berhasil mencetak rekor PB baru!<br>
            Nomor: <b>${gaya} ${jarak}</b><br>
            Waktu: <b style="color: #38bdf8; font-size: 20px;">${waktuInput}</b> (${currentSeconds} detik)
          </div>
        `,
        timer: 3000,
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#0284c7'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Catatan Waktu Tersimpan!',
        html: `Waktu <b>${waktuInput}</b> (${currentSeconds} detik) berhasil disimpan.`,
        timer: 2000,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#f8fafc'
      });
    }

    // Reset stopwatch & time input for next lap/swimmer
    setWaktuInput('');
    setCatatan('');
    handleResetStopwatch();
  };

  const gayaOptions: GayaRenang[] = ['Bebas', 'Dada', 'Punggung', 'Kupu-kupu', 'Gaya Ganti'];
  const jarakOptions: JarakRenang[] = ['25 m', '50 m', '100 m', '200 m', '400 m', '800 m', '1500 m'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Timer className="w-8 h-8 text-cyan-400" />
          Catat Waktu Renang
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Form cepat dengan tombol sentuh besar & stopwatch terintegrasi untuk penggunaan di pinggir kolam renang.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form Column (8 cols) */}
        <div className="lg:col-span-8 bg-slate-800/90 border border-slate-700/90 rounded-2xl p-5 sm:p-7 shadow-2xl">
          <form onSubmit={handleSave} className="space-y-5">
            {/* 1. Tanggal & Atlet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> Nama Atlet *
                </label>
                <select
                  required
                  value={selectedAtlet}
                  onChange={e => setSelectedAtlet(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-semibold rounded-xl px-4 py-3 text-sm focus:border-cyan-400 focus:outline-none"
                >
                  <option value="">-- Pilih Atlet --</option>
                  {activeAthletes.map(a => (
                    <option key={a.id} value={a.nama}>
                      {a.nama} ({a.kelompokUmur})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Jenis (Latihan / Lomba) & Nama Lomba */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Jenis Sesi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenis('Latihan')}
                    className={`py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                      jenis === 'Latihan'
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Latihan
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenis('Lomba')}
                    className={`py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                      jenis === 'Lomba'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Lomba
                  </button>
                </div>
              </div>

              {jenis === 'Lomba' && (
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                    Nama Kejuaraan / Lomba *
                  </label>
                  <select
                    value={namaLomba}
                    onChange={e => setNamaLomba(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/50 text-amber-300 font-semibold rounded-xl px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                  >
                    {competitions.map(c => (
                      <option key={c.id} value={c.namaLomba}>
                        {c.namaLomba}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 3. Gaya Renang (Touch Buttons) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Gaya Renang
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {gayaOptions.map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGaya(g)}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      gaya === g
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30 border border-cyan-400'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Jarak Renang (Touch Buttons) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Jarak Tempuh
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {jarakOptions.map(j => (
                  <button
                    type="button"
                    key={j}
                    onClick={() => setJarak(j)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                      jarak === j
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {j}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Input Waktu (Format MM:SS.hh) + Automatic Seconds Preview */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-cyan-500/40">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-cyan-400" /> Catatan Waktu (Format MM:SS.hh) *
                </label>
                {currentSeconds > 0 && (
                  <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    = {currentSeconds} Detik
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9:.,]*"
                  required
                  value={waktuInput}
                  onChange={e => setWaktuInput(autoFormatTimeInput(e.target.value, waktuInput))}
                  onBlur={() => setWaktuInput(normalizeSwimTime(waktuInput))}
                  placeholder="00:35.42"
                  className="w-full bg-slate-950 border-2 border-cyan-500/50 text-cyan-300 text-center font-mono text-3xl sm:text-4xl font-extrabold rounded-2xl py-3.5 tracking-wider focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                />
              </div>

              {/* Poolside Helper & Touch Keypad */}
              <div className="mt-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-medium text-[11px] sm:text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                    <span><b>Otomatis Tanda : & ,</b> Ketik angka (misal: <b>3542</b> atau <b>35,42</b>), sistem otomatis mengisi titik dua (:) dan koma/titik (.)</span>
                  </span>
                </div>

                {/* Touch Quick Keypad for Poolside */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Tombol Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!waktuInput) setWaktuInput('00:');
                      else if (!waktuInput.includes(':')) setWaktuInput(`00:${waktuInput}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold transition-all active:scale-95"
                  >
                    + 00:
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!waktuInput.includes(':')) setWaktuInput(waktuInput + ':');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-mono font-bold transition-all active:scale-95"
                  >
                    : (Titik Dua)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!waktuInput.includes('.')) setWaktuInput(waktuInput + '.');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-mono font-bold transition-all active:scale-95"
                  >
                    , / . (Koma)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaktuInput('')}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold transition-all active:scale-95 ml-auto"
                  >
                    Hapus (C)
                  </button>
                </div>

                {/* Fast Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Contoh:</span>
                  {['00:32.50', '00:33.95', '00:35.42', '00:39.50', '01:05.20', '01:12.30'].map(preset => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setWaktuInput(preset)}
                      className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* PB Alert Indicator */}
              {isFasterThanPB && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center gap-2 text-amber-300 text-xs font-bold animate-pulse">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    🔥 Waktu ini LEBIH CEPAT dari PB saat ini ({existingPB.pbWaktu} / {existingPB.pbDetik}s). Rekor baru akan dicatat!
                  </span>
                </div>
              )}
              {isFirstRecord && (
                <div className="mt-3 p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center gap-2 text-blue-300 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Catatan pertama untuk nomor ini, akan otomatis menjadi Personal Best awal.</span>
                </div>
              )}
            </div>

            {/* 6. Catatan */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Misal: Start tajam, kayuhan rileks, split 25m: 16.50..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-cyan-500/25 active:scale-[0.99] transition-all"
            >
              <Save className="w-6 h-6" />
              <span>SIMPAN CATATAN WAKTU</span>
            </button>
          </form>
        </div>

        {/* Side Column: Built-in Stopwatch & Swimmer PB Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Integrated Poolside Stopwatch Tool */}
          <div className="bg-slate-800/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="w-4 h-4" /> Stopwatch Tepi Kolam
              </span>
              <span className={`w-2 h-2 rounded-full ${stopwatchRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            </div>

            {/* Big Stopwatch Display */}
            <div className="bg-slate-950 rounded-2xl p-4 text-center border border-slate-800 my-3">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-widest text-shadow">
                {formatStopwatchDisplay(stopwatchTimeMs)}
              </div>
            </div>

            {/* Big Touch Controls */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {!stopwatchRunning ? (
                <button
                  type="button"
                  onClick={() => setStopwatchRunning(true)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStopwatchRunning(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>STOP</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetStopwatch}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET</span>
              </button>
            </div>

            {/* Use Time Button */}
            <button
              type="button"
              disabled={stopwatchTimeMs === 0}
              onClick={handleUseStopwatchTime}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Gunakan Waktu Stopwatch</span>
            </button>
          </div>

          {/* Reference Card: Atlet PB Status for this event */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Status PB: {selectedAtlet || 'Pilih Atlet'}
            </h3>

            {existingPB ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs">Nomor:</div>
                  <div className="text-sm font-bold text-white">{gaya} {jarak}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                    <span className="text-amber-400/80 block">Personal Best (PB)</span>
                    <span className="text-amber-300 font-bold font-mono text-base">{existingPB.pbWaktu}</span>
                    <span className="text-[10px] text-amber-400/70 block">({existingPB.pbDetik}s)</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Waktu Terakhir</span>
                    <span className="text-cyan-300 font-bold font-mono text-base">{existingPB.waktuTerakhir}</span>
                    <span className="text-[10px] text-slate-500 block">({existingPB.waktuTerakhirDetik}s)</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Rata-rata:</span>
                    <span className="font-mono text-slate-200">{existingPB.rataRataDetik} detik</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Sesi:</span>
                    <span className="text-slate-200">{existingPB.totalCatatan} ({existingPB.jumlahLatihan} Latihan, {existingPB.jumlahLomba} Lomba)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selisih Waktu Terakhir vs PB:</span>
                    <span className={`font-mono font-bold ${existingPB.selisihPbDetik <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {existingPB.selisihPbDetik <= 0 ? '0.00s' : `+${existingPB.selisihPbDetik}s`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                <Info className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                Belum ada rekor waktu untuk {selectedAtlet} pada nomor {gaya} {jarak}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CatatanWaktu, GayaRenang, JarakRenang } from '../types/swim';
import { formatDateIndo, computePBForEvent } from '../utils/timeUtils';
import Swal from 'sweetalert2';
import { 
  History, 
  Search, 
  Filter, 
  Award, 
  Trash2, 
  Download, 
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface RiwayatWaktuViewProps {
  records: CatatanWaktu[];
  athletes: string[];
  onDeleteRecord: (id: string) => void;
  onSelectAthlete: (nama: string) => void;
  onNavigate: (tab: string) => void;
}

export const RiwayatWaktuView: React.FC<RiwayatWaktuViewProps> = ({
  records,
  athletes,
  onDeleteRecord,
  onSelectAthlete,
  onNavigate
}) => {
  const [filterAthlete, setFilterAthlete] = useState<string>('Semua');
  const [filterGaya, setFilterGaya] = useState<string>('Semua');
  const [filterJarak, setFilterJarak] = useState<string>('Semua');
  const [filterJenis, setFilterJenis] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtering
  const filtered = records.filter(r => {
    const matchAthlete = filterAthlete === 'Semua' || r.atlet === filterAthlete;
    const matchGaya = filterGaya === 'Semua' || r.gaya === filterGaya;
    const matchJarak = filterJarak === 'Semua' || r.jarak === filterJarak;
    const matchJenis = filterJenis === 'Semua' || r.jenis === filterJenis;
    const matchSearch = r.atlet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.namaLomba.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.catatan.toLowerCase().includes(searchTerm.toLowerCase());

    return matchAthlete && matchGaya && matchJarak && matchJenis && matchSearch;
  });

  // Identify PB for each event to tag records that match the PB
  const pbMap = new Map<string, number>();
  records.forEach(r => {
    const key = `${r.atlet.trim().toLowerCase()}_${r.gaya}_${r.jarak}`;
    const cur = pbMap.get(key);
    if (cur === undefined || r.waktuDetik < cur) {
      pbMap.set(key, r.waktuDetik);
    }
  });

  const handleDelete = (id: string, label: string) => {
    Swal.fire({
      title: 'Hapus Catatan Waktu?',
      text: `Catatan waktu ${label} akan dihapus secara permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      background: '#1e293b',
      color: '#f8fafc'
    }).then((res) => {
      if (res.isConfirmed) {
        onDeleteRecord(id);
        Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          text: 'Catatan waktu berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#f8fafc'
        });
      }
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['ID', 'Tanggal', 'Atlet', 'Jenis', 'Nama Lomba', 'Gaya', 'Jarak', 'Waktu', 'Waktu Detik', 'Catatan'];
    const rows = filtered.map(r => [
      `"${r.id}"`,
      `"${r.tanggal}"`,
      `"${r.atlet}"`,
      `"${r.jenis}"`,
      `"${r.namaLomba || ''}"`,
      `"${r.gaya}"`,
      `"${r.jarak}"`,
      `"${r.waktu}"`,
      r.waktuDetik,
      `"${(r.catatan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Swim_Time_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: 'success',
      title: 'File CSV Diekspor',
      text: 'File CSV siap dibuka di Excel atau diimpor ke Google Spreadsheet.',
      timer: 2000,
      showConfirmButton: false,
      background: '#1e293b',
      color: '#f8fafc'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-cyan-400" />
            Riwayat Catatan Waktu
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Daftar lengkap log waktu latihan & kejuaraan resmi, diurutkan dari data paling terbaru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => onNavigate('catat')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all"
          >
            <span>+ Catat Waktu Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari atlet, nama lomba, atau catatan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Filter Atlet */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Atlet</label>
            <select
              value={filterAthlete}
              onChange={e => setFilterAthlete(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
            >
              <option value="Semua">Semua Atlet</option>
              {athletes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Filter Gaya */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gaya</label>
            <select
              value={filterGaya}
              onChange={e => setFilterGaya(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
            >
              <option value="Semua">Semua Gaya</option>
              <option value="Bebas">Bebas</option>
              <option value="Dada">Dada</option>
              <option value="Punggung">Punggung</option>
              <option value="Kupu-kupu">Kupu-kupu</option>
              <option value="Gaya Ganti">Gaya Ganti</option>
            </select>
          </div>

          {/* Filter Jarak */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Jarak</label>
            <select
              value={filterJarak}
              onChange={e => setFilterJarak(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
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

          {/* Filter Jenis */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Jenis</label>
            <select
              value={filterJenis}
              onChange={e => setFilterJenis(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Latihan">Latihan</option>
              <option value="Lomba">Lomba</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase text-[11px] font-bold">
                <th className="py-3.5 px-3">Tanggal</th>
                <th className="py-3.5 px-3">Jenis</th>
                <th className="py-3.5 px-4">Nama Lomba / Sesi</th>
                <th className="py-3.5 px-4">Atlet</th>
                <th className="py-3.5 px-3">Gaya</th>
                <th className="py-3.5 px-3">Jarak</th>
                <th className="py-3.5 px-3 text-right">Waktu</th>
                <th className="py-3.5 px-3 text-center">Status PB</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtered.length > 0 ? (
                filtered.map((r) => {
                  const key = `${r.atlet.trim().toLowerCase()}_${r.gaya}_${r.jarak}`;
                  const pbSeconds = pbMap.get(key);
                  const isCurrentPB = pbSeconds !== undefined && r.waktuDetik === pbSeconds;

                  return (
                    <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {formatDateIndo(r.tanggal)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.jenis === 'Lomba'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {r.jenis}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {r.jenis === 'Lomba' ? (
                          <span className="font-semibold text-amber-300">{r.namaLomba || '-'}</span>
                        ) : (
                          <span className="text-slate-400 italic">Sesi Latihan</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <button
                          onClick={() => onSelectAthlete(r.atlet)}
                          className="hover:text-cyan-400 text-left transition-colors"
                        >
                          {r.atlet}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">{r.gaya}</td>
                      <td className="py-3 px-3 text-slate-300 font-medium">{r.jarak}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-cyan-300 whitespace-nowrap">
                        {r.waktu}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          ({r.waktuDetik}s)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isCurrentPB ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-[11px]">
                            <Award className="w-3 h-3" />
                            PB Rekor
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 max-w-xs truncate">
                        {r.catatan || '-'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDelete(r.id, `${r.atlet} - ${r.gaya} ${r.jarak} (${r.waktu})`)}
                          title="Hapus Catatan"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    Tidak ada catatan waktu yang memenuhi kriteria filter.
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

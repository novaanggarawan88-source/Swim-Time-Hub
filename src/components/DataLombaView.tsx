import React, { useState } from 'react';
import { Lomba, CatatanWaktu } from '../types/swim';
import { formatDateIndo } from '../utils/timeUtils';
import Swal from 'sweetalert2';
import { Trophy, Plus, MapPin, Calendar, Building, Info, X, CheckCircle2 } from 'lucide-react';

interface DataLombaViewProps {
  competitions: Lomba[];
  records: CatatanWaktu[];
  onSaveLomba: (lomba: Partial<Lomba>) => void;
  onNavigate: (tab: string) => void;
}

export const DataLombaView: React.FC<DataLombaViewProps> = ({
  competitions,
  records,
  onSaveLomba,
  onNavigate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLomba, setEditingLomba] = useState<Lomba | null>(null);

  // Form State
  const [namaLomba, setNamaLomba] = useState('');
  const [penyelenggara, setPenyelenggara] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');

  const openAddModal = () => {
    setEditingLomba(null);
    setNamaLomba('');
    setPenyelenggara('');
    setLokasi('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (l: Lomba) => {
    setEditingLomba(l);
    setNamaLomba(l.namaLomba);
    setPenyelenggara(l.penyelenggara);
    setLokasi(l.lokasi);
    setTanggal(l.tanggal || new Date().toISOString().split('T')[0]);
    setKeterangan(l.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLomba.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama Lomba Kosong',
        text: 'Silakan isi nama lomba!',
        background: '#1e293b',
        color: '#f8fafc'
      });
      return;
    }

    onSaveLomba({
      id: editingLomba ? editingLomba.id : undefined,
      namaLomba: namaLomba.trim(),
      penyelenggara: penyelenggara.trim(),
      lokasi: lokasi.trim(),
      tanggal,
      keterangan: keterangan.trim()
    });

    setIsModalOpen(false);

    Swal.fire({
      icon: 'success',
      title: editingLomba ? 'Data Lomba Diperbarui!' : 'Lomba Ditambahkan!',
      text: `${namaLomba} siap digunakan di menu Catat Waktu.`,
      timer: 1800,
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
            <Trophy className="w-7 h-7 text-amber-400" />
            Data Kejuaraan & Lomba Renang
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Daftar event kejuaraan resmi. Nama lomba otomatis muncul saat pelatih mencatat hasil lomba atlet.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Lomba Baru</span>
        </button>
      </div>

      {/* Competitions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitions.map((lomba) => {
          // Count records in this competition
          const compRecords = records.filter(r => r.namaLomba === lomba.namaLomba);

          return (
            <div
              key={lomba.id}
              className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                      Event Renang
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                    {compRecords.length} Catatan Waktu
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-white group-hover:text-amber-400 transition-colors mb-3">
                  {lomba.namaLomba}
                </h3>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 mb-4">
                  {lomba.penyelenggara && (
                    <div className="flex items-start gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{lomba.penyelenggara}</span>
                    </div>
                  )}
                  {lomba.lokasi && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{lomba.lokasi}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-cyan-300 font-medium">{formatDateIndo(lomba.tanggal)}</span>
                  </div>
                  {lomba.keterangan && (
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-800 text-slate-400 italic">
                      <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{lomba.keterangan}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-xs">
                <button
                  onClick={() => openEditModal(lomba)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-colors"
                >
                  Edit Data Lomba
                </button>
                <button
                  onClick={() => onNavigate('catat')}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  Catat Waktu Lomba →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {competitions.length === 0 && (
        <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">Belum ada data lomba</h3>
          <p className="text-xs text-slate-500 mt-1">Klik tombol Tambah Lomba Baru di atas.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              {editingLomba ? 'Edit Data Lomba' : 'Tambah Lomba Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lomba * (Contoh: MOLA MOLA CUP II 2026)
                </label>
                <input
                  type="text"
                  required
                  value={namaLomba}
                  onChange={e => setNamaLomba(e.target.value)}
                  placeholder="Contoh: MOLA MOLA CUP II 2026"
                  className="w-full bg-slate-800 border border-slate-700 text-white font-semibold rounded-xl px-3.5 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  value={penyelenggara}
                  onChange={e => setPenyelenggara(e.target.value)}
                  placeholder="Contoh: Pengkab Akuatik Buleleng / PB PRSI"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lokasi Kolam Renang
                </label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={e => setLokasi(e.target.value)}
                  placeholder="Contoh: Kolam Renang Nirmala Asri Buleleng"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Pelaksanaan
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder="Kelompok umur yang dipertandingkan, catatan medali, dsb..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-bold shadow-md shadow-amber-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Data Lomba</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

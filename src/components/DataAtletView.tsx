import React, { useState } from 'react';
import { Atlet } from '../types/swim';
import { calculateKelompokUmur, formatDateIndo } from '../utils/timeUtils';
import Swal from 'sweetalert2';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Power, 
  CheckCircle2, 
  Eye, 
  X
} from 'lucide-react';

interface DataAtletViewProps {
  athletes: Atlet[];
  onSaveAthlete: (atlet: Partial<Atlet>) => void;
  onToggleStatus: (id: string) => void;
  onViewProfile: (nama: string) => void;
}

export const DataAtletView: React.FC<DataAtletViewProps> = ({
  athletes,
  onSaveAthlete,
  onToggleStatus,
  onViewProfile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKU, setFilterKU] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Atlet | null>(null);

  // Form State
  const [formNama, setFormNama] = useState('');
  const [formJK, setFormJK] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formTglLahir, setFormTglLahir] = useState('2010-01-01');
  const [formKU, setFormKU] = useState('KU II (13-14 th)');
  const [formKlub, setFormKlub] = useState('Garuda SC Buleleng');
  const [formPelatih, setFormPelatih] = useState('Coach Wayan Sudira');

  const openAddModal = () => {
    setEditingAthlete(null);
    setFormNama('');
    setFormJK('Laki-laki');
    setFormTglLahir('2010-01-01');
    setFormKU(calculateKelompokUmur('2010-01-01'));
    setFormKlub('Garuda SC Buleleng');
    setFormPelatih('Coach Wayan Sudira');
    setIsModalOpen(true);
  };

  const openEditModal = (atlet: Atlet) => {
    setEditingAthlete(atlet);
    setFormNama(atlet.nama);
    setFormJK(atlet.jenisKelamin);
    setFormTglLahir(atlet.tanggalLahir || '2010-01-01');
    setFormKU(atlet.kelompokUmur);
    setFormKlub(atlet.klub);
    setFormPelatih(atlet.pelatih);
    setIsModalOpen(true);
  };

  const handleBirthDateChange = (val: string) => {
    setFormTglLahir(val);
    if (val) {
      setFormKU(calculateKelompokUmur(val));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama Kosong',
        text: 'Silakan isi nama atlet!',
        background: '#1e293b',
        color: '#f8fafc'
      });
      return;
    }

    onSaveAthlete({
      id: editingAthlete ? editingAthlete.id : undefined,
      nama: formNama.trim(),
      jenisKelamin: formJK,
      tanggalLahir: formTglLahir,
      kelompokUmur: formKU,
      klub: formKlub.trim(),
      pelatih: formPelatih.trim(),
      status: editingAthlete ? editingAthlete.status : 'Aktif'
    });

    setIsModalOpen(false);

    Swal.fire({
      icon: 'success',
      title: editingAthlete ? 'Data Diperbarui!' : 'Atlet Ditambahkan!',
      text: `${formNama} berhasil disimpan ke database.`,
      timer: 1800,
      showConfirmButton: false,
      background: '#1e293b',
      color: '#f8fafc'
    });
  };

  const handleToggleClick = (atlet: Atlet) => {
    const nextStatus = atlet.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    Swal.fire({
      title: `Ubah Status Atlet?`,
      text: `Ubah status ${atlet.nama} menjadi ${nextStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Ubah',
      cancelButtonText: 'Batal',
      background: '#1e293b',
      color: '#f8fafc'
    }).then((res) => {
      if (res.isConfirmed) {
        onToggleStatus(atlet.id);
        Swal.fire({
          icon: 'success',
          title: 'Status Diperbarui',
          text: `Status ${atlet.nama} sekarang ${nextStatus}.`,
          timer: 1500,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#f8fafc'
        });
      }
    });
  };

  // Filter athletes
  const filteredAthletes = athletes.filter(a => {
    const matchSearch = a.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.klub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.pelatih.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchKU = filterKU === 'Semua' || a.kelompokUmur.includes(filterKU);
    const matchStatus = filterStatus === 'Semua' || a.status === filterStatus;

    return matchSearch && matchKU && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-cyan-400" />
            Data Atlet Renang
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Kelola daftar atlet, kelompok umur (KU), klub renang, dan pelatih pembina.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tambah Atlet Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atlet, klub, atau pelatih..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterKU}
            onChange={e => setFilterKU(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:border-cyan-400 focus:outline-none"
          >
            <option value="Semua">Semua KU</option>
            <option value="KU IV">KU IV (≤10 th)</option>
            <option value="KU III">KU III (11-12 th)</option>
            <option value="KU II">KU II (13-14 th)</option>
            <option value="KU I">KU I (15-17 th)</option>
            <option value="Senior">Senior (18+ th)</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:border-cyan-400 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Athletes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAthletes.map(atlet => {
          const isAktif = atlet.status === 'Aktif';
          return (
            <div
              key={atlet.id}
              className={`bg-slate-800/80 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:border-cyan-500/50 ${
                isAktif ? 'border-slate-700/80' : 'border-slate-800 opacity-60 bg-slate-900/60'
              }`}
            >
              <div>
                {/* Top Row: Name, Gender & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 
                      onClick={() => onViewProfile(atlet.nama)}
                      className="font-bold text-lg text-white hover:text-cyan-400 cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      {atlet.nama}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {atlet.jenisKelamin} • {formatDateIndo(atlet.tanggalLahir)}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isAktif ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {atlet.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kelompok Umur:</span>
                    <span className="font-semibold text-cyan-300">{atlet.kelompokUmur}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Klub:</span>
                    <span className="font-semibold">{atlet.klub}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pelatih:</span>
                    <span className="font-semibold">{atlet.pelatih}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-xs">
                <button
                  onClick={() => onViewProfile(atlet.nama)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Profil</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(atlet)}
                    title="Edit Atlet"
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleClick(atlet)}
                    title={isAktif ? 'Nonaktifkan Atlet' : 'Aktifkan Atlet'}
                    className={`p-2 rounded-lg transition-colors ${
                      isAktif 
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAthletes.length === 0 && (
        <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">Tidak ada atlet ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau tambah atlet baru.</p>
        </div>
      )}

      {/* Add / Edit Athlete Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              {editingAthlete ? 'Edit Data Atlet' : 'Tambah Atlet Baru'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Atlet *
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={e => setFormNama(e.target.value)}
                  placeholder="Contoh: I Putu Arya Satria"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formJK}
                    onChange={e => setFormJK(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    required
                    value={formTglLahir}
                    onChange={e => handleBirthDateChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kelompok Umur (KU)
                </label>
                <input
                  type="text"
                  value={formKU}
                  onChange={e => setFormKU(e.target.value)}
                  placeholder="Contoh: KU II (13-14 th)"
                  className="w-full bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:border-cyan-400 focus:outline-none"
                />
                <small className="text-[11px] text-slate-400 mt-1 block">
                  Otomatis terhitung dari tanggal lahir (dapat disesuaikan manual).
                </small>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Klub Renang
                </label>
                <input
                  type="text"
                  value={formKlub}
                  onChange={e => setFormKlub(e.target.value)}
                  placeholder="Contoh: Garuda SC Buleleng"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pelatih
                </label>
                <input
                  type="text"
                  value={formPelatih}
                  onChange={e => setFormPelatih(e.target.value)}
                  placeholder="Contoh: Coach Wayan Sudira"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-md shadow-cyan-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Data Atlet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

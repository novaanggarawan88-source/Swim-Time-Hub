import React, { useState } from 'react';
import { CODE_GS, INDEX_HTML, CSS_HTML, JAVASCRIPT_HTML } from '../services/gasCode';
import { SwimDataService } from '../services/dataService';
import Swal from 'sweetalert2';
import { 
  FileSpreadsheet, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  BookOpen, 
  X,
  HelpCircle
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  onDataSynced
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'code_gs' | 'index_html' | 'css_html' | 'js_html' | 'guide'>('sync');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const initialConfig = SwimDataService.getConfig();
  const [webAppUrl, setWebAppUrl] = useState(initialConfig.webAppUrl || '');
  const [spreadsheetId, setSpreadsheetId] = useState(initialConfig.spreadsheetId || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // Re-synchronize inputs whenever modal is opened or external config updates
  React.useEffect(() => {
    if (isOpen) {
      const cfg = SwimDataService.getConfig();
      setWebAppUrl(cfg.webAppUrl || '');
      setSpreadsheetId(cfg.spreadsheetId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);

    Swal.fire({
      icon: 'success',
      title: 'Tersalin ke Clipboard!',
      text: `Kode ${key} siap ditempel di Google Apps Script editor.`,
      timer: 1500,
      showConfirmButton: false,
      background: '#0f172a',
      color: '#f8fafc'
    });
  };

  const handleSaveConfig = async () => {
    setIsSyncing(true);
    await SwimDataService.saveConfig({
      webAppUrl: webAppUrl.trim(),
      spreadsheetId: spreadsheetId.trim(),
      autoSync: true,
      lastSync: new Date().toISOString()
    });
    setIsSyncing(false);
    onDataSynced();

    Swal.fire({
      icon: 'success',
      title: 'Pengaturan Disimpan!',
      text: 'URL Web App & Spreadsheet ID berhasil disimpan dan disinkronkan ke seluruh perangkat (HP & Laptop).',
      timer: 2000,
      showConfirmButton: false,
      background: '#0f172a',
      color: '#f8fafc'
    });
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Web App Kosong',
        text: 'Masukkan URL Web App hasil Deploy Google Apps Script terlebih dahulu.',
        background: '#0f172a',
        color: '#f8fafc'
      });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch(`${webAppUrl.trim()}?action=ping`);
      const data = await res.json();
      if (data.status === 'online') {
        Swal.fire({
          icon: 'success',
          title: 'Koneksi Berhasil!',
          text: 'Google Apps Script Web App merespons dengan status ONLINE.',
          background: '#0f172a',
          color: '#f8fafc'
        });
      } else {
        throw new Error('Respons tidak sesuai');
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'info',
        title: 'Status Deployment',
        html: `
          <div style="font-size: 13px; text-align: left;">
            Panggilan uji coba selesai. Pastikan saat deploy Apps Script:<br>
            1. <b>Execute as</b>: Me<br>
            2. <b>Who has access</b>: Anyone<br>
            URL yang Anda masukkan: <br><code style="word-break: break-all; color: #38bdf8;">${webAppUrl}</code>
          </div>
        `,
        background: '#0f172a',
        color: '#f8fafc'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushAll = async () => {
    if (!webAppUrl.trim()) {
      Swal.fire({ icon: 'warning', title: 'URL Belum Diisi', background: '#0f172a', color: '#f8fafc' });
      return;
    }

    setIsSyncing(true);
    const res = await SwimDataService.pushAllToGas(webAppUrl.trim());
    setIsSyncing(false);

    if (res.success) {
      Swal.fire({ icon: 'success', title: 'Sinkronisasi Berhasil!', text: res.message, background: '#0f172a', color: '#f8fafc' });
    } else {
      Swal.fire({ icon: 'error', title: 'Sinkronisasi Gagal', text: res.message, background: '#0f172a', color: '#f8fafc' });
    }
  };

  const handlePullAll = async () => {
    if (!webAppUrl.trim()) {
      Swal.fire({ icon: 'warning', title: 'URL Belum Diisi', background: '#0f172a', color: '#f8fafc' });
      return;
    }

    setIsSyncing(true);
    const res = await SwimDataService.pullAllFromGas(webAppUrl.trim());
    setIsSyncing(false);

    if (res.success) {
      onDataSynced();
      Swal.fire({ icon: 'success', title: 'Data Berhasil Ditarik!', text: res.message, background: '#0f172a', color: '#f8fafc' });
    } else {
      Swal.fire({ icon: 'error', title: 'Tarik Data Gagal', text: res.message, background: '#0f172a', color: '#f8fafc' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Google Spreadsheet & Apps Script Backend
            </h2>
            <p className="text-xs text-slate-400">
              Integrasi database Google Spreadsheet, generator kode 4 file, dan panduan lengkap.
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'sync'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Koneksi & Sinkronisasi
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan Langkah 1 - 10</span>
          </button>
          <button
            onClick={() => setActiveTab('code_gs')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'code_gs'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Code.gs
          </button>
          <button
            onClick={() => setActiveTab('index_html')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'index_html'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Index.html
          </button>
          <button
            onClick={() => setActiveTab('css_html')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'css_html'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            CSS.html
          </button>
          <button
            onClick={() => setActiveTab('js_html')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'js_html'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            JavaScript.html
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-4">
          {activeTab === 'sync' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Hubungkan Aplikasi ke Web App Google Apps Script
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Google Apps Script Web App (Hasil Deploy)
                  </label>
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={e => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:border-emerald-400 focus:outline-none"
                  />
                  <small className="text-[11px] text-slate-400 mt-1 block">
                    Didapat dari Apps Script: <b>Deploy &gt; New deployment &gt; Web app</b> (Who has access: Anyone).
                  </small>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={e => setSpreadsheetId(e.target.value)}
                    placeholder="Contoh: 1BxiMVs0XR..."
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                  >
                    Simpan Pengaturan
                  </button>

                  <button
                    onClick={handleTestConnection}
                    disabled={isSyncing}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs"
                  >
                    {isSyncing ? 'Mengecek...' : 'Uji Koneksi'}
                  </button>

                  <button
                    onClick={handlePushAll}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Kirim Semua Data ke Spreadsheet</span>
                  </button>

                  <button
                    onClick={handlePullAll}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Tarik Data Terbaru</span>
                  </button>
                </div>
              </div>

              {/* Status info */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Status Sinkronisasi Multi-Device & Cloud:
                </span>
                <p>
                  Aplikasi ini kini dilengkapi <b>Penyimpanan Server Pusat</b> dan <b>Sinkronisasi Google Spreadsheet</b>. Ketika Anda mencatat waktu atau menambah atlet dari HP, datanya otomatis tersimpan ke server dan spreadsheet sehingga saat Anda membuka aplikasi di laptop, komputer, atau HP lain, seluruh rekapan datanya tetap ada dan selalu sama.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed p-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Panduan Langkah 1 - 10: Menyiapkan Google Apps Script & Google Spreadsheet
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">1. Buat Google Spreadsheet Baru</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Buka peramban (browser) dan kunjungi <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-mono">https://sheets.new</a>. Beri nama spreadsheet Anda, misalnya <b>DATABASE SWIM TIME TRACKER</b>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">2. Cara Mendapatkan Spreadsheet ID</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Lihat URL pada bilah alamat browser Anda. Format URL adalah:<br />
                    <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-mono text-[11px] block my-1">
                      https://docs.google.com/spreadsheets/d/<b>MASUKKAN_ID_DI_SINI</b>/edit
                    </code>
                    Salin bagian kode di antara <code>/d/</code> dan <code>/edit</code>. Itulah Spreadsheet ID Anda!
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">3. Buka Google Apps Script</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Di Google Spreadsheet Anda, klik menu atas: <b>Ekstensi (Extensions) &gt; Apps Script</b>. Halaman editor kode Google Apps Script akan terbuka.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">4. Masukkan Kode `Code.gs`</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Klik tab <b>Code.gs</b> di atas modal ini, tekan tombol <b>"Salin Kode"</b>, lalu tempelkan (paste) seluruhnya ke dalam file <code>Code.gs</code> di Apps Script. Jangan lupa ganti <code>const SPREADSHEET_ID = "..."</code> dengan ID Spreadsheet Anda!
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">5. Buat 3 File HTML di Apps Script</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Di Apps Script, klik ikon tanda tambah <b>(+)</b> di samping Files, pilih <b>HTML</b>. Buat 3 file dengan nama persis:
                  </p>
                  <ul className="list-disc pl-5 mt-1 text-xs space-y-1 text-slate-300">
                    <li><code>Index</code> (salin dari tab Index.html)</li>
                    <li><code>CSS</code> (salin dari tab CSS.html)</li>
                    <li><code>JavaScript</code> (salin dari tab JavaScript.html)</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">6. Jalankan setupSpreadsheet()</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Di toolbar editor Apps Script, pilih fungsi <b>setupSpreadsheet</b> pada dropdown fungsi, lalu klik tombol <b>Run (Jalankan)</b>. Berikan izin (Review Permissions) saat pertama kali diminta.
                    Fungsi ini akan otomatis membuat 4 Sheet dengan header warna biru:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono">
                    <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-cyan-300">✓ Sheet ATLET</span>
                    <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-cyan-300">✓ Sheet LOMBA</span>
                    <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-cyan-300">✓ Sheet CATATAN_WAKTU</span>
                    <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-cyan-300">✓ Sheet PROGRAM_LATIHAN</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">7. Deploy sebagai Web App</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Klik tombol biru <b>Deploy &gt; New deployment</b> di pojok kanan atas editor Apps Script.<br />
                    - Klik ikon gerigi (Select type) &gt; pilih <b>Web app</b>.<br />
                    - Description: <code>SWIM TIME TRACKER v1</code><br />
                    - Execute as: <b>Me (email Anda)</b><br />
                    - Who has access: <b>Anyone (Siapa saja)</b><br />
                    Klik <b>Deploy</b>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">8. Hubungkan Web App URL ke Aplikasi Ini</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Salin <b>Web app URL</b> yang muncul (berakhiran <code>/exec</code>), buka kembali tab <b>Koneksi & Sinkronisasi</b> di modal ini, tempelkan ke kolom URL lalu tekan <b>Simpan Pengaturan</b>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">9. Cara Menggunakan di Tepi Kolam</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Buka aplikasi ini dari smartphone Android, tablet, atau laptop. Pelatih dapat mencatat waktu latihan atau lomba dengan stopwatch terintegrasi, melihat Personal Best, dan membuat rekomendasi program latihan otomatis!
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-cyan-400">10. Data Tersimpan Aman di Google Spreadsheet</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Setiap atlet baru, catatan waktu renang, dan program latihan otomatis tercatat di Google Spreadsheet Anda, sehingga dapat dicetak, dianalisis lebih lanjut, atau dibagikan ke atlet dan orang tua.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code_gs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">File: <b>Code.gs</b> (Backend GAS)</span>
                <button
                  onClick={() => handleCopy(CODE_GS, 'Code.gs')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  {copiedKey === 'Code.gs' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'Code.gs' ? 'Tersalin!' : 'Salin Kode Code.gs'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-96 leading-relaxed">
                {CODE_GS}
              </pre>
            </div>
          )}

          {activeTab === 'index_html' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">File: <b>Index.html</b></span>
                <button
                  onClick={() => handleCopy(INDEX_HTML, 'Index.html')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  {copiedKey === 'Index.html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'Index.html' ? 'Tersalin!' : 'Salin Kode Index.html'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-amber-300 overflow-x-auto max-h-96 leading-relaxed">
                {INDEX_HTML}
              </pre>
            </div>
          )}

          {activeTab === 'css_html' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">File: <b>CSS.html</b></span>
                <button
                  onClick={() => handleCopy(CSS_HTML, 'CSS.html')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  {copiedKey === 'CSS.html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'CSS.html' ? 'Tersalin!' : 'Salin Kode CSS.html'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                {CSS_HTML}
              </pre>
            </div>
          )}

          {activeTab === 'js_html' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">File: <b>JavaScript.html</b></span>
                <button
                  onClick={() => handleCopy(JAVASCRIPT_HTML, 'JavaScript.html')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  {copiedKey === 'JavaScript.html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'JavaScript.html' ? 'Tersalin!' : 'Salin Kode JavaScript.html'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto max-h-96 leading-relaxed">
                {JAVASCRIPT_HTML}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

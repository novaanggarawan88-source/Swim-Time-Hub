import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If running in standalone mode (already installed), don't show
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Button for Chromium / Android / Desktop */}
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/30 transition-all active:scale-95 animate-pulse"
          title="Install aplikasi ke Layar Utama HP / Komputer"
        >
          <img src="/logo.png" alt="Logo" className="w-4 h-4 rounded-full object-contain" />
          <span>Install Aplikasi</span>
        </button>
      )}

      {/* Button for iOS Safari */}
      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/50 text-amber-300 text-xs sm:text-sm font-bold transition-all"
          title="Cara Install di iPhone / iPad"
        >
          <img src="/logo.png" alt="Logo" className="w-4 h-4 rounded-full object-contain" />
          <span>Install di iOS</span>
        </button>
      )}

      {/* Fallback button if neither prompted yet (e.g. guide user) */}
      {!isInstallable && !isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          title="Install ke Desktop / Ponsel"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Install App</span>
        </button>
      )}

      {/* Modal / Guide for Home Screen Installation */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <img
                src="/logo.png"
                alt="Garuda SC Logo"
                className="w-20 h-20 rounded-2xl mx-auto shadow-xl border-2 border-amber-500/50 object-contain p-1 bg-slate-950"
              />
              <h3 className="text-lg font-black text-white">
                GARUDA SWIMMING CLUB
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                Install ke Layar Utama (Home Screen)
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Buka peramban (Chrome di Android atau Safari di iPhone).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Tekan tombol <b>Bagikan (Share)</b> atau <b>Menu Titik Tiga (⋮)</b> di browser.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Pilih <b>"Tambahkan ke Layar Utama" (Add to Home Screen)</b> atau <b>"Install App"</b>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </span>
                <span>
                  Aplikasi akan muncul di layar HP Anda dengan logo resmi Garuda SC dan dapat dibuka layaknya aplikasi asli tanpa bar browser!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-md"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

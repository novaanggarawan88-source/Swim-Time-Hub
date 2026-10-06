import React from 'react';
import { 
  Users, 
  Timer, 
  Trophy, 
  TrendingUp, 
  ClipboardList, 
  History, 
  LayoutDashboard, 
  FileSpreadsheet,
  Waves,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  openStopwatchModal: () => void;
  openSheetsModal: () => void;
  hasSheetsUrl: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  openStopwatchModal,
  openSheetsModal,
  hasSheetsUrl
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'atlet', label: 'Data Atlet', icon: Users },
    { id: 'catat', label: 'Catat Waktu', icon: Timer, highlight: true },
    { id: 'lomba', label: 'Data Lomba', icon: Trophy },
    { id: 'pb', label: 'Analisis & PB', icon: TrendingUp },
    { id: 'program', label: 'Program Latihan', icon: ClipboardList },
    { id: 'riwayat', label: 'Riwayat Waktu', icon: History },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-cyan-900/40 shadow-lg shadow-cyan-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/30 text-white">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-200 bg-clip-text text-transparent">
                SWIM TIME TRACKER
              </span>
              <span className="block text-[10px] text-cyan-400/80 font-medium tracking-wider uppercase">
                Poolside Timing & Training System
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  } ${item.highlight ? 'text-cyan-400 hover:text-cyan-300' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Stopwatch & Google Sheets Manager */}
          <div className="flex items-center gap-2">
            {/* Quick Stopwatch Poolside Floating Button */}
            <button
              onClick={openStopwatchModal}
              title="Stopwatch Tepi Kolam"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden sm:inline">Stopwatch Kolam</span>
            </button>

            {/* Google Sheets Status / Manager */}
            <button
              onClick={openSheetsModal}
              title="Pengaturan Google Spreadsheet & Apps Script"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                hasSheetsUrl
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Google Sheets</span>
              <span className={`w-2 h-2 rounded-full ${hasSheetsUrl ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-cyan-900/40 px-4 pt-2 pb-4 space-y-1 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

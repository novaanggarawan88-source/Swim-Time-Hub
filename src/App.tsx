/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SwimDataService } from './services/dataService';
import { Atlet, Lomba, CatatanWaktu, ProgramLatihanItem } from './types/swim';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { DataAtletView } from './components/DataAtletView';
import { DataLombaView } from './components/DataLombaView';
import { CatatWaktuView } from './components/CatatWaktuView';
import { AnalisisDanPBView } from './components/AnalisisDanPBView';
import { ProgramLatihanView } from './components/ProgramLatihanView';
import { RiwayatWaktuView } from './components/RiwayatWaktuView';
import { RekapanSpreadsheetView } from './components/RekapanSpreadsheetView';
import { ProfilAtletModal } from './components/ProfilAtletModal';
import { PoolsideStopwatchModal } from './components/PoolsideStopwatchModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { 
  Timer, 
  LayoutDashboard, 
  Users, 
  Trophy, 
  TrendingUp, 
  ClipboardList, 
  History,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Data States
  const [athletes, setAthletes] = useState<Atlet[]>([]);
  const [competitions, setCompetitions] = useState<Lomba[]>([]);
  const [records, setRecords] = useState<CatatanWaktu[]>([]);
  const [programs, setPrograms] = useState<ProgramLatihanItem[]>([]);
  
  // Modal States
  const [profileSwimmer, setProfileSwimmer] = useState<string | null>(null);
  const [isStopwatchOpen, setIsStopwatchOpen] = useState<boolean>(false);
  const [isSheetsOpen, setIsSheetsOpen] = useState<boolean>(false);
  const [hasSheetsUrl, setHasSheetsUrl] = useState<boolean>(false);

  // Load Initial Data
  const refreshData = () => {
    setAthletes(SwimDataService.getAtlet());
    setCompetitions(SwimDataService.getLomba());
    setRecords(SwimDataService.getCatatanWaktu());
    setPrograms(SwimDataService.getProgramLatihan());
    const cfg = SwimDataService.getConfig();
    setHasSheetsUrl(Boolean(cfg.webAppUrl));
  };

  useEffect(() => {
    refreshData();
    // Fetch central multi-device server data
    SwimDataService.initSync().then(() => {
      refreshData();
    });

    // Subscribe to cross-tab or server-sync data changes
    const unsubscribe = SwimDataService.subscribe(() => {
      refreshData();
    });

    return () => unsubscribe();
  }, []);

  // Data Actions
  const handleSaveAthlete = (data: Partial<Atlet>) => {
    SwimDataService.saveAtlet(data);
    refreshData();
  };

  const handleToggleStatus = (id: string) => {
    SwimDataService.toggleStatusAtlet(id);
    refreshData();
  };

  const handleSaveLomba = (data: Partial<Lomba>) => {
    SwimDataService.saveLomba(data);
    refreshData();
  };

  const handleSaveRecord = (data: Partial<CatatanWaktu>) => {
    const result = SwimDataService.saveCatatanWaktu(data);
    refreshData();
    return result;
  };

  const handleDeleteRecord = (id: string) => {
    SwimDataService.deleteCatatanWaktu(id);
    refreshData();
  };

  const handleSaveProgram = (items: ProgramLatihanItem[]) => {
    const result = SwimDataService.saveProgramLatihan(items);
    refreshData();
    return result;
  };

  const handleTransferStopwatchTime = (timeFormatted: string) => {
    setCurrentTab('catat');
    // time will be accessible or transferred
  };

  const distinctAthleteNames = Array.from(new Set(athletes.map(a => a.nama)));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white pb-20 lg:pb-8">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        openStopwatchModal={() => setIsStopwatchOpen(true)}
        openSheetsModal={() => setIsSheetsOpen(true)}
        hasSheetsUrl={hasSheetsUrl}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            athletes={athletes}
            competitions={competitions}
            records={records}
            onNavigate={setCurrentTab}
            onSelectAthlete={name => setProfileSwimmer(name)}
          />
        )}

        {currentTab === 'atlet' && (
          <DataAtletView
            athletes={athletes}
            onSaveAthlete={handleSaveAthlete}
            onToggleStatus={handleToggleStatus}
            onViewProfile={name => setProfileSwimmer(name)}
          />
        )}

        {currentTab === 'catat' && (
          <CatatWaktuView
            athletes={athletes}
            competitions={competitions}
            allRecords={records}
            onSaveRecord={handleSaveRecord}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'lomba' && (
          <DataLombaView
            competitions={competitions}
            records={records}
            onSaveLomba={handleSaveLomba}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'pb' && (
          <AnalisisDanPBView
            records={records}
            onSelectAthlete={name => setProfileSwimmer(name)}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'program' && (
          <ProgramLatihanView
            athletes={athletes}
            records={records}
            savedPrograms={programs}
            onSaveProgram={handleSaveProgram}
          />
        )}

        {currentTab === 'riwayat' && (
          <RiwayatWaktuView
            records={records}
            athletes={distinctAthleteNames}
            onDeleteRecord={handleDeleteRecord}
            onSelectAthlete={name => setProfileSwimmer(name)}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'spreadsheet' && (
          <RekapanSpreadsheetView
            athletes={athletes}
            competitions={competitions}
            records={records}
            programs={programs}
            onOpenSettings={() => setIsSheetsOpen(true)}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (Designed specifically for coach poolside single-hand tapping) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-cyan-900/50 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-bold ${
            currentTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('atlet')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-bold ${
            currentTab === 'atlet' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Atlet</span>
        </button>

        {/* Big Center Action Button: Catat Waktu */}
        <button
          onClick={() => setCurrentTab('catat')}
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/40 border-2 border-slate-900 active:scale-95 transition-all">
            <Timer className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-extrabold text-cyan-300 mt-1">Catat</span>
        </button>

        <button
          onClick={() => setCurrentTab('program')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-bold ${
            currentTab === 'program' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span>Program</span>
        </button>

        <button
          onClick={() => setCurrentTab('spreadsheet')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-bold ${
            currentTab === 'spreadsheet' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5 text-emerald-400" />
          <span>Sheet</span>
        </button>

        <button
          onClick={() => setCurrentTab('riwayat')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-bold ${
            currentTab === 'riwayat' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span>Riwayat</span>
        </button>
      </nav>

      {/* Athlete Profile Modal */}
      {profileSwimmer && (
        <ProfilAtletModal
          athleteName={profileSwimmer}
          athletes={athletes}
          records={records}
          onClose={() => setProfileSwimmer(null)}
          onNavigateToProgram={atlet => {
            setCurrentTab('program');
            setProfileSwimmer(null);
          }}
        />
      )}

      {/* Poolside Stopwatch Modal */}
      <PoolsideStopwatchModal
        isOpen={isStopwatchOpen}
        onClose={() => setIsStopwatchOpen(false)}
        onTransferTime={handleTransferStopwatchTime}
      />

      {/* Google Sheets Hub & Code Exporter Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsOpen}
        onClose={() => setIsSheetsOpen(false)}
        onDataSynced={refreshData}
      />
    </div>
  );
}

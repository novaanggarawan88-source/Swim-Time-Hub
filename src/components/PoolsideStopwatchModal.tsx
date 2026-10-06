import React, { useState, useEffect, useRef } from 'react';
import { secondsToTimeString } from '../utils/timeUtils';
import { Timer, Play, Square, RotateCcw, Flag, X, ArrowRight } from 'lucide-react';

interface PoolsideStopwatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferTime: (timeFormatted: string) => void;
}

interface LapRecord {
  lap: number;
  lapTime: string;
  totalTime: string;
}

export const PoolsideStopwatchModal: React.FC<PoolsideStopwatchModalProps> = ({
  isOpen,
  onClose,
  onTransferTime
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const lastLapTimeRef = useRef<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - timeMs;
      timerRef.current = setInterval(() => {
        setTimeMs(Date.now() - startTime);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  if (!isOpen) return null;

  const formattedTime = secondsToTimeString(timeMs / 1000);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeMs(0);
    setLaps([]);
    lastLapTimeRef.current = 0;
  };

  const handleLap = () => {
    if (timeMs === 0) return;
    const currentMs = timeMs;
    const lapDiff = currentMs - lastLapTimeRef.current;
    lastLapTimeRef.current = currentMs;

    setLaps(prev => [
      {
        lap: prev.length + 1,
        lapTime: secondsToTimeString(lapDiff / 1000),
        totalTime: secondsToTimeString(currentMs / 1000)
      },
      ...prev
    ]);
  };

  const handleSendToForm = () => {
    onTransferTime(formattedTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 text-cyan-400 font-extrabold text-sm uppercase tracking-wider">
          <Timer className="w-5 h-5 animate-pulse" />
          <span>Stopwatch Presisi Tepi Kolam</span>
        </div>

        {/* Huge Digital Clock */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-cyan-500/30 shadow-inner">
          <span className="font-mono text-5xl sm:text-6xl font-black text-cyan-300 tracking-wider select-none">
            {formattedTime}
          </span>
          <span className="block text-[11px] text-slate-500 mt-2 font-mono">
            MENIT : DETIK . RATUSAN DETIK
          </span>
        </div>

        {/* Big Touch Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleStartStop}
            className={`py-4 rounded-2xl font-black text-lg text-white shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-1 ${
              isRunning ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isRunning ? <Square className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            <span className="text-xs">{isRunning ? 'STOP' : 'START'}</span>
          </button>

          <button
            onClick={handleLap}
            disabled={!isRunning}
            className="py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
          >
            <Flag className="w-6 h-6" />
            <span className="text-xs">SPLIT LAP</span>
          </button>

          <button
            onClick={handleReset}
            className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-lg shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
          >
            <RotateCcw className="w-6 h-6" />
            <span className="text-xs">RESET</span>
          </button>
        </div>

        {/* Send to Form Button */}
        <button
          onClick={handleSendToForm}
          disabled={timeMs === 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Gunakan Waktu ({formattedTime}) di Form</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Laps List */}
        {laps.length > 0 && (
          <div className="max-h-40 overflow-y-auto bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold pb-1">
                  <th className="py-1">Lap #</th>
                  <th className="py-1">Split Lap</th>
                  <th className="py-1 text-right">Total Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {laps.map(l => (
                  <tr key={l.lap} className="text-slate-300">
                    <td className="py-1 text-cyan-400 font-bold">Lap {l.lap}</td>
                    <td className="py-1">{l.lapTime}</td>
                    <td className="py-1 text-right font-bold text-white">{l.totalTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CatatanWaktu, GayaRenang, JarakRenang } from '../types/swim';
import { secondsToTimeString, formatDateIndo } from '../utils/timeUtils';
import { TrendingDown, Award } from 'lucide-react';

interface SwimProgressChartProps {
  records: CatatanWaktu[];
  athletes: string[];
}

export const SwimProgressChart: React.FC<SwimProgressChartProps> = ({ records, athletes }) => {
  const [selectedAthlete, setSelectedAthlete] = useState<string>(athletes[0] || 'Andi Pratama');
  const [selectedGaya, setSelectedGaya] = useState<GayaRenang>('Bebas');
  const [selectedJarak, setSelectedJarak] = useState<JarakRenang>('50 m');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter records for this chart
  const filtered = records
    .filter(
      r => r.atlet.toLowerCase() === selectedAthlete.toLowerCase() &&
           r.gaya === selectedGaya &&
           r.jarak === selectedJarak
    )
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  if (filtered.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 text-center">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-cyan-400" />
            Grafik Perkembangan Waktu Renang
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedAthlete}
              onChange={e => setSelectedAthlete(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-400 focus:outline-none"
            >
              {athletes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              value={selectedGaya}
              onChange={e => setSelectedGaya(e.target.value as GayaRenang)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-400 focus:outline-none"
            >
              <option value="Bebas">Gaya Bebas</option>
              <option value="Dada">Gaya Dada</option>
              <option value="Punggung">Gaya Punggung</option>
              <option value="Kupu-kupu">Gaya Kupu-kupu</option>
              <option value="Gaya Ganti">Gaya Ganti</option>
            </select>
            <select
              value={selectedJarak}
              onChange={e => setSelectedJarak(e.target.value as JarakRenang)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-400 focus:outline-none"
            >
              <option value="25 m">25 m</option>
              <option value="50 m">50 m</option>
              <option value="100 m">100 m</option>
              <option value="200 m">200 m</option>
              <option value="400 m">400 m</option>
            </select>
          </div>
        </div>
        <p className="text-slate-400 text-sm py-8">
          Belum ada catatan waktu untuk <span className="text-cyan-300 font-semibold">{selectedAthlete}</span> pada nomor {selectedGaya} {selectedJarak}.
        </p>
      </div>
    );
  }

  // Calculate coordinates
  const times = filtered.map(f => f.waktuDetik);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeSpread = Math.max(maxTime - minTime, 1.5);
  const yPadding = timeSpread * 0.2;
  const yMin = Math.max(0, minTime - yPadding);
  const yMax = maxTime + yPadding;

  const width = 680;
  const height = 240;
  const paddingX = 50;
  const paddingY = 35;

  const getX = (index: number) => {
    if (filtered.length <= 1) return width / 2;
    return paddingX + (index / (filtered.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    return height - paddingY - ((val - yMin) / (yMax - yMin)) * (height - paddingY * 2);
  };

  // Build SVG path
  const points = filtered.map((f, i) => `${getX(i)},${getY(f.waktuDetik)}`);
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${getX(filtered.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  const pbItem = filtered.reduce((prev, curr) => (curr.waktuDetik < prev.waktuDetik ? curr : prev), filtered[0]);

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-cyan-400" />
              Grafik Perkembangan Waktu Renang
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {filtered.length} Catatan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Grafik kurva waktu: Semakin turun kurva, semakin cepat catatan waktu atlet (Perbaikan Waktu).
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAthlete}
            onChange={e => setSelectedAthlete(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:border-cyan-400 focus:outline-none"
          >
            {athletes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={selectedGaya}
            onChange={e => setSelectedGaya(e.target.value as GayaRenang)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:border-cyan-400 focus:outline-none"
          >
            <option value="Bebas">Gaya Bebas</option>
            <option value="Dada">Gaya Dada</option>
            <option value="Punggung">Gaya Punggung</option>
            <option value="Kupu-kupu">Gaya Kupu-kupu</option>
            <option value="Gaya Ganti">Gaya Ganti</option>
          </select>
          <select
            value={selectedJarak}
            onChange={e => setSelectedJarak(e.target.value as JarakRenang)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:border-cyan-400 focus:outline-none"
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
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs">
        <div>
          <span className="text-slate-400 block">Personal Best (PB):</span>
          <span className="text-amber-400 font-extrabold text-sm font-mono flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            {pbItem.waktu} ({pbItem.waktuDetik}s)
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Waktu Terakhir:</span>
          <span className="text-cyan-400 font-bold text-sm font-mono">
            {filtered[filtered.length - 1].waktu}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Rata-rata:</span>
          <span className="text-slate-200 font-bold text-sm font-mono">
            {secondsToTimeString(Number((times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)))}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Perkembangan Total:</span>
          {times.length > 1 ? (
            <span className={`font-bold text-sm font-mono ${times[times.length - 1] <= times[0] ? 'text-emerald-400' : 'text-rose-400'}`}>
              {times[times.length - 1] <= times[0] ? '▼ Lebih Cepat ' : '▲ Lebih Lambat '}
              {Math.abs(Number((times[times.length - 1] - times[0]).toFixed(2)))}s
            </span>
          ) : (
            <span className="text-slate-400">1 Catatan</span>
          )}
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] overflow-visible"
        >
          <defs>
            <linearGradient id="swimGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const yVal = yMin + (yMax - yMin) * pct;
            const yPos = getY(yVal);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={width - paddingX}
                  y2={yPos}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={yPos + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {secondsToTimeString(yVal)}
                </text>
              </g>
            );
          })}

          {/* PB Horizontal Reference Line */}
          <line
            x1={paddingX}
            y1={getY(pbItem.waktuDetik)}
            x2={width - paddingX}
            y2={getY(pbItem.waktuDetik)}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            strokeWidth="1.5"
            opacity="0.8"
          />
          <text
            x={width - paddingX + 5}
            y={getY(pbItem.waktuDetik) + 3}
            fill="#f59e0b"
            fontSize="9"
            fontWeight="bold"
          >
            PB: {pbItem.waktu}
          </text>

          {/* Area fill */}
          {filtered.length > 1 && (
            <path d={areaD} fill="url(#swimGradient)" />
          )}

          {/* Progression line */}
          {filtered.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#lineStroke)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {filtered.map((item, index) => {
            const cx = getX(index);
            const cy = getY(item.waktuDetik);
            const isPb = item.waktuDetik === pbItem.waktuDetik;
            const isHovered = hoveredIndex === index;

            return (
              <g key={item.id} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle cx={cx} cy={cy} r="10" fill="#38bdf8" opacity="0.3" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isPb ? 6 : 4.5}
                  fill={isPb ? '#f59e0b' : item.jenis === 'Lomba' ? '#38bdf8' : '#0284c7'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                {/* Date labels on bottom axis */}
                <text
                  x={cx}
                  y={height - 8}
                  fill={isHovered ? '#38bdf8' : '#94a3b8'}
                  fontSize="9"
                  textAnchor="middle"
                >
                  {formatDateIndo(item.tanggal)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredIndex !== null && filtered[hoveredIndex] && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-500/60 text-slate-100 text-xs px-3 py-1.5 rounded-lg shadow-2xl pointer-events-none flex items-center gap-3 z-20">
            <span className="font-semibold">{formatDateIndo(filtered[hoveredIndex].tanggal)}</span>
            <span className="text-cyan-400 font-mono font-bold">{filtered[hoveredIndex].waktu}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${filtered[hoveredIndex].jenis === 'Lomba' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
              {filtered[hoveredIndex].jenis} {filtered[hoveredIndex].namaLomba ? `(${filtered[hoveredIndex].namaLomba})` : ''}
            </span>
            {filtered[hoveredIndex].waktuDetik === pbItem.waktuDetik && (
              <span className="text-amber-400 font-bold flex items-center gap-1">★ PB</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

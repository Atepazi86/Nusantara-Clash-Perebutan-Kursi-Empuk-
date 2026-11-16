import React from 'react';
import { ArenaBackdropId } from '../types/game';

interface StageBackdropProps {
  backdrop: ArenaBackdropId;
  className?: string;
}

export const BACKDROP_NAMES: Record<ArenaBackdropId, string> = {
  bundaran_hi: 'Bundaran HI Kartun',
  angkringan: 'Angkringan Tengah Malam',
  gerbang_dpr: 'Depan Gerbang DPR',
  ikn_masa_depan: 'Proyek IKN Masa Depan',
};

export const StageBackdrop: React.FC<StageBackdropProps> = ({ backdrop, className = '' }) => {
  if (backdrop === 'bundaran_hi') {
    return (
      <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="skyHI" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
        </defs>
        <rect width="800" height="320" fill="url(#skyHI)" />
        {/* Cartoon Clouds */}
        <g fill="#ffffff" stroke="#1e1e24" strokeWidth="3">
          <path d="M90 70 Q105 45 130 55 Q150 38 175 58 Q195 55 198 75 Z" />
          <path d="M580 55 Q598 34 622 44 Q645 30 666 50 Q686 48 688 66 Z" />
        </g>
        {/* City skyline silhouettes */}
        <g stroke="#1e1e24" strokeWidth="3">
          <rect x="40" y="95" width="75" height="140" fill="#cbd5e1" rx="4" />
          <rect x="130" y="70" width="90" height="165" fill="#94a3b8" rx="4" />
          <rect x="570" y="65" width="85" height="170" fill="#94a3b8" rx="4" />
          <rect x="670" y="105" width="85" height="130" fill="#cbd5e1" rx="4" />
        </g>
        {/* Welcome Monument / Tugu Selamat Datang */}
        <g stroke="#1e1e24" strokeWidth="3">
          <ellipse cx="400" cy="212" rx="135" ry="26" fill="#38bdf8" />
          <ellipse cx="400" cy="218" rx="145" ry="28" fill="none" stroke="#1e1e24" strokeWidth="3" />
          <rect x="376" y="110" width="48" height="100" fill="#e2e8f0" rx="6" />
          <rect x="386" y="122" width="28" height="75" fill="#f8fafc" />
          {/* Two little waving figures on top */}
          <circle cx="391" cy="96" r="8" fill="#fbbf24" />
          <circle cx="409" cy="96" r="8" fill="#fbbf24" />
          <path d="M385 110 L380 86 M415 110 L420 86" stroke="#1e1e24" strokeWidth="4" strokeLinecap="round" />
        </g>
        {/* Asphalt & Sidewalk */}
        <rect x="0" y="232" width="800" height="88" fill="#475569" />
        <line x1="0" y1="232" x2="800" y2="232" stroke="#1e1e24" strokeWidth="4" />
        <line x1="0" y1="274" x2="800" y2="274" stroke="#facc15" strokeWidth="4" strokeDasharray="24 18" />
      </svg>
    );
  }

  if (backdrop === 'angkringan') {
    return (
      <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
        </defs>
        <rect width="800" height="320" fill="url(#skyNight)" />
        {/* Moon & Stars */}
        <circle cx="670" cy="65" r="28" fill="#fde047" stroke="#1e1e24" strokeWidth="3" />
        <circle cx="120" cy="52" r="3" fill="#fef08a" />
        <circle cx="240" cy="82" r="2.5" fill="#fef08a" />
        <circle cx="520" cy="48" r="3" fill="#fef08a" />
        {/* Warm Angkringan Tent */}
        <g stroke="#1e1e24" strokeWidth="3">
          <path d="M235 120 L565 120 L590 170 L210 170 Z" fill="#f97316" />
          <rect x="235" y="170" width="330" height="70" fill="#fed7aa" />
          <rect x="265" y="170" width="120" height="55" fill="#78350f" />
          {/* Glowing Hanging Bulbs */}
          <line x1="300" y1="120" x2="300" y2="145" stroke="#1e1e24" strokeWidth="3" />
          <circle cx="300" cy="150" r="9" fill="#fde047" />
          <line x1="500" y1="120" x2="500" y2="145" stroke="#1e1e24" strokeWidth="3" />
          <circle cx="500" cy="150" r="9" fill="#fde047" />
          {/* Banner */}
          <rect x="330" y="132" width="140" height="26" fill="#fef08a" rx="4" />
          <text x="400" y="150" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e1e24" stroke="none">
            WEDANGAN JOSS
          </text>
          {/* Wooden Bench */}
          <rect x="420" y="210" width="120" height="14" fill="#92400e" rx="3" />
        </g>
        {/* Night Street Floor */}
        <rect x="0" y="238" width="800" height="82" fill="#334155" />
        <line x1="0" y1="238" x2="800" y2="238" stroke="#1e1e24" strokeWidth="4" />
      </svg>
    );
  }

  if (backdrop === 'gerbang_dpr') {
    return (
      <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="skyDPR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
        </defs>
        <rect width="800" height="320" fill="url(#skyDPR)" />
        {/* Iconic Twin Turtle Dome Roof */}
        <g stroke="#1e1e24" strokeWidth="3">
          <path d="M210 190 Q310 75 400 135 Q490 75 590 190 Z" fill="#10b981" />
          <rect x="200" y="185" width="400" height="50" fill="#f1f5f9" />
          {/* Pillars */}
          <rect x="240" y="185" width="16" height="50" fill="#cbd5e1" />
          <rect x="320" y="185" width="16" height="50" fill="#cbd5e1" />
          <rect x="464" y="185" width="16" height="50" fill="#cbd5e1" />
          <rect x="544" y="185" width="16" height="50" fill="#cbd5e1" />
          {/* Iron Fence */}
          <rect x="30" y="205" width="740" height="30" fill="none" stroke="#1e1e24" strokeWidth="3" />
          {[80, 140, 200, 260, 320, 380, 440, 500, 560, 620, 680, 740].map((x) => (
            <line key={x} x1={x} y1="198" x2={x} y2="235" stroke="#1e1e24" strokeWidth="3" />
          ))}
        </g>
        {/* Flag Pole */}
        <line x1="120" y1="80" x2="120" y2="235" stroke="#1e1e24" strokeWidth="4" />
        <rect x="120" y="82" width="46" height="15" fill="#ef4444" stroke="#1e1e24" strokeWidth="2.5" />
        <rect x="120" y="97" width="46" height="15" fill="#ffffff" stroke="#1e1e24" strokeWidth="2.5" />
        {/* Plaza Ground */}
        <rect x="0" y="235" width="800" height="85" fill="#d6d3d1" />
        <line x1="0" y1="235" x2="800" y2="235" stroke="#1e1e24" strokeWidth="4" />
      </svg>
    );
  }

  // ikn_masa_depan
  return (
    <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="skyIKN" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="65%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>
      <rect width="800" height="320" fill="url(#skyIKN)" />
      {/* Green Forest Hills */}
      <path d="M0 220 Q180 145 380 210 Q590 150 800 215 L800 245 L0 245 Z" fill="#22c55e" stroke="#1e1e24" strokeWidth="3" />
      {/* Stylized Garuda Palace Silhouette */}
      <g stroke="#1e1e24" strokeWidth="3">
        <path d="M250 185 L340 115 L400 140 L460 115 L550 185 L490 215 L310 215 Z" fill="#0d9488" />
        <rect x="355" y="165" width="90" height="65" fill="#f8fafc" rx="6" />
        {/* Futuristic Skyscrapers */}
        <rect x="85" y="135" width="44" height="95" fill="#e0f2fe" rx="4" />
        <rect x="665" y="125" width="50" height="105" fill="#e0f2fe" rx="4" />
      </g>
      {/* Construction Crane in distance */}
      <g stroke="#f59e0b" strokeWidth="4">
        <line x1="615" y1="75" x2="615" y2="210" />
        <line x1="560" y1="88" x2="680" y2="88" />
      </g>
      {/* Clean Future Boulevard */}
      <rect x="0" y="232" width="800" height="88" fill="#cbd5e1" />
      <line x1="0" y1="232" x2="800" y2="232" stroke="#1e1e24" strokeWidth="4" />
      <rect x="0" y="265" width="800" height="12" fill="#34d399" opacity="0.55" />
    </svg>
  );
};

import React from 'react';

interface ChibiAvatarProps {
  characterId: string;
  size?: number;
  className?: string;
  flipX?: boolean;
  bouncy?: boolean;
}

const OUTLINE = '#1e1e24';

export const ChibiAvatar: React.FC<ChibiAvatarProps> = ({
  characterId,
  size = 110,
  className = '',
  flipX = false,
  bouncy = false,
}) => {
  const wrapStyle: React.CSSProperties = {
    width: size,
    height: size,
    transform: flipX ? 'scaleX(-1)' : undefined,
  };

  return (
    <div
      style={wrapStyle}
      className={`inline-flex items-center justify-center select-none ${bouncy ? 'animate-chibi-bounce' : ''} ${className}`}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
        {/* Ground shadow */}
        <ellipse cx="60" cy="112" rx="28" ry="6" fill="#1e1e24" opacity="0.2" />
        {renderCharacterSvg(characterId)}
      </svg>
    </div>
  );
};

function renderCharacterSvg(id: string) {
  switch (id) {
    case 'jenderal_gemoy':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Legs */}
          <rect x="44" y="92" width="12" height="16" rx="5" fill="#d6c5a3" />
          <rect x="64" y="92" width="12" height="16" rx="5" fill="#d6c5a3" />
          <ellipse cx="49" cy="108" rx="8" ry="4" fill="#27272a" />
          <ellipse cx="71" cy="108" rx="8" ry="4" fill="#27272a" />
          {/* Chubby Cream Safari Body */}
          <rect x="33" y="62" width="54" height="36" rx="14" fill="#f3e8c8" />
          {/* Cel shade */}
          <path d="M35 82 Q60 92 85 82 L85 92 Q60 98 35 92 Z" fill="#dfd0a8" stroke="none" />
          {/* Safari Pockets */}
          <rect x="39" y="68" width="14" height="10" rx="2" fill="#e7d8b1" strokeWidth="2.5" />
          <rect x="67" y="68" width="14" height="10" rx="2" fill="#e7d8b1" strokeWidth="2.5" />
          <rect x="39" y="81" width="14" height="10" rx="2" fill="#e7d8b1" strokeWidth="2.5" />
          <rect x="67" y="81" width="14" height="10" rx="2" fill="#e7d8b1" strokeWidth="2.5" />
          {/* Center Collar & Gold Pin */}
          <line x1="60" y1="63" x2="60" y2="96" strokeWidth="2.5" />
          <circle cx="74" cy="64" r="3.5" fill="#facc15" strokeWidth="2" />
          {/* Arms (joget pose!) */}
          <path d="M34 69 Q20 62 24 50" fill="none" strokeWidth="10" stroke={OUTLINE} />
          <path d="M34 69 Q20 62 24 50" fill="none" strokeWidth="5" stroke="#f3e8c8" />
          <circle cx="24" cy="49" r="6" fill="#fbd3b6" />
          <path d="M86 69 Q100 62 96 50" fill="none" strokeWidth="10" stroke={OUTLINE} />
          <path d="M86 69 Q100 62 96 50" fill="none" strokeWidth="5" stroke="#f3e8c8" />
          <circle cx="96" cy="49" r="6" fill="#fbd3b6" />
          {/* Big Chibi Head */}
          <rect x="32" y="20" width="56" height="46" rx="22" fill="#fbd3b6" />
          {/* Rosy Gemoy Cheeks */}
          <ellipse cx="42" cy="48" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.65" stroke="none" />
          <ellipse cx="78" cy="48" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.65" stroke="none" />
          {/* Happy Eyes & Smile */}
          <circle cx="48" cy="42" r="3.2" fill={OUTLINE} stroke="none" />
          <circle cx="72" cy="42" r="3.2" fill={OUTLINE} stroke="none" />
          <path d="M53 50 Q60 56 67 50" fill="none" strokeWidth="3" />
          {/* Tilted Black Peci */}
          <path d="M36 25 Q60 17 84 25 L81 10 Q60 6 39 10 Z" fill="#1e1e24" />
        </g>
      );

    case 'pak_tukang_kayu':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Black Trousers & Shoes */}
          <rect x="46" y="90" width="10" height="18" rx="4" fill="#1f2937" />
          <rect x="64" y="90" width="10" height="18" rx="4" fill="#1f2937" />
          <ellipse cx="50" cy="108" rx="7" ry="4" fill="#111827" />
          <ellipse cx="70" cy="108" rx="7" ry="4" fill="#111827" />
          {/* Slim White Rolled-Up Shirt */}
          <rect x="40" y="62" width="40" height="32" rx="10" fill="#ffffff" />
          <path d="M40 78 L80 78 L80 90 Q60 94 40 90 Z" fill="#e2e8f0" stroke="none" />
          <path d="M52 62 L60 70 L68 62" fill="#f1f5f9" strokeWidth="2.5" />
          {/* Left Arm */}
          <rect x="30" y="65" width="10" height="17" rx="5" fill="#ffffff" />
          <circle cx="35" cy="84" r="5" fill="#f5c6a5" />
          {/* Head */}
          <rect x="35" y="20" width="50" height="44" rx="20" fill="#f5c6a5" />
          {/* Hair */}
          <path d="M36 33 Q38 14 60 15 Q82 14 84 33 Q72 24 60 25 Q48 24 36 33 Z" fill="#27272a" />
          {/* Friendly Eyes & Smile */}
          <circle cx="49" cy="42" r="3" fill={OUTLINE} stroke="none" />
          <circle cx="71" cy="42" r="3" fill={OUTLINE} stroke="none" />
          <path d="M54 51 Q60 55 66 51" fill="none" strokeWidth="2.8" />
          {/* Mini Red Bicycle Prop on right! */}
          <g transform="translate(76, 62)">
            <circle cx="6" cy="24" r="8" fill="none" stroke="#1e1e24" strokeWidth="3" />
            <circle cx="28" cy="24" r="8" fill="none" stroke="#1e1e24" strokeWidth="3" />
            <path d="M6 24 L15 12 L24 12 L28 24 M15 12 L18 24 L6 24" fill="none" stroke="#ef4444" strokeWidth="3" />
            <line x1="22" y1="8" x2="27" y2="8" stroke="#1e1e24" strokeWidth="3" />
          </g>
          {/* Right Hand holding bike */}
          <circle cx="84" cy="78" r="5.5" fill="#f5c6a5" />
        </g>
      );

    case 'ibu_banteng':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Skirt/Trousers */}
          <rect x="43" y="90" width="34" height="14" rx="4" fill="#1e1e24" />
          <ellipse cx="50" cy="107" rx="7" ry="4" fill="#991b1b" />
          <ellipse cx="70" cy="107" rx="7" ry="4" fill="#991b1b" />
          {/* Bold Red Blazer */}
          <rect x="35" y="61" width="50" height="33" rx="12" fill="#dc2626" />
          <path d="M52 61 L60 76 L68 61 Z" fill="#ffffff" />
          <path d="M50 61 L55 77 M70 61 L65 77" stroke="#991b1b" strokeWidth="2.5" />
          {/* Hair Bun (Sanggul) */}
          <circle cx="60" cy="13" r="10" fill="#1e1e24" />
          {/* Head */}
          <rect x="34" y="19" width="52" height="44" rx="20" fill="#fbd3b6" />
          {/* Hair Bangs */}
          <path d="M35 32 Q45 17 60 19 Q75 17 85 32 Q70 25 60 27 Q50 25 35 32 Z" fill="#1e1e24" />
          {/* Stern Eyebrows & Sharp Gaze */}
          <line x1="42" y1="36" x2="53" y2="39" strokeWidth="3" />
          <line x1="78" y1="36" x2="67" y2="39" strokeWidth="3" />
          <circle cx="48" cy="43" r="3" fill={OUTLINE} stroke="none" />
          <circle cx="72" cy="43" r="3" fill={OUTLINE} stroke="none" />
          <line x1="54" y1="53" x2="66" y2="53" strokeWidth="2.8" />
          {/* Command Megaphone in hand */}
          <g transform="translate(79, 58)">
            <path d="M4 12 L22 3 L22 23 L4 16 Z" fill="#facc15" />
            <rect x="0" y="11" width="7" height="7" rx="2" fill="#dc2626" />
          </g>
          <circle cx="82" cy="76" r="5.5" fill="#fbd3b6" />
          <circle cx="34" cy="76" r="5.5" fill="#fbd3b6" />
        </g>
      );

    case 'mas_santuy':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Jeans & Sneakers */}
          <rect x="44" y="90" width="12" height="17" rx="4" fill="#334155" />
          <rect x="64" y="90" width="12" height="17" rx="4" fill="#334155" />
          <ellipse cx="49" cy="108" rx="8" ry="4" fill="#f8fafc" />
          <ellipse cx="71" cy="108" rx="8" ry="4" fill="#f8fafc" />
          {/* Casual Plaid Shirt */}
          <rect x="37" y="62" width="46" height="32" rx="11" fill="#38bdf8" />
          <line x1="49" y1="62" x2="49" y2="94" stroke="#0284c7" strokeWidth="3" />
          <line x1="71" y1="62" x2="71" y2="94" stroke="#0284c7" strokeWidth="3" />
          <line x1="38" y1="77" x2="82" y2="77" stroke="#0284c7" strokeWidth="3" />
          <rect x="37" y="62" width="46" height="32" rx="11" fill="none" stroke={OUTLINE} strokeWidth="3.5" />
          {/* Head */}
          <rect x="34" y="20" width="52" height="44" rx="20" fill="#fbd3b6" />
          {/* Casual Side-part Hair */}
          <path d="M34 34 Q36 14 61 15 Q86 15 86 35 Q73 24 58 28 Q45 24 34 34 Z" fill="#1e1e24" />
          {/* Chill Half-lidded Eyes */}
          <path d="M43 41 L53 41" strokeWidth="3" />
          <circle cx="48" cy="43" r="2.5" fill={OUTLINE} stroke="none" />
          <path d="M67 41 L77 41" strokeWidth="3" />
          <circle cx="72" cy="43" r="2.5" fill={OUTLINE} stroke="none" />
          <path d="M55 52 Q60 54 66 51" fill="none" strokeWidth="2.6" />
          {/* Milk Carton ("Susu Gratis") */}
          <g transform="translate(80, 56)">
            <rect x="2" y="8" width="18" height="24" rx="3" fill="#ffffff" />
            <path d="M2 8 L11 1 L20 8 Z" fill="#60a5fa" />
            <rect x="2" y="17" width="18" height="8" fill="#3b82f6" stroke="none" />
            <rect x="2" y="8" width="18" height="24" rx="3" fill="none" />
          </g>
          <circle cx="82" cy="79" r="5.5" fill="#fbd3b6" />
          <circle cx="34" cy="77" r="5.5" fill="#fbd3b6" />
        </g>
      );

    case 'juragan_energi':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Trousers */}
          <rect x="44" y="90" width="12" height="17" rx="4" fill="#1e1e24" />
          <rect x="64" y="90" width="12" height="17" rx="4" fill="#1e1e24" />
          <ellipse cx="49" cy="108" rx="8" ry="4" fill="#451a03" />
          <ellipse cx="71" cy="108" rx="8" ry="4" fill="#451a03" />
          {/* Brown-Gold Batik Shirt */}
          <rect x="36" y="61" width="48" height="33" rx="12" fill="#92400e" />
          <circle cx="47" cy="72" r="3" fill="#fbbf24" stroke="none" />
          <circle cx="72" cy="74" r="3" fill="#fbbf24" stroke="none" />
          <circle cx="58" cy="84" r="3.5" fill="#fbbf24" stroke="none" />
          <rect x="36" y="61" width="48" height="33" rx="12" fill="none" />
          {/* Head */}
          <rect x="34" y="20" width="52" height="44" rx="20" fill="#e5b28a" />
          <path d="M35 32 Q42 15 60 15 Q78 15 85 32 Q68 23 60 25 Q52 23 35 32 Z" fill="#1e1e24" />
          {/* Glasses */}
          <rect x="40" y="37" width="16" height="11" rx="4" fill="#ffffff" opacity="0.45" />
          <rect x="64" y="37" width="16" height="11" rx="4" fill="#ffffff" opacity="0.45" />
          <line x1="56" y1="42" x2="64" y2="42" strokeWidth="2.5" />
          <circle cx="48" cy="42" r="2.6" fill={OUTLINE} stroke="none" />
          <circle cx="72" cy="42" r="2.6" fill={OUTLINE} stroke="none" />
          <path d="M54 53 Q61 56 67 52" fill="none" strokeWidth="2.6" />
          {/* Bright Green 3kg Mini Gas Cylinder */}
          <g transform="translate(80, 56)">
            <ellipse cx="14" cy="22" rx="12" ry="13" fill="#4ade80" />
            <rect x="8" y="6" width="12" height="6" rx="2" fill="#22c55e" />
            <circle cx="14" cy="5" r="2.5" fill="#ef4444" />
          </g>
          <circle cx="82" cy="77" r="5.5" fill="#e5b28a" />
          <circle cx="34" cy="77" r="5.5" fill="#e5b28a" />
        </g>
      );

    case 'abang_ojol':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Dark Pants & Boots */}
          <rect x="44" y="90" width="12" height="17" rx="4" fill="#1e293b" />
          <rect x="64" y="90" width="12" height="17" rx="4" fill="#1e293b" />
          <ellipse cx="49" cy="108" rx="8" ry="4" fill="#0f172a" />
          <ellipse cx="71" cy="108" rx="8" ry="4" fill="#0f172a" />
          {/* Bright Emerald Ojol Jacket */}
          <rect x="35" y="62" width="50" height="32" rx="12" fill="#10b981" />
          <rect x="52" y="62" width="16" height="32" fill="#064e3b" />
          <line x1="60" y1="62" x2="60" y2="94" stroke="#ffffff" strokeWidth="2" />
          {/* Head */}
          <rect x="34" y="21" width="52" height="43" rx="20" fill="#f5c6a5" />
          {/* Green Half-Face Helmet + Visor */}
          <path d="M31 40 Q32 10 60 10 Q88 10 89 40 Z" fill="#10b981" />
          <rect x="38" y="29" width="44" height="11" rx="5" fill="#0f172a" opacity="0.85" />
          <line x1="43" y1="33" x2="54" y2="33" stroke="#38bdf8" strokeWidth="2.5" />
          <path d="M54 53 Q60 58 66 53" fill="none" strokeWidth="2.8" />
          {/* Smartphone Order Prop */}
          <rect x="83" y="58" width="14" height="22" rx="3" fill="#38bdf8" />
          <circle cx="82" cy="76" r="5.5" fill="#1e1e24" />
          <circle cx="34" cy="76" r="5.5" fill="#1e1e24" />
        </g>
      );

    case 'ibu_senam':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Tracksuit Pants */}
          <rect x="44" y="90" width="12" height="17" rx="4" fill="#0f766e" />
          <rect x="64" y="90" width="12" height="17" rx="4" fill="#0f766e" />
          <ellipse cx="49" cy="108" rx="8" ry="4" fill="#ec4899" />
          <ellipse cx="71" cy="108" rx="8" ry="4" fill="#ec4899" />
          {/* Vibrant Magenta Tracksuit Jacket */}
          <rect x="35" y="61" width="50" height="33" rx="12" fill="#ec4899" />
          <path d="M36 74 L84 74" stroke="#2dd4bf" strokeWidth="5" />
          <rect x="35" y="61" width="50" height="33" rx="12" fill="none" />
          {/* Head */}
          <rect x="34" y="21" width="52" height="43" rx="20" fill="#fbd3b6" />
          {/* Ponytail & Visor Cap */}
          <circle cx="88" cy="34" r="8" fill="#1e1e24" />
          <path d="M32 30 Q60 18 88 30 L85 20 Q60 12 35 20 Z" fill="#2dd4bf" />
          <path d="M29 31 L65 29" stroke="#0d9488" strokeWidth="6" />
          {/* Energetic Eyes & Whistle */}
          <circle cx="48" cy="43" r="3" fill={OUTLINE} stroke="none" />
          <circle cx="72" cy="43" r="3" fill={OUTLINE} stroke="none" />
          <ellipse cx="60" cy="52" rx="4" ry="3" fill="#fb7185" />
          <circle cx="34" cy="75" r="5.5" fill="#fbd3b6" />
          <circle cx="86" cy="75" r="5.5" fill="#fbd3b6" />
        </g>
      );

    case 'hansip_malam':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Green Uniform Pants & Boots */}
          <rect x="44" y="90" width="12" height="17" rx="4" fill="#15803d" />
          <rect x="64" y="90" width="12" height="17" rx="4" fill="#15803d" />
          <ellipse cx="49" cy="108" rx="8" ry="4" fill="#1e1e24" />
          <ellipse cx="71" cy="108" rx="8" ry="4" fill="#1e1e24" />
          {/* Green Hansip Uniform Shirt */}
          <rect x="35" y="62" width="50" height="32" rx="11" fill="#22c55e" />
          <rect x="35" y="84" width="50" height="6" fill="#1e1e24" />
          <rect x="55" y="83" width="10" height="8" fill="#facc15" />
          {/* Head */}
          <rect x="34" y="21" width="52" height="43" rx="20" fill="#e5b28a" />
          {/* Hansip Cap */}
          <path d="M35 28 Q60 12 85 28 Z" fill="#166534" />
          <path d="M32 29 L78 29" stroke="#1e1e24" strokeWidth="5" />
          {/* Bushy Mustache */}
          <circle cx="48" cy="41" r="3" fill={OUTLINE} stroke="none" />
          <circle cx="72" cy="41" r="3" fill={OUTLINE} stroke="none" />
          <path d="M47 50 Q60 44 73 50 Q60 55 47 50 Z" fill="#1e1e24" />
          {/* Wooden Kentongan */}
          <g transform="translate(82, 46)">
            <rect x="2" y="2" width="12" height="34" rx="4" fill="#b45309" />
            <rect x="6" y="10" width="4" height="18" rx="1" fill="#451a03" stroke="none" />
          </g>
          <circle cx="83" cy="74" r="5.5" fill="#e5b28a" />
          <circle cx="34" cy="76" r="5.5" fill="#e5b28a" />
        </g>
      );

    // Enemy Units & Raid Bosses
    case 'boss_inflasi':
      return (
        <g stroke={OUTLINE} strokeWidth="3.8" strokeLinejoin="round" strokeLinecap="round">
          <ellipse cx="60" cy="68" rx="38" ry="34" fill="#ef4444" />
          <path d="M32 45 Q45 14 60 30 Q76 12 88 45" fill="#f97316" />
          {/* Angry Eyes */}
          <line x1="39" y1="54" x2="54" y2="60" strokeWidth="4" />
          <line x1="81" y1="54" x2="66" y2="60" strokeWidth="4" />
          <circle cx="47" cy="64" r="4.5" fill="#fef08a" />
          <circle cx="73" cy="64" r="4.5" fill="#fef08a" />
          {/* Jagged Mouth */}
          <path d="M42 80 L48 75 L54 81 L60 75 L66 81 L72 75 L78 80" fill="none" strokeWidth="3.5" />
          {/* Floating Up-Arrow Horns */}
          <text x="60" y="28" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#fef08a" stroke={OUTLINE} strokeWidth="1">
            Rp↑↑
          </text>
        </g>
      );

    case 'boss_mangkrak':
      return (
        <g stroke={OUTLINE} strokeWidth="3.8" strokeLinejoin="round" strokeLinecap="round">
          {/* Concrete Block Golem */}
          <rect x="24" y="30" width="72" height="72" rx="10" fill="#94a3b8" />
          <rect x="30" y="36" width="60" height="22" fill="#cbd5e1" stroke="none" />
          {/* Rebar Hair */}
          <path d="M38 30 L34 12 M54 30 L56 10 M72 30 L78 13" stroke="#b45309" strokeWidth="4.5" />
          {/* Glowing Red Eyes */}
          <rect x="37" y="54" width="14" height="9" rx="2" fill="#ef4444" />
          <rect x="69" y="54" width="14" height="9" rx="2" fill="#ef4444" />
          {/* Caution Tape Belt */}
          <rect x="24" y="78" width="72" height="12" fill="#facc15" />
          <path d="M32 78 L42 90 M50 78 L60 90 M68 78 L78 90" stroke={OUTLINE} strokeWidth="3" />
        </g>
      );

    case 'buzzer_bot':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          <rect x="42" y="66" width="36" height="34" rx="10" fill="#64748b" />
          <rect x="34" y="24" width="52" height="42" rx="12" fill="#e2e8f0" />
          <line x1="60" y1="24" x2="60" y2="12" strokeWidth="3.5" />
          <circle cx="60" cy="10" r="4.5" fill="#38bdf8" />
          <rect x="42" y="36" width="36" height="16" rx="4" fill="#0f172a" />
          <text x="60" y="48" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#38bdf8" stroke="none">
            #VIRAL
          </text>
        </g>
      );

    case 'preman_parkir':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          <rect x="38" y="64" width="44" height="36" rx="10" fill="#f97316" />
          <rect x="35" y="22" width="50" height="42" rx="18" fill="#e5b28a" />
          <rect x="40" y="36" width="16" height="9" rx="2" fill="#1e1e24" />
          <rect x="64" y="36" width="16" height="9" rx="2" fill="#1e1e24" />
          <line x1="56" y1="40" x2="64" y2="40" strokeWidth="3" />
          <path d="M52 54 Q60 51 68 54" fill="none" strokeWidth="2.8" />
        </g>
      );

    case 'pengamat_tv':
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          <rect x="38" y="64" width="44" height="36" rx="10" fill="#4f46e5" />
          <rect x="35" y="22" width="50" height="42" rx="18" fill="#fbd3b6" />
          <path d="M36 32 Q60 15 84 32 Z" fill="#475569" />
          <circle cx="48" cy="42" r="6" fill="#ffffff" />
          <circle cx="72" cy="42" r="6" fill="#ffffff" />
          <circle cx="48" cy="42" r="2" fill={OUTLINE} stroke="none" />
          <circle cx="72" cy="42" r="2" fill={OUTLINE} stroke="none" />
          <line x1="54" y1="53" x2="66" y2="53" strokeWidth="2.8" />
        </g>
      );

    default: // calo_proyek & fallback
      return (
        <g stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
          <rect x="38" y="64" width="44" height="36" rx="10" fill="#7c3aed" />
          <rect x="35" y="22" width="50" height="42" rx="18" fill="#f5c6a5" />
          <circle cx="48" cy="42" r="3" fill={OUTLINE} stroke="none" />
          <circle cx="72" cy="42" r="3" fill={OUTLINE} stroke="none" />
          <path d="M52 53 Q60 57 68 53" fill="none" strokeWidth="2.8" />
          <rect x="80" y="68" width="18" height="16" rx="3" fill="#92400e" />
        </g>
      );
  }
}

import React, { useState } from 'react';
import {
  ArrowUpCircle,
  Check,
  Heart,
  Lock,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sword,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { CHARACTER_MAP, CHARACTER_POOL, RARITY_CONFIG } from '../data/characters';
import { PlayerSaveData } from '../types/game';
import { soundFX } from '../utils/sound';
import {
  computeCharacterStats,
  getBlessingUpgradeCost,
  getLevelUpCost,
  getMultiLevelCost,
  getStarUpgradeShards,
  MAX_LEVEL,
  MAX_STARS,
} from '../utils/stats';
import { ChibiAvatar } from './ChibiAvatar';
import { TeamEditorModal } from './TeamEditorModal';

interface CharacterTabProps {
  save: PlayerSaveData;
  onUpdateSave: (updater: (prev: PlayerSaveData) => PlayerSaveData) => void;
  onGoToGacha: () => void;
}

type InspectModal =
  | { kind: 'skill'; idx: number }
  | { kind: 'blessing'; idx: 0 | 1 | 2 }
  | null;

export const CharacterTab: React.FC<CharacterTabProps> = ({ save, onUpdateSave, onGoToGacha }) => {
  const [selectedId, setSelectedId] = useState<string>(save.partyIds[0] || CHARACTER_POOL[0].id);
  const [inspect, setInspect] = useState<InspectModal>(null);
  const [teamEditorOpen, setTeamEditorOpen] = useState(false);
  const [dragHoverSlot, setDragHoverSlot] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const tpl = CHARACTER_MAP[selectedId] || CHARACTER_POOL[0];
  const owned = save.ownedCharacters[tpl.id];
  const rarityCfg = RARITY_CONFIG[tpl.rarity];
  const partyIndex = save.partyIds.indexOf(tpl.id);
  const isDeployed = partyIndex !== -1;

  const stats = owned
    ? computeCharacterStats(owned)
    : {
        hp: tpl.baseStats.hp,
        atk: tpl.baseStats.atk,
        def: tpl.baseStats.def,
        spd: tpl.baseStats.spd,
        critRate: tpl.baseStats.critRate,
        startGauge: 0,
        power: 0,
      };

  const singleLvCost = owned ? getLevelUpCost(owned.level) : 0;
  const multi5 = owned ? getMultiLevelCost(owned.level, 5) : { totalCost: 0, levelsGained: 0 };
  const nextStarShards = owned ? getStarUpgradeShards(owned.stars) : 20;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const handleLevelUp = (count: number) => {
    if (!owned || owned.level >= MAX_LEVEL) return;
    const { totalCost, levelsGained } = getMultiLevelCost(owned.level, count);
    if (levelsGained === 0 || save.coins < totalCost) return;
    soundFX.playLevelUp();
    onUpdateSave((prev) => {
      const char = prev.ownedCharacters[tpl.id];
      if (!char) return prev;
      return {
        ...prev,
        coins: prev.coins - totalCost,
        ownedCharacters: {
          ...prev.ownedCharacters,
          [tpl.id]: { ...char, level: Math.min(MAX_LEVEL, char.level + levelsGained) },
        },
      };
    });
    showToast(`+${levelsGained} Lv!`);
  };

  const handleStarAwaken = () => {
    if (!owned || owned.stars >= MAX_STARS) return;
    const needed = getStarUpgradeShards(owned.stars);
    if (owned.shards < needed) return;
    soundFX.playAwaken();
    onUpdateSave((prev) => {
      const char = prev.ownedCharacters[tpl.id];
      if (!char || char.shards < needed || char.stars >= MAX_STARS) return prev;
      return {
        ...prev,
        ownedCharacters: {
          ...prev.ownedCharacters,
          [tpl.id]: { ...char, stars: char.stars + 1, shards: char.shards - needed },
        },
      };
    });
    showToast(`Bintang ${owned.stars + 1}!`);
  };

  const handleToggleDeploy = () => {
    if (!owned) return;
    soundFX.playClick();
    onUpdateSave((prev) => {
      if (prev.partyIds.includes(tpl.id)) {
        if (prev.partyIds.length <= 1) {
          showToast('Minimal 1 hero!');
          return prev;
        }
        return { ...prev, partyIds: prev.partyIds.filter((id) => id !== tpl.id) };
      }
      if (prev.partyIds.length >= 4) {
        return { ...prev, partyIds: [...prev.partyIds.slice(0, 3), tpl.id] };
      }
      return { ...prev, partyIds: [...prev.partyIds, tpl.id] };
    });
  };

  const handleSetFront = () => {
    if (!owned) return;
    soundFX.playClick();
    onUpdateSave((prev) => ({
      ...prev,
      partyIds: [tpl.id, ...prev.partyIds.filter((id) => id !== tpl.id)].slice(0, 4),
    }));
    showToast('Posisi Depan!');
  };

  const handleUpgradeBlessing = (slotIdx: 0 | 1 | 2) => {
    if (!owned) return;
    const blessing = tpl.defaultBlessings[slotIdx];
    if (owned.level < blessing.unlockLevel) return;
    const currentTier = owned.blessingTiers?.[slotIdx] ?? 0;
    if (currentTier >= 5) return;
    const cost = getBlessingUpgradeCost(currentTier);
    if (save.coins < cost) return;
    soundFX.playLevelUp();
    onUpdateSave((prev) => {
      const char = prev.ownedCharacters[tpl.id];
      if (!char) return prev;
      const tiers: [number, number, number] = [...(char.blessingTiers || [0, 0, 0])] as [
        number,
        number,
        number,
      ];
      tiers[slotIdx] = currentTier + 1;
      return {
        ...prev,
        coins: prev.coins - cost,
        ownedCharacters: { ...prev.ownedCharacters, [tpl.id]: { ...char, blessingTiers: tiers } },
      };
    });
    showToast('Restu Naik!');
  };

  return (
    <div className="space-y-3">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-400 text-[#181a24] font-display font-bold px-4 py-1.5 rounded-xl border-2 border-[#181a24] shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* MAIN HERO SHEET (Compact Game Layout) */}
      <div className="game-parchment rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* LEFT: Hero Visual Stage + Stars + Deploy */}
        <div className="md:col-span-5 flex flex-col justify-between gap-2.5">
          <div
            className="relative rounded-xl border-[2.5px] border-[#181a24] p-3 flex flex-col items-center justify-center min-h-[210px] overflow-hidden"
            style={{
              background: `radial-gradient(circle at 50% 42%, ${rarityCfg.color}40 0%, #fffdf8 78%)`,
            }}
          >
            {/* Top Corner Badges */}
            <div className="w-full flex items-center justify-between text-[11px] font-bold mb-1">
              <span
                className="px-2 py-0.5 rounded-md border-2 border-[#181a24] text-white"
                style={{ backgroundColor: rarityCfg.color }}
              >
                {rarityCfg.label} · {tpl.role}
              </span>
              {owned && (
                <span className="bg-[#181a24] text-amber-300 font-mono-num px-2 py-0.5 rounded-md">
                  Lv.{owned.level}
                </span>
              )}
            </div>

            <div className={!owned ? 'grayscale opacity-55' : ''}>
              <ChibiAvatar characterId={tpl.id} size={134} bouncy={Boolean(owned)} />
            </div>

            <div className="text-center mt-1">
              <h2 className="font-display text-xl font-bold text-[#181a24] leading-tight">
                {tpl.name}
              </h2>
              {owned && (
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= owned.stars
                          ? 'fill-amber-400 text-[#181a24]'
                          : 'fill-slate-200 text-slate-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Star Shard Bar & Formation Buttons */}
          {owned ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#e9dec6] h-5 rounded-lg border-2 border-[#181a24] relative overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{
                      width:
                        owned.stars >= MAX_STARS
                          ? '100%'
                          : `${Math.min(100, (owned.shards / nextStarShards) * 100)}%`,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center font-mono-num text-[11px] font-bold text-[#181a24]">
                    {owned.stars >= MAX_STARS
                      ? '★ MAX'
                      : `${owned.shards}/${nextStarShards} Shard`}
                  </span>
                </div>
                <button
                  onClick={handleStarAwaken}
                  disabled={owned.stars >= MAX_STARS || owned.shards < nextStarShards}
                  className="comic-btn bg-amber-400 hover:bg-amber-300 text-[#181a24] font-display font-bold text-xs px-3 py-1 rounded-lg whitespace-nowrap"
                >
                  Naik ★
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleToggleDeploy}
                  className={`comic-btn flex-1 font-display font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 ${
                    isDeployed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-[#181a24] hover:bg-amber-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isDeployed ? (partyIndex === 0 ? 'Aktif (Depan)' : `Aktif (#${partyIndex + 1})`) : 'Pasang Tim'}</span>
                </button>
                {(!isDeployed || partyIndex !== 0) && (
                  <button
                    onClick={handleSetFront}
                    className="comic-btn bg-sky-400 hover:bg-sky-300 text-[#181a24] font-display font-bold text-xs px-3 py-2 rounded-xl whitespace-nowrap"
                  >
                    Set Depan
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={onGoToGacha}
              className="comic-btn w-full bg-red-500 hover:bg-red-400 text-white font-display font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Rekrut di Gacha</span>
            </button>
          )}
        </div>

        {/* RIGHT: Compact Stats + Level Up + Tap-to-Inspect Skill & Restu Icons */}
        <div className="md:col-span-7 flex flex-col justify-between gap-3">
          {/* Stats Grid + Upgrade Buttons */}
          <div className="game-slot rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm text-[#181a24]">
                Statistik · Power{' '}
                <span className="font-mono-num text-amber-700">
                  {stats.power.toLocaleString('id-ID')}
                </span>
              </span>
              {owned && (
                <span className="font-mono-num text-xs font-bold text-slate-600">
                  Crit {stats.critRate}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              <MiniStat icon={<Heart className="w-3.5 h-3.5 text-rose-500" />} label="HP" val={stats.hp} />
              <MiniStat icon={<Sword className="w-3.5 h-3.5 text-amber-600" />} label="ATK" val={stats.atk} />
              <MiniStat icon={<Shield className="w-3.5 h-3.5 text-sky-600" />} label="DEF" val={stats.def} />
              <MiniStat icon={<Zap className="w-3.5 h-3.5 text-emerald-600" />} label="SPD" val={stats.spd} />
            </div>

            {owned && (
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  onClick={() => handleLevelUp(1)}
                  disabled={owned.level >= MAX_LEVEL || save.coins < singleLvCost}
                  className="comic-btn bg-emerald-500 hover:bg-emerald-400 text-white font-display font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-between"
                >
                  <span className="flex items-center gap-1">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> +1 Lv
                  </span>
                  <span className="font-mono-num text-[11px]">{singleLvCost.toLocaleString('id-ID')}</span>
                </button>
                <button
                  onClick={() => handleLevelUp(5)}
                  disabled={owned.level >= MAX_LEVEL || multi5.levelsGained === 0 || save.coins < multi5.totalCost}
                  className="comic-btn bg-amber-400 hover:bg-amber-300 text-[#181a24] font-display font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-between"
                >
                  <span>+{multi5.levelsGained || 5} Lv</span>
                  <span className="font-mono-num text-[11px]">{multi5.totalCost.toLocaleString('id-ID')}</span>
                </button>
              </div>
            )}
          </div>

          {/* 3 Jurus Icons */}
          <div className="game-slot rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-xs text-[#181a24]">
                Jurus (Ketuk untuk info)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {tpl.skills.map((sk, idx) => {
                const unlocked = owned ? owned.stars >= sk.unlockStars : idx < 2;
                return (
                  <button
                    key={sk.id}
                    onClick={() => {
                      soundFX.playClick();
                      setInspect({ kind: 'skill', idx });
                    }}
                    className={`comic-btn p-2 rounded-xl text-left flex items-center gap-2 ${
                      unlocked ? 'bg-white' : 'bg-slate-200 opacity-75'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 shrink-0 rounded-lg border-2 border-[#181a24] flex items-center justify-center text-[10px] font-bold text-white ${
                        sk.type === 'ultimate'
                          ? 'bg-red-500'
                          : sk.type === 'passive'
                          ? 'bg-purple-500'
                          : 'bg-sky-500'
                      }`}
                    >
                      {sk.type === 'ultimate' ? 'ULT' : sk.type === 'passive' ? 'PSF' : 'ATK'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[#181a24] truncate">{sk.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {unlocked ? sk.multiplierText.split(' ')[0] : `★${sk.unlockStars}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Restu Passive Slots */}
          <div className="game-slot rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-xs text-[#181a24]">
                Restu Pasif (Lv.1 · Lv.50 · Lv.100)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {tpl.defaultBlessings.map((bl, idx) => {
                const slotIdx = idx as 0 | 1 | 2;
                const unlocked = Boolean(owned && owned.level >= bl.unlockLevel);
                const tier = owned?.blessingTiers?.[slotIdx] ?? 0;
                return (
                  <button
                    key={bl.id}
                    onClick={() => {
                      soundFX.playClick();
                      setInspect({ kind: 'blessing', idx: slotIdx });
                    }}
                    className={`comic-btn p-2 rounded-xl text-left flex items-center gap-2 ${
                      unlocked ? 'bg-amber-100' : 'bg-slate-200 opacity-75'
                    }`}
                  >
                    <span className="w-7 h-7 shrink-0 rounded-lg border-2 border-[#181a24] bg-white flex items-center justify-center">
                      {unlocked ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[#181a24] truncate">
                        {bl.name.replace('Restu ', '')}
                      </div>
                      <div className="text-[10px] font-mono-num text-slate-600">
                        {unlocked ? `Tk.${tier + 1}` : `Lv.${bl.unlockLevel}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HORIZONTAL ROSTER DECK + QUICK DRAG-DROP SLOTS */}
      <div className="game-frame rounded-2xl p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="font-display text-xs font-bold text-amber-200">
            Seret Hero ke Slot Tim ({Object.keys(save.ownedCharacters).length}/{CHARACTER_POOL.length})
          </span>
          <button
            onClick={() => {
              soundFX.playClick();
              setTeamEditorOpen(true);
            }}
            className="comic-btn bg-amber-400 hover:bg-amber-300 text-[#181a24] font-display font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit Tim</span>
          </button>
        </div>

        {/* 4 Inline Drop Target Slots */}
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((slotIdx) => {
            const cid = save.partyIds[slotIdx];
            const slotChar = cid ? CHARACTER_MAP[cid] : null;
            const isHover = dragHoverSlot === slotIdx;
            return (
              <div
                key={slotIdx}
                draggable={Boolean(slotChar)}
                onDragStart={(e) => {
                  if (!slotChar) return;
                  soundFX.playDragStart();
                  e.dataTransfer.setData('text/plain', slotChar.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragHoverSlot !== slotIdx) setDragHoverSlot(slotIdx);
                }}
                onDragLeave={() => {
                  if (dragHoverSlot === slotIdx) setDragHoverSlot(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragHoverSlot(null);
                  const droppedId = e.dataTransfer.getData('text/plain');
                  if (!droppedId || !save.ownedCharacters[droppedId]) return;
                  soundFX.playDropSnap();
                  onUpdateSave((prev) => {
                    const slots: (string | null)[] = [0, 1, 2, 3].map((i) => prev.partyIds[i] || null);
                    const existingIdx = slots.indexOf(droppedId);
                    if (existingIdx !== -1) {
                      const tmp = slots[slotIdx];
                      slots[slotIdx] = droppedId;
                      slots[existingIdx] = tmp;
                    } else {
                      slots[slotIdx] = droppedId;
                    }
                    const compact = slots.filter((x): x is string => Boolean(x));
                    return { ...prev, partyIds: compact };
                  });
                  showToast(`Masuk Slot ${slotIdx === 0 ? 'Depan' : slotIdx + 1}!`);
                }}
                onClick={() => {
                  if (slotChar) {
                    soundFX.playClick();
                    setSelectedId(slotChar.id);
                  }
                }}
                className={`rounded-xl border-2 px-2 py-1 flex items-center gap-1.5 cursor-pointer transition-all ${
                  isHover
                    ? 'border-emerald-400 bg-emerald-500/30 scale-105'
                    : 'border-[#10121a] bg-[#1a1f2e] hover:border-amber-400'
                }`}
              >
                <span className="text-[10px] font-bold text-amber-300 shrink-0">
                  {slotIdx === 0 ? 'DPN' : `#${slotIdx + 1}`}
                </span>
                {slotChar ? (
                  <span className="text-[11px] font-bold text-white truncate">
                    {slotChar.name.split(' ')[0]}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Kosong</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="roster-scroll flex gap-2.5 overflow-x-auto pb-1.5 pt-1">
          {CHARACTER_POOL.map((char) => {
            const charOwned = save.ownedCharacters[char.id];
            const rCfg = RARITY_CONFIG[char.rarity];
            const isSelected = char.id === tpl.id;
            const slot = save.partyIds.indexOf(char.id);

            return (
              <button
                key={char.id}
                draggable={Boolean(charOwned)}
                onDragStart={(e) => {
                  if (!charOwned) return;
                  soundFX.playDragStart();
                  e.dataTransfer.setData('text/plain', char.id);
                }}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedId(char.id);
                }}
                className={`relative shrink-0 w-[96px] rounded-xl p-1.5 border-[2.5px] transition-transform text-center ${
                  charOwned ? 'cursor-grab active:cursor-grabbing' : ''
                } ${
                  isSelected
                    ? 'border-amber-400 bg-[#fff7e6] -translate-y-1 shadow-[0_3px_0_#f59e0b]'
                    : 'border-[#181a24] bg-[#f5ebd4] hover:-translate-y-0.5'
                }`}
                style={{ borderTopWidth: '5px', borderTopColor: rCfg.color }}
              >
                {slot !== -1 && (
                  <span className="absolute -top-2 right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 rounded border border-[#181a24]">
                    {slot === 0 ? 'DEPAN' : 'TIM'}
                  </span>
                )}
                <div className={`flex justify-center ${!charOwned ? 'grayscale opacity-45' : ''}`}>
                  <ChibiAvatar characterId={char.id} size={62} />
                </div>
                <div className="text-[11px] font-bold text-[#181a24] truncate">
                  {char.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-mono-num font-bold text-slate-600">
                  {charOwned ? `Lv.${charOwned.level}` : 'Kunci'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {teamEditorOpen && (
        <TeamEditorModal
          save={save}
          onUpdateSave={onUpdateSave}
          onClose={() => setTeamEditorOpen(false)}
        />
      )}

      {/* Tap-to-Inspect Skill / Restu Mini Popup */}
      {inspect && (
        <div
          className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4"
          onClick={() => setInspect(null)}
        >
          <div
            className="game-parchment rounded-2xl p-4 max-w-sm w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {inspect.kind === 'skill' ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-red-600">
                      {tpl.skills[inspect.idx].type.toUpperCase()} · Buka ★{tpl.skills[inspect.idx].unlockStars}
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#181a24]">
                      {tpl.skills[inspect.idx].name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setInspect(null)}
                    className="p-1 rounded-lg border-2 border-[#181a24] bg-white"
                    aria-label="Tutup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="font-mono-num text-xs font-bold bg-amber-100 border-2 border-[#181a24] rounded-lg px-2.5 py-1 inline-block">
                  {tpl.skills[inspect.idx].multiplierText}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {tpl.skills[inspect.idx].description}
                </p>
              </>
            ) : (
              (() => {
                const bl = tpl.defaultBlessings[inspect.idx];
                const unlocked = Boolean(owned && owned.level >= bl.unlockLevel);
                const tier = owned?.blessingTiers?.[inspect.idx] ?? 0;
                const cost = getBlessingUpgradeCost(tier);
                return (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-amber-700">
                          Restu Slot Lv.{bl.unlockLevel} · Tingkat {tier + 1}/6
                        </div>
                        <h3 className="font-display text-xl font-bold text-[#181a24]">{bl.name}</h3>
                      </div>
                      <button
                        onClick={() => setInspect(null)}
                        className="p-1 rounded-lg border-2 border-[#181a24] bg-white"
                        aria-label="Tutup"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{bl.description}</p>
                    {owned && (
                      <button
                        onClick={() => handleUpgradeBlessing(inspect.idx)}
                        disabled={!unlocked || tier >= 5 || save.coins < cost}
                        className="comic-btn w-full bg-emerald-500 hover:bg-emerald-400 text-white font-display font-bold text-xs py-2.5 rounded-xl"
                      >
                        {!unlocked
                          ? `Terbuka di Lv.${bl.unlockLevel}`
                          : tier >= 5
                          ? 'Tingkat Maksimal'
                          : `Perkuat Restu (${cost.toLocaleString('id-ID')} Koin)`}
                      </button>
                    )}
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MiniStat: React.FC<{ icon: React.ReactNode; label: string; val: number }> = ({
  icon,
  label,
  val,
}) => (
  <div className="bg-white border-2 border-[#181a24] rounded-lg px-2 py-1.5 text-center">
    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500">
      {icon}
      <span>{label}</span>
    </div>
    <div className="font-mono-num text-xs sm:text-sm font-bold text-[#181a24] mt-0.5">
      {val.toLocaleString('id-ID')}
    </div>
  </div>
);

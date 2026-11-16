import React, { useState } from 'react';
import { Coins, Info, Mail, Sparkles, Star, X } from 'lucide-react';
import { CHARACTER_MAP, CHARACTER_POOL, RARITY_CONFIG } from '../data/characters';
import { GachaPullItem, PlayerSaveData, Rarity } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChibiAvatar } from './ChibiAvatar';

interface GachaTabProps {
  save: PlayerSaveData;
  onUpdateSave: (updater: (prev: PlayerSaveData) => PlayerSaveData) => void;
}

const PITY_MAX = 50;
const ENVELOPE_COST_1X = 150;
const ENVELOPE_COST_10X = 1500;
const COIN_COST_1X = 400;
const COIN_COST_10X = 4000;

function pickRandomByRarity(rarity: Rarity): string {
  const pool = CHARACTER_POOL.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function rollRarity(isPremium: boolean, pityCounter: number, guaranteeEpicOrHigher: boolean): Rarity {
  if (isPremium && pityCounter + 1 >= PITY_MAX) return Rarity.MYTHIC;
  const r = Math.random() * 100;
  if (isPremium) {
    if (r < 4) return Rarity.MYTHIC;
    if (r < 18) return Rarity.LEGENDARY;
    if (r < 50 || guaranteeEpicOrHigher) return Rarity.EPIC;
    return Rarity.RARE;
  }
  if (r < 0.8) return Rarity.MYTHIC;
  if (r < 7) return Rarity.LEGENDARY;
  if (r < 30 || guaranteeEpicOrHigher) return Rarity.EPIC;
  return Rarity.RARE;
}

export const GachaTab: React.FC<GachaTabProps> = ({ save, onUpdateSave }) => {
  const [bannerMode, setBannerMode] = useState<'premium' | 'standard'>('premium');
  const [showRates, setShowRates] = useState(false);
  const [revealPhase, setRevealPhase] = useState<'idle' | 'shaking' | 'results'>('idle');
  const [pullResults, setPullResults] = useState<GachaPullItem[]>([]);
  const [highestRarity, setHighestRarity] = useState<Rarity>(Rarity.RARE);

  const isPremium = bannerMode === 'premium';
  const cost1x = isPremium ? ENVELOPE_COST_1X : COIN_COST_1X;
  const cost10x = isPremium ? ENVELOPE_COST_10X : COIN_COST_10X;
  const currentCurrency = isPremium ? save.envelopes : save.coins;
  const mythics = CHARACTER_POOL.filter((c) => c.rarity === Rarity.MYTHIC);

  const handlePull = (count: 1 | 10) => {
    const totalCost = count === 1 ? cost1x : cost10x;
    if (currentCurrency < totalCost) return;

    soundFX.playPullDrum();
    const tempOwned = new Set(Object.keys(save.ownedCharacters));
    let localPity = save.pityCounter;
    const results: GachaPullItem[] = [];

    for (let i = 0; i < count; i++) {
      const rarity = rollRarity(isPremium, localPity, count === 10 && i === 9);
      if (isPremium) localPity = rarity === Rarity.MYTHIC ? 0 : localPity + 1;
      const charId = pickRandomByRarity(rarity);
      const isNew = !tempOwned.has(charId);
      if (isNew) tempOwned.add(charId);
      results.push({
        characterId: charId,
        rarity,
        isNew,
        shardsGained: isNew ? 0 : RARITY_CONFIG[rarity].shardValue,
        isDuplicate: !isNew,
      });
    }

    const order: Record<Rarity, number> = {
      [Rarity.RARE]: 1,
      [Rarity.EPIC]: 2,
      [Rarity.LEGENDARY]: 3,
      [Rarity.MYTHIC]: 4,
    };
    let best = Rarity.RARE;
    results.forEach((item) => {
      if (order[item.rarity] > order[best]) best = item.rarity;
    });

    onUpdateSave((prev) => {
      const nextOwned = { ...prev.ownedCharacters };
      results.forEach((item) => {
        const existing = nextOwned[item.characterId];
        if (!existing) {
          nextOwned[item.characterId] = {
            id: item.characterId,
            level: 1,
            stars: 1,
            shards: 0,
            blessingTiers: [0, 0, 0],
          };
        } else {
          nextOwned[item.characterId] = {
            ...existing,
            shards: existing.shards + item.shardsGained,
          };
        }
      });
      return {
        ...prev,
        envelopes: isPremium ? prev.envelopes - totalCost : prev.envelopes,
        coins: !isPremium ? prev.coins - totalCost : prev.coins,
        pityCounter: localPity,
        totalPulls: prev.totalPulls + count,
        ownedCharacters: nextOwned,
      };
    });

    setHighestRarity(best);
    setPullResults(results);
    setRevealPhase('shaking');
    setTimeout(() => {
      soundFX.playReveal(best === Rarity.MYTHIC || best === Rarity.LEGENDARY);
      setRevealPhase('results');
    }, 850);
  };

  return (
    <div className="space-y-3">
      {/* Top Banner Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex p-1 bg-[#23283b] border-[2.5px] border-[#10121a] rounded-xl">
          <button
            onClick={() => {
              soundFX.playClick();
              setBannerMode('premium');
            }}
            className={`px-3.5 py-1.5 text-xs font-display font-bold rounded-lg transition-colors ${
              isPremium ? 'bg-red-500 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Koalisi Abadi
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setBannerMode('standard');
            }}
            className={`px-3.5 py-1.5 text-xs font-display font-bold rounded-lg transition-colors ${
              !isPremium ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Rekrut Rakyat
          </button>
        </div>

        <button
          onClick={() => setShowRates(true)}
          className="comic-btn bg-[#fff7e6] text-[#181a24] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Rate</span>
        </button>
      </div>

      {/* Main Illustrated Summon Stage */}
      <div
        className="comic-panel rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center gap-4"
        style={{
          background: isPremium
            ? 'radial-gradient(circle at 50% 35%, #fef08a 0%, #fca5a5 52%, #ef4444 100%)'
            : 'radial-gradient(circle at 50% 35%, #e0f2fe 0%, #93c5fd 55%, #3b82f6 100%)',
        }}
      >
        <div>
          <span className="inline-block bg-[#181a24] text-amber-300 text-[11px] font-bold px-3 py-0.5 rounded-full">
            {isPremium ? 'Pasti Epic+ di 10x · Pity Mythic 50' : 'Banner Koin Receh'}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#181a24] mt-1.5 drop-shadow-[0_2px_0_rgba(255,255,255,0.75)]">
            {isPremium ? 'Banner Koalisi Abadi' : 'Rekrutmen Rakyat'}
          </h2>
        </div>

        {/* 3 Mythic Showcase Characters */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-lg">
          {mythics.map((char) => (
            <div
              key={char.id}
              className="game-parchment rounded-2xl p-2 flex flex-col items-center"
            >
              <ChibiAvatar characterId={char.id} size={86} bouncy />
              <div className="font-display font-bold text-xs text-[#181a24] truncate w-full mt-0.5">
                {char.name}
              </div>
              <div className="text-[10px] font-bold text-red-600">MYTHIC</div>
            </div>
          ))}
        </div>

        {/* Pity Meter */}
        {isPremium && (
          <div className="w-full max-w-md bg-[#181a24]/85 text-white rounded-xl px-3.5 py-2 border-2 border-[#181a24]">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Jaminan Mythic</span>
              <span className="font-mono-num text-amber-300">
                {save.pityCounter}/{PITY_MAX}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (save.pityCounter / PITY_MAX) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Pull Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          <button
            onClick={() => handlePull(1)}
            disabled={currentCurrency < cost1x || revealPhase !== 'idle'}
            className="comic-btn bg-white hover:bg-amber-50 text-[#181a24] py-3 px-4 rounded-2xl flex items-center justify-center gap-2"
          >
            {isPremium ? <Mail className="w-5 h-5 text-red-500" /> : <Coins className="w-5 h-5 text-amber-500" />}
            <div className="text-left">
              <div className="font-display font-bold text-base leading-none">1x Buka</div>
              <div className="font-mono-num text-xs font-bold text-slate-600 mt-0.5">
                {cost1x.toLocaleString('id-ID')}
              </div>
            </div>
          </button>

          <button
            onClick={() => handlePull(10)}
            disabled={currentCurrency < cost10x || revealPhase !== 'idle'}
            className="comic-btn bg-amber-400 hover:bg-amber-300 text-[#181a24] py-3 px-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-[#181a24]" />
            <div className="text-left">
              <div className="font-display font-bold text-base leading-none">10x Buka</div>
              <div className="font-mono-num text-xs font-bold text-[#181a24] mt-0.5">
                {cost10x.toLocaleString('id-ID')}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Rate Info Modal */}
      {showRates && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowRates(false)}
        >
          <div
            className="game-parchment rounded-2xl p-4 max-w-sm w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Peluang Drop</h3>
              <button
                onClick={() => setShowRates(false)}
                className="p-1 rounded-lg border-2 border-[#181a24] bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {([Rarity.MYTHIC, Rarity.LEGENDARY, Rarity.EPIC, Rarity.RARE] as Rarity[]).map((r) => {
                const cfg = RARITY_CONFIG[r];
                const rate = isPremium
                  ? r === Rarity.MYTHIC
                    ? '4%'
                    : r === Rarity.LEGENDARY
                    ? '14%'
                    : r === Rarity.EPIC
                    ? '32%'
                    : '50%'
                  : r === Rarity.MYTHIC
                  ? '0.8%'
                  : r === Rarity.LEGENDARY
                  ? '6.2%'
                  : r === Rarity.EPIC
                  ? '23%'
                  : '70%';
                return (
                  <div
                    key={r}
                    className="flex items-center justify-between bg-white border-2 border-[#181a24] rounded-xl px-3 py-2 font-bold"
                  >
                    <span style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="font-mono-num">{rate} · +{cfg.shardValue} Shard</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Animated Envelope-Opening Reveal Sequence */}
      {revealPhase !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          {revealPhase === 'shaking' ? (
            <div className="text-center space-y-5">
              <div
                className="mx-auto w-44 h-32 rounded-2xl border-4 border-[#181a24] flex flex-col items-center justify-center animate-envelope-wobble"
                style={{
                  backgroundColor: '#d97706',
                  boxShadow: `0 0 42px ${RARITY_CONFIG[highestRarity].color}`,
                }}
              >
                <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-[#181a24] flex items-center justify-center text-white font-display font-bold text-xs">
                  VIP
                </div>
                <div className="font-display font-bold text-amber-100 text-sm mt-2">
                  Membuka Amplop...
                </div>
              </div>
              <button
                onClick={() => {
                  soundFX.playReveal(highestRarity === Rarity.MYTHIC || highestRarity === Rarity.LEGENDARY);
                  setRevealPhase('results');
                }}
                className="comic-btn bg-white text-[#181a24] text-xs font-bold px-4 py-2 rounded-xl"
              >
                Lewati
              </button>
            </div>
          ) : (
            <div className="game-parchment rounded-2xl p-4 sm:p-5 max-w-2xl w-full max-h-[88vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-2xl font-bold text-[#181a24]">Hasil Rekrutmen</h3>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setRevealPhase('idle');
                  }}
                  className="comic-btn bg-amber-400 text-[#181a24] font-display font-bold text-sm px-4 py-1.5 rounded-xl"
                >
                  Oke!
                </button>
              </div>
              <div
                className={`grid gap-2.5 ${
                  pullResults.length === 1 ? 'grid-cols-1 max-w-[200px] mx-auto' : 'grid-cols-2 sm:grid-cols-5'
                }`}
              >
                {pullResults.map((item, idx) => {
                  const char = CHARACTER_MAP[item.characterId];
                  const rCfg = RARITY_CONFIG[item.rarity];
                  return (
                    <div
                      key={`${item.characterId}-${idx}`}
                      className="bg-white border-[2.5px] border-[#181a24] rounded-xl p-2 text-center"
                      style={{ borderTopWidth: '6px', borderTopColor: rCfg.color }}
                    >
                      <div className="text-[10px] font-bold">
                        {item.isNew ? (
                          <span className="text-emerald-600">BARU!</span>
                        ) : (
                          <span className="text-amber-700 font-mono-num">+{item.shardsGained} Shard</span>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <ChibiAvatar
                          characterId={item.characterId}
                          size={pullResults.length === 1 ? 110 : 72}
                          bouncy={item.rarity === Rarity.MYTHIC || item.rarity === Rarity.LEGENDARY}
                        />
                      </div>
                      <div className="font-display font-bold text-xs truncate">{char.name}</div>
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-[#181a24]" />
                        <span className="text-[10px] font-bold" style={{ color: rCfg.color }}>
                          {rCfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

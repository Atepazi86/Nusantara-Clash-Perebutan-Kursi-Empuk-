import React, { useState } from 'react';
import { GripVertical, Shield, Sparkles, Swords, X } from 'lucide-react';
import { CHARACTER_MAP, CHARACTER_POOL, RARITY_CONFIG } from '../data/characters';
import { PlayerSaveData } from '../types/game';
import { soundFX } from '../utils/sound';
import { computePartyPower } from '../utils/stats';
import { ChibiAvatar } from './ChibiAvatar';

interface TeamEditorModalProps {
  save: PlayerSaveData;
  onUpdateSave: (updater: (prev: PlayerSaveData) => PlayerSaveData) => void;
  onClose: () => void;
}

export const TeamEditorModal: React.FC<TeamEditorModalProps> = ({
  save,
  onUpdateSave,
  onClose,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragSourceSlot, setDragSourceSlot] = useState<number | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const [justDroppedSlot, setJustDroppedSlot] = useState<number | null>(null);
  const [tapSelectedId, setTapSelectedId] = useState<string | null>(null);

  const partyPower = computePartyPower(save);

  const assignToSlot = (charId: string, targetSlot: number, sourceSlot: number | null) => {
    if (!save.ownedCharacters[charId]) return;
    soundFX.playDropSnap();

    onUpdateSave((prev) => {
      const slots: (string | null)[] = [0, 1, 2, 3].map((i) => prev.partyIds[i] || null);
      const existingSlotOfChar = slots.indexOf(charId);

      if (sourceSlot !== null && sourceSlot >= 0 && sourceSlot < 4) {
        // Swapping between two formation slots
        const temp = slots[targetSlot];
        slots[targetSlot] = slots[sourceSlot];
        slots[sourceSlot] = temp;
      } else if (existingSlotOfChar !== -1) {
        // Moving from another slot in team to targetSlot
        const temp = slots[targetSlot];
        slots[targetSlot] = charId;
        slots[existingSlotOfChar] = temp;
      } else {
        // Dropping new character from roster into targetSlot
        slots[targetSlot] = charId;
      }

      const compact = slots.filter((id): id is string => Boolean(id));
      return {
        ...prev,
        partyIds: compact.length > 0 ? compact : [charId],
      };
    });

    setJustDroppedSlot(targetSlot);
    setTimeout(() => setJustDroppedSlot(null), 350);
    setDraggedId(null);
    setDragSourceSlot(null);
    setHoverSlot(null);
    setTapSelectedId(null);
  };

  const removeFromSlot = (slotIdx: number) => {
    if (save.partyIds.length <= 1) {
      soundFX.playBoing();
      return;
    }
    soundFX.playClick();
    onUpdateSave((prev) => ({
      ...prev,
      partyIds: prev.partyIds.filter((_, idx) => idx !== slotIdx),
    }));
  };

  const autoBestTeam = () => {
    soundFX.playDropSnap();
    const orderRank = { MYTHIC: 4, LEGENDARY: 3, EPIC: 2, RARE: 1 };
    const ownedIds = Object.keys(save.ownedCharacters).sort((a, b) => {
      const ta = CHARACTER_MAP[a];
      const tb = CHARACTER_MAP[b];
      const diff = (orderRank[tb.rarity] || 0) - (orderRank[ta.rarity] || 0);
      if (diff !== 0) return diff;
      return (save.ownedCharacters[b]?.level || 1) - (save.ownedCharacters[a]?.level || 1);
    });
    // Put Tank/Warrior in Slot 0 if available
    const tankIdx = ownedIds.slice(0, 4).findIndex((id) => {
      const r = CHARACTER_MAP[id]?.role;
      return r === 'Tank' || r === 'Pejuang';
    });
    const best4 = ownedIds.slice(0, 4);
    if (tankIdx > 0) {
      const [tank] = best4.splice(tankIdx, 1);
      best4.unshift(tank);
    }
    onUpdateSave((prev) => ({ ...prev, partyIds: best4 }));
    setJustDroppedSlot(0);
    setTimeout(() => setJustDroppedSlot(null), 350);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="game-parchment rounded-2xl p-4 sm:p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#181a24]">
              Edit Formasi Tim (Drag &amp; Drop)
            </h2>
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2 mt-0.5">
              <span>Seret karakter ke 4 slot atau ketuk karakter lalu ketuk slot</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-[#181a24] bg-white hover:bg-slate-100"
            aria-label="Tutup Edit Tim"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Power & Quick Auto-Fill */}
        <div className="flex items-center justify-between bg-[#23283b] text-white rounded-xl px-3.5 py-2 border-2 border-[#10121a]">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Swords className="w-4 h-4 text-amber-400" />
            <span>Total Power:</span>
            <span className="font-mono-num text-amber-300 text-sm">
              {partyPower.toLocaleString('id-ID')}
            </span>
          </div>
          <button
            onClick={autoBestTeam}
            className="comic-btn bg-amber-400 hover:bg-amber-300 text-[#181a24] font-display font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tim Terkuat</span>
          </button>
        </div>

        {/* 4 Drop Zone Formation Slots */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[0, 1, 2, 3].map((slotIdx) => {
            const cid = save.partyIds[slotIdx];
            const char = cid ? CHARACTER_MAP[cid] : null;
            const owned = cid ? save.ownedCharacters[cid] : null;
            const rCfg = char ? RARITY_CONFIG[char.rarity] : null;
            const isFront = slotIdx === 0;
            const isHover = hoverSlot === slotIdx;
            const isPop = justDroppedSlot === slotIdx;

            return (
              <div
                key={slotIdx}
                draggable={Boolean(char)}
                onDragStart={() => {
                  if (!char) return;
                  soundFX.playDragStart();
                  setDraggedId(char.id);
                  setDragSourceSlot(slotIdx);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (hoverSlot !== slotIdx) setHoverSlot(slotIdx);
                }}
                onDragLeave={() => {
                  if (hoverSlot === slotIdx) setHoverSlot(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedCharId = e.dataTransfer.getData('text/plain') || draggedId;
                  if (droppedCharId) {
                    assignToSlot(droppedCharId, slotIdx, dragSourceSlot);
                  }
                }}
                onClick={() => {
                  if (tapSelectedId) {
                    assignToSlot(tapSelectedId, slotIdx, null);
                  } else if (char) {
                    setTapSelectedId(char.id);
                    soundFX.playClick();
                  }
                }}
                className={`relative rounded-2xl border-[2.5px] p-2 text-center transition-all cursor-pointer select-none min-h-[132px] flex flex-col items-center justify-between ${
                  isHover
                    ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-[0_4px_0_#10b981]'
                    : tapSelectedId
                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300'
                    : char
                    ? 'border-[#181a24] bg-white shadow-[0_3px_0_#181a24]'
                    : 'border-dashed border-slate-400 bg-[#efe6cf]'
                } ${isPop ? 'animate-drop-pop' : ''}`}
              >
                <div className="w-full flex items-center justify-between text-[10px] font-bold">
                  <span
                    className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      isFront ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isFront && <Shield className="w-2.5 h-2.5" />}
                    {isFront ? 'DEPAN' : `POS ${slotIdx + 1}`}
                  </span>
                  {char && save.partyIds.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromSlot(slotIdx);
                      }}
                      className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center leading-none"
                      aria-label="Keluarkan dari tim"
                    >
                      ×
                    </button>
                  )}
                </div>

                {char && owned && rCfg ? (
                  <>
                    <ChibiAvatar characterId={char.id} size={66} bouncy />
                    <div className="w-full">
                      <div className="font-display font-bold text-xs text-[#181a24] truncate">
                        {char.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-mono-num font-bold" style={{ color: rCfg.color }}>
                        Lv.{owned.level} · ★{owned.stars}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="my-auto text-[11px] font-bold text-slate-400">
                    Taruh Hero Di Sini
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Draggable Owned Roster Tray */}
        <div className="bg-[#23283b] border-[2.5px] border-[#10121a] rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-200">
            <span className="font-display">Koleksi Siap Tempur (Seret ke Slot di Atas)</span>
            {tapSelectedId && (
              <span className="text-emerald-300">
                Ketuk salah satu slot untuk pasang {CHARACTER_MAP[tapSelectedId]?.name.split(' ')[0]}!
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
            {CHARACTER_POOL.map((char) => {
              const owned = save.ownedCharacters[char.id];
              if (!owned) return null;
              const rCfg = RARITY_CONFIG[char.rarity];
              const inSlot = save.partyIds.indexOf(char.id);
              const isTapSelected = tapSelectedId === char.id;

              return (
                <div
                  key={char.id}
                  draggable
                  onDragStart={(e) => {
                    soundFX.playDragStart();
                    e.dataTransfer.setData('text/plain', char.id);
                    setDraggedId(char.id);
                    setDragSourceSlot(null);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setHoverSlot(null);
                  }}
                  onClick={() => {
                    soundFX.playClick();
                    setTapSelectedId((prev) => (prev === char.id ? null : char.id));
                  }}
                  className={`relative rounded-xl border-2 p-1.5 text-center cursor-grab active:cursor-grabbing transition-transform select-none ${
                    isTapSelected
                      ? 'border-amber-400 bg-amber-100 -translate-y-1 ring-2 ring-amber-400'
                      : 'border-[#181a24] bg-[#fff7e6] hover:-translate-y-0.5'
                  }`}
                  style={{ borderTopWidth: '5px', borderTopColor: rCfg.color }}
                >
                  <GripVertical className="w-3 h-3 text-slate-400 absolute top-1 left-1" />
                  {inSlot !== -1 && (
                    <span className="absolute -top-1.5 right-1 bg-emerald-500 text-white text-[9px] font-bold px-1 rounded border border-[#181a24]">
                      #{inSlot + 1}
                    </span>
                  )}
                  <div className="flex justify-center">
                    <ChibiAvatar characterId={char.id} size={54} />
                  </div>
                  <div className="font-display font-bold text-[11px] text-[#181a24] truncate">
                    {char.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-600">
                    Lv.{owned.level} · {char.role}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="comic-btn w-full bg-emerald-500 hover:bg-emerald-400 text-white font-display font-bold text-sm py-2.5 rounded-xl"
        >
          Selesai &amp; Simpan Formasi
        </button>
      </div>
    </div>
  );
};

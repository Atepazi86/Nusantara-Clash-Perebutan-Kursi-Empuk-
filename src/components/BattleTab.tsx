import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  FastForward,
  Flag,
  Flame,
  Gift,
  Hand,
  Play,
  RotateCcw,
  Shield,
  Skull,
  SlidersHorizontal,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  ARENA_RIVALS,
  CAMPAIGN_STAGES,
  CHARACTER_MAP,
  RAID_BOSSES,
  RARITY_CONFIG,
} from '../data/characters';
import {
  ArenaBackdropId,
  BattleMode,
  BattleUnit,
  FloatingNumber,
  PlayerSaveData,
  Rarity,
} from '../types/game';
import { soundFX } from '../utils/sound';
import { computeCharacterStats, computeIdleCashRewards } from '../utils/stats';
import { ChibiAvatar } from './ChibiAvatar';
import { BACKDROP_NAMES, StageBackdrop } from './StageBackdrop';
import { TeamEditorModal } from './TeamEditorModal';

interface BattleTabProps {
  save: PlayerSaveData;
  onUpdateSave: (updater: (prev: PlayerSaveData) => PlayerSaveData) => void;
}

interface ActiveEncounter {
  mode: BattleMode;
  title: string;
  backdrop: ArenaBackdropId;
  rewardCoins: number;
  rewardEnvelopes: number;
  stageIndex?: number;
}

interface BattleState {
  phase: 'lobby' | 'fighting' | 'victory' | 'defeat';
  encounter: ActiveEncounter | null;
  units: BattleUnit[];
  turnPointer: number;
  round: number;
  lastActionText: string;
  activeAttackerUid: string | null;
  activeHitUids: string[];
  evadedUids: string[];
  ultActorUid: string | null;
  callout: { uid: string; text: string } | null;
  screenShake: boolean;
  floatingNums: FloatingNumber[];
}

function getUltCost(templateId: string): number {
  if (templateId === 'hansip_malam') return 85;
  if (
    templateId === 'mas_santuy' ||
    templateId === 'abang_ojol' ||
    templateId === 'ibu_senam' ||
    templateId === 'kang_sidak' ||
    templateId === 'emak_sein'
  ) {
    return 90;
  }
  return 100;
}

function buildAllyUnits(save: PlayerSaveData): BattleUnit[] {
  const hasIbuBantengAura = save.partyIds.some((id) => {
    const o = save.ownedCharacters[id];
    return id === 'ibu_banteng' && o && o.stars >= 3;
  });
  const hasSultanSpdAura = save.partyIds.some((id) => {
    const o = save.ownedCharacters[id];
    return id === 'sultan_konten' && o && o.stars >= 3;
  });

  return save.partyIds
    .map((id, idx) => {
      const tpl = CHARACTER_MAP[id];
      const owned = save.ownedCharacters[id];
      if (!tpl || !owned) return null;
      const stats = computeCharacterStats(owned);
      const atkWithAura = hasIbuBantengAura ? Math.round(stats.atk * 1.15) : stats.atk;
      const spdWithAura = stats.spd + (hasSultanSpdAura ? 12 : 0);
      const critWithPassive =
        stats.critRate + (id === 'pengacara_berlian' && owned.stars >= 3 ? 12 : 0);

      const unit: BattleUnit = {
        uid: `ally_${id}_${idx}`,
        templateId: tpl.id,
        name: tpl.name,
        side: 'ally',
        slotIndex: idx,
        rarity: tpl.rarity,
        maxHp: stats.hp,
        hp: stats.hp,
        atk: atkWithAura,
        def: stats.def,
        spd: spdWithAura,
        critRate: critWithPassive,
        gauge: Math.min(100, stats.startGauge),
        shield: 0,
        stunTurns: 0,
        tauntTurns: id === 'jenderal_gemoy' && owned.stars >= 3 ? 2 : 0,
        atkBuffTurns: 0,
        atkBuffPct: 0,
        defBuffTurns: 0,
        defBuffPct: 0,
        evadeBuffTurns: id === 'emak_sein' && owned.stars >= 3 ? 2 : 0,
        spdBuffTurns: 0,
        atkDebuffTurns: 0,
        skillName: tpl.skills[1].name,
        ultDesc: tpl.skills[1].description,
        passiveUnlocked: owned.stars >= 3,
        stars: owned.stars,
      };
      return unit;
    })
    .filter((u): u is BattleUnit => u !== null);
}

export const BattleTab: React.FC<BattleTabProps> = ({ save, onUpdateSave }) => {
  const [battleMode, setBattleMode] = useState<BattleMode>('campaign');
  const [speedMult, setSpeedMult] = useState<1 | 2>(1);
  const [autoUlt, setAutoUlt] = useState<boolean>(true);
  const [idleTick, setIdleTick] = useState<number>(Date.now());
  const [claimBanner, setClaimBanner] = useState<string | null>(null);
  const [teamEditorOpen, setTeamEditorOpen] = useState<boolean>(false);

  const [battle, setBattle] = useState<BattleState>({
    phase: 'lobby',
    encounter: null,
    units: [],
    turnPointer: 0,
    round: 1,
    lastActionText: '',
    activeAttackerUid: null,
    activeHitUids: [],
    evadedUids: [],
    ultActorUid: null,
    callout: null,
    screenShake: false,
    floatingNums: [],
  });

  useEffect(() => {
    const t = setInterval(() => setIdleTick(Date.now()), 20000);
    return () => clearInterval(t);
  }, []);

  const idleReward = computeIdleCashRewards(save, idleTick);
  const selectedStage = CAMPAIGN_STAGES[save.selectedStageIndex] || CAMPAIGN_STAGES[0];

  const handleClaimIdleCash = () => {
    const current = computeIdleCashRewards(save, Date.now());
    if (current.coins <= 0 && current.envelopes <= 0) return;
    soundFX.playCoinJingle();
    onUpdateSave((prev) => ({
      ...prev,
      coins: prev.coins + current.coins,
      envelopes: prev.envelopes + current.envelopes,
      lastCashClaimAt: Date.now(),
    }));
    setIdleTick(Date.now());
    setClaimBanner(`+${current.coins.toLocaleString('id-ID')} Koin · +${current.envelopes} Amplop`);
    setTimeout(() => setClaimBanner(null), 2200);
  };

  const startEncounter = (encounter: ActiveEncounter, enemyUnits: BattleUnit[]) => {
    const allies = buildAllyUnits(save);
    if (allies.length === 0) return;
    soundFX.playClick();
    setBattle({
      phase: 'fighting',
      encounter,
      units: [...allies, ...enemyUnits],
      turnPointer: 0,
      round: 1,
      lastActionText: `${BACKDROP_NAMES[encounter.backdrop]} — Siap!`,
      activeAttackerUid: null,
      activeHitUids: [],
      evadedUids: [],
      ultActorUid: null,
      callout: null,
      screenShake: false,
      floatingNums: [],
    });
  };

  const startCampaignStage = (stageIdx: number) => {
    const stage = CAMPAIGN_STAGES[stageIdx];
    if (!stage) return;
    const enemyUnits: BattleUnit[] = stage.enemies.map((e, idx) => ({
      uid: `enemy_${e.id}_${idx}`,
      templateId: e.id,
      name: e.name,
      side: 'enemy',
      slotIndex: idx,
      rarity: e.isBoss ? Rarity.MYTHIC : Rarity.RARE,
      isBoss: e.isBoss,
      maxHp: e.hp,
      hp: e.hp,
      atk: e.atk,
      def: e.def,
      spd: e.spd,
      critRate: 10,
      gauge: 0,
      shield: 0,
      stunTurns: 0,
      tauntTurns: 0,
      atkBuffTurns: 0,
      atkBuffPct: 0,
      defBuffTurns: 0,
      defBuffPct: 0,
      evadeBuffTurns: 0,
      spdBuffTurns: 0,
      atkDebuffTurns: 0,
      skillName: e.skillName,
      ultDesc: e.skillDesc,
      passiveUnlocked: false,
      stars: 1,
    }));

    startEncounter(
      {
        mode: 'campaign',
        title: `Stage ${stage.code}`,
        backdrop: stage.backdrop,
        rewardCoins: stage.rewardCoins,
        rewardEnvelopes: stage.rewardEnvelopes,
        stageIndex: stageIdx,
      },
      enemyUnits
    );
  };

  const startArenaMatch = (rivalIdx: number) => {
    const rival = ARENA_RIVALS[rivalIdx];
    if (!rival) return;
    const enemyUnits: BattleUnit[] = rival.characterIds.map((cid, idx) => {
      const tpl = CHARACTER_MAP[cid];
      const stats = computeCharacterStats({
        id: cid,
        level: rival.level,
        stars: idx === 0 ? 2 : 1,
        shards: 0,
        blessingTiers: [0, 0, 0],
      });
      return {
        uid: `arena_${cid}_${idx}`,
        templateId: cid,
        name: tpl.name,
        side: 'enemy',
        slotIndex: idx,
        rarity: tpl.rarity,
        maxHp: stats.hp,
        hp: stats.hp,
        atk: Math.round(stats.atk * 0.88),
        def: stats.def,
        spd: stats.spd,
        critRate: stats.critRate,
        gauge: 15,
        shield: 0,
        stunTurns: 0,
        tauntTurns: 0,
        atkBuffTurns: 0,
        atkBuffPct: 0,
        defBuffTurns: 0,
        defBuffPct: 0,
        evadeBuffTurns: 0,
        spdBuffTurns: 0,
        atkDebuffTurns: 0,
        skillName: tpl.skills[1].name,
        ultDesc: tpl.skills[1].description,
        passiveUnlocked: false,
        stars: 1,
      };
    });

    startEncounter(
      {
        mode: 'arena',
        title: rival.name,
        backdrop: rival.backdrop,
        rewardCoins: rival.rewardCoins,
        rewardEnvelopes: rival.rewardEnvelopes,
      },
      enemyUnits
    );
  };

  const startRaidBoss = (raidIdx: number) => {
    const boss = RAID_BOSSES[raidIdx];
    if (!boss) return;
    const enemyUnits: BattleUnit[] = [
      {
        uid: `raid_${boss.id}`,
        templateId: boss.id === 'raid_inflasi' ? 'boss_inflasi' : 'boss_mangkrak',
        name: boss.name,
        side: 'enemy',
        slotIndex: 0,
        rarity: Rarity.MYTHIC,
        isBoss: true,
        maxHp: boss.hp,
        hp: boss.hp,
        atk: boss.atk,
        def: boss.def,
        spd: boss.spd,
        critRate: 14,
        gauge: 0,
        shield: 0,
        stunTurns: 0,
        tauntTurns: 0,
        atkBuffTurns: 0,
        atkBuffPct: 0,
        defBuffTurns: 0,
        defBuffPct: 0,
        evadeBuffTurns: 0,
        spdBuffTurns: 0,
        atkDebuffTurns: 0,
        skillName: boss.skillName,
        ultDesc: boss.skillDesc,
        passiveUnlocked: false,
        stars: 5,
      },
    ];

    startEncounter(
      {
        mode: 'raid',
        title: boss.name,
        backdrop: boss.backdrop,
        rewardCoins: boss.rewardCoins,
        rewardEnvelopes: boss.rewardEnvelopes,
      },
      enemyUnits
    );
  };

  const applyHit = (
    attacker: BattleUnit,
    target: BattleUnit,
    mult: number,
    forceCrit = false,
    bonusFlatDmg = 0,
    defIgnorePct = 0
  ): { dmg: number; isCrit: boolean; evaded: boolean } => {
    if (target.evadeBuffTurns > 0 && Math.random() < 0.55) {
      return { dmg: 0, isCrit: false, evaded: true };
    }
    const lowHpBonus =
      attacker.templateId === 'kang_sidak' &&
      attacker.passiveUnlocked &&
      attacker.hp < attacker.maxHp * 0.6
        ? 0.25
        : 0;
    const atkMult =
      1 +
      (attacker.atkBuffTurns > 0 ? attacker.atkBuffPct / 100 : 0) +
      lowHpBonus -
      (attacker.atkDebuffTurns > 0 ? 0.22 : 0);
    const effectiveAtk = Math.max(20, attacker.atk * atkMult);
    const defMult = 1 + (target.defBuffTurns > 0 ? target.defBuffPct / 100 : 0);
    const effectiveDef = Math.max(10, target.def * defMult * (1 - defIgnorePct));

    const mitigation = 100 / (100 + effectiveDef * 0.72);
    const isCrit = forceCrit || Math.random() * 100 < attacker.critRate;
    const critMult = isCrit ? 1.58 : 1;
    const variance = 0.94 + Math.random() * 0.12;
    let dmg = Math.max(
      18,
      Math.round((effectiveAtk * mult * mitigation * critMult + bonusFlatDmg) * variance)
    );

    if (target.templateId === 'jenderal_gemoy' && target.passiveUnlocked) {
      dmg = Math.round(dmg * 0.82);
    }

    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, dmg);
      target.shield -= absorbed;
      dmg -= absorbed;
    }

    target.hp = Math.max(0, target.hp - dmg);
    target.gauge = Math.min(100, target.gauge + 15);
    return { dmg, isCrit, evaded: false };
  };

  const executeUnitTurn = useCallback(
    (forcedUltUnitUid?: string) => {
      setBattle((prev) => {
        if (prev.phase !== 'fighting' || !prev.encounter) return prev;

        const units = prev.units.map((u) => ({ ...u }));
        const living = units.filter((u) => u.hp > 0);
        const alliesAlive = living.filter((u) => u.side === 'ally');
        const enemiesAlive = living.filter((u) => u.side === 'enemy');

        if (alliesAlive.length === 0 || enemiesAlive.length === 0) return prev;

        const order = [...living].sort((a, b) => {
          const spdA = a.spd * (a.spdBuffTurns > 0 ? 1.25 : 1);
          const spdB = b.spd * (b.spdBuffTurns > 0 ? 1.25 : 1);
          return spdB - spdA;
        });

        let actor: BattleUnit;
        let nextPointer = prev.turnPointer;
        let nextRound = prev.round;

        if (forcedUltUnitUid) {
          const found = units.find((u) => u.uid === forcedUltUnitUid && u.hp > 0);
          if (!found || found.gauge < getUltCost(found.templateId)) return prev;
          actor = found;
        } else {
          if (nextPointer >= order.length) {
            nextPointer = 0;
            nextRound += 1;
          }
          actor = order[nextPointer];
          nextPointer += 1;
        }

        const newFloats: FloatingNumber[] = [];
        const hitUids: string[] = [];
        const evadedUids: string[] = [];
        let ultActorUid: string | null = null;
        let callout: { uid: string; text: string } | null = null;
        let shake = false;
        let actionText = '';

        const pushFloat = (uid: string, text: string, kind: FloatingNumber['kind']) => {
          newFloats.push({
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            unitUid: uid,
            text,
            kind,
          });
        };

        if (actor.templateId === 'hansip_malam' && actor.passiveUnlocked && actor.hp > 0) {
          const regen = Math.round(actor.maxHp * 0.08);
          actor.hp = Math.min(actor.maxHp, actor.hp + regen);
          pushFloat(actor.uid, `+${regen}`, 'heal');
        }

        if (actor.stunTurns > 0 && !(actor.templateId === 'hansip_malam' && actor.passiveUnlocked)) {
          actor.stunTurns -= 1;
          soundFX.playBoing();
          pushFloat(actor.uid, 'STUN!', 'debuff');
          callout = { uid: actor.uid, text: 'PUSING!' };
          actionText = `${actor.name} kena Stun!`;
        } else {
          const opponents = units.filter((u) => u.side !== actor.side && u.hp > 0);
          const friends = units.filter((u) => u.side === actor.side && u.hp > 0);
          const pickTarget = () => opponents.find((o) => o.tauntTurns > 0) || opponents[0];

          const ultCost = getUltCost(actor.templateId);
          const canUseUlt =
            Boolean(forcedUltUnitUid) ||
            (actor.gauge >= ultCost && (actor.side === 'enemy' || autoUlt));

          if (canUseUlt && opponents.length > 0) {
            actor.gauge = 0;
            ultActorUid = actor.uid;
            if (actor.side === 'enemy') {
              if (actor.isBoss) {
                shake = true;
                soundFX.playHit(true);
                callout = { uid: actor.uid, text: actor.skillName.toUpperCase() + '!' };
                opponents.forEach((t) => {
                  const res = applyHit(actor, t, 1.32);
                  if (res.evaded) evadedUids.push(t.uid);
                  else hitUids.push(t.uid);
                  pushFloat(t.uid, res.evaded ? 'MISS' : `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
                });
              } else {
                const target = pickTarget();
                const res = applyHit(actor, target, 1.55);
                if (res.evaded) {
                  evadedUids.push(target.uid);
                  soundFX.playBoing();
                } else {
                  hitUids.push(target.uid);
                  soundFX.playHit(res.isCrit);
                }
                if (res.isCrit) shake = true;
                pushFloat(target.uid, res.evaded ? 'MISS' : `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
              }
              actionText = `${actor.name}: ${actor.skillName}!`;
            } else {
              soundFX.playUltimateByHero(actor.templateId);
              switch (actor.templateId) {
                case 'jenderal_gemoy':
                  callout = { uid: actor.uid, text: 'OK GAS! ♫' };
                  friends.forEach((f) => {
                    const heal = Math.round(f.maxHp * 0.24);
                    f.hp = Math.min(f.maxHp, f.hp + heal);
                    f.defBuffTurns = 2;
                    f.defBuffPct = 35;
                    pushFloat(f.uid, `+${heal}`, 'heal');
                  });
                  break;
                case 'pak_tukang_kayu': {
                  shake = true;
                  callout = { uid: actor.uid, text: 'SEPEDA GRATIS!' };
                  opponents.forEach((t) => {
                    const res = applyHit(actor, t, 1.45);
                    if (res.evaded) evadedUids.push(t.uid);
                    else hitUids.push(t.uid);
                    pushFloat(t.uid, res.evaded ? 'MISS' : `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
                  });
                  const stunTarget = opponents[Math.floor(Math.random() * opponents.length)];
                  if (stunTarget && stunTarget.hp > 0) {
                    stunTarget.stunTurns = 1;
                    pushFloat(stunTarget.uid, 'STUN!', 'debuff');
                  }
                  if (actor.passiveUnlocked) {
                    friends.forEach((f) => {
                      f.shield += Math.round(f.maxHp * 0.15);
                    });
                  }
                  break;
                }
                case 'ibu_banteng': {
                  shake = true;
                  callout = { uid: actor.uid, text: 'SERBUUU!' };
                  const mainTarget = [...opponents].sort((a, b) => b.atk - a.atk)[0];
                  const res = applyHit(actor, mainTarget, 1.65, true);
                  hitUids.push(mainTarget.uid);
                  pushFloat(mainTarget.uid, `${res.dmg}!`, 'crit');
                  friends
                    .filter((f) => f.uid !== actor.uid)
                    .forEach((ally) => {
                      const aliveOpps = units.filter((u) => u.side === 'enemy' && u.hp > 0);
                      if (!aliveOpps.length) return;
                      const t = aliveOpps[0];
                      const assist = applyHit(ally, t, 0.78);
                      hitUids.push(t.uid);
                      pushFloat(t.uid, `${assist.dmg}`, assist.isCrit ? 'crit' : 'damage');
                    });
                  break;
                }
                case 'mas_santuy': {
                  shake = true;
                  callout = { uid: actor.uid, text: 'SANTUY~' };
                  const lowest = [...opponents].sort((a, b) => a.hp - b.hp)[0];
                  const res = applyHit(actor, lowest, 2.45, true);
                  hitUids.push(lowest.uid);
                  actor.evadeBuffTurns = 2;
                  pushFloat(lowest.uid, `${res.dmg}!`, 'crit');
                  pushFloat(actor.uid, 'EVADE!', 'buff');
                  break;
                }
                case 'juragan_energi':
                  shake = true;
                  callout = { uid: actor.uid, text: 'STOK HABIS!' };
                  opponents.forEach((t) => {
                    const res = applyHit(actor, t, 1.3);
                    t.gauge = Math.max(0, t.gauge - 45);
                    hitUids.push(t.uid);
                    pushFloat(t.uid, `-${res.dmg}`, 'debuff');
                  });
                  friends.forEach((f) => {
                    f.atkBuffTurns = 2;
                    f.atkBuffPct = 20;
                  });
                  break;
                case 'abang_ojol': {
                  callout = { uid: actor.uid, text: 'OM TELOLET!' };
                  const lowestAlly = [...friends].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
                  friends.forEach((f) => {
                    f.spdBuffTurns = 2;
                    pushFloat(f.uid, 'SPD+', 'buff');
                  });
                  if (lowestAlly) {
                    const heal = Math.round(lowestAlly.maxHp * 0.15);
                    lowestAlly.hp = Math.min(lowestAlly.maxHp, lowestAlly.hp + heal);
                    lowestAlly.shield += Math.round(lowestAlly.maxHp * 0.3);
                    pushFloat(lowestAlly.uid, `+${heal}`, 'heal');
                  }
                  break;
                }
                case 'ibu_senam':
                  shake = true;
                  callout = { uid: actor.uid, text: '1-2-3 SENAM!' };
                  opponents.forEach((t) => {
                    const res = applyHit(actor, t, 1.4, Math.random() < 0.2);
                    hitUids.push(t.uid);
                    pushFloat(t.uid, `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
                  });
                  break;
                case 'hansip_malam': {
                  callout = { uid: actor.uid, text: 'RONDA MALAM!' };
                  actor.tauntTurns = 2;
                  actor.defBuffTurns = 2;
                  actor.defBuffPct = 45;
                  const target = pickTarget();
                  const res = applyHit(actor, target, 1.35);
                  hitUids.push(target.uid);
                  pushFloat(actor.uid, 'TAUNT!', 'buff');
                  pushFloat(target.uid, `${res.dmg}`, 'damage');
                  break;
                }
                case 'pengacara_berlian': {
                  shake = true;
                  callout = { uid: actor.uid, text: 'SILAU BOSS!' };
                  opponents.forEach((t) => {
                    const res = applyHit(actor, t, 1.55);
                    t.atkDebuffTurns = 2;
                    if (res.evaded) evadedUids.push(t.uid);
                    else hitUids.push(t.uid);
                    pushFloat(t.uid, res.evaded ? 'MISS' : `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
                  });
                  const selfHeal = Math.round(actor.maxHp * 0.2);
                  actor.hp = Math.min(actor.maxHp, actor.hp + selfHeal);
                  pushFloat(actor.uid, `+${selfHeal}`, 'heal');
                  break;
                }
                case 'sultan_konten':
                  shake = true;
                  callout = { uid: actor.uid, text: 'GIVEAWAY!' };
                  opponents.forEach((t) => {
                    const res = applyHit(actor, t, 1.25);
                    if (res.evaded) evadedUids.push(t.uid);
                    else hitUids.push(t.uid);
                    pushFloat(t.uid, res.evaded ? 'MISS' : `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
                  });
                  friends.forEach((f) => {
                    f.gauge = Math.min(100, f.gauge + 30);
                    f.atkBuffTurns = 2;
                    f.atkBuffPct = Math.max(f.atkBuffPct, 25);
                    pushFloat(f.uid, '+30 ENG', 'buff');
                  });
                  break;
                case 'kang_sidak': {
                  shake = true;
                  callout = { uid: actor.uid, text: 'SIDAK VIRAL!' };
                  const target = pickTarget();
                  const res = applyHit(actor, target, 2.1);
                  if (res.evaded) evadedUids.push(target.uid);
                  else hitUids.push(target.uid);
                  pushFloat(target.uid, res.evaded ? 'MISS' : `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
                  const lowestAlly = [...friends].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
                  if (lowestAlly) {
                    const heal = Math.round(lowestAlly.maxHp * 0.22);
                    lowestAlly.hp = Math.min(lowestAlly.maxHp, lowestAlly.hp + heal);
                    lowestAlly.defBuffTurns = 2;
                    lowestAlly.defBuffPct = Math.max(lowestAlly.defBuffPct, 25);
                    pushFloat(lowestAlly.uid, `+${heal}`, 'heal');
                  }
                  break;
                }
                case 'emak_sein': {
                  shake = true;
                  callout = { uid: actor.uid, text: 'SEIN KIRI!' };
                  const backTarget = opponents[opponents.length - 1];
                  const res = applyHit(actor, backTarget, 2.25);
                  if (res.evaded) {
                    evadedUids.push(backTarget.uid);
                    pushFloat(backTarget.uid, 'MISS', 'miss');
                  } else {
                    hitUids.push(backTarget.uid);
                    pushFloat(backTarget.uid, `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
                    if (backTarget.hp > 0 && Math.random() < 0.55) {
                      backTarget.stunTurns = 1;
                      pushFloat(backTarget.uid, 'STUN!', 'debuff');
                    }
                  }
                  break;
                }
              }
              actionText = `${actor.name}: "${actor.skillName}!"`;
            }
          } else if (opponents.length > 0) {
            const target =
              actor.templateId === 'mas_santuy'
                ? [...opponents].sort((a, b) => a.hp - b.hp)[0]
                : pickTarget();
            const bonusHpDmg =
              actor.templateId === 'jenderal_gemoy' ? Math.round(actor.maxHp * 0.08) : 0;
            const basicMult =
              actor.templateId === 'pengacara_berlian' || actor.templateId === 'kang_sidak'
                ? 1.2
                : actor.templateId === 'emak_sein'
                ? 1.18
                : actor.templateId === 'sultan_konten'
                ? 1.15
                : 1.12;
            const defIgnore = actor.templateId === 'pengacara_berlian' ? 0.2 : 0;
            const res = applyHit(actor, target, basicMult, false, bonusHpDmg, defIgnore);
            if (res.evaded) {
              evadedUids.push(target.uid);
              soundFX.playSantuySlide();
              callout = { uid: target.uid, text: 'EITS~' };
              pushFloat(target.uid, 'MISS', 'miss');
              if (target.templateId === 'mas_santuy' && target.passiveUnlocked) {
                target.hp = Math.min(target.maxHp, target.hp + Math.round(target.maxHp * 0.1));
                target.gauge = Math.min(100, target.gauge + 20);
              }
            } else {
              hitUids.push(target.uid);
              if (res.isCrit) shake = true;
              soundFX.playHit(res.isCrit);
              pushFloat(target.uid, res.isCrit ? `${res.dmg}!` : `${res.dmg}`, res.isCrit ? 'crit' : 'damage');
              if (actor.templateId === 'sultan_konten') {
                const stolen = Math.min(15, target.gauge);
                target.gauge -= stolen;
                actor.gauge = Math.min(100, actor.gauge + 15);
                if (stolen > 0) pushFloat(target.uid, `-${stolen} ENG`, 'debuff');
              }
            }

            if (actor.templateId === 'ibu_banteng') target.atkDebuffTurns = 2;
            if (actor.templateId === 'juragan_energi') {
              actor.atkBuffTurns = 2;
              actor.atkBuffPct = Math.min(30, (actor.atkBuffPct || 0) + 10);
            }

            actor.gauge = Math.min(100, actor.gauge + (actor.templateId === 'pak_tukang_kayu' ? 40 : 30));
            actionText = `${actor.name} → ${target.name} (${res.evaded ? 'Miss!' : res.dmg})`;
          }
        }

        if (actor.templateId === 'pengacara_berlian' && actor.passiveUnlocked && actor.hp > 0) {
          actor.gauge = Math.min(100, actor.gauge + 15);
        }

        if (actor.templateId === 'abang_ojol' && actor.passiveUnlocked && actor.hp > 0) {
          const friends = units.filter((u) => u.side === 'ally' && u.hp > 0);
          const low = [...friends].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
          if (low) low.hp = Math.min(low.maxHp, low.hp + Math.round(low.maxHp * 0.06));
        }

        if (actor.tauntTurns > 0) actor.tauntTurns -= 1;
        if (actor.atkBuffTurns > 0) actor.atkBuffTurns -= 1;
        if (actor.defBuffTurns > 0) actor.defBuffTurns -= 1;
        if (actor.evadeBuffTurns > 0) actor.evadeBuffTurns -= 1;
        if (actor.spdBuffTurns > 0) actor.spdBuffTurns -= 1;
        if (actor.atkDebuffTurns > 0) actor.atkDebuffTurns -= 1;

        const remainingAllies = units.filter((u) => u.side === 'ally' && u.hp > 0);
        const remainingEnemies = units.filter((u) => u.side === 'enemy' && u.hp > 0);

        let nextPhase: BattleState['phase'] = 'fighting';
        if (remainingEnemies.length === 0) {
          nextPhase = 'victory';
          soundFX.playVictory();
        } else if (remainingAllies.length === 0) {
          nextPhase = 'defeat';
          soundFX.playDefeat();
        }

        return {
          ...prev,
          phase: nextPhase,
          units,
          turnPointer: nextPointer,
          round: nextRound,
          lastActionText: actionText,
          activeAttackerUid: actor.uid,
          activeHitUids: hitUids,
          evadedUids,
          ultActorUid,
          callout,
          screenShake: shake,
          floatingNums: [...prev.floatingNums.slice(-8), ...newFloats],
        };
      });
    },
    [autoUlt]
  );

  useEffect(() => {
    if (battle.phase !== 'fighting') return;
    const delay = speedMult === 2 ? 420 : 820;
    const timer = setTimeout(() => executeUnitTurn(), delay);
    return () => clearTimeout(timer);
  }, [battle.phase, battle.turnPointer, battle.round, battle.lastActionText, speedMult, executeUnitTurn]);

  const creditedRef = useRef<boolean>(false);
  useEffect(() => {
    if (battle.phase === 'fighting') creditedRef.current = false;
    if (battle.phase === 'victory' && battle.encounter && !creditedRef.current) {
      creditedRef.current = true;
      const enc = battle.encounter;
      onUpdateSave((prev) => {
        const nextHighest =
          enc.mode === 'campaign' && typeof enc.stageIndex === 'number'
            ? Math.max(prev.highestStageIndex, Math.min(CAMPAIGN_STAGES.length - 1, enc.stageIndex + 1))
            : prev.highestStageIndex;
        const nextSelected =
          enc.mode === 'campaign' && typeof enc.stageIndex === 'number'
            ? Math.min(CAMPAIGN_STAGES.length - 1, enc.stageIndex + 1)
            : prev.selectedStageIndex;
        return {
          ...prev,
          coins: prev.coins + enc.rewardCoins,
          envelopes: prev.envelopes + enc.rewardEnvelopes,
          highestStageIndex: nextHighest,
          selectedStageIndex: nextSelected,
          arenaWins: enc.mode === 'arena' ? prev.arenaWins + 1 : prev.arenaWins,
          raidClears: enc.mode === 'raid' ? prev.raidClears + 1 : prev.raidClears,
        };
      });
    }
  }, [battle.phase, battle.encounter, onUpdateSave]);

  if (battle.phase !== 'lobby' && battle.encounter) {
    const allies = battle.units.filter((u) => u.side === 'ally');
    const enemies = battle.units.filter((u) => u.side === 'enemy');
    const turnOrder = battle.units.filter((u) => u.hp > 0).sort((a, b) => b.spd - a.spd);

    return (
      <div className="space-y-2.5">
        {/* Compact Combat Top HUD */}
        <div className="game-frame rounded-2xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-amber-300">
              {battle.encounter.title}
            </span>
            <span className="font-mono-num text-xs text-slate-300">R{battle.round}</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {turnOrder.slice(0, 5).map((u, idx) => (
              <span
                key={u.uid}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                  u.side === 'ally'
                    ? 'bg-emerald-600/80 border-emerald-400'
                    : 'bg-red-600/80 border-red-400'
                } ${idx === 0 ? 'ring-2 ring-amber-300' : ''}`}
              >
                {u.name.split(' ')[0]}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFX.playClick();
                setAutoUlt((v) => !v);
              }}
              className={`comic-btn px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                autoUlt ? 'bg-emerald-500 text-white' : 'bg-amber-300 text-[#181a24]'
              }`}
            >
              {autoUlt ? <Bot className="w-3.5 h-3.5" /> : <Hand className="w-3.5 h-3.5" />}
              <span>{autoUlt ? 'Auto' : 'Manual'}</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setSpeedMult((s) => (s === 1 ? 2 : 1));
              }}
              className={`comic-btn px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                speedMult === 2 ? 'bg-amber-400 text-[#181a24]' : 'bg-white text-[#181a24]'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="font-mono-num">{speedMult}x</span>
            </button>
            <button
              onClick={() => setBattle((p) => ({ ...p, phase: 'lobby', encounter: null }))}
              className="comic-btn bg-slate-200 text-[#181a24] p-1.5 rounded-lg"
              aria-label="Mundur"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4v4 Battle Stage */}
        <div
          className={`comic-panel rounded-2xl relative overflow-hidden min-h-[320px] sm:min-h-[360px] flex flex-col justify-between p-3 sm:p-4 ${
            battle.screenShake ? 'animate-arena-shake' : ''
          }`}
        >
          <StageBackdrop
            backdrop={battle.encounter.backdrop}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-8 my-auto pt-6 pb-2">
            <div className="grid grid-cols-2 gap-2 items-end">
              {allies.map((unit) => (
                <FighterPod
                  key={unit.uid}
                  unit={unit}
                  isAttacker={battle.activeAttackerUid === unit.uid}
                  isUltActor={battle.ultActorUid === unit.uid}
                  isHit={battle.activeHitUids.includes(unit.uid)}
                  isDodging={battle.evadedUids.includes(unit.uid)}
                  calloutText={battle.callout?.uid === unit.uid ? battle.callout.text : null}
                  floats={battle.floatingNums.filter((f) => f.unitUid === unit.uid)}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              {enemies.map((unit) => (
                <FighterPod
                  key={unit.uid}
                  unit={unit}
                  isAttacker={battle.activeAttackerUid === unit.uid}
                  isUltActor={battle.ultActorUid === unit.uid}
                  isHit={battle.activeHitUids.includes(unit.uid)}
                  isDodging={battle.evadedUids.includes(unit.uid)}
                  calloutText={battle.callout?.uid === unit.uid ? battle.callout.text : null}
                  floats={battle.floatingNums.filter((f) => f.unitUid === unit.uid)}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 bg-[#141824]/85 text-amber-300 font-display font-bold text-xs text-center py-1.5 px-3 rounded-xl border border-[#181a24]">
            {battle.lastActionText}
          </div>
        </div>

        {/* Bottom Ultimate Trigger Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {allies.map((unit) => {
            const ready =
              unit.hp > 0 && unit.gauge >= getUltCost(unit.templateId) && battle.phase === 'fighting';
            return (
              <button
                key={unit.uid}
                disabled={!ready}
                onClick={() => executeUnitTurn(unit.uid)}
                className={`comic-btn rounded-xl px-3 py-2 text-left ${
                  ready ? 'bg-amber-400 text-[#181a24] ring-2 ring-red-500' : 'bg-[#23283b] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="truncate">{unit.name.split(' ')[0]}</span>
                  <span className="font-mono-num">{unit.hp <= 0 ? 'KO' : `${Math.min(100, unit.gauge)}%`}</span>
                </div>
                <div className="text-[11px] font-display font-bold truncate mt-0.5">
                  {unit.skillName}
                </div>
              </button>
            );
          })}
        </div>

        {/* Victory / Defeat Modal */}
        {(battle.phase === 'victory' || battle.phase === 'defeat') && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="game-parchment rounded-2xl p-5 max-w-sm w-full text-center space-y-4">
              <div
                className={`mx-auto w-14 h-14 rounded-2xl border-[3px] border-[#181a24] flex items-center justify-center ${
                  battle.phase === 'victory' ? 'bg-amber-400' : 'bg-slate-300'
                }`}
              >
                {battle.phase === 'victory' ? (
                  <Trophy className="w-7 h-7 text-[#181a24]" />
                ) : (
                  <Skull className="w-7 h-7 text-[#181a24]" />
                )}
              </div>

              <h3 className="font-display text-3xl font-bold text-[#181a24]">
                {battle.phase === 'victory' ? 'MENANG!' : 'KALAH!'}
              </h3>

              {battle.phase === 'victory' && (
                <div className="bg-white border-2 border-[#181a24] rounded-xl p-3 flex justify-around font-mono-num font-bold text-sm">
                  <span className="text-amber-700">+{battle.encounter.rewardCoins.toLocaleString('id-ID')} Koin</span>
                  <span className="text-red-600">+{battle.encounter.rewardEnvelopes} Amplop</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setBattle((p) => ({ ...p, phase: 'lobby', encounter: null }))}
                  className="comic-btn flex-1 bg-white text-[#181a24] font-display font-bold text-sm py-2.5 rounded-xl"
                >
                  Kembali
                </button>
                {battle.phase === 'victory' &&
                battle.encounter.mode === 'campaign' &&
                typeof battle.encounter.stageIndex === 'number' &&
                battle.encounter.stageIndex + 1 < CAMPAIGN_STAGES.length ? (
                  <button
                    onClick={() => startCampaignStage((battle.encounter?.stageIndex ?? 0) + 1)}
                    className="comic-btn flex-1 bg-emerald-500 text-white font-display font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1"
                  >
                    <Play className="w-4 h-4" /> Lanjut
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (
                        battle.encounter?.mode === 'campaign' &&
                        typeof battle.encounter.stageIndex === 'number'
                      ) {
                        startCampaignStage(battle.encounter.stageIndex);
                      } else {
                        setBattle((p) => ({ ...p, phase: 'lobby', encounter: null }));
                      }
                    }}
                    className="comic-btn flex-1 bg-amber-400 text-[#181a24] font-display font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" /> Ulangi
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Clean Visual Lobby View
  return (
    <div className="space-y-3">
      {claimBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-500 text-white font-display font-bold px-4 py-1.5 rounded-xl border-2 border-[#181a24] shadow-lg text-sm">
          {claimBanner}
        </div>
      )}

      {/* Mode Switcher + Uang Kas Chest Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-1 bg-[#23283b] border-[2.5px] border-[#10121a] rounded-xl">
          <button
            onClick={() => {
              soundFX.playClick();
              setBattleMode('campaign');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold flex items-center gap-1.5 ${
              battleMode === 'campaign' ? 'bg-red-500 text-white' : 'text-slate-300'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Campaign</span>
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setBattleMode('arena');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold flex items-center gap-1.5 ${
              battleMode === 'arena' ? 'bg-amber-400 text-[#181a24]' : 'text-slate-300'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Arena</span>
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setBattleMode('raid');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold flex items-center gap-1.5 ${
              battleMode === 'raid' ? 'bg-purple-600 text-white' : 'text-slate-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Raid</span>
          </button>
        </div>

        {/* Edit Tim (Drag & Drop) + Peti Uang Kas */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              setTeamEditorOpen(true);
            }}
            className="comic-btn bg-sky-400 hover:bg-sky-300 text-[#181a24] px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Edit Tim</span>
          </button>

          <button
            onClick={handleClaimIdleCash}
            disabled={idleReward.coins <= 0 && idleReward.envelopes <= 0}
            className="comic-btn bg-amber-400 hover:bg-amber-300 text-[#181a24] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Gift className="w-4 h-4 text-red-600" />
            <span className="font-display">Uang Kas</span>
            <span className="font-mono-num bg-white/80 px-1.5 py-0.5 rounded text-[11px]">
              +{idleReward.coins.toLocaleString('id-ID')}
            </span>
          </button>
        </div>
      </div>

      {/* Campaign Stage Preview */}
      {battleMode === 'campaign' && (
        <div className="game-parchment rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold text-red-600">
                {BACKDROP_NAMES[selectedStage.backdrop]}
              </div>
              <h2 className="font-display text-xl font-bold text-[#181a24]">
                Stage {selectedStage.code} · {selectedStage.name}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  onUpdateSave((p) => ({
                    ...p,
                    selectedStageIndex: Math.max(0, p.selectedStageIndex - 1),
                  }))
                }
                disabled={save.selectedStageIndex <= 0}
                className="comic-btn bg-white p-1.5 rounded-xl"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono-num text-xs font-bold px-1.5">
                {selectedStage.code}/10-5
              </span>
              <button
                onClick={() =>
                  onUpdateSave((p) => ({
                    ...p,
                    selectedStageIndex: Math.min(p.highestStageIndex, p.selectedStageIndex + 1),
                  }))
                }
                disabled={save.selectedStageIndex >= save.highestStageIndex}
                className="comic-btn bg-white p-1.5 rounded-xl"
                aria-label="Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Illustrated Stage Diorama: Allies vs Enemies */}
          <div className="relative rounded-xl border-[2.5px] border-[#181a24] overflow-hidden min-h-[210px] p-3 flex items-end justify-between gap-2">
            <StageBackdrop
              backdrop={selectedStage.backdrop}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            {/* Allies Preview */}
            <div className="relative z-10 flex items-end -space-x-3">
              {save.partyIds.map((cid) => (
                <ChibiAvatar key={cid} characterId={cid} size={66} bouncy />
              ))}
            </div>
            {/* VS Emblem */}
            <div className="relative z-10 self-center bg-amber-400 border-2 border-[#181a24] rounded-full w-9 h-9 flex items-center justify-center font-display font-bold text-xs shadow">
              VS
            </div>
            {/* Enemies Preview */}
            <div className="relative z-10 flex items-end -space-x-3">
              {selectedStage.enemies.map((e, i) => (
                <ChibiAvatar key={i} characterId={e.id} size={e.isBoss ? 86 : 64} flipX bouncy />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="font-mono-num text-xs font-bold text-slate-700">
              Hadiah: <span className="text-amber-700">+{selectedStage.rewardCoins.toLocaleString('id-ID')} Koin</span> ·{' '}
              <span className="text-red-600">+{selectedStage.rewardEnvelopes} Amplop</span>
            </div>
            <button
              onClick={() => startCampaignStage(save.selectedStageIndex)}
              className="comic-btn bg-red-500 hover:bg-red-400 text-white font-display font-bold text-base px-6 py-2.5 rounded-xl flex items-center gap-2"
            >
              <Swords className="w-5 h-5" />
              <span>BERTARUNG!</span>
            </button>
          </div>
        </div>
      )}

      {/* Arena Debat */}
      {battleMode === 'arena' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ARENA_RIVALS.map((rival, idx) => (
            <div key={rival.id} className="game-parchment rounded-2xl p-3.5 flex flex-col justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-amber-700">{rival.rankLabel}</div>
                <h3 className="font-display text-lg font-bold text-[#181a24]">{rival.name}</h3>
                <div className="grid grid-cols-4 gap-1 mt-2 bg-white p-1.5 rounded-xl border-2 border-[#181a24]">
                  {rival.characterIds.map((cid, i) => (
                    <div key={i} className="flex justify-center">
                      <ChibiAvatar characterId={cid} size={46} />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => startArenaMatch(idx)}
                className="comic-btn w-full bg-amber-400 hover:bg-amber-300 text-[#181a24] font-display font-bold text-sm py-2 rounded-xl"
              >
                Lawan · +{rival.rewardEnvelopes} Amplop
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Raid Boss */}
      {battleMode === 'raid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RAID_BOSSES.map((boss, idx) => (
            <div key={boss.id} className="game-parchment rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 border-2 border-[#181a24] rounded-xl p-1.5 shrink-0">
                  <ChibiAvatar
                    characterId={boss.id === 'raid_inflasi' ? 'boss_inflasi' : 'boss_mangkrak'}
                    size={76}
                    bouncy
                  />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#181a24]">{boss.name}</h3>
                  <div className="font-mono-num text-xs font-bold text-red-600">
                    HP {boss.hp.toLocaleString('id-ID')}
                  </div>
                  <div className="font-mono-num text-[11px] font-bold text-amber-700 mt-0.5">
                    +{boss.rewardEnvelopes} Amplop
                  </div>
                </div>
              </div>
              <button
                onClick={() => startRaidBoss(idx)}
                className="comic-btn bg-purple-600 hover:bg-purple-500 text-white font-display font-bold text-sm px-4 py-2.5 rounded-xl shrink-0"
              >
                Serbu!
              </button>
            </div>
          ))}
        </div>
      )}
      {teamEditorOpen && (
        <TeamEditorModal
          save={save}
          onUpdateSave={onUpdateSave}
          onClose={() => setTeamEditorOpen(false)}
        />
      )}
    </div>
  );
};

const FighterPod: React.FC<{
  unit: BattleUnit;
  isAttacker: boolean;
  isUltActor: boolean;
  isHit: boolean;
  isDodging: boolean;
  calloutText: string | null;
  floats: FloatingNumber[];
}> = ({ unit, isAttacker, isUltActor, isHit, isDodging, calloutText, floats }) => {
  const isDead = unit.hp <= 0;
  const hpPct = Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100));
  const gaugePct = Math.max(0, Math.min(100, unit.gauge));
  const rCfg = RARITY_CONFIG[unit.rarity];

  let animClass = '';
  if (!isDead) {
    if (isDodging) animClass = 'animate-santuy-dodge';
    else if (isUltActor && unit.templateId === 'jenderal_gemoy') animClass = 'animate-joget';
    else if (isAttacker) animClass = unit.side === 'ally' ? 'animate-lunge-right' : 'animate-lunge-left';
    else if (isHit) animClass = 'animate-hit-shake';
    else if (unit.stunTurns > 0) animClass = 'animate-stun-wobble';
  }

  return (
    <div
      className={`relative flex flex-col items-center transition-opacity duration-300 ${
        isDead ? 'opacity-25 grayscale' : 'opacity-100'
      } ${animClass}`}
    >
      {/* Comedic Speech Callout Bubble */}
      {calloutText && !isDead && (
        <div className="pointer-events-none absolute -top-9 left-1/2 z-40 whitespace-nowrap animate-callout-pop">
          <div className="bg-amber-300 text-[#181a24] font-display font-bold text-[11px] px-2.5 py-0.5 rounded-xl border-2 border-[#181a24] shadow-[0_2px_0_#181a24]">
            {calloutText}
          </div>
        </div>
      )}

      {/* Floating Damage / Heal Numbers */}
      <div className="pointer-events-none absolute -top-2 left-1/2 z-30 w-28">
        {floats.slice(-3).map((f) => (
          <div
            key={f.id}
            className={`animate-float-damage font-display font-bold text-center drop-shadow-[0_2px_0_#181a24] ${
              f.kind === 'crit'
                ? 'text-lg text-amber-300'
                : f.kind === 'heal'
                ? 'text-sm text-emerald-300'
                : f.kind === 'buff'
                ? 'text-xs text-sky-300'
                : f.kind === 'debuff'
                ? 'text-xs text-purple-300'
                : f.kind === 'miss'
                ? 'text-xs text-white'
                : 'text-base text-white'
            }`}
          >
            {f.text}
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-0.5 min-h-[14px]">
        {unit.stunTurns > 0 && (
          <span className="bg-amber-400 text-[#181a24] text-[9px] font-bold px-1 rounded border border-[#181a24]">
            ✦ STUN
          </span>
        )}
        {unit.tauntTurns > 0 && (
          <span className="bg-sky-500 text-white text-[9px] font-bold px-1 rounded border border-[#181a24] flex items-center gap-0.5">
            <Shield className="w-2.5 h-2.5" />
          </span>
        )}
        {unit.evadeBuffTurns > 0 && (
          <span className="bg-emerald-500 text-white text-[9px] font-bold px-1 rounded border border-[#181a24] flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      <ChibiAvatar
        characterId={unit.templateId}
        size={unit.isBoss ? 98 : 72}
        flipX={unit.side === 'enemy'}
        bouncy={!isDead}
      />

      <div className="w-full max-w-[108px] bg-white/95 border-2 border-[#181a24] rounded-lg p-1 shadow-[0_2px_0_#181a24]">
        <div className="flex items-center justify-between text-[10px] font-bold leading-none mb-1">
          <span className="truncate" style={{ color: unit.side === 'ally' ? '#181a24' : rCfg.color }}>
            {unit.name.split(' ')[0]}
          </span>
          <span className="font-mono-num text-[9px] text-slate-600">{unit.hp}</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full border border-[#181a24] overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              unit.side === 'ally' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-amber-400 transition-all duration-200" style={{ width: `${gaugePct}%` }} />
        </div>
      </div>
    </div>
  );
};

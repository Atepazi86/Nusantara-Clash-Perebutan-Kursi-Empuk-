import { CHARACTER_MAP } from '../data/characters';
import { OwnedCharacterState, PlayerSaveData } from '../types/game';

export const MAX_LEVEL = 120;
export const MAX_STARS = 5;

export function getLevelUpCost(currentLevel: number): number {
  return Math.round(120 + currentLevel * 55 + Math.pow(currentLevel, 1.35) * 4);
}

export function getMultiLevelCost(currentLevel: number, count: number): { totalCost: number; levelsGained: number } {
  let totalCost = 0;
  let lv = currentLevel;
  let gained = 0;
  for (let i = 0; i < count && lv < MAX_LEVEL; i++) {
    totalCost += getLevelUpCost(lv);
    lv++;
    gained++;
  }
  return { totalCost, levelsGained: gained };
}

export function getStarUpgradeShards(currentStars: number): number {
  const table: Record<number, number> = {
    1: 20,
    2: 35,
    3: 55,
    4: 80,
  };
  return table[currentStars] ?? 999;
}

export function getBlessingUpgradeCost(tier: number): number {
  return 450 + tier * 550;
}

export interface ComputedStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  startGauge: number;
  power: number;
}

export function computeCharacterStats(owned: OwnedCharacterState): ComputedStats {
  const tpl = CHARACTER_MAP[owned.id];
  if (!tpl) {
    return { hp: 1000, atk: 100, def: 80, spd: 100, critRate: 10, startGauge: 0, power: 1000 };
  }

  const starMultiplier = 1 + (owned.stars - 1) * 0.22; // +22% per star awakening
  const lvOffset = Math.max(0, owned.level - 1);

  let hp = (tpl.baseStats.hp + tpl.growthPerLevel.hp * lvOffset) * starMultiplier;
  let atk = (tpl.baseStats.atk + tpl.growthPerLevel.atk * lvOffset) * starMultiplier;
  let def = (tpl.baseStats.def + tpl.growthPerLevel.def * lvOffset) * starMultiplier;
  let spd = tpl.baseStats.spd + (owned.stars - 1) * 3;
  let critRate = tpl.baseStats.critRate + (owned.stars - 1) * 2;
  let startGauge = 0;

  let hpBonusPct = 0;
  let atkBonusPct = 0;
  let defBonusPct = 0;

  tpl.defaultBlessings.forEach((blessing, idx) => {
    if (owned.level >= blessing.unlockLevel) {
      const tier = owned.blessingTiers?.[idx] ?? 0;
      const tierMult = 1 + tier * 0.25;
      hpBonusPct += (blessing.statBonus.hpPct ?? 0) * tierMult;
      atkBonusPct += (blessing.statBonus.atkPct ?? 0) * tierMult;
      defBonusPct += (blessing.statBonus.defPct ?? 0) * tierMult;
      spd += Math.round((blessing.statBonus.spdFlat ?? 0) * tierMult);
      critRate += Math.round((blessing.statBonus.critPct ?? 0) * tierMult);
      startGauge += blessing.statBonus.startGauge ?? 0;
    }
  });

  hp = Math.round(hp * (1 + hpBonusPct / 100));
  atk = Math.round(atk * (1 + atkBonusPct / 100));
  def = Math.round(def * (1 + defBonusPct / 100));

  const power = Math.round(hp * 0.65 + atk * 4.5 + def * 3.2 + spd * 4 + critRate * 15);

  return { hp, atk, def, spd, critRate, startGauge, power };
}

export function computePartyPower(save: PlayerSaveData): number {
  return save.partyIds.reduce((sum, id) => {
    const owned = save.ownedCharacters[id];
    if (!owned) return sum;
    return sum + computeCharacterStats(owned).power;
  }, 0);
}

export function computeIdleCashRewards(save: PlayerSaveData, now = Date.now()): {
  minutesElapsed: number;
  coins: number;
  envelopes: number;
} {
  const diffMs = Math.max(0, now - save.lastCashClaimAt);
  const cappedMinutes = Math.min(720, Math.floor(diffMs / 60000)); // cap at 12 hours
  const stageFactor = 1 + save.highestStageIndex * 0.28;
  const coins = Math.floor(cappedMinutes * 18 * stageFactor);
  const envelopes = Math.floor((cappedMinutes / 30) * (15 + save.highestStageIndex * 3));
  return { minutesElapsed: cappedMinutes, coins, envelopes };
}

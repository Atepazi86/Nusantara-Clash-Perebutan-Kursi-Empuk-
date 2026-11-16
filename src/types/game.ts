export enum Rarity {
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
}

export enum CharacterRole {
  TANK = 'Tank',
  TACTICIAN = 'Taktisi',
  COMMANDER = 'Komandan',
  ASSASSIN = 'Lincah',
  DEBUFFER = 'Debuffer',
  SUPPORT = 'Support',
  MAGE = 'Mage',
  WARRIOR = 'Pejuang',
}

export interface AdventureSkill {
  id: string;
  name: string;
  unlockStars: number;
  type: 'basic' | 'ultimate' | 'passive';
  description: string;
  multiplierText: string;
  gaugeCost?: number;
}

export interface BlessingEffect {
  id: string;
  name: string;
  unlockLevel: 1 | 50 | 100;
  description: string;
  statBonus: {
    hpPct?: number;
    atkPct?: number;
    defPct?: number;
    spdFlat?: number;
    critPct?: number;
    startGauge?: number;
  };
}

export interface CharacterTemplate {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  role: CharacterRole;
  tagline: string;
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
    critRate: number; // percentage e.g. 12
  };
  growthPerLevel: {
    hp: number;
    atk: number;
    def: number;
  };
  skills: [AdventureSkill, AdventureSkill, AdventureSkill];
  defaultBlessings: [BlessingEffect, BlessingEffect, BlessingEffect];
}

export interface OwnedCharacterState {
  id: string;
  level: number; // 1 - 120
  stars: number; // 1 - 5
  shards: number;
  blessingTiers: [number, number, number]; // Bonus upgrade levels (0 - 5) for Lv1, Lv50, Lv100 Restu
}

export type ArenaBackdropId = 'bundaran_hi' | 'angkringan' | 'gerbang_dpr' | 'ikn_masa_depan';

export interface EnemyUnitTemplate {
  id: string;
  name: string;
  roleTitle: string;
  isBoss?: boolean;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  skillName: string;
  skillDesc: string;
}

export interface CampaignStage {
  id: string;
  chapter: number;
  stageNum: number;
  code: string; // e.g. "1-1"
  name: string;
  backdrop: ArenaBackdropId;
  isBoss: boolean;
  recommendedPower: number;
  enemies: EnemyUnitTemplate[];
  rewardCoins: number;
  rewardEnvelopes: number;
}

export interface RaidBossDef {
  id: string;
  name: string;
  subtitle: string;
  backdrop: ArenaBackdropId;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  skillName: string;
  skillDesc: string;
  rewardCoins: number;
  rewardEnvelopes: number;
}

export interface GachaPullItem {
  characterId: string;
  rarity: Rarity;
  isNew: boolean;
  shardsGained: number;
  isDuplicate: boolean;
}

export type BattleMode = 'campaign' | 'arena' | 'raid';

export interface PlayerSaveData {
  coins: number; // Koin Receh
  envelopes: number; // Amplop Cokelat
  pityCounter: number; // 0 - 50
  totalPulls: number;
  ownedCharacters: Record<string, OwnedCharacterState>;
  partyIds: string[]; // Up to 4 character IDs (index 0 = Frontline, 1-3 = Backline)
  highestStageIndex: number; // 0-based index into CAMPAIGN_STAGES (cleared count)
  selectedStageIndex: number;
  lastCashClaimAt: number; // epoch ms
  arenaWins: number;
  raidClears: number;
  soundMuted: boolean;
}

export interface FloatingNumber {
  id: string;
  unitUid: string;
  text: string;
  kind: 'damage' | 'crit' | 'heal' | 'buff' | 'debuff' | 'miss';
}

export interface BattleUnit {
  uid: string;
  templateId: string;
  name: string;
  side: 'ally' | 'enemy';
  slotIndex: number; // 0 = Frontline, 1-3 = Backline
  rarity: Rarity;
  isBoss?: boolean;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  gauge: number; // 0 - 100
  shield: number;
  stunTurns: number;
  tauntTurns: number;
  atkBuffTurns: number;
  atkBuffPct: number;
  defBuffTurns: number;
  defBuffPct: number;
  evadeBuffTurns: number;
  spdBuffTurns: number;
  atkDebuffTurns: number;
  skillName: string;
  ultDesc: string;
  passiveUnlocked: boolean;
  stars: number;
}

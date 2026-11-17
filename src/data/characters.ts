import {
  ArenaBackdropId,
  CampaignStage,
  CharacterRole,
  CharacterTemplate,
  EnemyUnitTemplate,
  PlayerSaveData,
  RaidBossDef,
  Rarity,
} from '../types/game';

export const RARITY_CONFIG: Record<
  Rarity,
  {
    label: string;
    tierName: string;
    color: string;
    bgSoft: string;
    bgCard: string;
    border: string;
    text: string;
    shardValue: number;
  }
> = {
  [Rarity.RARE]: {
    label: 'Rare',
    tierName: 'Rakyat Jelata',
    color: '#3b82f6',
    bgSoft: 'bg-blue-50',
    bgCard: 'bg-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-600',
    shardValue: 10,
  },
  [Rarity.EPIC]: {
    label: 'Epic',
    tierName: 'Pejabat Daerah',
    color: '#a855f7',
    bgSoft: 'bg-purple-50',
    bgCard: 'bg-purple-500',
    border: 'border-purple-500',
    text: 'text-purple-600',
    shardValue: 15,
  },
  [Rarity.LEGENDARY]: {
    label: 'Legendary',
    tierName: 'Menteri & Elit',
    color: '#f59e0b',
    bgSoft: 'bg-amber-50',
    bgCard: 'bg-amber-500',
    border: 'border-amber-500',
    text: 'text-amber-600',
    shardValue: 25,
  },
  [Rarity.MYTHIC]: {
    label: 'Mythic',
    tierName: 'Tokoh Sentral',
    color: '#ef4444',
    bgSoft: 'bg-red-50',
    bgCard: 'bg-red-500',
    border: 'border-red-500',
    text: 'text-red-600',
    shardValue: 40,
  },
};

export const CHARACTER_POOL: CharacterTemplate[] = [
  {
    id: 'jenderal_gemoy',
    name: 'Jenderal Gemoy',
    title: 'Panglima Safari Empuk',
    rarity: Rarity.MYTHIC,
    role: CharacterRole.TANK,
    tagline: 'Setelan safari rapi, peci miring sedikit, siap joget demi pertahanan koalisi!',
    baseStats: { hp: 1680, atk: 145, def: 130, spd: 96, critRate: 10 },
    growthPerLevel: { hp: 92, atk: 9, def: 8 },
    skills: [
      {
        id: 'jg_basic',
        name: 'Serbuan Makan Siang',
        unlockStars: 1,
        type: 'basic',
        description: 'Menyerang barisan depan musuh dengan kotak makan siang bergizi (+bonus damage dari 15% Max HP).',
        multiplierText: '115% ATK + 8% HP',
      },
      {
        id: 'jg_ult',
        name: 'Joget Ok Gas',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Berjoget riang untuk memulihkan 24% Max HP seluruh tim dan meningkatkan Defense tim sebesar 35% selama 2 giliran.',
        multiplierText: 'Heal 24% + DEF +35%',
        gaugeCost: 100,
      },
      {
        id: 'jg_passive',
        name: 'Perisai Safari Abadi',
        unlockStars: 3,
        type: 'passive',
        description: 'Di awal pertarungan, mendapat Taunt 2 giliran dan mengurangi damage masuk sebesar 18%.',
        multiplierText: 'DMG Reduksi 18%',
      },
    ],
    defaultBlessings: [
      {
        id: 'jg_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Viral joget memicu semangat: HP Maksimal naik permanen.',
        statBonus: { hpPct: 12, defPct: 6 },
      },
      {
        id: 'jg_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Elektabilitas tembus batas: Defense dan HP melonjak tajam.',
        statBonus: { hpPct: 18, defPct: 16 },
      },
      {
        id: 'jg_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Dukungan penuh lintas fraksi: Memulai duel dengan +40 Energy & +15% ATK.',
        statBonus: { atkPct: 15, startGauge: 40 },
      },
    ],
  },
  {
    id: 'pak_tukang_kayu',
    name: 'Pak Tukang Kayu',
    title: 'Arsitek Sepeda Kilat',
    rarity: Rarity.MYTHIC,
    role: CharacterRole.TACTICIAN,
    tagline: 'Kemeja putih digulung, langkah gesit, siap bagi-bagi sepeda ke siapa saja yang bisa jawab kuis.',
    baseStats: { hp: 1320, atk: 190, def: 95, spd: 118, critRate: 16 },
    growthPerLevel: { hp: 70, atk: 13, def: 5 },
    skills: [
      {
        id: 'ptk_basic',
        name: 'Kuis Nama Ikan',
        unlockStars: 1,
        type: 'basic',
        description: 'Melontarkan pertanyaan dadakan ke 1 musuh, memberi damage akurat dan +15 Energy tambahan.',
        multiplierText: '120% ATK',
      },
      {
        id: 'ptk_ult',
        name: 'Hujan Sepeda',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Memanggil hujan sepeda mini ke seluruh musuh (145% ATK AoE) dan memberi efek Stun 1 giliran ke target acak.',
        multiplierText: '145% AoE + Stun',
        gaugeCost: 100,
      },
      {
        id: 'ptk_passive',
        name: 'Kebut Infrastruktur',
        unlockStars: 3,
        type: 'passive',
        description: 'Setiap penggunaan Skill Ultimate memberi perisai (Shield) sebesar 15% Max HP ke seluruh sekutu.',
        multiplierText: 'Tim Shield 15%',
      },
    ],
    defaultBlessings: [
      {
        id: 'ptk_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Sepeda viral di timeline: Speed & Attack meningkat.',
        statBonus: { atkPct: 10, spdFlat: 8 },
      },
      {
        id: 'ptk_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Tingkat kepuasan tinggi: Critical Rate & Attack naik pesat.',
        statBonus: { atkPct: 18, critPct: 10 },
      },
      {
        id: 'ptk_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Proyek strategis rampung: +25% HP & +50 Energy awal ronde.',
        statBonus: { hpPct: 25, startGauge: 50 },
      },
    ],
  },
  {
    id: 'ibu_banteng',
    name: 'Ibu Banteng',
    title: 'Komandan Ruang Tengah',
    rarity: Rarity.MYTHIC,
    role: CharacterRole.COMMANDER,
    tagline: 'Blazer merah menyala, tatapan tegas, satu komando menggerakkan seluruh pasukan.',
    baseStats: { hp: 1380, atk: 205, def: 92, spd: 112, critRate: 18 },
    growthPerLevel: { hp: 72, atk: 14, def: 5 },
    skills: [
      {
        id: 'ib_basic',
        name: 'Tatapan Tajam',
        unlockStars: 1,
        type: 'basic',
        description: 'Menyerang musuh dan menurunkan Attack target sebesar 20% selama 2 giliran.',
        multiplierText: '115% ATK + ATK -20%',
      },
      {
        id: 'ib_ult',
        name: 'Komando Petugas',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Memberi serangan burst 165% ATK ke musuh terkuat DAN memerintahkan seluruh sekutu langsung melakukan serangan bonus!',
        multiplierText: '165% + All-Out Assist',
        gaugeCost: 100,
      },
      {
        id: 'ib_passive',
        name: 'Disiplin Partai',
        unlockStars: 3,
        type: 'passive',
        description: 'Meningkatkan Attack seluruh anggota tim sebesar 15% selama Ibu Banteng masih berdiri.',
        multiplierText: 'Aura Tim +15% ATK',
      },
    ],
    defaultBlessings: [
      {
        id: 'ib_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Klip pidato trending: +12% Attack & +5% Crit.',
        statBonus: { atkPct: 12, critPct: 5 },
      },
      {
        id: 'ib_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Basis kader solid: +20% Attack & +12% HP.',
        statBonus: { atkPct: 20, hpPct: 12 },
      },
      {
        id: 'ib_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Mandat tertinggi: +15% Crit & +45 Energy awal ronde.',
        statBonus: { critPct: 15, atkPct: 15, startGauge: 45 },
      },
    ],
  },
  {
    id: 'mas_santuy',
    name: 'Mas Santuy',
    title: 'Pendekar Susu Kotak',
    rarity: Rarity.LEGENDARY,
    role: CharacterRole.ASSASSIN,
    tagline: 'Kemeja kotak-kotak, ekspresi kalem, menghindar santai lalu membalas dengan critical pedas.',
    baseStats: { hp: 1180, atk: 185, def: 82, spd: 128, critRate: 24 },
    growthPerLevel: { hp: 62, atk: 12, def: 4 },
    skills: [
      {
        id: 'ms_basic',
        name: 'Lempar Kotak Susu',
        unlockStars: 1,
        type: 'basic',
        description: 'Serangan cepat dengan peluang Crit tinggi ke target dengan HP terendah.',
        multiplierText: '125% ATK',
      },
      {
        id: 'ms_ult',
        name: 'Counter Santuy',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Menghantam 1 target dengan 245% ATK (pasti Critical!) dan mengaktifkan Evasion Buff 2 giliran.',
        multiplierText: '245% Crit + Evasion',
        gaugeCost: 90,
      },
      {
        id: 'ms_passive',
        name: 'Gaya Tanpa Beban',
        unlockStars: 3,
        type: 'passive',
        description: 'Setiap berhasil menghindari serangan, langsung memulihkan 10% HP dan +20 Energy.',
        multiplierText: 'Counter Heal 10%',
      },
    ],
    defaultBlessings: [
      {
        id: 'ms_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Meme santuy mendunia: +10 Speed & +8% Crit.',
        statBonus: { spdFlat: 10, critPct: 8 },
      },
      {
        id: 'ms_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Daya tarik milenial: +18% Attack & +12% Crit.',
        statBonus: { atkPct: 18, critPct: 12 },
      },
      {
        id: 'ms_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Posisi aman terjamin: +20% HP, +15 Speed, +35 Energy awal.',
        statBonus: { hpPct: 20, spdFlat: 15, startGauge: 35 },
      },
    ],
  },
  {
    id: 'juragan_energi',
    name: 'Juragan Energi',
    title: 'Maestro Tabung Hijau',
    rarity: Rarity.LEGENDARY,
    role: CharacterRole.DEBUFFER,
    tagline: 'Batik elegan, tabung gas mini di tangan, ahli mengeringkan Energy lawan dalam sekejap.',
    baseStats: { hp: 1250, atk: 168, def: 90, spd: 114, critRate: 14 },
    growthPerLevel: { hp: 66, atk: 11, def: 5 },
    skills: [
      {
        id: 'je_basic',
        name: 'Lobi Investasi',
        unlockStars: 1,
        type: 'basic',
        description: 'Menyerang musuh dan mencuri 10% Attack target menjadi buff diri sendiri.',
        multiplierText: '115% ATK + Steal ATK',
      },
      {
        id: 'je_ult',
        name: 'Kelangkaan Mendadak',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Menyerang semua musuh (130% ATK), menguras 45 Energy lawan, dan memindahkan ATK ke tim sendiri.',
        multiplierText: '130% AoE + Drain 45 ENG',
        gaugeCost: 100,
      },
      {
        id: 'je_passive',
        name: 'Monopoli Pasokan',
        unlockStars: 3,
        type: 'passive',
        description: 'Musuh yang terkena pengurangan Energy mendapat tambahan +18% damage dari semua serangan tim.',
        multiplierText: 'Debuff +18% DMG',
      },
    ],
    defaultBlessings: [
      {
        id: 'je_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Antrean panjang jadi sorotan: +10% Attack & +10% HP.',
        statBonus: { atkPct: 10, hpPct: 10 },
      },
      {
        id: 'je_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Negosiator ulung: +16% Defense & +14% Attack.',
        statBonus: { defPct: 16, atkPct: 14 },
      },
      {
        id: 'je_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Kursi strategis terkunci: +20% All Stats & +40 Energy awal.',
        statBonus: { hpPct: 20, atkPct: 20, defPct: 20, startGauge: 40 },
      },
    ],
  },
  {
    id: 'abang_ojol',
    name: 'Abang Ojol',
    title: 'Kurir Bintang Lima',
    rarity: Rarity.EPIC,
    role: CharacterRole.SUPPORT,
    tagline: 'Jaket hijau menyala, helm half-face, selalu tiba tepat waktu sebelum HP sekutu habis.',
    baseStats: { hp: 1210, atk: 140, def: 88, spd: 124, critRate: 12 },
    growthPerLevel: { hp: 64, atk: 9, def: 5 },
    skills: [
      {
        id: 'ao_basic',
        name: 'Klakson Telolet',
        unlockStars: 1,
        type: 'basic',
        description: 'Menyerang musuh depan dan mempercepat giliran sekutu dengan HP terendah.',
        multiplierText: '110% ATK',
      },
      {
        id: 'ao_ult',
        name: 'Antar Kilat',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Meningkatkan Speed seluruh tim selama 2 giliran serta memberi Shield 30% Max HP & Heal 15% ke sekutu paling kritis.',
        multiplierText: 'SPD Up + Shield 30%',
        gaugeCost: 90,
      },
      {
        id: 'ao_passive',
        name: 'Rating Bintang 5',
        unlockStars: 3,
        type: 'passive',
        description: 'Setiap giliran, memulihkan 6% HP sekutu dengan persentase HP terendah.',
        multiplierText: 'Auto Heal 6%/turn',
      },
    ],
    defaultBlessings: [
      {
        id: 'ao_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Tip tambahan pelanggan: +10 Speed & +10% HP.',
        statBonus: { spdFlat: 10, hpPct: 10 },
      },
      {
        id: 'ao_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Solidaritas aspal: +15% HP & +15% Defense.',
        statBonus: { hpPct: 15, defPct: 15 },
      },
      {
        id: 'ao_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Prioritas order kilat: +20% Attack, +12 Speed, +35 Energy awal.',
        statBonus: { atkPct: 20, spdFlat: 12, startGauge: 35 },
      },
    ],
  },
  {
    id: 'ibu_senam',
    name: 'Ibu Senam Komplek',
    title: 'Diva Aerobik RT 05',
    rarity: Rarity.RARE,
    role: CharacterRole.MAGE,
    tagline: 'Training warna neon, topi visor, siap menggetarkan arena dengan musik senam pagi!',
    baseStats: { hp: 1020, atk: 152, def: 72, spd: 108, critRate: 15 },
    growthPerLevel: { hp: 54, atk: 10, def: 4 },
    skills: [
      {
        id: 'is_basic',
        name: 'Tepuk Semangat',
        unlockStars: 1,
        type: 'basic',
        description: 'Gelombang suara peluit mengenai musuh depan dengan damage konsisten.',
        multiplierText: '115% ATK',
      },
      {
        id: 'is_ult',
        name: 'Musik Aerobik',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Menembakkan gelombang sonik ke seluruh musuh sebesar 140% ATK dengan peluang Critical tambahan.',
        multiplierText: '140% AoE Wave',
        gaugeCost: 90,
      },
      {
        id: 'is_passive',
        name: 'Ritme Pagi Hari',
        unlockStars: 3,
        type: 'passive',
        description: 'Meningkatkan Critical Rate diri sendiri dan sekutu di baris belakang sebesar +10%.',
        multiplierText: 'Backline +10% Crit',
      },
    ],
    defaultBlessings: [
      {
        id: 'is_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Video senam ibu-ibu viral: +10% Attack.',
        statBonus: { atkPct: 10 },
      },
      {
        id: 'is_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Suara emak-emak menentukan: +15% Attack & +10% Crit.',
        statBonus: { atkPct: 15, critPct: 10 },
      },
      {
        id: 'is_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Ketua arisan se-kecamatan: +20% HP & +30 Energy awal.',
        statBonus: { hpPct: 20, startGauge: 30 },
      },
    ],
  },
  {
    id: 'hansip_malam',
    name: 'Hansip Malam',
    title: 'Penjaga Pos Ronda',
    rarity: Rarity.RARE,
    role: CharacterRole.WARRIOR,
    tagline: 'Seragam hijau gagah, kumis tebal, kentongan bambu siap mengetuk nyali lawan!',
    baseStats: { hp: 1350, atk: 122, def: 108, spd: 94, critRate: 8 },
    growthPerLevel: { hp: 74, atk: 7, def: 7 },
    skills: [
      {
        id: 'hm_basic',
        name: 'Pukul Kentongan',
        unlockStars: 1,
        type: 'basic',
        description: 'Menghantam musuh dengan kentongan bambu mantap.',
        multiplierText: '110% ATK',
      },
      {
        id: 'hm_ult',
        name: 'Ronda Malam',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Memukul kentongan bertubi-tubi: Memaksa musuh menyerang Hansip (Taunt 2 giliran) dan menaikkan Defense +45%.',
        multiplierText: 'Taunt 2T + DEF +45%',
        gaugeCost: 85,
      },
      {
        id: 'hm_passive',
        name: 'Kopi Hitam Poskamling',
        unlockStars: 3,
        type: 'passive',
        description: 'Kebal terhadap efek Stun dan memulihkan 8% HP setiap giliran.',
        multiplierText: 'Anti-Stun + Regen 8%',
      },
    ],
    defaultBlessings: [
      {
        id: 'hm_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Pahlawan lingkungan: +12% HP.',
        statBonus: { hpPct: 12 },
      },
      {
        id: 'hm_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Keamanan warga nomor satu: +18% Defense & +12% HP.',
        statBonus: { defPct: 18, hpPct: 12 },
      },
      {
        id: 'hm_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Kepala keamanan kompleks: +20% HP & +30 Energy awal.',
        statBonus: { hpPct: 20, defPct: 12, startGauge: 30 },
      },
    ],
  },
  {
    id: 'pengacara_berlian',
    name: 'Pengacara Berlian',
    title: 'Kolektor Cincin Silau',
    rarity: Rarity.MYTHIC,
    role: CharacterRole.MAGE,
    tagline: 'Jas mengilap, kacamata hitam, sepuluh jari penuh batu permata siap menyilaukan lawan!',
    baseStats: { hp: 1310, atk: 212, def: 90, spd: 115, critRate: 20 },
    growthPerLevel: { hp: 69, atk: 14, def: 5 },
    skills: [
      {
        id: 'pb_basic',
        name: 'Gugatan Kilat',
        unlockStars: 1,
        type: 'basic',
        description: 'Melempar berkas pasal tajam yang menembus 20% Defense musuh.',
        multiplierText: '120% ATK (Piercing)',
      },
      {
        id: 'pb_ult',
        name: 'Cincin Silau Maut',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Memantulkan cahaya berlian 155% AoE ke semua musuh, menurunkan ATK lawan 25%, dan memulihkan 20% HP diri.',
        multiplierText: '155% AoE + ATK -25%',
        gaugeCost: 100,
      },
      {
        id: 'pb_passive',
        name: 'Honorarium Fantastis',
        unlockStars: 3,
        type: 'passive',
        description: 'Meningkatkan Crit Rate +12% dan memulihkan +15 Energy ekstra setiap giliran.',
        multiplierText: '+12% Crit & +15 ENG',
      },
    ],
    defaultBlessings: [
      {
        id: 'pb_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Klip pamer mobil mewah viral: +12% Attack & +6% Crit.',
        statBonus: { atkPct: 12, critPct: 6 },
      },
      {
        id: 'pb_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Klien kelas kakap antre: +20% Attack & +15% HP.',
        statBonus: { atkPct: 20, hpPct: 15 },
      },
      {
        id: 'pb_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Kuasa hukum elite: +15% Crit & +45 Energy awal ronde.',
        statBonus: { critPct: 15, atkPct: 15, startGauge: 45 },
      },
    ],
  },
  {
    id: 'sultan_konten',
    name: 'Sultan Konten',
    title: 'Raja Giveaway Viral',
    rarity: Rarity.LEGENDARY,
    role: CharacterRole.TACTICIAN,
    tagline: 'Ring light menyala, topi terbalik, siap bagi-bagi kotak hadiah biar tim makin ngebut!',
    baseStats: { hp: 1260, atk: 175, def: 86, spd: 122, critRate: 16 },
    growthPerLevel: { hp: 66, atk: 11, def: 5 },
    skills: [
      {
        id: 'sk_basic',
        name: 'Prank Kamera',
        unlockStars: 1,
        type: 'basic',
        description: 'Menyerang musuh dengan kilatan flash kamera dan mencuri 15 Energy.',
        multiplierText: '115% ATK + Steal ENG',
      },
      {
        id: 'sk_ult',
        name: 'Giveaway Dadakan',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Melempar kotak hadiah 125% AoE ke musuh sambil memberi +30 Energy & +25% Attack ke seluruh tim!',
        multiplierText: '125% AoE + Tim +30 ENG',
        gaugeCost: 100,
      },
      {
        id: 'sk_passive',
        name: 'Jutaan Subscriber',
        unlockStars: 3,
        type: 'passive',
        description: 'Aura tren viral meningkatkan Speed seluruh anggota tim di arena.',
        multiplierText: 'Aura Tim +12 SPD',
      },
    ],
    defaultBlessings: [
      {
        id: 'sk_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Trending #1 nasional: +10 Speed & +10% Attack.',
        statBonus: { spdFlat: 10, atkPct: 10 },
      },
      {
        id: 'sk_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Endorsement membludak: +18% Attack & +14% HP.',
        statBonus: { atkPct: 18, hpPct: 14 },
      },
      {
        id: 'sk_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Sponsor utama koalisi: +20% HP & +40 Energy awal ronde.',
        statBonus: { hpPct: 20, atkPct: 12, startGauge: 40 },
      },
    ],
  },
  {
    id: 'kang_sidak',
    name: 'Kang Sidak',
    title: 'Pendekar Rompi Lapangan',
    rarity: Rarity.EPIC,
    role: CharacterRole.WARRIOR,
    tagline: 'Iket kepala khas, rompi lapangan, hobi sidak jalan berlubang sambil bikin konten.',
    baseStats: { hp: 1380, atk: 158, def: 106, spd: 104, critRate: 12 },
    growthPerLevel: { hp: 74, atk: 10, def: 6 },
    skills: [
      {
        id: 'ks_basic',
        name: 'Sidak Mendadak',
        unlockStars: 1,
        type: 'basic',
        description: 'Hantaman keras ke barisan depan musuh dengan papan proyek.',
        multiplierText: '120% ATK',
      },
      {
        id: 'ks_ult',
        name: 'Konten Aspal Mulus',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Menghajar musuh depan 210% ATK sekaligus memulihkan 22% HP sekutu paling kritis + DEF +25%.',
        multiplierText: '210% + Heal 22%',
        gaugeCost: 90,
      },
      {
        id: 'ks_passive',
        name: 'Laporan Warga',
        unlockStars: 3,
        type: 'passive',
        description: 'Saat HP di bawah 60%, Attack Kang Sidak otomatis naik +25%.',
        multiplierText: 'HP <60% ATK +25%',
      },
    ],
    defaultBlessings: [
      {
        id: 'ks_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Komentar warga mendukung: +12% HP & +8% Attack.',
        statBonus: { hpPct: 12, atkPct: 8 },
      },
      {
        id: 'ks_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Jalanan mulus jadi sorotan: +16% Defense & +14% HP.',
        statBonus: { defPct: 16, hpPct: 14 },
      },
      {
        id: 'ks_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Populer lintas daerah: +18% Attack & +35 Energy awal.',
        statBonus: { atkPct: 18, startGauge: 35 },
      },
    ],
  },
  {
    id: 'emak_sein',
    name: 'Emak Sein Kiri',
    title: 'Penguasa Jalanan Matic',
    rarity: Rarity.RARE,
    role: CharacterRole.ASSASSIN,
    tagline: 'Lampu sein berkedip ke kiri, tapi beloknya ke kanan—lawan dijamin bingung!',
    baseStats: { hp: 1010, atk: 166, def: 70, spd: 132, critRate: 22 },
    growthPerLevel: { hp: 52, atk: 11, def: 4 },
    skills: [
      {
        id: 'es_basic',
        name: 'Tancap Gas Matic',
        unlockStars: 1,
        type: 'basic',
        description: 'Menyerbu cepat musuh dengan klakson matic bertubi-tubi.',
        multiplierText: '118% ATK',
      },
      {
        id: 'es_ult',
        name: 'Belok Kanan Sein Kiri',
        unlockStars: 1,
        type: 'ultimate',
        description: 'Menembus Taunt langsung ke musuh belakang sebesar 225% ATK dengan peluang Stun 55%!',
        multiplierText: '225% Backline + Stun',
        gaugeCost: 90,
      },
      {
        id: 'es_passive',
        name: 'Ratu Jalanan',
        unlockStars: 3,
        type: 'passive',
        description: 'Memulai pertarungan dengan Evasion Buff 2 giliran untuk menghindari serangan awal.',
        multiplierText: 'Start Evade 2T',
      },
    ],
    defaultBlessings: [
      {
        id: 'es_b1',
        name: 'Restu Netizen',
        unlockLevel: 1,
        description: 'Rekaman dashcam viral: +12 Speed.',
        statBonus: { spdFlat: 12 },
      },
      {
        id: 'es_b2',
        name: 'Restu Survei',
        unlockLevel: 50,
        description: 'Disegani pengendara lain: +16% Attack & +10% Crit.',
        statBonus: { atkPct: 16, critPct: 10 },
      },
      {
        id: 'es_b3',
        name: 'Restu Koalisi',
        unlockLevel: 100,
        description: 'Bebas tilang di mana saja: +18% HP & +30 Energy awal.',
        statBonus: { hpPct: 18, startGauge: 30 },
      },
    ],
  },
];

export const CHARACTER_MAP: Record<string, CharacterTemplate> = Object.fromEntries(
  CHARACTER_POOL.map((c) => [c.id, c])
);

const BACKDROPS: { id: ArenaBackdropId; areaName: string }[] = [
  { id: 'bundaran_hi', areaName: 'Bundaran HI Kartun' },
  { id: 'angkringan', areaName: 'Angkringan Tengah Malam' },
  { id: 'gerbang_dpr', areaName: 'Depan Gerbang DPR' },
  { id: 'ikn_masa_depan', areaName: 'Proyek IKN Masa Depan' },
];

const ENEMY_ARCHETYPES: Record<string, Omit<EnemyUnitTemplate, 'hp' | 'atk' | 'def'>> = {
  buzzer_bot: {
    id: 'buzzer_bot',
    name: 'Pasukan Komentar',
    roleTitle: 'Spammer Timeline',
    spd: 104,
    skillName: 'Serangan Hashtag',
    skillDesc: 'Menyerang 1 target dengan opini berisik.',
  },
  preman_parkir: {
    id: 'preman_parkir',
    name: 'Jukir Siluman',
    roleTitle: 'Penarik Retribusi',
    spd: 92,
    skillName: 'Peluit Mendadak',
    skillDesc: 'Menghantam barisan depan saat lengah.',
  },
  pengamat_tv: {
    id: 'pengamat_tv',
    name: 'Pengamat Sinyal',
    roleTitle: 'Analis Dadakan',
    spd: 112,
    skillName: 'Grafik Memutar',
    skillDesc: 'Memberi serangan psikologis ke baris belakang.',
  },
  calo_proyek: {
    id: 'calo_proyek',
    name: 'Makelar Berkas',
    roleTitle: 'Spesialis Stempel',
    spd: 98,
    skillName: 'Biaya Admin',
    skillDesc: 'Menyerap semangat dan menyerang keras.',
  },
  boss_inflasi: {
    id: 'boss_inflasi',
    name: 'Monster Inflasi',
    roleTitle: 'Bos Raksasa Harga Naik',
    isBoss: true,
    spd: 106,
    skillName: 'Harga Cabai Meroket',
    skillDesc: 'Serangan AoE panas yang mengguncang seluruh tim!',
  },
  boss_mangkrak: {
    id: 'boss_mangkrak',
    name: 'Siluman Proyek Mangkrak',
    roleTitle: 'Bos Tiang Beton',
    isBoss: true,
    spd: 95,
    skillName: 'Beton Terbengkalai',
    skillDesc: 'Menghantam keras barisan depan dengan puing anggaran.',
  },
};

function buildCampaignStages(): CampaignStage[] {
  const stages: CampaignStage[] = [];
  const totalChapters = 10; // 10 chapters x 5 stages = 50 stages (Stage 1-1 to 10-5)
  const chapterNames = [
    'Musyawarah RT 01',
    'Macetnya Bundaran HI',
    'Diskusi Warung Angkringan',
    'Sidak Pasar Rakyat',
    'Demo Depan Gerbang',
    'Lobi Tengah Malam',
    'Sidang Paripurna Kilat',
    'Tender Jembatan Gantung',
    'Menuju IKN Nusantara',
    'Perebutan Kursi Empuk',
  ];

  let globalIdx = 0;
  for (let ch = 1; ch <= totalChapters; ch++) {
    const backdropInfo = BACKDROPS[Math.floor((ch - 1) / 2.5) % BACKDROPS.length];
    for (let st = 1; st <= 5; st++) {
      globalIdx++;
      const isBoss = st === 5;
      const scale = Math.pow(1.13, globalIdx - 1);
      const hpBase = Math.round(520 * scale);
      const atkBase = Math.round(68 * Math.pow(1.1, globalIdx - 1));
      const defBase = Math.round(35 * Math.pow(1.08, globalIdx - 1));

      const enemies: EnemyUnitTemplate[] = isBoss
        ? [
            {
              ...ENEMY_ARCHETYPES[ch % 2 === 1 ? 'boss_inflasi' : 'boss_mangkrak'],
              hp: Math.round(hpBase * 2.5),
              atk: Math.round(atkBase * 1.35),
              def: Math.round(defBase * 1.3),
            },
            {
              ...ENEMY_ARCHETYPES.pengamat_tv,
              hp: Math.round(hpBase * 0.9),
              atk: Math.round(atkBase * 0.9),
              def: defBase,
            },
            {
              ...ENEMY_ARCHETYPES.buzzer_bot,
              hp: Math.round(hpBase * 0.85),
              atk: Math.round(atkBase * 0.95),
              def: defBase,
            },
          ]
        : [
            {
              ...ENEMY_ARCHETYPES.preman_parkir,
              hp: Math.round(hpBase * 1.15),
              atk: atkBase,
              def: Math.round(defBase * 1.15),
            },
            {
              ...ENEMY_ARCHETYPES.buzzer_bot,
              hp: Math.round(hpBase * 0.85),
              atk: Math.round(atkBase * 1.05),
              def: defBase,
            },
            {
              ...ENEMY_ARCHETYPES.pengamat_tv,
              hp: Math.round(hpBase * 0.82),
              atk: Math.round(atkBase * 1.02),
              def: defBase,
            },
            ...(globalIdx >= 3
              ? [
                  {
                    ...ENEMY_ARCHETYPES.calo_proyek,
                    hp: Math.round(hpBase * 0.95),
                    atk: Math.round(atkBase * 0.98),
                    def: defBase,
                  },
                ]
              : []),
          ];

      stages.push({
        id: `stage_${ch}_${st}`,
        chapter: ch,
        stageNum: st,
        code: `${ch}-${st}`,
        name: isBoss ? `Bos: ${chapterNames[ch - 1]}` : `${chapterNames[ch - 1]} (${st})`,
        backdrop: backdropInfo.id,
        isBoss,
        recommendedPower: Math.round(1800 * scale),
        enemies,
        rewardCoins: Math.round((isBoss ? 1200 : 450) * Math.pow(1.08, globalIdx - 1)),
        rewardEnvelopes: isBoss ? 300 : 80,
      });
    }
  }
  return stages;
}

export const CAMPAIGN_STAGES: CampaignStage[] = buildCampaignStages();

export const RAID_BOSSES: RaidBossDef[] = [
  {
    id: 'raid_inflasi',
    name: 'Monster Inflasi',
    subtitle: 'Raid Mingguan · Ancaman Dompet Nasional',
    backdrop: 'gerbang_dpr',
    hp: 18500,
    atk: 310,
    def: 155,
    spd: 112,
    skillName: 'Harga Sembako Terbang',
    skillDesc: 'Gelombang inflasi menghajar seluruh tim dengan damage tinggi.',
    rewardCoins: 4500,
    rewardEnvelopes: 650,
  },
  {
    id: 'raid_mangkrak',
    name: 'Siluman Proyek Mangkrak',
    subtitle: 'Raid Mingguan · Penunggu Tiang Beton',
    backdrop: 'ikn_masa_depan',
    hp: 26000,
    atk: 380,
    def: 195,
    spd: 102,
    skillName: 'Anggaran Membengkak',
    skillDesc: 'Menjatuhkan tiang beton raksasa & menurunkan pertahanan lawan.',
    rewardCoins: 6500,
    rewardEnvelopes: 900,
  },
];

export const ARENA_RIVALS = [
  {
    id: 'arena_rt',
    name: 'Koalisi Karang Taruna',
    rankLabel: 'Peringkat #42 · Zona Santai',
    power: 4200,
    backdrop: 'angkringan' as ArenaBackdropId,
    characterIds: ['hansip_malam', 'ibu_senam', 'abang_ojol', 'mas_santuy'],
    level: 10,
    rewardCoins: 1100,
    rewardEnvelopes: 180,
  },
  {
    id: 'arena_elit',
    name: 'Fraksi Lobi Eksekutif',
    rankLabel: 'Peringkat #15 · Zona Panas',
    power: 9800,
    backdrop: 'bundaran_hi' as ArenaBackdropId,
    characterIds: ['jenderal_gemoy', 'juragan_energi', 'mas_santuy', 'abang_ojol'],
    level: 28,
    rewardCoins: 2200,
    rewardEnvelopes: 320,
  },
  {
    id: 'arena_nasional',
    name: 'Dewan Sentral Nusantara',
    rankLabel: 'Peringkat #1 · Kursi Empuk Tertinggi',
    power: 19500,
    backdrop: 'ikn_masa_depan' as ArenaBackdropId,
    characterIds: ['jenderal_gemoy', 'pak_tukang_kayu', 'ibu_banteng', 'juragan_energi'],
    level: 55,
    rewardCoins: 3800,
    rewardEnvelopes: 550,
  },
];

export function createInitialSaveData(): PlayerSaveData {
  return {
    coins: 10000, // 10,000 Koin Receh starter
    envelopes: 5000, // 5,000 Amplop Cokelat starter
    pityCounter: 0,
    totalPulls: 0,
    ownedCharacters: {
      hansip_malam: {
        id: 'hansip_malam',
        level: 5,
        stars: 1,
        shards: 5,
        blessingTiers: [0, 0, 0],
      },
      ibu_senam: {
        id: 'ibu_senam',
        level: 5,
        stars: 1,
        shards: 5,
        blessingTiers: [0, 0, 0],
      },
      abang_ojol: {
        id: 'abang_ojol',
        level: 5,
        stars: 1,
        shards: 0,
        blessingTiers: [0, 0, 0],
      },
      mas_santuy: {
        id: 'mas_santuy',
        level: 5,
        stars: 1,
        shards: 0,
        blessingTiers: [0, 0, 0],
      },
    },
    partyIds: ['hansip_malam', 'abang_ojol', 'ibu_senam', 'mas_santuy'],
    highestStageIndex: 0,
    selectedStageIndex: 0,
    lastCashClaimAt: Date.now() - 45 * 60 * 1000, // Give 45 min of starter idle Uang Kas ready to test!
    arenaWins: 0,
    raidClears: 0,
    soundMuted: false,
  };
}

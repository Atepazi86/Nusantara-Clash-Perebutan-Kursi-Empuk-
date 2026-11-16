import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import {
  Cloud,
  CloudOff,
  Coins,
  LogIn,
  LogOut,
  Mail,
  RotateCcw,
  Sparkles,
  Swords,
  User as UserIcon,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { BattleTab } from './components/BattleTab';
import { CharacterTab } from './components/CharacterTab';
import { GachaTab } from './components/GachaTab';
import { createInitialSaveData } from './data/characters';
import {
  auth,
  loadCloudPlayerSave,
  saveCloudPlayerSave,
  signInWithGoogle,
  signOutAccount,
} from './firebase';
import { PlayerSaveData } from './types/game';
import { soundFX } from './utils/sound';
import { computePartyPower } from './utils/stats';

const STORAGE_KEY = 'nusantara_clash_save_v1';

type MainTab = 'karakter' | 'gacha' | 'arena';

function loadLocalSaveData(): PlayerSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialSaveData();
    const parsed = JSON.parse(raw) as Partial<PlayerSaveData>;
    const initial = createInitialSaveData();
    return {
      ...initial,
      ...parsed,
      ownedCharacters:
        parsed.ownedCharacters && Object.keys(parsed.ownedCharacters).length > 0
          ? parsed.ownedCharacters
          : initial.ownedCharacters,
      partyIds:
        Array.isArray(parsed.partyIds) && parsed.partyIds.length > 0
          ? parsed.partyIds
          : initial.partyIds,
    };
  } catch {
    return createInitialSaveData();
  }
}

export default function App() {
  const [save, setSave] = useState<PlayerSaveData>(() => loadLocalSaveData());
  const [activeTab, setActiveTab] = useState<MainTab>('karakter');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [displayName, setDisplayName] = useState<string>('Pemain');
  const [syncState, setSyncState] = useState<'guest' | 'syncing' | 'saved' | 'error'>('guest');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const cloudCreatedAtRef = useRef<Timestamp | undefined>(undefined);
  const hydratingCloudRef = useRef<boolean>(false);
  const saveRef = useRef<PlayerSaveData>(save);
  saveRef.current = save;

  // Listen to Firebase Auth state and load/create cloud save
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);

      if (!firebaseUser) {
        cloudCreatedAtRef.current = undefined;
        setSyncState('guest');
        return;
      }

      setSyncState('syncing');
      hydratingCloudRef.current = true;
      try {
        const cloud = await loadCloudPlayerSave(firebaseUser.uid);
        if (cloud) {
          cloudCreatedAtRef.current = cloud.createdAt;
          setDisplayName(cloud.displayName);
          setSave(cloud.save);
        } else {
          // New account: upload current local progress immediately as starter cloud profile
          const fallbackName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Pemain';
          setDisplayName(fallbackName);
          const created = await saveCloudPlayerSave(
            firebaseUser.uid,
            fallbackName,
            saveRef.current
          );
          cloudCreatedAtRef.current = created;
        }
        setSyncState('saved');
      } catch {
        setSyncState('error');
      } finally {
        hydratingCloudRef.current = false;
      }
    });
    return () => unsub();
  }, []);

  // Persist locally on every change + debounce cloud sync when signed in
  useEffect(() => {
    soundFX.muted = save.soundMuted;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {
      // Ignore quota errors
    }

    if (!authReady || !user || hydratingCloudRef.current) return;

    setSyncState('syncing');
    const timer = setTimeout(async () => {
      try {
        const created = await saveCloudPlayerSave(
          user.uid,
          displayName,
          save,
          cloudCreatedAtRef.current
        );
        if (created) cloudCreatedAtRef.current = created;
        setSyncState('saved');
      } catch {
        setSyncState('error');
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [save, user, authReady, displayName]);

  const partyPower = computePartyPower(save);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    soundFX.playClick();
    try {
      await signInWithGoogle();
      setAccountModalOpen(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    }
  };

  const handleSignOut = async () => {
    soundFX.playClick();
    await signOutAccount();
    setAccountModalOpen(false);
  };

  const handleUpdateDisplayName = async (newName: string) => {
    const clean = newName.trim().slice(0, 80);
    if (!clean || !user) return;
    setDisplayName(clean);
    setSyncState('syncing');
    try {
      const created = await saveCloudPlayerSave(user.uid, clean, save, cloudCreatedAtRef.current);
      if (created) cloudCreatedAtRef.current = created;
      setSyncState('saved');
    } catch {
      setSyncState('error');
    }
  };

  const handleResetProgress = () => {
    const fresh = createInitialSaveData();
    setSave(fresh);
    setConfirmResetOpen(false);
    soundFX.playClick();
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Compact Game Top HUD */}
      <header className="sticky top-0 z-30 bg-[#1a1f2e]/95 backdrop-blur-sm border-b-[3px] border-[#0d0f17] px-3 py-2">
        <div className="max-w-[960px] mx-auto flex items-center justify-between gap-2">
          {/* Left: Account / Profile Chip + Power */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => {
                soundFX.playClick();
                setAccountModalOpen(true);
              }}
              className="comic-btn bg-[#2c334a] hover:bg-[#37405c] text-white px-2.5 py-1.5 rounded-xl flex items-center gap-2 min-w-0"
            >
              <div
                className={`w-7 h-7 rounded-lg border-2 border-[#181a24] flex items-center justify-center shrink-0 ${
                  user ? 'bg-emerald-500' : 'bg-amber-400 text-[#181a24]'
                }`}
              >
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-display font-bold text-xs leading-none truncate max-w-[110px] sm:max-w-[160px]">
                  {user ? displayName : 'Akun Tamu'}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono-num text-amber-300 mt-0.5">
                  {user ? (
                    <>
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span>{syncState === 'syncing' ? 'Sync...' : 'Cloud'}</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300">Simpan Akun</span>
                    </>
                  )}
                </div>
              </div>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 bg-[#23283b] border-2 border-[#10121a] rounded-xl px-2.5 py-1.5 text-white">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono-num text-xs font-bold">
                {partyPower.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Right: Glossy Currencies + Sound */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-[#fff7e6] border-2 border-[#181a24] rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-[0_2px_0_#181a24]">
              <Coins className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-mono-num text-xs font-bold text-[#181a24]">
                {save.coins.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="bg-[#fff7e6] border-2 border-[#181a24] rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-[0_2px_0_#181a24]">
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-mono-num text-xs font-bold text-[#181a24]">
                {save.envelopes.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={() =>
                setSave((prev) => {
                  const next = !prev.soundMuted;
                  soundFX.muted = next;
                  if (!next) soundFX.playClick();
                  return { ...prev, soundMuted: next };
                })
              }
              className="comic-btn bg-[#2c334a] text-white p-2 rounded-xl"
              aria-label={save.soundMuted ? 'Aktifkan suara' : 'Matikan suara'}
            >
              {save.soundMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Viewport */}
      <main className="flex-1 w-full max-w-[960px] mx-auto px-3 pt-3">
        {activeTab === 'karakter' && (
          <CharacterTab
            save={save}
            onUpdateSave={setSave}
            onGoToGacha={() => {
              soundFX.playClick();
              setActiveTab('gacha');
            }}
          />
        )}
        {activeTab === 'gacha' && <GachaTab save={save} onUpdateSave={setSave} />}
        {activeTab === 'arena' && <BattleTab save={save} onUpdateSave={setSave} />}
      </main>

      {/* Bottom RPG Dock */}
      <nav
        aria-label="Navigasi Game"
        className="fixed bottom-0 inset-x-0 z-30 bg-[#1a1f2e]/95 backdrop-blur-sm border-t-[3px] border-[#0d0f17] px-3 py-2"
      >
        <div className="max-w-[560px] mx-auto grid grid-cols-3 gap-2.5">
          <NavTabButton
            active={activeTab === 'karakter'}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('karakter');
            }}
            icon={<Users className="w-4 h-4" />}
            label="Karakter"
          />
          <NavTabButton
            active={activeTab === 'gacha'}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('gacha');
            }}
            icon={<Sparkles className="w-4 h-4" />}
            label="Gacha"
          />
          <NavTabButton
            active={activeTab === 'arena'}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('arena');
            }}
            icon={<Swords className="w-4 h-4" />}
            label="Arena"
          />
        </div>
      </nav>

      {/* Account & Cloud Save Modal */}
      {accountModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setAccountModalOpen(false)}
        >
          <div
            className="game-parchment rounded-2xl p-5 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[#181a24]">
                Akun &amp; Progres Cloud
              </h2>
              <button
                onClick={() => setAccountModalOpen(false)}
                className="p-1 rounded-lg border-2 border-[#181a24] bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {user ? (
              <div className="space-y-3">
                <div className="bg-emerald-100 border-2 border-[#181a24] rounded-xl p-3 flex items-center gap-2.5">
                  <Cloud className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm text-[#181a24] truncate">
                      {displayName}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">{user.email}</div>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    handleUpdateDisplayName(String(fd.get('playerName') || ''));
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="playerName"
                    defaultValue={displayName}
                    maxLength={40}
                    placeholder="Nama Pemain"
                    className="flex-1 bg-white border-2 border-[#181a24] rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                  <button
                    type="submit"
                    className="comic-btn bg-amber-400 text-[#181a24] text-xs font-display font-bold px-3 py-1.5 rounded-xl"
                  >
                    Simpan
                  </button>
                </form>

                <button
                  onClick={handleSignOut}
                  className="comic-btn w-full bg-white text-[#181a24] font-display font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed">
                  Buat / masuk dengan akun Google agar progres level, gacha, dan stage tersimpan aman di Cloud.
                </p>
                {authError && (
                  <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-300 rounded-lg p-2">
                    {authError}
                  </div>
                )}
                <button
                  onClick={handleGoogleSignIn}
                  className="comic-btn w-full bg-emerald-500 hover:bg-emerald-400 text-white font-display font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Buat / Masuk Akun Google</span>
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-slate-300">
              <button
                onClick={() => {
                  setAccountModalOpen(false);
                  setConfirmResetOpen(true);
                }}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Progres ke Awal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="game-parchment rounded-2xl p-5 max-w-xs w-full space-y-4 text-center">
            <h2 className="font-display text-xl font-bold text-[#181a24]">Reset Data?</h2>
            <p className="text-xs text-slate-600">
              Progres akan diulang ke awal (5.000 Amplop &amp; 10.000 Koin).
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="comic-btn flex-1 bg-white text-[#181a24] font-display font-bold text-xs py-2 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleResetProgress}
                className="comic-btn flex-1 bg-red-500 text-white font-display font-bold text-xs py-2 rounded-xl"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavTabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`comic-btn py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-display font-bold text-xs sm:text-sm whitespace-nowrap ${
        active ? 'bg-amber-400 text-[#181a24]' : 'bg-[#2c334a] text-slate-200 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

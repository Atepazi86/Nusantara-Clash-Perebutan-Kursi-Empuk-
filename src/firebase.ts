import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { OwnedCharacterState, PlayerSaveData } from './types/game';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutAccount(): Promise<void> {
  await signOut(auth);
}

export interface CloudPlayerDoc extends PlayerSaveData {
  ownerUid: string;
  displayName: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

function sanitizeOwnedMap(
  raw: Record<string, OwnedCharacterState>
): Record<string, OwnedCharacterState> {
  const clean: Record<string, OwnedCharacterState> = {};
  Object.entries(raw)
    .slice(0, 20)
    .forEach(([key, val]) => {
      if (!val) return;
      clean[key] = {
        id: String(val.id || key).slice(0, 40),
        level: Math.max(1, Math.min(120, Math.floor(Number(val.level) || 1))),
        stars: Math.max(1, Math.min(5, Math.floor(Number(val.stars) || 1))),
        shards: Math.max(0, Math.floor(Number(val.shards) || 0)),
        blessingTiers: [
          Math.max(0, Math.min(5, Math.floor(Number(val.blessingTiers?.[0]) || 0))),
          Math.max(0, Math.min(5, Math.floor(Number(val.blessingTiers?.[1]) || 0))),
          Math.max(0, Math.min(5, Math.floor(Number(val.blessingTiers?.[2]) || 0))),
        ],
      };
    });
  return clean;
}

export async function loadCloudPlayerSave(
  uid: string
): Promise<{ save: PlayerSaveData; createdAt?: Timestamp; displayName: string } | null> {
  const path = `players/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'players', uid));
    if (!snap.exists()) return null;
    const data = snap.data() as CloudPlayerDoc;
    return {
      save: {
        coins: Number(data.coins) || 0,
        envelopes: Number(data.envelopes) || 0,
        pityCounter: Number(data.pityCounter) || 0,
        totalPulls: Number(data.totalPulls) || 0,
        ownedCharacters: data.ownedCharacters || {},
        partyIds: Array.isArray(data.partyIds) ? data.partyIds.slice(0, 4) : ['hansip_malam'],
        highestStageIndex: Number(data.highestStageIndex) || 0,
        selectedStageIndex: Number(data.selectedStageIndex) || 0,
        lastCashClaimAt: Number(data.lastCashClaimAt) || Date.now(),
        arenaWins: Number(data.arenaWins) || 0,
        raidClears: Number(data.raidClears) || 0,
        soundMuted: Boolean(data.soundMuted),
      },
      createdAt: data.createdAt,
      displayName: data.displayName || 'Pemain',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCloudPlayerSave(
  uid: string,
  displayName: string,
  save: PlayerSaveData,
  existingCreatedAt?: Timestamp
): Promise<Timestamp | undefined> {
  const path = `players/${uid}`;
  const cleanName = (displayName || 'Pemain').trim().slice(0, 80) || 'Pemain';
  const cleanParty = (save.partyIds.length > 0 ? save.partyIds : ['hansip_malam']).slice(0, 4);

  const payload = {
    ownerUid: uid,
    displayName: cleanName,
    coins: Math.max(0, Math.min(999999999, Math.floor(save.coins))),
    envelopes: Math.max(0, Math.min(999999999, Math.floor(save.envelopes))),
    pityCounter: Math.max(0, Math.min(50, Math.floor(save.pityCounter))),
    totalPulls: Math.max(0, Math.min(1000000, Math.floor(save.totalPulls))),
    ownedCharacters: sanitizeOwnedMap(save.ownedCharacters),
    partyIds: cleanParty,
    highestStageIndex: Math.max(0, Math.min(100, Math.floor(save.highestStageIndex))),
    selectedStageIndex: Math.max(0, Math.min(100, Math.floor(save.selectedStageIndex))),
    lastCashClaimAt: Math.max(0, Math.floor(save.lastCashClaimAt)),
    arenaWins: Math.max(0, Math.min(1000000, Math.floor(save.arenaWins))),
    raidClears: Math.max(0, Math.min(1000000, Math.floor(save.raidClears))),
    soundMuted: Boolean(save.soundMuted),
    createdAt: existingCreatedAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'players', uid), payload);
    if (!existingCreatedAt) {
      const fresh = await getDoc(doc(db, 'players', uid));
      return (fresh.data() as CloudPlayerDoc | undefined)?.createdAt;
    }
    return existingCreatedAt;
  } catch (error) {
    handleFirestoreError(error, existingCreatedAt ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

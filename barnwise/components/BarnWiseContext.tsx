import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getMyBarnWiseData,
  loginAccount as loginApi,
  logoutAccount as logoutApi,
  registerAccount as registerApi,
  saveMyBarnWiseData,
  type AccountUser,
  type RegisterRequestRole,
} from '@workspace/api-client-react';
import { createInitialData, type BarnWiseData, type Horse, type HorseEntry } from '@/lib/barnwise';

const STORAGE_KEY = '@barnwise/local-data-v1';
const AUTH_TOKEN_KEY = '@barnwise/auth-token-v1';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type BarnWiseContextValue = BarnWiseData & {
  ready: boolean;
  authStatus: AuthStatus;
  account: AccountUser | null;
  storageError: string | null;
  registerAccount: (input: {
    username: string;
    password: string;
    role: RegisterRequestRole;
  }) => Promise<void>;
  loginAccount: (username: string, password: string) => Promise<void>;
  logoutAccount: () => Promise<void>;
  addHorse: (horse: Horse) => void;
  updateHorse: (id: string, updates: Partial<Horse>) => void;
  deleteHorse: (id: string) => void;
  addEntry: (entry: HorseEntry) => void;
  updateEntry: (id: string, updates: Partial<HorseEntry>) => void;
  deleteEntry: (id: string) => void;
  updateProfile: (updates: Partial<BarnWiseData['profile']>) => void;
};

const BarnWiseContext = createContext<BarnWiseContextValue | null>(null);

function isStoredData(value: unknown): value is BarnWiseData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<BarnWiseData>;
  return (
    Array.isArray(data.horses) &&
    Array.isArray(data.entries) &&
    !!data.profile &&
    typeof data.profile.name === 'string' &&
    (data.profile.role === 'owner' || data.profile.role === 'rider')
  );
}

export function BarnWiseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BarnWiseData>(() => createInitialData());
  const [ready, setReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const syncVersion = useRef(0);
  const syncQueue = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      let localData = createInitialData();
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (!isStoredData(parsed)) {
            throw new Error('De opgeslagen gegevens hebben een ongeldig formaat.');
          }
          localData = parsed;
        }
      } catch (error: unknown) {
        if (active) {
          setStorageError(
            error instanceof Error
              ? `Lokale gegevens konden niet worden geladen: ${error.message}`
              : 'Lokale gegevens konden niet worden geladen.',
          );
        }
      }
      if (!active) return;
      dataRef.current = localData;
      setData(localData);

      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!active) return;
      if (!token) {
        setAuthStatus('signedOut');
        setReady(true);
        return;
      }

      try {
        const envelope = await getMyBarnWiseData();
        if (!active) return;
        dataRef.current = envelope.data;
        setData(envelope.data);
        setAccount(envelope.user);
        setAuthStatus('signedIn');
      } catch (error: unknown) {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        if (active) {
          setAuthStatus('signedOut');
          setStorageError(
            error instanceof Error
              ? `Je online gegevens konden niet worden geladen: ${error.message}`
              : 'Je online gegevens konden niet worden geladen.',
          );
        }
      } finally {
        if (active) setReady(true);
      }
    }
    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      .then(() =>
        setStorageError((current) =>
          current?.startsWith('Lokale gegevens') || current?.startsWith('Wijzigingen konden niet lokaal')
            ? null
            : current,
        ),
      )
      .catch((error: unknown) => {
        setStorageError(
          error instanceof Error
            ? `Wijzigingen konden niet worden opgeslagen: ${error.message}`
            : 'Wijzigingen konden niet worden opgeslagen.',
        );
      });
  }, [data, ready]);

  const syncData = useCallback(
    (next: BarnWiseData) => {
      if (authStatus !== 'signedIn') return;
      const version = ++syncVersion.current;
      syncQueue.current = syncQueue.current
        .catch(() => undefined)
        .then(() => saveMyBarnWiseData(next))
        .then(() => {
          if (version === syncVersion.current) setStorageError(null);
        })
        .catch((error: unknown) => {
          if (version === syncVersion.current) {
            setStorageError(
              error instanceof Error
                ? `Wijzigingen konden niet worden gesynchroniseerd: ${error.message}`
                : 'Wijzigingen konden niet worden gesynchroniseerd.',
            );
          }
        });
    },
    [authStatus],
  );

  const commit = useCallback(
    (update: (current: BarnWiseData) => BarnWiseData) => {
      const next = update(dataRef.current);
      dataRef.current = next;
      setData(next);
      syncData(next);
    },
    [syncData],
  );

  const registerAccount = useCallback(
    async (input: {
      username: string;
      password: string;
      role: RegisterRequestRole;
    }) => {
      const response = await registerApi({ ...input, data: dataRef.current });
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      dataRef.current = response.data;
      setData(response.data);
      setAccount(response.user);
      setAuthStatus('signedIn');
      setStorageError(null);
    },
    [],
  );

  const loginAccount = useCallback(async (username: string, password: string) => {
    const response = await loginApi({ username, password });
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
    dataRef.current = response.data;
    setData(response.data);
    setAccount(response.user);
    setAuthStatus('signedIn');
    setStorageError(null);
  }, []);

  const logoutAccount = useCallback(async () => {
    try {
      if (authStatus === 'signedIn') await logoutApi();
    } finally {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setAccount(null);
      setAuthStatus('signedOut');
    }
  }, [authStatus]);

  const addHorse = useCallback((horse: Horse) => {
    commit((current) => ({ ...current, horses: [...current.horses, horse] }));
  }, [commit]);

  const updateHorse = useCallback((id: string, updates: Partial<Horse>) => {
    commit((current) => ({
      ...current,
      horses: current.horses.map((horse) =>
        horse.id === id ? { ...horse, ...updates } : horse,
      ),
    }));
  }, [commit]);

  const deleteHorse = useCallback((id: string) => {
    commit((current) => ({
      ...current,
      horses: current.horses.filter((horse) => horse.id !== id),
      entries: current.entries.filter((entry) => entry.horseId !== id),
    }));
  }, [commit]);

  const addEntry = useCallback((entry: HorseEntry) => {
    commit((current) => ({ ...current, entries: [entry, ...current.entries] }));
  }, [commit]);

  const updateEntry = useCallback((id: string, updates: Partial<HorseEntry>) => {
    commit((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry,
      ),
    }));
  }, [commit]);

  const deleteEntry = useCallback((id: string) => {
    commit((current) => ({
      ...current,
      entries: current.entries.filter((entry) => entry.id !== id),
    }));
  }, [commit]);

  const updateProfile = useCallback(
    (updates: Partial<BarnWiseData['profile']>) => {
      commit((current) => ({
        ...current,
        profile: { ...current.profile, ...updates },
      }));
      setAccount((current) =>
        current
          ? {
              ...current,
              name: updates.name ?? current.name,
              role: updates.role ?? current.role,
            }
          : current,
      );
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      ...data,
      ready,
      authStatus,
      account,
      storageError,
      registerAccount,
      loginAccount,
      logoutAccount,
      addHorse,
      updateHorse,
      deleteHorse,
      addEntry,
      updateEntry,
      deleteEntry,
      updateProfile,
    }),
    [
      data,
      ready,
      authStatus,
      account,
      storageError,
      registerAccount,
      loginAccount,
      logoutAccount,
      addHorse,
      updateHorse,
      deleteHorse,
      addEntry,
      updateEntry,
      deleteEntry,
      updateProfile,
    ],
  );

  return <BarnWiseContext.Provider value={value}>{children}</BarnWiseContext.Provider>;
}

export function useBarnWise() {
  const context = useContext(BarnWiseContext);
  if (!context) throw new Error('useBarnWise must be used inside BarnWiseProvider');
  return context;
}
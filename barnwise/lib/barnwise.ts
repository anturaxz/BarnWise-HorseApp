export type Horse = {
  id: string;
  name: string;
  breed: string;
  birthYear: string;
  sex: 'Merrie' | 'Ruin' | 'Hengst';
  coat: string;
  notes: string;
};

export type EntryKind = 'ride' | 'training' | 'care' | 'health' | 'appointment';
export type EntryStatus = 'planned' | 'completed';

export type HorseEntry = {
  id: string;
  horseId: string;
  kind: EntryKind;
  title: string;
  date: string;
  detail: string;
  status: EntryStatus;
};

export type UserRole = 'owner' | 'rider';

export type BarnWiseData = {
  horses: Horse[];
  entries: HorseEntry[];
  profile: {
    name: string;
    role: UserRole;
  };
};

export const ENTRY_LABELS: Record<EntryKind, string> = {
  ride: 'Rit',
  training: 'Training',
  care: 'Verzorging',
  health: 'Gezondheid',
  appointment: 'Afspraak',
};

export const ENTRY_ICONS: Record<EntryKind, string> = {
  ride: 'horse-variant',
  training: 'run',
  care: 'brush',
  health: 'heart-pulse',
  appointment: 'calendar-clock',
};

export function getEntryKindsForRole(role: UserRole): EntryKind[] {
  return role === 'rider'
    ? ['ride', 'training']
    : ['ride', 'training', 'care', 'health', 'appointment'];
}

export function filterEntriesForRole(entries: HorseEntry[], role: UserRole) {
  if (role === 'owner') return entries;
  return entries.filter((entry) => entry.kind === 'ride' || entry.kind === 'training');
}

export function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function toLocalISO(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function todayISO() {
  return toLocalISO(new Date());
}

export function shiftDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalISO(date);
}

export function formatDate(date: string, includeWeekday = false) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('nl-BE', {
    day: 'numeric',
    month: 'short',
    ...(includeWeekday ? { weekday: 'short' as const } : {}),
  }).format(parsed);
}

export function createInitialData(): BarnWiseData {
  const miloId = createId();
  const novaId = createId();
  const pippaId = createId();
  const horses: Horse[] = [
    {
      id: miloId,
      name: 'Milo',
      breed: 'Belgisch warmbloed',
      birthYear: '2017',
      sex: 'Ruin',
      coat: 'Vos',
      notes: 'Houdt van rustige bosritten.',
    },
    {
      id: novaId,
      name: 'Nova',
      breed: 'Hannoveraan',
      birthYear: '2019',
      sex: 'Merrie',
      coat: 'Bruin',
      notes: 'Werkt graag aan overgangen en balans.',
    },
    {
      id: pippaId,
      name: 'Pippa',
      breed: 'Connemara',
      birthYear: '2014',
      sex: 'Merrie',
      coat: 'Schimmel',
      notes: '',
    },
  ];

  const entries: HorseEntry[] = [
    {
      id: createId(),
      horseId: miloId,
      kind: 'appointment',
      title: 'Hoefsmid',
      date: shiftDate(2),
      detail: 'Bekappen en ijzers controleren',
      status: 'planned',
    },
    {
      id: createId(),
      horseId: novaId,
      kind: 'health',
      title: 'Vaccinatiecontrole',
      date: shiftDate(6),
      detail: 'Boek een controle bij de dierenarts',
      status: 'planned',
    },
    {
      id: createId(),
      horseId: pippaId,
      kind: 'appointment',
      title: 'Tandarts',
      date: shiftDate(10),
      detail: 'Jaarlijkse gebitscontrole',
      status: 'planned',
    },
    {
      id: createId(),
      horseId: miloId,
      kind: 'ride',
      title: 'Bosrit langs de vijver',
      date: shiftDate(-1),
      detail: '55 min · rustig tempo',
      status: 'completed',
    },
    {
      id: createId(),
      horseId: novaId,
      kind: 'training',
      title: 'Overgangen & balans',
      date: shiftDate(-2),
      detail: '40 min · dressuur',
      status: 'completed',
    },
    {
      id: createId(),
      horseId: pippaId,
      kind: 'care',
      title: 'Vacht en hoeven verzorgd',
      date: shiftDate(-3),
      detail: 'Na de training nagekeken',
      status: 'completed',
    },
  ];

  return {
    horses,
    entries,
    profile: { name: 'Paardenliefhebber', role: 'owner' },
  };
}
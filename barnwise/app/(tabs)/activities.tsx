import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useBarnWise } from '@/components/BarnWiseContext';
import { ActionButton, Card, EmptyState, LoadingState, Pill, Screen, SectionTitle } from '@/components/BarnWiseUI';
import { EntryFormModal } from '@/components/EntryFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  ENTRY_ICONS,
  ENTRY_LABELS,
  filterEntriesForRole,
  getEntryKindsForRole,
  formatDate,
  todayISO,
  type EntryKind,
  type HorseEntry,
} from '@/lib/barnwise';

type FilterKey = 'all' | EntryKind;

export default function ActivitiesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { horses, entries, profile, ready, addEntry, updateEntry, deleteEntry } = useBarnWise();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HorseEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<HorseEntry | null>(null);
  const filters: FilterKey[] = ['all', ...getEntryKindsForRole(profile.role)];
  const activeFilter = filters.includes(filter) ? filter : 'all';
  const filteredEntries = useMemo(
    () =>
      filterEntriesForRole(entries, profile.role)
        .filter((entry) => activeFilter === 'all' || entry.kind === activeFilter)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [entries, profile.role, activeFilter],
  );

  if (!ready) return <Screen><LoadingState /></Screen>;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>JOURNAAL</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{profile.role === 'rider' ? 'Ritten & trainingen' : 'Activiteiten'}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{profile.role === 'rider' ? 'Jouw ritten en trainingen per paard.' : 'Ritten, trainingen en zorgmomenten.'}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={profile.role === 'rider' ? 'Rit of training toevoegen' : 'Activiteit toevoegen'} testID="add-activity-button" onPress={() => setShowForm(true)} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}>
            <Feather name="plus" size={21} color={colors.primaryForeground} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => (
            <Pill
              key={item}
              label={item === 'all' ? 'Alles' : ENTRY_LABELS[item]}
              active={activeFilter === item}
              onPress={() => setFilter(item)}
            />
          ))}
        </ScrollView>

        <SectionTitle title={`${filteredEntries.length} ${filteredEntries.length === 1 ? 'item' : 'items'}`} />
        {filteredEntries.length ? (
          filteredEntries.map((entry, index) => {
            const horse = horses.find((item) => item.id === entry.horseId);
            const upcoming = entry.status === 'planned' && entry.date >= todayISO();
            return (
              <Card key={entry.id} style={styles.entryCard}>
                <View style={styles.entryRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/horse/[id]', params: { id: entry.horseId } })}
                    style={({ pressed }) => [styles.entryMain, pressed && { opacity: 0.72 }]}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
                      <MaterialCommunityIcons name={ENTRY_ICONS[entry.kind] as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.entryCopy}>
                      <Text style={[styles.entryTitle, { color: colors.foreground }]} numberOfLines={1}>{entry.title}</Text>
                      <Text style={[styles.entryMeta, { color: colors.mutedForeground }]}>{horse?.name ?? 'Paard'} · {ENTRY_LABELS[entry.kind]}</Text>
                    </View>
                    <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(entry.date)}</Text>
                  </Pressable>
                  <View style={styles.entryActions}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`${entry.title} aanpassen`} onPress={() => setEditingEntry(entry)} style={[styles.entryAction, { backgroundColor: colors.secondary }]}>
                      <Feather name="edit-2" size={14} color={colors.primary} />
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`${entry.title} verwijderen`} onPress={() => setEntryToDelete(entry)} style={[styles.entryAction, { backgroundColor: colors.secondary }]}>
                      <Feather name="trash-2" size={14} color={colors.destructive} />
                    </Pressable>
                  </View>
                </View>
                {entry.detail ? <Text style={[styles.detail, { color: colors.mutedForeground }]}>{entry.detail}</Text> : null}
                <View style={styles.entryFooter}>
                  <View style={[styles.status, { backgroundColor: upcoming ? '#F8E9DC' : colors.secondary }]}>
                    <View style={[styles.statusDot, { backgroundColor: upcoming ? '#A26645' : colors.primary }]} />
                    <Text style={[styles.statusText, { color: upcoming ? '#825239' : colors.secondaryForeground }]}>{upcoming ? 'Gepland' : 'Afgerond'}</Text>
                  </View>
                  {index === 0 ? <Text style={[styles.todayText, { color: colors.primary }]}>{entry.date === todayISO() ? 'Vandaag' : ''}</Text> : null}
                </View>
              </Card>
            );
          })
        ) : (
          <Card>
            <EmptyState
              icon="activity"
              title={profile.role === 'rider' ? 'Nog geen ritten of trainingen' : 'Nog geen activiteiten'}
              detail={profile.role === 'rider'
                ? 'Voeg een rit of training toe om je geschiedenis per paard op te bouwen.'
                : 'Voeg een rit, training, verzorging of afspraak toe om je geschiedenis op te bouwen.'}
            />
            {horses.length ? <ActionButton label={profile.role === 'rider' ? 'Rit of training toevoegen' : 'Activiteit toevoegen'} icon="plus" onPress={() => setShowForm(true)} /> : null}
          </Card>
        )}
      </ScrollView>
      {showForm ? (
        <EntryFormModal
          visible
          onClose={() => setShowForm(false)}
          onSave={(entry) => {
            addEntry(entry);
            setShowForm(false);
          }}
        />
      ) : null}
      {editingEntry ? (
        <EntryFormModal
          key={`edit-${editingEntry.id}`}
          visible
          initialEntry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={(updated) => {
            updateEntry(updated.id, updated);
            setEditingEntry(null);
          }}
        />
      ) : null}
      {entryToDelete ? (
        <ConfirmModal
          visible
          title={`${entryToDelete.title} verwijderen?`}
          message="Deze activiteit wordt definitief verwijderd."
          onCancel={() => setEntryToDelete(null)}
          onConfirm={() => {
            deleteEntry(entryToDelete.id);
            setEntryToDelete(null);
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 112, gap: 13 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, marginBottom: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 5 },
  addButton: { width: 47, height: 47, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 15 },
  filters: { paddingVertical: 1, paddingRight: 18 },
  entryCard: { marginBottom: 1 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  entryMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 11 },
  entryActions: { flexDirection: 'row', gap: 5 },
  entryAction: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  entryCopy: { flex: 1, minWidth: 0 },
  entryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  entryMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  date: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 11 },
  entryFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  todayText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
});
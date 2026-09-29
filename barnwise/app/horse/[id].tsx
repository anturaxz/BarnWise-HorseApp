import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useBarnWise } from '@/components/BarnWiseContext';
import {
  ActionButton,
  Card,
  EmptyState,
  HorseMark,
  IconButton,
  LoadingState,
  Screen,
  SectionTitle,
} from '@/components/BarnWiseUI';
import { EntryFormModal } from '@/components/EntryFormModal';
import { HorseFormModal } from '@/components/HorseFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  ENTRY_ICONS,
  ENTRY_LABELS,
  filterEntriesForRole,
  formatDate,
  todayISO,
  type Horse,
  type HorseEntry,
} from '@/lib/barnwise';

function TimelineRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: HorseEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineIcon, { backgroundColor: colors.secondary }]}>
        <MaterialCommunityIcons name={ENTRY_ICONS[entry.kind] as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={18} color={colors.primary} />
      </View>
      <View style={styles.timelineCopy}>
        <Text style={[styles.timelineTitle, { color: colors.foreground }]}>{entry.title}</Text>
        <Text style={[styles.timelineMeta, { color: colors.mutedForeground }]}>{formatDate(entry.date, true)} · {ENTRY_LABELS[entry.kind]}</Text>
        {entry.detail ? <Text style={[styles.timelineDetail, { color: colors.mutedForeground }]}>{entry.detail}</Text> : null}
      </View>
      <View style={styles.timelineActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${entry.title} aanpassen`} onPress={onEdit} style={[styles.timelineAction, { backgroundColor: colors.secondary }]}>
          <Feather name="edit-2" size={13} color={colors.primary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`${entry.title} verwijderen`} onPress={onDelete} style={[styles.timelineAction, { backgroundColor: colors.secondary }]}>
          <Feather name="trash-2" size={13} color={colors.destructive} />
        </Pressable>
      </View>
      <View style={[styles.timelineStatus, { backgroundColor: entry.status === 'planned' && entry.date >= todayISO() ? '#F8E9DC' : colors.secondary }]}>
        <Text style={[styles.timelineStatusText, { color: entry.status === 'planned' && entry.date >= todayISO() ? '#825239' : colors.secondaryForeground }]}>
          {entry.status === 'planned' && entry.date >= todayISO() ? 'Gepland' : 'Klaar'}
        </Text>
      </View>
    </View>
  );
}

export default function HorseDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horses, entries, profile, ready, updateHorse, deleteHorse, addEntry, updateEntry, deleteEntry } = useBarnWise();
  const [showEdit, setShowEdit] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HorseEntry | null>(null);
  const [showHorseDeleteConfirm, setShowHorseDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<HorseEntry | null>(null);
  const horse = horses.find((item) => item.id === id);
  const horseEntries = useMemo(
    () => filterEntriesForRole(entries, profile.role)
      .filter((entry) => entry.horseId === id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [entries, id, profile.role],
  );

  if (!ready) return <Screen><LoadingState /></Screen>;
  if (!horse) {
    return (
      <Screen>
        <View style={styles.notFound}>
          <IconButton icon="arrow-left" label="Terug" onPress={() => router.back()} />
          <EmptyState title="Paard niet gevonden" detail="Dit profiel is verwijderd of bestaat niet meer." icon="alert-circle" />
        </View>
      </Screen>
    );
  }

  const nextEntry = horseEntries.find((entry) => entry.status === 'planned' && entry.date >= todayISO());

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topbar}>
          <IconButton icon="arrow-left" label="Terug" onPress={() => router.back()} />
          <Text style={[styles.topLabel, { color: colors.mutedForeground }]}>PAARDPROFIEL</Text>
          <IconButton icon="trash-2" label="Paard verwijderen" color={colors.destructive} onPress={() => setShowHorseDeleteConfirm(true)} />
        </View>

        <Card style={styles.identityCard}>
          <View style={styles.identityTop}>
            <HorseMark name={horse.name} size={74} />
            <View style={styles.identityText}>
              <Text style={[styles.name, { color: colors.foreground }]}>{horse.name}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{[horse.breed, horse.birthYear, horse.sex].filter(Boolean).join(' · ')}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Paard bewerken" onPress={() => setShowEdit(true)} style={[styles.editButton, { backgroundColor: colors.secondary }]}>
              <Feather name="edit-2" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <View style={[styles.identityRule, { backgroundColor: colors.border }]} />
          <View style={styles.quickFacts}>
            <Fact icon="palette-outline" label="Kleur" value={horse.coat || 'Niet ingevuld'} />
            <Fact icon="notebook-outline" label="Activiteiten" value={String(horseEntries.length)} />
          </View>
          {horse.notes ? <Text style={[styles.notes, { color: colors.mutedForeground }]}>{horse.notes}</Text> : null}
        </Card>

        {nextEntry ? (
          <Card style={[styles.nextCard, { backgroundColor: colors.secondary, borderColor: colors.secondary }]}>
            <View style={styles.nextIcon}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nextLabel, { color: colors.mutedForeground }]}>{profile.role === 'rider' ? 'VOLGENDE RIT OF TRAINING' : 'VOLGENDE OP DE PLANNING'}</Text>
              <Text style={[styles.nextTitle, { color: colors.foreground }]}>{nextEntry.title}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{formatDate(nextEntry.date, true)}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={profile.role === 'rider' ? 'Rit of training afronden' : 'Afspraak afronden'} onPress={() => updateEntry(nextEntry.id, { status: 'completed' })} style={[styles.checkButton, { backgroundColor: colors.card }]}>
              <MaterialCommunityIcons name="check" size={19} color={colors.primary} />
            </Pressable>
          </Card>
        ) : null}

        <View style={styles.sectionHead}>
          <SectionTitle title={profile.role === 'rider' ? 'Ritten & trainingen' : 'Activiteiten'} />
          <Pressable accessibilityRole="button" accessibilityLabel={profile.role === 'rider' ? 'Rit of training toevoegen' : 'Activiteit toevoegen'} onPress={() => setShowEntryForm(true)} style={[styles.addSmall, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={18} color={colors.primaryForeground} />
          </Pressable>
        </View>
        {horseEntries.length ? (
          <Card style={styles.timelineCard}>
            {horseEntries.map((entry, index) => (
              <View key={entry.id}>
                {index > 0 ? <View style={[styles.timelineDivider, { backgroundColor: colors.border }]} /> : null}
                <TimelineRow
                  entry={entry}
                  onEdit={() => setEditingEntry(entry)}
                  onDelete={() => setEntryToDelete(entry)}
                />
              </View>
            ))}
          </Card>
        ) : (
          <Card>
            <EmptyState
              title={profile.role === 'rider' ? 'Nog geen ritten of trainingen' : 'Nog geen activiteiten'}
              detail={profile.role === 'rider'
                ? 'Bewaar hier je ritten en trainingen voor dit paard.'
                : 'Bewaar hier ritten, trainingen, behandelingen en afspraken voor dit paard.'}
              icon="activity"
            />
            <ActionButton label={profile.role === 'rider' ? 'Eerste rit of training toevoegen' : 'Eerste activiteit toevoegen'} icon="plus" onPress={() => setShowEntryForm(true)} />
          </Card>
        )}
      </ScrollView>
      {showEdit ? (
        <HorseFormModal
          key={`edit-${horse.id}`}
          visible
          initialHorse={horse as Horse}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => {
            updateHorse(horse.id, updated);
            setShowEdit(false);
          }}
        />
      ) : null}
      {showEntryForm ? (
        <EntryFormModal
          key={`entry-${horse.id}`}
          visible
          initialHorseId={horse.id}
          onClose={() => setShowEntryForm(false)}
          onSave={(entry) => {
            addEntry(entry);
            setShowEntryForm(false);
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
      {showHorseDeleteConfirm ? (
        <ConfirmModal
          visible
          title={`${horse.name} verwijderen?`}
          message="Het paardenprofiel en alle bijbehorende activiteiten worden van dit toestel verwijderd. Dit kan niet ongedaan worden gemaakt."
          onCancel={() => setShowHorseDeleteConfirm(false)}
          onConfirm={() => {
            deleteHorse(id);
            setShowHorseDeleteConfirm(false);
            router.replace('/horses');
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

function Fact({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.fact}>
      <MaterialCommunityIcons name={icon} size={17} color={colors.primary} />
      <View style={styles.factText}>
        <Text style={[styles.factLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.factValue, { color: colors.foreground }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 112, gap: 15 },
  notFound: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 42 },
  topLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.4 },
  identityCard: { padding: 19 },
  identityTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  identityText: { flex: 1, minWidth: 0 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 25 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  editButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  identityRule: { height: 1, marginVertical: 16 },
  quickFacts: { flexDirection: 'row', gap: 18 },
  fact: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 0 },
  factText: { minWidth: 0 },
  factLabel: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  factValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 3 },
  notes: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 15 },
  nextCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  nextIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  nextLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.9, marginBottom: 4 },
  nextTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  checkButton: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -9 },
  addSmall: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  timelineCard: { paddingVertical: 3 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 10 },
  timelineIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  timelineCopy: { flex: 1, minWidth: 0 },
  timelineTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  timelineMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  timelineDetail: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 4 },
  timelineActions: { flexDirection: 'row', gap: 4, marginLeft: 3 },
  timelineAction: { width: 27, height: 27, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  timelineStatus: { borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  timelineStatusText: { fontFamily: 'Inter_500Medium', fontSize: 9 },
  timelineDivider: { height: 1, marginLeft: 48 },
});
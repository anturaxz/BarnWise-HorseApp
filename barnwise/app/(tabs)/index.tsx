import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useBarnWise } from '@/components/BarnWiseContext';
import { ActionButton, Card, HorseMark, LoadingState, Pill, Screen, SectionTitle } from '@/components/BarnWiseUI';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EntryFormModal } from '@/components/EntryFormModal';
import { EntryDetailsModal } from '@/components/EntryDetailsModal';
import { ENTRY_ICONS, ENTRY_LABELS, filterEntriesForRole, formatDate, todayISO, type Horse, type HorseEntry } from '@/lib/barnwise';

function EntryLine({ entry, horseName, onPress }: { entry: HorseEntry; horseName: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.entryLine}>
      <View style={[styles.entryIcon, { backgroundColor: colors.secondary }]}>
        <MaterialCommunityIcons name={ENTRY_ICONS[entry.kind] as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={19} color={colors.primary} />
      </View>
      <View style={styles.entryCopy}>
        <Text style={[styles.entryTitle, { color: colors.foreground }]} numberOfLines={1}>{entry.title}</Text>
        <Text style={[styles.entryMeta, { color: colors.mutedForeground }]} numberOfLines={1}>{horseName} · {ENTRY_LABELS[entry.kind]}</Text>
      </View>
      <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>{formatDate(entry.date)}</Text>
    </Pressable>
  );
}

export default function OverviewScreen() {
  const colors = useColors();
  const router = useRouter();
  const { horses, entries, profile, ready, storageError, addEntry, updateEntry, deleteEntry } = useBarnWise();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedRecentEntry, setSelectedRecentEntry] = useState<HorseEntry | null>(null);
  const [editingRecentEntry, setEditingRecentEntry] = useState<HorseEntry | null>(null);
  const [deletingRecentEntry, setDeletingRecentEntry] = useState<HorseEntry | null>(null);
  const today = todayISO();
  const visibleEntries = useMemo(() => filterEntriesForRole(entries, profile.role), [entries, profile.role]);
  const upcoming = useMemo(
    () => visibleEntries.filter((entry) => entry.status === 'planned' && entry.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4),
    [visibleEntries, today],
  );
  const recent = useMemo(
    () => visibleEntries.filter((entry) => entry.status === 'completed').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    [visibleEntries],
  );
  if (!ready) return <Screen><LoadingState /></Screen>;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topline}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>BARNWISE · {formatDate(today).toUpperCase()}</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>Fijn dat je er bent,</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>{profile.name}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Profiel openen" onPress={() => router.push('/profile')} style={[styles.profileButton, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.profileInitial, { color: colors.primary }]}>{profile.name.trim().charAt(0).toUpperCase() || 'B'}</Text>
          </Pressable>
        </View>

        {storageError ? (
          <View style={[styles.warning, { backgroundColor: '#F8E8DE', borderColor: '#E8C8B5' }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={19} color="#9B5537" />
            <Text style={[styles.warningText, { color: '#75412C' }]}>{storageError}</Text>
          </View>
        ) : null}

        {profile.role === 'rider' ? (
          <RiderRideSummary
            horses={horses}
            entries={entries}
            onAdd={() => setShowEntryForm(true)}
          />
        ) : (
          <View style={[styles.hero, { backgroundColor: colors.primary }]}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroKicker}>ALLES VOOR JE PAARDEN</Text>
                <Text style={styles.heroTitle}>Goede zorg,{'\n'}in één overzicht.</Text>
                <Text style={styles.heroDescription}>Van de eerste rit tot de volgende afspraak.</Text>
              </View>
              <View style={styles.heroHorse}><MaterialCommunityIcons name="horse-variant" size={66} color="#F6F1E5" /></View>
            </View>
            <View style={styles.heroBottom}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{horses.length}</Text>
                <Text style={styles.statLabel}>{horses.length === 1 ? 'paard' : 'paarden'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{upcoming.length}</Text>
                <Text style={styles.statLabel}>komende items</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Pressable accessibilityRole="button" accessibilityLabel="Activiteit toevoegen" testID="dashboard-add-activity" onPress={() => setShowEntryForm(true)} style={({ pressed }) => [styles.heroAdd, { opacity: pressed ? 0.8 : 1 }]}>
                <MaterialCommunityIcons name="plus" size={23} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        )}

        <SectionTitle title="Binnenkort" action="Alles bekijken" onAction={() => router.push('/activities')} />
        {upcoming.length ? (
          <Card style={styles.upcomingCard}>
            {upcoming.map((entry, index) => {
              const horseName = horses.find((horse) => horse.id === entry.horseId)?.name ?? 'Paard';
              const date = new Date(`${entry.date}T12:00:00`);
              return (
                <View key={entry.id}>
                  {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                  <View style={styles.upcomingLine}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push({ pathname: '/horse/[id]', params: { id: entry.horseId } })}
                      style={styles.upcomingMain}
                    >
                      <View style={[styles.dateBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.dateBadgeDay, { color: colors.primary }]}>{date.getDate()}</Text>
                        <Text style={[styles.dateBadgeMonth, { color: colors.mutedForeground }]}>{new Intl.DateTimeFormat('nl-BE', { month: 'short' }).format(date)}</Text>
                      </View>
                      <View style={styles.entryCopy}>
                        <Text style={[styles.entryTitle, { color: colors.foreground }]} numberOfLines={1}>{entry.title}</Text>
                        <Text style={[styles.entryMeta, { color: colors.mutedForeground }]}>{horseName} · {ENTRY_LABELS[entry.kind]}</Text>
                      </View>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`${entry.title} afronden`} hitSlop={8} onPress={() => updateEntry(entry.id, { status: 'completed' })} style={[styles.checkButton, { borderColor: colors.border }]}>
                      <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </Card>
        ) : (
          <Card>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Je agenda is helemaal bij.</Text>
              <Text style={[styles.entryMeta, { color: colors.mutedForeground, marginTop: 5 }]}>{profile.role === 'rider' ? 'Plan een rit of training om die hier terug te zien.' : 'Voeg een afspraak of activiteit toe wanneer je die plant.'}</Text>
          </Card>
        )}

        <SectionTitle title="Jouw paarden" action="Bekijk alle" onAction={() => router.push('/horses')} />
        {horses.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horseScroll}>
            {horses.map((horse) => (
              <Pressable key={horse.id} accessibilityRole="button" accessibilityLabel={`${horse.name} openen`} onPress={() => router.push({ pathname: '/horse/[id]', params: { id: horse.id } })} style={({ pressed }) => [styles.horseMini, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
                <HorseMark name={horse.name} size={53} />
                <Text style={[styles.horseMiniName, { color: colors.foreground }]}>{horse.name}</Text>
                <Text style={[styles.horseMiniMeta, { color: colors.mutedForeground }]} numberOfLines={1}>{horse.breed || 'Paard'}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Card>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nog geen paarden toegevoegd</Text>
            <Text style={[styles.entryMeta, { color: colors.mutedForeground, marginTop: 5, marginBottom: 14 }]}>Maak een profiel aan om zorg en activiteiten bij te houden.</Text>
            <ActionButton label="Eerste paard toevoegen" icon="plus" onPress={() => router.push('/horses')} />
          </Card>
        )}

        <SectionTitle title="Recent bijgewerkt" action="Activiteiten" onAction={() => router.push('/activities')} />
        {recent.length ? (
          <Card style={styles.recentCard}>
            {recent.map((entry, index) => (
              <View key={entry.id}>
                {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                <EntryLine
                  entry={entry}
                  horseName={horses.find((horse) => horse.id === entry.horseId)?.name ?? 'Paard'}
                  onPress={() => setSelectedRecentEntry(entry)}
                />
              </View>
            ))}
          </Card>
        ) : <Card><Text style={[styles.entryMeta, { color: colors.mutedForeground }]}>Je afgeronde activiteiten verschijnen hier.</Text></Card>}
      </ScrollView>
      {showEntryForm ? (
        <EntryFormModal visible onClose={() => setShowEntryForm(false)} onSave={(entry) => { addEntry(entry); setShowEntryForm(false); }} />
      ) : null}
      {selectedRecentEntry ? (
        <EntryDetailsModal
          visible
          entry={selectedRecentEntry}
          horseName={horses.find((horse) => horse.id === selectedRecentEntry.horseId)?.name ?? 'Paard'}
          onClose={() => setSelectedRecentEntry(null)}
          onEdit={() => {
            setEditingRecentEntry(selectedRecentEntry);
            setSelectedRecentEntry(null);
          }}
          onDelete={() => {
            setDeletingRecentEntry(selectedRecentEntry);
            setSelectedRecentEntry(null);
          }}
        />
      ) : null}
      {editingRecentEntry ? (
        <EntryFormModal
          key={`edit-recent-${editingRecentEntry.id}`}
          visible
          initialEntry={editingRecentEntry}
          onClose={() => setEditingRecentEntry(null)}
          onSave={(updated) => {
            updateEntry(updated.id, updated);
            setEditingRecentEntry(null);
          }}
        />
      ) : null}
      {deletingRecentEntry ? (
        <ConfirmModal
          visible
          title={`${deletingRecentEntry.title} verwijderen?`}
          message="Deze activiteit wordt definitief verwijderd."
          onCancel={() => setDeletingRecentEntry(null)}
          onConfirm={() => {
            deleteEntry(deletingRecentEntry.id);
            setDeletingRecentEntry(null);
          }}
        />
      ) : null}
    </Screen>
  );
}

function RiderRideSummary({
  horses,
  entries,
  onAdd,
}: {
  horses: Horse[];
  entries: HorseEntry[];
  onAdd: () => void;
}) {
  const colors = useColors();
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [activityFilter, setActivityFilter] = useState<'all' | 'ride' | 'training'>('all');
  const currentYear = new Date().getFullYear();
  const activityLabel = activityFilter === 'ride' ? 'ritten' : activityFilter === 'training' ? 'trainingen' : 'activiteiten';
  const activitySingularLabel = activityFilter === 'ride' ? 'rit' : activityFilter === 'training' ? 'training' : 'activiteit';
  const activityTitle = activityLabel.charAt(0).toUpperCase() + activityLabel.slice(1);
  const activitiesByHorse = useMemo(
    () => horses.map((horse) => ({
      horse,
      count: entries.filter((entry) =>
        (activityFilter === 'all' ? (entry.kind === 'ride' || entry.kind === 'training') : entry.kind === activityFilter) &&
        entry.status === 'completed' &&
        entry.horseId === horse.id &&
        Number(entry.date.slice(0, 4)) === selectedYear,
      ).length,
    }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count),
    [activityFilter, entries, horses, selectedYear],
  );
  const maxActivities = Math.max(0, ...activitiesByHorse.map(({ count }) => count));

  return (
    <Card style={styles.riderChartCard}>
      <View style={styles.riderChartHeader}>
        <View style={styles.riderChartHeading}>
          <Text style={[styles.riderChartTitle, { color: colors.foreground }]}>{`${activityTitle} per paard`}</Text>
          <Text style={[styles.riderChartSubtitle, { color: colors.mutedForeground }]}>{`Afgeronde ${activityLabel}`}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rit of training toevoegen"
          testID="rider-add-ride"
          onPress={onAdd}
          style={({ pressed }) => [styles.riderAddButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartFilters}>
        <Pill label="Alle activiteiten" active={activityFilter === 'all'} onPress={() => setActivityFilter('all')} />
        <Pill label="Ritten" active={activityFilter === 'ride'} onPress={() => setActivityFilter('ride')} />
        <Pill label="Trainingen" active={activityFilter === 'training'} onPress={() => setActivityFilter('training')} />
      </ScrollView>

      <View style={styles.yearPicker}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vorig jaar"
          testID="rides-previous-year"
          disabled={selectedYear <= 2000}
          onPress={() => setSelectedYear((year) => Math.max(2000, year - 1))}
          hitSlop={8}
          style={({ pressed }) => [styles.yearArrow, { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : selectedYear <= 2000 ? 0.45 : 1 }]}
        >
          <MaterialCommunityIcons name="chevron-left" size={20} color={colors.primary} />
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={[styles.selectedYear, { color: colors.foreground }]}>{selectedYear}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volgend jaar"
          testID="rides-next-year"
          disabled={selectedYear >= currentYear}
          onPress={() => setSelectedYear((year) => Math.min(currentYear, year + 1))}
          hitSlop={8}
          style={({ pressed }) => [styles.yearArrow, { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : selectedYear >= currentYear ? 0.45 : 1 }]}
        >
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {activitiesByHorse.length ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
            <View
              accessible
              accessibilityRole="image"
              accessibilityLabel={`Staafdiagram met het aantal afgeronde ${activityLabel} per paard in ${selectedYear}`}
              style={styles.rideChart}
            >
              {activitiesByHorse.map(({ horse, count }) => {
                const barHeight = Math.max(8, (count / maxActivities) * 88);
                return (
                  <View
                    key={horse.id}
                    accessible
                    accessibilityLabel={`${horse.name}: ${count} ${count === 1 ? activitySingularLabel : activityLabel} in ${selectedYear}`}
                    style={styles.rideColumn}
                  >
                    <View style={styles.rideBarArea}>
                      <Text style={[styles.rideCount, { color: colors.foreground, bottom: barHeight + 4 }]}>{count}</Text>
                      <View style={[styles.rideBarTrack, { backgroundColor: colors.secondary }]}>
                        <View style={[styles.rideBarFill, { height: barHeight, backgroundColor: colors.primary }]} />
                      </View>
                    </View>
                    <Text style={[styles.rideHorseName, { color: colors.mutedForeground }]} numberOfLines={2}>{horse.name}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <Text style={[styles.chartFootnote, { color: colors.mutedForeground }]}>
            {`Afgeronde ${activityLabel} per paard in ${selectedYear}`}
          </Text>
        </>
      ) : (
        <Text style={[styles.chartEmpty, { color: colors.mutedForeground }]}>
          {horses.length
            ? `Geen afgeronde ${activityLabel} geregistreerd in ${selectedYear}`
            : 'Voeg paarden toe om je activiteiten per paard te bekijken.'}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 112, gap: 13 },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, marginBottom: 7 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 15 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 23, marginTop: 1 },
  profileButton: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  warning: { flexDirection: 'row', gap: 9, alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 12 },
  warningText: { fontFamily: 'Inter_500Medium', fontSize: 12, flex: 1, lineHeight: 17 },
  hero: { borderRadius: 24, padding: 20, marginBottom: 6, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', minHeight: 140 },
  heroCopy: { flex: 1, justifyContent: 'center' },
  heroKicker: { color: '#BED4C4', fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.25, marginBottom: 10 },
  heroTitle: { color: '#FBF9F2', fontFamily: 'Inter_700Bold', fontSize: 25, lineHeight: 30 },
  heroDescription: { color: '#DAE5D9', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 8 },
  heroHorse: { width: 88, alignItems: 'center', justifyContent: 'center', opacity: 0.93 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 14, marginTop: 10 },
  stat: { alignItems: 'flex-start', minWidth: 72 },
  statNumber: { color: '#FBF9F2', fontFamily: 'Inter_700Bold', fontSize: 21 },
  statLabel: { color: '#DAE5D9', fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 31, backgroundColor: 'rgba(255,255,255,0.28)', marginRight: 15 },
  heroAdd: { width: 43, height: 43, borderRadius: 15, backgroundColor: '#F4EEE1', alignItems: 'center', justifyContent: 'center' },
  riderChartCard: { padding: 16, gap: 13, marginBottom: 6 },
  riderChartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  riderChartHeading: { flex: 1 },
  riderChartTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  riderChartSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  riderAddButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  yearPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13 },
  yearArrow: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  selectedYear: { fontFamily: 'Inter_700Bold', fontSize: 15, minWidth: 44, textAlign: 'center' },
  chartFilters: { gap: 7, paddingRight: 2 },
  chartScroll: { flexGrow: 1, paddingHorizontal: 2 },
  rideChart: { minWidth: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around', gap: 8 },
  rideColumn: { width: 62, alignItems: 'center' },
  rideBarArea: { width: 48, height: 122, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  rideBarTrack: { width: 26, height: 96, borderRadius: 10, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  rideBarFill: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  rideCount: { position: 'absolute', fontFamily: 'Inter_600SemiBold', fontSize: 12, textAlign: 'center' },
  rideHorseName: { width: 62, minHeight: 32, fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 15, textAlign: 'center', marginTop: 6 },
  chartFootnote: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center' },
  chartEmpty: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, paddingVertical: 18, textAlign: 'center' },
  upcomingCard: { paddingVertical: 5, marginBottom: 5 },
  upcomingLine: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  upcomingMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBadge: { width: 46, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dateBadgeDay: { fontFamily: 'Inter_700Bold', fontSize: 17, lineHeight: 19 },
  dateBadgeMonth: { fontFamily: 'Inter_500Medium', fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  entryCopy: { flex: 1, minWidth: 0 },
  entryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  entryMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  checkButton: { width: 32, height: 32, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, marginLeft: 58 },
  horseScroll: { gap: 10, paddingBottom: 4 },
  horseMini: { width: 116, minHeight: 126, borderRadius: 19, borderWidth: 1, padding: 14, justifyContent: 'center', alignItems: 'flex-start' },
  horseMiniName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginTop: 9 },
  horseMiniMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3, maxWidth: 90 },
  recentCard: { paddingVertical: 5 },
  entryLine: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11 },
  entryIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  entryDate: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});

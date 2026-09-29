import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useBarnWise } from '@/components/BarnWiseContext';
import { ActionButton, Card, EmptyState, HorseMark, IconButton, LoadingState, Screen, SectionTitle } from '@/components/BarnWiseUI';
import { HorseFormModal } from '@/components/HorseFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { filterEntriesForRole, type Horse } from '@/lib/barnwise';

export default function HorsesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { horses, entries, profile, ready, addHorse, deleteHorse } = useBarnWise();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [horseToDelete, setHorseToDelete] = useState<Horse | null>(null);
  const filtered = useMemo(
    () => horses.filter((horse) => `${horse.name} ${horse.breed} ${horse.coat}`.toLowerCase().includes(search.trim().toLowerCase())),
    [horses, search],
  );

  if (!ready) return <Screen><LoadingState /></Screen>;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>JOUW STAL</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Paarden</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Alle profielen en gegevens bij elkaar.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Paard toevoegen"
            testID="add-horse-button"
            onPress={() => setShowForm(true)}
            style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
          >
            <Feather name="plus" size={21} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Zoek op naam of ras"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            accessibilityLabel="Zoek paarden"
          />
          {search ? <Pressable accessibilityLabel="Zoekopdracht wissen" onPress={() => setSearch('')}><Feather name="x-circle" size={18} color={colors.mutedForeground} /></Pressable> : null}
        </View>

        <SectionTitle title={`${filtered.length} ${filtered.length === 1 ? 'paard' : 'paarden'}`} />
        {filtered.length ? (
          filtered.map((horse) => {
            const horseEntries = filterEntriesForRole(entries, profile.role)
              .filter((entry) => entry.horseId === horse.id);
            const nextEntry = horseEntries
              .filter((entry) => entry.status === 'planned')
              .sort((a, b) => a.date.localeCompare(b.date))[0];
            return (
              <Card key={horse.id} style={styles.horseCard}>
                <View style={styles.cardTop}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${horse.name} profiel bekijken`}
                    onPress={() => router.push({ pathname: '/horse/[id]', params: { id: horse.id } })}
                    style={({ pressed }) => [styles.cardTopMain, pressed && { opacity: 0.72 }]}
                  >
                    <HorseMark name={horse.name} size={58} />
                    <View style={styles.horseCopy}>
                      <Text style={[styles.horseName, { color: colors.foreground }]}>{horse.name}</Text>
                      <Text style={[styles.horseMeta, { color: colors.mutedForeground }]}>{[horse.breed, horse.birthYear, horse.sex].filter(Boolean).join(' · ')}</Text>
                    </View>
                    <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
                  </Pressable>
                  <IconButton icon="trash-2" label={`${horse.name} verwijderen`} color={colors.destructive} onPress={() => setHorseToDelete(horse)} />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${horse.name} profiel bekijken`}
                  onPress={() => router.push({ pathname: '/horse/[id]', params: { id: horse.id } })}
                  style={({ pressed }) => [pressed && { opacity: 0.72 }]}
                >
                  <View style={[styles.cardRule, { backgroundColor: colors.border }]} />
                  <View style={styles.cardFoot}>
                    <View style={styles.footItem}>
                      <MaterialCommunityIcons name="notebook-outline" size={15} color={colors.primary} />
                      <Text style={[styles.footText, { color: colors.mutedForeground }]}>{horseEntries.length} {profile.role === 'rider' ? 'ritten/trainingen' : 'items'}</Text>
                    </View>
                    <View style={styles.footItem}>
                      <MaterialCommunityIcons name={nextEntry ? 'calendar-clock' : 'check-circle-outline'} size={15} color={nextEntry ? '#A26645' : colors.primary} />
                      <Text style={[styles.footText, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {nextEntry
                          ? `${profile.role === 'rider' ? 'Volgende rit/training' : 'Volgende'}: ${nextEntry.title}`
                          : profile.role === 'rider' ? 'Geen ritten of trainingen gepland' : 'Geen afspraken gepland'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Card>
            );
          })
        ) : (
          <Card>
            <EmptyState
              icon={search ? 'search' : 'plus'}
              title={search ? 'Geen paarden gevonden' : 'Je stal begint hier'}
              detail={search ? 'Pas je zoekopdracht aan en probeer opnieuw.' : 'Voeg je eerste paard toe om gegevens en activiteiten bij te houden.'}
            />
            {!search ? <ActionButton label="Paard toevoegen" icon="plus" onPress={() => setShowForm(true)} /> : null}
          </Card>
        )}
      </ScrollView>
      {showForm ? (
        <HorseFormModal
          key="new-horse"
          visible
          onClose={() => setShowForm(false)}
          onSave={(horse: Horse) => {
            addHorse(horse);
            setShowForm(false);
            router.push({ pathname: '/horse/[id]', params: { id: horse.id } });
          }}
        />
      ) : null}
      {horseToDelete ? (
        <ConfirmModal
          visible
          title={`${horseToDelete.name} verwijderen?`}
          message="Het paardenprofiel en alle bijbehorende activiteiten worden verwijderd. Dit kan niet ongedaan worden gemaakt."
          onCancel={() => setHorseToDelete(null)}
          onConfirm={() => {
            deleteHorse(horseToDelete.id);
            setHorseToDelete(null);
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 112, gap: 13 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerCopy: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, marginBottom: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 5 },
  addButton: { width: 47, height: 47, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  searchWrap: { minHeight: 49, borderRadius: 15, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 11 },
  horseCard: { marginBottom: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  cardTopMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 13 },
  horseCopy: { flex: 1, minWidth: 0 },
  horseName: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  horseMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  cardRule: { height: 1, marginVertical: 13 },
  cardFoot: { gap: 9 },
  footItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  footText: { fontFamily: 'Inter_400Regular', fontSize: 12, flexShrink: 1 },
});
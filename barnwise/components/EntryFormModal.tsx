import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import {
  createId,
  ENTRY_LABELS,
  getEntryKindsForRole,
  todayISO,
  type EntryKind,
  type HorseEntry,
} from '@/lib/barnwise';
import { useBarnWise } from '@/components/BarnWiseContext';
import { ActionButton, IconButton, Pill } from '@/components/BarnWiseUI';

export function EntryFormModal({
  visible,
  initialHorseId,
  initialEntry,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialHorseId?: string;
  initialEntry?: HorseEntry;
  onClose: () => void;
  onSave: (entry: HorseEntry) => void;
}) {
  const colors = useColors();
  const { horses, profile } = useBarnWise();
  const kinds: EntryKind[] = getEntryKindsForRole(profile.role);
  const [kind, setKind] = useState<EntryKind>(initialEntry?.kind ?? 'ride');
  const [horseId, setHorseId] = useState(initialEntry?.horseId ?? initialHorseId ?? horses[0]?.id ?? '');
  const [title, setTitle] = useState(initialEntry?.title ?? '');
  const [date, setDate] = useState(initialEntry?.date ?? todayISO());
  const [detail, setDetail] = useState(initialEntry?.detail ?? '');
  const [error, setError] = useState('');
  const inputStyle = [styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }];

  function save() {
    if (!horseId) {
      setError('Voeg eerst een paard toe.');
      return;
    }
    if (!title.trim()) {
      setError('Geef deze activiteit een naam.');
      return;
    }
    const parsedDate = new Date(`${date}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime())) {
      setError('Gebruik een geldige datum in het formaat JJJJ-MM-DD.');
      return;
    }
    onSave({
      id: initialEntry?.id ?? createId(),
      horseId,
      kind: kinds.includes(kind) ? kind : kinds[0],
      title: title.trim(),
      date,
      detail: detail.trim(),
      status: date > todayISO() ? 'planned' : 'completed',
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Sluiten" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: Platform.OS === 'web' ? 34 : 18 }]}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>{initialEntry ? 'Activiteit aanpassen' : profile.role === 'rider' ? 'Rit of training toevoegen' : 'Activiteit toevoegen'}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{initialEntry ? 'Pas de gegevens van deze activiteit aan.' : profile.role === 'rider' ? 'Leg je rit of training vast bij het paard.' : 'Bewaar een rit, verzorging of afspraak.'}</Text>
            </View>
            <IconButton icon="x" label="Sluiten" onPress={onClose} />
          </View>
          <KeyboardAwareScrollViewCompat
            style={styles.formScroll}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            bottomOffset={24}
          >
            <Text style={[styles.label, { color: colors.foreground }]}>Soort activiteit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.pills}>
                {kinds.map((item) => (
                  <Pill key={item} label={ENTRY_LABELS[item]} active={kind === item} onPress={() => setKind(item)} />
                ))}
              </View>
            </ScrollView>
            <Text style={[styles.label, { color: colors.foreground }]}>Paard</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.pills}>
                {horses.map((horse) => (
                  <Pill key={horse.id} label={horse.name} active={horseId === horse.id} onPress={() => setHorseId(horse.id)} />
                ))}
              </View>
            </ScrollView>
            <Text style={[styles.label, { color: colors.foreground }]}>Naam *</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder={profile.role === 'rider' ? 'Bijvoorbeeld bosrit of dressuurtraining' : 'Bijvoorbeeld bosrit of hoefsmid'} placeholderTextColor={colors.mutedForeground} style={inputStyle} testID="entry-title-input" />
            <Text style={[styles.label, { color: colors.foreground }]}>Datum</Text>
            <TextInput value={date} onChangeText={setDate} placeholder="JJJJ-MM-DD" placeholderTextColor={colors.mutedForeground} style={inputStyle} />
            <Text style={[styles.label, { color: colors.foreground }]}>Notities</Text>
            <TextInput value={detail} onChangeText={setDetail} placeholder={profile.role === 'rider' ? 'Duur, route, training of extra informatie…' : 'Duur, behandeling of extra informatie…'} placeholderTextColor={colors.mutedForeground} style={[inputStyle, styles.notesInput]} multiline textAlignVertical="top" />
            {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
            <ActionButton label={initialEntry ? 'Wijzigingen bewaren' : profile.role === 'rider' ? 'Rit of training bewaren' : 'Activiteit bewaren'} icon="check" onPress={save} disabled={horses.length === 0} testID="save-entry-button" />
          </KeyboardAwareScrollViewCompat>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(18, 30, 24, 0.38)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 20, maxHeight: '93%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4 },
  formScroll: { flexGrow: 0 },
  form: { paddingBottom: 20, gap: 8 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 5 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, fontFamily: 'Inter_400Regular', fontSize: 14 },
  pills: { flexDirection: 'row', paddingVertical: 3 },
  notesInput: { minHeight: 82, paddingTop: 12 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 13, marginVertical: 4 },
});
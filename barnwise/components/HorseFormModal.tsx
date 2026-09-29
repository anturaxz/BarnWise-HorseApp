import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { createId, type Horse } from '@/lib/barnwise';
import { ActionButton, IconButton, Pill } from '@/components/BarnWiseUI';

export function HorseFormModal({
  visible,
  initialHorse,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialHorse?: Horse;
  onClose: () => void;
  onSave: (horse: Horse) => void;
}) {
  const colors = useColors();
  const [name, setName] = useState(initialHorse?.name ?? '');
  const [breed, setBreed] = useState(initialHorse?.breed ?? '');
  const [birthYear, setBirthYear] = useState(initialHorse?.birthYear ?? '');
  const [sex, setSex] = useState<Horse['sex']>(initialHorse?.sex ?? 'Merrie');
  const [coat, setCoat] = useState(initialHorse?.coat ?? '');
  const [notes, setNotes] = useState(initialHorse?.notes ?? '');
  const [error, setError] = useState('');

  const inputStyle = [styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }];

  function save() {
    if (!name.trim()) {
      setError('Vul de naam van je paard in.');
      return;
    }
    if (birthYear && !/^\d{4}$/.test(birthYear)) {
      setError('Vul een geboortejaar van vier cijfers in.');
      return;
    }
    onSave({
      id: initialHorse?.id ?? createId(),
      name: name.trim(),
      breed: breed.trim(),
      birthYear: birthYear.trim(),
      sex,
      coat: coat.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Sluiten" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: Platform.OS === 'web' ? 34 : 18 }]}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>{initialHorse ? 'Paard aanpassen' : 'Paard toevoegen'}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>De belangrijkste gegevens op één plek.</Text>
            </View>
            <IconButton icon="x" label="Sluiten" onPress={onClose} />
          </View>
          <KeyboardAwareScrollViewCompat
            style={styles.formScroll}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            bottomOffset={24}
          >
            <Text style={[styles.label, { color: colors.foreground }]}>Naam *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Bijvoorbeeld Noor" placeholderTextColor={colors.mutedForeground} style={inputStyle} testID="horse-name-input" />
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={[styles.label, { color: colors.foreground }]}>Ras</Text>
                <TextInput value={breed} onChangeText={setBreed} placeholder="Ras" placeholderTextColor={colors.mutedForeground} style={inputStyle} />
              </View>
              <View style={styles.column}>
                <Text style={[styles.label, { color: colors.foreground }]}>Geboortejaar</Text>
                <TextInput value={birthYear} onChangeText={setBirthYear} placeholder="2018" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" maxLength={4} style={inputStyle} />
              </View>
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>Geslacht</Text>
            <View style={styles.pills}>
              {(['Merrie', 'Ruin', 'Hengst'] as const).map((option) => (
                <Pill key={option} label={option} active={sex === option} onPress={() => setSex(option)} />
              ))}
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>Kleur</Text>
            <TextInput value={coat} onChangeText={setCoat} placeholder="Bijvoorbeeld vos" placeholderTextColor={colors.mutedForeground} style={inputStyle} />
            <Text style={[styles.label, { color: colors.foreground }]}>Notities</Text>
            <TextInput value={notes} onChangeText={setNotes} placeholder="Bijzonderheden, voorkeuren…" placeholderTextColor={colors.mutedForeground} style={[inputStyle, styles.notesInput]} multiline textAlignVertical="top" />
            {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
            <ActionButton label={initialHorse ? 'Gegevens bewaren' : 'Paard bewaren'} icon="check" onPress={save} testID="save-horse-button" />
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
  twoColumns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1, gap: 8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2, marginBottom: 4 },
  notesInput: { minHeight: 82, paddingTop: 12 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 13, marginVertical: 4 },
});
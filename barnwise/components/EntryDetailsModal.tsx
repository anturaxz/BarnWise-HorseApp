import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { ActionButton, IconButton } from '@/components/BarnWiseUI';
import { ENTRY_ICONS, ENTRY_LABELS, formatDate, type HorseEntry } from '@/lib/barnwise';

export function EntryDetailsModal({
  visible,
  entry,
  horseName,
  onClose,
  onEdit,
  onDelete,
}: {
  visible: boolean;
  entry: HorseEntry;
  horseName: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const isPlanned = entry.status === 'planned' && entry.date >= new Date().toISOString().slice(0, 10);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Activiteitdetails sluiten" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.dialog, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name={ENTRY_ICONS[entry.kind] as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={22} color={colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.foreground }]}>{entry.title}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{horseName} · {ENTRY_LABELS[entry.kind]}</Text>
            </View>
            <IconButton icon="x" label="Sluiten" onPress={onClose} />
          </View>

          <View style={[styles.status, { backgroundColor: isPlanned ? '#F8E9DC' : colors.secondary }]}>
            <View style={[styles.statusDot, { backgroundColor: isPlanned ? '#A26645' : colors.primary }]} />
            <Text style={[styles.statusText, { color: isPlanned ? '#825239' : colors.secondaryForeground }]}>{isPlanned ? 'Gepland' : 'Afgerond'}</Text>
          </View>

          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.detailLine}>
              <Feather name="calendar" size={16} color={colors.primary} />
              <View>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Datum</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{formatDate(entry.date, true)}</Text>
              </View>
            </View>
            <View style={[styles.rule, { backgroundColor: colors.border }]} />
            <View>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Notitie</Text>
              <Text style={[styles.note, { color: entry.detail ? colors.foreground : colors.mutedForeground }]}>
                {entry.detail || 'Geen notitie toegevoegd.'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <ActionButton label="Bewerken" icon="edit-2" secondary onPress={onEdit} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Activiteit verwijderen"
              onPress={onDelete}
              style={({ pressed }) => [styles.deleteButton, { backgroundColor: colors.destructive, opacity: pressed ? 0.78 : 1 }]}
            >
              <Feather name="trash-2" size={16} color="#FFFFFF" />
              <Text style={styles.deleteText}>Verwijderen</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(18, 30, 24, 0.42)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  dialog: { width: '100%', maxWidth: 440, borderRadius: 24, borderWidth: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  iconWrap: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  status: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, marginTop: 17 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  detailCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: 14 },
  detailLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 3 },
  rule: { height: 1, marginVertical: 13 },
  note: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 18 },
  deleteButton: { flex: 1, minHeight: 46, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12 },
  deleteText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
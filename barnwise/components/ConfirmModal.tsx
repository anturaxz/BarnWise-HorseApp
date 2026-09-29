import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function ConfirmModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = 'Verwijderen',
}: {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Bevestiging sluiten" style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Annuleren"
              onPress={onCancel}
              style={({ pressed }) => [styles.action, { backgroundColor: colors.secondary, opacity: pressed ? 0.75 : 1 }]}
            >
              <Text style={[styles.actionText, { color: colors.secondaryForeground }]}>Annuleren</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              style={({ pressed }) => [styles.action, { backgroundColor: colors.destructive, opacity: pressed ? 0.75 : 1 }]}
            >
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(18, 30, 24, 0.42)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 420, borderRadius: 22, borderWidth: 1, padding: 22 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  message: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 20 },
  action: { minWidth: 104, minHeight: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
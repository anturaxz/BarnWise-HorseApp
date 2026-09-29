import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: Platform.OS === 'web' ? 67 : 0 },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

export function ScreenScroll({ children }: { children: ReactNode }) {
  return (
    <Screen>
      <View style={styles.scrollContent}>{children}</View>
    </Screen>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  icon,
  secondary = false,
  disabled = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>['name'];
  secondary?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      disabled={disabled}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: secondary ? colors.secondary : colors.primary,
          opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
        },
      ]}
    >
      {icon ? (
        <Feather
          name={icon}
          size={16}
          color={secondary ? colors.secondaryForeground : colors.primaryForeground}
        />
      ) : null}
      <Text
        style={[
          styles.actionText,
          { color: secondary ? colors.secondaryForeground : colors.primaryForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  label: string;
  color?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={`icon-${label.toLowerCase().replaceAll(' ', '-')}`}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Feather name={icon} size={21} color={color ?? colors.foreground} />
    </Pressable>
  );
}

export function Pill({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: active } : undefined}
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? colors.primary : colors.secondary,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: active ? colors.primaryForeground : colors.secondaryForeground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function HorseMark({ name, size = 46 }: { name: string; size?: number }) {
  const colors = useColors();
  const palette = [colors.primary, '#A26645', '#73865C'];
  const color = palette[(name.charCodeAt(0) || 0) % palette.length];
  return (
    <View
      style={[
        styles.horseMark,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}1C` },
      ]}
    >
      <MaterialCommunityIcons name="horse-variant" size={size * 0.55} color={color} />
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <Text style={[styles.textAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingState() {
  const colors = useColors();
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.muted, { color: colors.mutedForeground }]}>BarnWise wordt geopend…</Text>
    </View>
  );
}

export function EmptyState({
  title,
  detail,
  icon = 'inbox',
}: {
  title: string;
  detail: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
}) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyDetail, { color: colors.mutedForeground }]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'web' ? 118 : 100 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  actionButton: {
    minHeight: 48,
    borderRadius: 15,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  pill: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 30,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  horseMark: { alignItems: 'center', justifyContent: 'center' },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
  textAction: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  muted: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 34 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, textAlign: 'center', marginBottom: 6 },
  emptyDetail: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 280 },
});
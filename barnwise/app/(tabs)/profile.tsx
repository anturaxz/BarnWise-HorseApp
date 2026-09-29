import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useBarnWise } from '@/components/BarnWiseContext';
import { ActionButton, Card, HorseMark, LoadingState, Pill, Screen, SectionTitle } from '@/components/BarnWiseUI';
import { filterEntriesForRole } from '@/lib/barnwise';

export default function ProfileScreen() {
  const colors = useColors();
  const { horses, entries, profile, account, ready, storageError, updateProfile, logoutAccount } = useBarnWise();
  const visibleEntryCount = filterEntriesForRole(entries, profile.role).length;
  if (!ready) return <Screen><LoadingState /></Screen>;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>JOUW ACCOUNT</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Profiel</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Stel BarnWise af op jouw rol aan de stal.</Text>
        </View>

        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{profile.name.trim().charAt(0).toUpperCase() || 'B'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>{profile.name}</Text>
            <Text style={[styles.profileMeta, { color: colors.mutedForeground }]}>
              @{account?.username ?? 'profiel'} · {profile.role === 'owner' ? 'Paardenhouder' : 'Ruiter'}
            </Text>
          </View>
          <MaterialCommunityIcons name="account-circle-outline" size={23} color={colors.mutedForeground} />
        </Card>

        <SectionTitle title="Ik gebruik BarnWise als…" />
        <View style={styles.roles}>
          <RoleCard
            active={profile.role === 'owner'}
            title="Paardenhouder"
            description="Ik beheer paarden en hun dagelijkse zorg."
            icon="home-heart"
            onPress={() => updateProfile({ role: 'owner' })}
          />
          <RoleCard
            active={profile.role === 'rider'}
            title="Ruiter"
            description="Ik houd mijn ritten en trainingen bij."
            icon="horse-variant"
            onPress={() => updateProfile({ role: 'rider' })}
          />
        </View>

        <SectionTitle title="Jouw BarnWise" />
        <Card style={styles.dataCard}>
          <DataLine icon="horse-variant" title="Paarden" value={String(horses.length)} />
          <View style={[styles.rule, { backgroundColor: colors.border }]} />
          <DataLine
            icon="notebook-outline"
            title={profile.role === 'rider' ? 'Ritten & trainingen' : 'Activiteiten'}
            value={String(visibleEntryCount)}
          />
          <View style={[styles.rule, { backgroundColor: colors.border }]} />
          <DataLine
            icon="shield-check-outline"
            title="Gegevens"
            value={storageError ? 'Controleer verbinding' : 'Gesynchroniseerd'}
          />
        </Card>

        <View style={[styles.info, { backgroundColor: colors.secondary }]}>
          <Feather name="info" size={17} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.secondaryForeground }]}>
            Je profiel, paarden en activiteiten worden per account opgeslagen en automatisch gesynchroniseerd.
          </Text>
        </View>
        {storageError ? (
          <Text style={[styles.syncError, { color: colors.destructive }]}>{storageError}</Text>
        ) : null}
        <ActionButton label="Uitloggen" icon="log-out" secondary onPress={() => void logoutAccount()} />
        <Text style={[styles.version, { color: colors.mutedForeground }]}>BarnWise · jouw stal, overzichtelijk</Text>
      </ScrollView>
    </Screen>
  );
}

function RoleCard({
  active,
  title,
  description,
  icon,
  onPress,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Card style={[styles.roleCard, active && { borderColor: colors.primary, borderWidth: 2 }]}>
      <View style={styles.roleTop}>
        <View style={[styles.roleIcon, { backgroundColor: colors.secondary }]}>
          <MaterialCommunityIcons name={icon} size={21} color={colors.primary} />
        </View>
        {active ? <Feather name="check-circle" size={19} color={colors.primary} /> : null}
      </View>
      <Text style={[styles.roleTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.roleDescription, { color: colors.mutedForeground }]}>{description}</Text>
      <View style={styles.roleSelect}>
        <Pill label={active ? 'Geselecteerd' : 'Kiezen'} active={active} onPress={onPress} />
      </View>
    </Card>
  );
}

function DataLine({
  icon,
  title,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.dataLine}>
      <MaterialCommunityIcons name={icon} size={19} color={colors.primary} />
      <Text style={[styles.dataTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.dataValue, { color: colors.mutedForeground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 112, gap: 14 },
  header: { marginBottom: 2 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, marginBottom: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 5 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 19 },
  avatar: { width: 54, height: 54, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 21 },
  profileName: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  profileMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  roles: { flexDirection: 'row', gap: 10 },
  roleCard: { flex: 1, padding: 13, minHeight: 190 },
  roleTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roleIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  roleTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 12 },
  roleDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 5, minHeight: 34 },
  roleSelect: { marginTop: 8, alignItems: 'flex-start' },
  dataCard: { paddingVertical: 6 },
  dataLine: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 11 },
  dataTitle: { fontFamily: 'Inter_500Medium', fontSize: 13, flex: 1 },
  dataValue: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  rule: { height: 1, marginLeft: 30 },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 16 },
  infoText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, flex: 1 },
  syncError: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  version: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginTop: 2 },
});
import React, { useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useBarnWise } from '@/components/BarnWiseContext';
import { ActionButton, Card, Screen } from '@/components/BarnWiseUI';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import type { UserRole } from '@/lib/barnwise';

export function AuthScreen() {
  const colors = useColors();
  const { loginAccount, registerAccount, storageError } = useBarnWise();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('rider');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  async function submit() {
    Keyboard.dismiss();
    setError(null);
    if (!username.trim() || !password) {
      setError('Vul je gebruikersnaam en wachtwoord in.');
      return;
    }
    if (isRegister && password.length < 8) {
      setError('Kies een wachtwoord van minstens 8 tekens.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await registerAccount({ username, password, role });
      } else {
        await loginAccount(username, password);
      }
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Aanmelden is niet gelukt.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.content}
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.secondary }]}>
            <MaterialCommunityIcons name="horse-variant" size={30} color={colors.primary} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>BARNWISE</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Jouw stal,{'\n'}overzichtelijk.
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Bewaar je paarden en activiteiten veilig per profiel.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={[styles.modeRow, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setMode('login')} style={styles.modeButton}>
              <Text style={[styles.modeText, { color: mode === 'login' ? colors.primary : colors.mutedForeground }]}>
                Aanmelden
              </Text>
              {mode === 'login' ? <View style={[styles.modeRule, { backgroundColor: colors.primary }]} /> : null}
            </Pressable>
            <Pressable onPress={() => setMode('register')} style={styles.modeButton}>
              <Text style={[styles.modeText, { color: mode === 'register' ? colors.primary : colors.mutedForeground }]}>
                Registreren
              </Text>
              {mode === 'register' ? <View style={[styles.modeRule, { backgroundColor: colors.primary }]} /> : null}
            </Pressable>
          </View>

          <Field
            label="Gebruikersnaam"
            value={username}
            onChangeText={setUsername}
            placeholder="bijvoorbeeld noor_ruit"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field
            label="Wachtwoord"
            value={password}
            onChangeText={setPassword}
            placeholder={isRegister ? 'Minstens 8 tekens' : 'Je wachtwoord'}
            secureTextEntry
            autoCapitalize="none"
          />

          {isRegister ? (
            <View style={styles.roleSection}>
              <Text style={[styles.label, { color: colors.foreground }]}>Mijn rol</Text>
              <View style={styles.roleRow}>
                <RoleChoice
                  title="Ruiter"
                  description="Ritten en trainingen"
                  icon="horse-variant"
                  active={role === 'rider'}
                  onPress={() => setRole('rider')}
                />
                <RoleChoice
                  title="Paardenhouder"
                  description="Paarden en verzorging"
                  icon="home-heart"
                  active={role === 'owner'}
                  onPress={() => setRole('owner')}
                />
              </View>
            </View>
          ) : null}

          {error || storageError ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + '18' }]}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error ?? storageError}</Text>
            </View>
          ) : null}

          <ActionButton
            label={submitting ? 'Even geduld…' : isRegister ? 'Profiel aanmaken' : 'Aanmelden'}
            icon={submitting ? undefined : 'arrow-right'}
            onPress={() => void submit()}
            disabled={submitting}
          />
          {isRegister ? (
            <Text style={[styles.helper, { color: colors.mutedForeground }]}>
              Je bestaande gegevens op dit toestel worden meegenomen naar je nieuwe profiel.
            </Text>
          ) : null}
        </Card>
      </KeyboardAwareScrollViewCompat>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
      />
    </View>
  );
}

function RoleChoice({
  title,
  description,
  icon,
  active,
  onPress,
}: {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.roleChoice,
        { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.secondary : colors.background },
      ]}
    >
      <View style={styles.roleChoiceTop}>
        <MaterialCommunityIcons name={icon} size={19} color={colors.primary} />
        {active ? <Feather name="check" size={15} color={colors.primary} /> : null}
      </View>
      <Text style={[styles.roleTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.roleDescription, { color: colors.mutedForeground }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40, gap: 25 },
  brand: { alignItems: 'center' },
  logo: { width: 62, height: 62, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 31, lineHeight: 35, textAlign: 'center' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 280, marginTop: 10 },
  formCard: { padding: 18, gap: 16 },
  modeRow: { flexDirection: 'row', gap: 22, borderBottomWidth: 1, marginBottom: 3 },
  modeButton: { paddingBottom: 11 },
  modeText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  modeRule: { height: 2, borderRadius: 2, position: 'absolute', bottom: -1, left: 0, right: 0 },
  field: { gap: 7 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 14 },
  roleSection: { gap: 8 },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChoice: { flex: 1, minHeight: 98, borderWidth: 1, borderRadius: 14, padding: 11 },
  roleChoiceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 9 },
  roleDescription: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 14, marginTop: 3 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, borderRadius: 12 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, flex: 1 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: -5 },
});
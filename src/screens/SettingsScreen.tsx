import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { APP_COLORS, SHELF_THEMES } from '../constants/colors';
import { Settings } from '../types';

const DURATIONS = [15, 20, 25, 30, 45, 60];
const SHORT_BREAKS = [5, 10];
const LONG_BREAKS = [15, 20, 30];
const LONG_BREAK_INTERVALS = [2, 3, 4];

function OptionRow({
  label,
  options,
  value,
  onSelect,
  suffix = 'dk',
}: {
  label: string;
  options: number[];
  value: number;
  onSelect: (v: number) => void;
  suffix?: string;
}) {
  return (
    <View style={styles.optionRow}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.optionBtns}>
        {options.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.optBtn, value === o && styles.optBtnActive]}
            onPress={() => onSelect(o)}
          >
            <Text style={[styles.optBtnText, value === o && styles.optBtnTextActive]}>
              {o}{suffix}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useAppStore();

  const update = (patch: Partial<Settings>) => updateSettings(patch);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>⚙️ Ayarlar</Text>

      {/* Timer Settings */}
      <Text style={styles.sectionTitle}>Zamanlayıcı</Text>
      <View style={styles.card}>
        <OptionRow
          label="Pomodoro Süresi"
          options={DURATIONS}
          value={settings.pomodoroDuration}
          onSelect={(v) => update({ pomodoroDuration: v })}
        />
        <View style={styles.divider} />
        <OptionRow
          label="Kısa Mola"
          options={SHORT_BREAKS}
          value={settings.shortBreak}
          onSelect={(v) => update({ shortBreak: v })}
        />
        <View style={styles.divider} />
        <OptionRow
          label="Uzun Mola"
          options={LONG_BREAKS}
          value={settings.longBreak}
          onSelect={(v) => update({ longBreak: v })}
        />
        <View style={styles.divider} />
        <OptionRow
          label="Uzun Molaya Kadar"
          options={LONG_BREAK_INTERVALS}
          value={settings.longBreakInterval}
          onSelect={(v) => update({ longBreakInterval: v })}
          suffix=" seans"
        />
      </View>

      {/* Sound & Notifications */}
      <Text style={styles.sectionTitle}>Ses & Bildirim</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>🔊 Sesler</Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(v) => update({ soundEnabled: v })}
            trackColor={{ true: APP_COLORS.primary, false: APP_COLORS.border }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>🔔 Bildirimler</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(v) => update({ notificationsEnabled: v })}
            trackColor={{ true: APP_COLORS.primary, false: APP_COLORS.border }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Shelf Theme */}
      <Text style={styles.sectionTitle}>Kütüphane Teması</Text>
      <View style={styles.card}>
        {Object.entries(SHELF_THEMES).map(([key, theme], i, arr) => (
          <React.Fragment key={key}>
            <TouchableOpacity
              style={styles.themeRow}
              onPress={() => update({ shelfTheme: key as Settings['shelfTheme'] })}
            >
              <View style={styles.themeLeft}>
                <View
                  style={[styles.themePreview, { backgroundColor: theme.shelfColor }]}
                />
                <Text style={styles.themeName}>{theme.name}</Text>
              </View>
              {settings.shelfTheme === key && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
            {i < arr.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>

      {/* App Theme */}
      <Text style={styles.sectionTitle}>Uygulama Teması</Text>
      <View style={styles.card}>
        {(['system', 'dark', 'light'] as const).map((t, i, arr) => {
          const labels: Record<string, string> = {
            system: '📱 Sisteme Göre',
            dark: '🌙 Koyu',
            light: '☀️ Açık',
          };
          return (
            <React.Fragment key={t}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => update({ theme: t })}
              >
                <Text style={styles.toggleLabel}>{labels[t]}</Text>
                {settings.theme === t && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  sectionTitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: APP_COLORS.border,
    marginHorizontal: 16,
  },
  optionRow: {
    padding: 16,
  },
  optionLabel: {
    color: APP_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: APP_COLORS.background,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  optBtnActive: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  optBtnText: {
    color: APP_COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  optBtnTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleLabel: {
    color: APP_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themePreview: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  themeName: {
    color: APP_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});

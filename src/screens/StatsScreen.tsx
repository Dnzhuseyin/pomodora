import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { APP_COLORS } from '../constants/colors';

const { width: SW } = Dimensions.get('window');

function getDayLabel(date: Date): string {
  return ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][date.getDay()];
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { sessions } = useAppStore();

  const completed = sessions.filter((s) => s.completed);
  const totalMinutes = completed.reduce((a, s) => a + s.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // Weekly bar chart (last 7 days)
  const weekData = useMemo(() => {
    const days: { label: string; count: number; date: string }[] = [];
    let maxCount = 1;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const count = completed.filter(
        (s) => new Date(s.startedAt).toDateString() === ds,
      ).length;
      if (count > maxCount) maxCount = count;
      days.push({ label: getDayLabel(d), count, date: ds });
    }
    return { days, maxCount };
  }, [completed]);

  // Monthly heat map (last 35 days, 5 weeks)
  const heatData = useMemo(() => {
    const cells: { count: number; date: string }[] = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const count = completed.filter(
        (s) => new Date(s.startedAt).toDateString() === ds,
      ).length;
      cells.push({ count, date: ds });
    }
    return cells;
  }, [completed]);

  const maxHeat = Math.max(1, ...heatData.map((c) => c.count));

  // Best day
  const bestDay = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((s) => {
      const ds = new Date(s.startedAt).toDateString();
      map[ds] = (map[ds] || 0) + 1;
    });
    let best = { date: '', count: 0 };
    for (const [date, count] of Object.entries(map)) {
      if (count > best.count) best = { date, count };
    }
    return best;
  }, [completed]);

  // Streak
  let streak = 0;
  const daySet = new Set(completed.map((s) => new Date(s.startedAt).toDateString()));
  let check = new Date();
  while (daySet.has(check.toDateString())) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  const heatColor = (count: number) => {
    if (count === 0) return APP_COLORS.border;
    const intensity = count / maxHeat;
    if (intensity < 0.25) return '#1a4d2e';
    if (intensity < 0.5) return '#276738';
    if (intensity < 0.75) return '#31a354';
    return '#74c476';
  };

  const BAR_MAX_H = 80;
  const barW = (SW - 48 - 6 * 8) / 7;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>📊 İstatistikler</Text>

      {/* Summary cards */}
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{completed.length}</Text>
          <Text style={styles.cardLabel}>Toplam Kitap</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{totalHours}s {totalMinutes % 60}d</Text>
          <Text style={styles.cardLabel}>Odaklanma</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{streak} 🔥</Text>
          <Text style={styles.cardLabel}>Gün Serisi</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{bestDay.count || 0}</Text>
          <Text style={styles.cardLabel}>En iyi gün</Text>
        </View>
      </View>

      {/* Weekly bar chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bu Hafta</Text>
        <View style={[styles.chartCard]}>
          <View style={styles.barChart}>
            {weekData.days.map((d, i) => {
              const barH = weekData.maxCount > 0
                ? (d.count / weekData.maxCount) * BAR_MAX_H
                : 0;
              const isToday = d.date === new Date().toDateString();
              return (
                <View key={i} style={[styles.barCol, { width: barW }]}>
                  <Text style={styles.barCount}>{d.count || ''}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(4, barH),
                          backgroundColor: isToday
                            ? APP_COLORS.primary
                            : APP_COLORS.primaryLight + '88',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isToday && { color: APP_COLORS.primary }]}>
                    {d.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Heat map */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son 35 Gün</Text>
        <View style={styles.chartCard}>
          <View style={styles.heatGrid}>
            {heatData.map((cell, i) => (
              <View
                key={i}
                style={[
                  styles.heatCell,
                  { backgroundColor: heatColor(cell.count) },
                ]}
              />
            ))}
          </View>
          <View style={styles.heatLegend}>
            <Text style={styles.heatLegendText}>Az</Text>
            {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
              <View
                key={i}
                style={[
                  styles.heatCell,
                  { backgroundColor: heatColor(Math.round(v * maxHeat)) },
                ]}
              />
            ))}
            <Text style={styles.heatLegendText}>Çok</Text>
          </View>
        </View>
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
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  cardNum: {
    color: APP_COLORS.primaryLight,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 12,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barCount: {
    color: APP_COLORS.textMuted,
    fontSize: 10,
    marginBottom: 4,
    height: 14,
  },
  barTrack: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
    borderRadius: 4,
    backgroundColor: APP_COLORS.border,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 10,
    marginTop: 6,
  },
  heatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  heatLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  heatLegendText: {
    color: APP_COLORS.textMuted,
    fontSize: 10,
  },
});

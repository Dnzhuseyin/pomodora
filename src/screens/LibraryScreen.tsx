import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import ShelfBook from '../components/ShelfBook';
import { APP_COLORS, SHELF_THEMES } from '../constants/colors';
import { Session } from '../types';

const { width: SW } = Dimensions.get('window');
const BOOKS_PER_SHELF = 8;
const SHELF_HEIGHT = 100;

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, settings, newSessionId, setNewSessionId } = useAppStore();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const theme = SHELF_THEMES[settings.shelfTheme];
  const completedSessions = sessions.filter((s) => s.completed);
  const totalBooks = completedSessions.length;

  // Shelves
  const shelves: Session[][] = [];
  for (let i = 0; i < completedSessions.length; i += BOOKS_PER_SHELF) {
    shelves.push(completedSessions.slice(i, i + BOOKS_PER_SHELF));
  }
  // Add empty shelf if needed
  if (shelves.length === 0 || shelves[shelves.length - 1].length >= BOOKS_PER_SHELF) {
    shelves.push([]);
  }

  // Stats
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeek = completedSessions.filter(
    (s) => new Date(s.startedAt) >= weekStart,
  ).length;

  // Streak
  let streak = 0;
  const daySet = new Set(
    completedSessions.map((s) => new Date(s.startedAt).toDateString()),
  );
  let check = new Date();
  while (daySet.has(check.toDateString())) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  const handleBookPress = (session: Session) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSession(session);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgGradient[0] }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>📚 Kütüphanem</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{thisWeek}</Text>
          <Text style={styles.statLabel}>bu hafta</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalBooks}</Text>
          <Text style={styles.statLabel}>toplam</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{streak}</Text>
          <Text style={styles.statLabel}>gün serisi 🔥</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {shelves.map((shelfBooks, shelfIdx) => (
          <View key={shelfIdx} style={styles.shelfSection}>
            {/* Books on shelf */}
            <View style={styles.booksRow}>
              {shelfBooks.map((session) => (
                <ShelfBook
                  key={session.id}
                  session={session}
                  isNew={session.id === newSessionId}
                  onPress={handleBookPress}
                />
              ))}
              {/* Empty placeholder slots */}
              {Array.from({
                length: Math.max(0, BOOKS_PER_SHELF - shelfBooks.length),
              }).map((_, i) => (
                <View
                  key={`empty-${i}`}
                  style={[
                    styles.emptySlot,
                    { borderColor: theme.shelfColor + '40' },
                  ]}
                />
              ))}
            </View>

            {/* Shelf plank */}
            <View style={[styles.shelfPlank, { backgroundColor: theme.shelfColor }]}>
              <View style={[styles.shelfPlankDark, { backgroundColor: theme.shelfDark }]} />
            </View>
          </View>
        ))}

        {totalBooks === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📖</Text>
            <Text style={styles.emptyTitle}>Kütüphanen boş</Text>
            <Text style={styles.emptyDesc}>İlk Pomodoro seansını tamamla ve kitabını rafa koy!</Text>
          </View>
        )}
      </ScrollView>

      {/* Book Detail Modal */}
      <Modal
        visible={!!selectedSession}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSession(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedSession && (
              <>
                <View
                  style={[
                    styles.modalBookPreview,
                    { backgroundColor: selectedSession.book.color },
                  ]}
                >
                  <View
                    style={[
                      styles.modalBookSpine,
                      { backgroundColor: selectedSession.book.darkColor },
                    ]}
                  />
                  {selectedSession.book.label ? (
                    <Text style={styles.modalBookLabel}>{selectedSession.book.label}</Text>
                  ) : null}
                </View>
                <Text style={styles.modalTitle}>
                  {selectedSession.book.label || 'İsimsiz Kitap'}
                </Text>
                <Text style={styles.modalMeta}>
                  📅{' '}
                  {new Date(selectedSession.startedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.modalMeta}>
                  ⏱ {selectedSession.durationMinutes} dakika odaklanma
                </Text>
                {selectedSession.note ? (
                  <Text style={styles.modalNote}>{selectedSession.note}</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => {
                    setSelectedSession(null);
                    setNewSessionId(null);
                  }}
                >
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: APP_COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: APP_COLORS.border,
    marginVertical: 4,
  },
  statNum: {
    color: APP_COLORS.primaryLight,
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  shelfSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  booksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 4,
    minHeight: 90,
  },
  emptySlot: {
    width: 30,
    height: 65,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 3,
    marginHorizontal: 3,
    opacity: 0.4,
  },
  shelfPlank: {
    height: 14,
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  shelfPlankDark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    color: APP_COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: SW - 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  modalBookPreview: {
    width: 60,
    height: 85,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  modalBookSpine: {
    width: 8,
    height: '100%',
  },
  modalBookLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 9,
    fontWeight: '700',
    padding: 4,
    flexShrink: 1,
  },
  modalTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMeta: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  modalNote: {
    color: APP_COLORS.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  modalClose: {
    marginTop: 20,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

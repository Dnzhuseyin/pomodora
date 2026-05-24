import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  withRepeat,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as KeepAwake from 'expo-keep-awake';
import { useAppStore } from '../store/useAppStore';
import ClosedBook from '../components/ClosedBook';
import OpenBook from '../components/OpenBook';
import BookSelectorSheet from '../components/BookSelectorSheet';
import { APP_COLORS } from '../constants/colors';
import { randomBookHeight } from '../utils/seededRandom';
import { BookConfig } from '../types';

const { width: SW, height: SH } = Dimensions.get('window');
const TOTAL_PAGES = 20;

export default function PomodoroScreen() {
  const insets = useSafeAreaInsets();
  const {
    timerState,
    remainingSeconds,
    currentBook,
    settings,
    setTimerState,
    setRemainingSeconds,
    setCurrentBook,
    saveSession,
    setNewSessionId,
    getTodayCount,
    getTodayMinutes,
  } = useAppStore();

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values
  const bookScale = useSharedValue(1);
  const bookOpacity = useSharedValue(1);
  const bookTranslateY = useSharedValue(0);
  const bookTranslateX = useSharedValue(0);
  const abandonOpacity = useSharedValue(1);
  const abandonScale = useSharedValue(1);

  const totalSeconds = settings.pomodoroDuration * 60;
  const progress = (totalSeconds - remainingSeconds) / totalSeconds;
  const isRunning = timerState === 'running';

  // Flip interval: faster near end
  const getFlipInterval = useCallback(() => {
    const ratio = remainingSeconds / totalSeconds;
    if (ratio > 0.8) return 6000;      // First 20%: slow
    if (ratio > 0.2) return 3500;      // Middle: normal
    return 1800;                        // Last 20%: fast
  }, [remainingSeconds, totalSeconds]);

  // Timer countdown
  useEffect(() => {
    if (timerState === 'running') {
      KeepAwake.activateKeepAwakeAsync();
      intervalRef.current = setInterval(() => {
        const current = useAppStore.getState().remainingSeconds;
        if (current <= 1) {
          clearInterval(intervalRef.current!);
          handleComplete();
        } else {
          setRemainingSeconds(current - 1);
        }
      }, 1000);
    } else {
      KeepAwake.deactivateKeepAwake();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  // Accessibility: announce remaining time every minute
  useEffect(() => {
    if (isRunning && remainingSeconds % 60 === 0) {
      const mins = Math.floor(remainingSeconds / 60);
      AccessibilityInfo.announceForAccessibility(`${mins} dakika kaldı`);
    }
  }, [remainingSeconds, isRunning]);

  const handleStart = () => {
    const now = new Date();
    setStartedAt(now);
    setTimerState('running');
    bookScale.value = withTiming(1.1, { duration: 300 });
  };

  const handleComplete = () => {
    setTimerState('completed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const session = {
      id: Math.random().toString(36).slice(2),
      startedAt: startedAt?.toISOString() ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: settings.pomodoroDuration,
      completed: true,
      book: {
        color: currentBook.color,
        darkColor: currentBook.darkColor,
        label: currentBook.label,
        height: currentBook.height,
      },
      note: '',
    };

    saveSession(session);
    setNewSessionId(session.id);

    // Fly animation
    setTimeout(() => {
      bookScale.value = withTiming(0.15, { duration: 600, easing: Easing.in(Easing.cubic) });
      bookTranslateY.value = withTiming(-SH * 0.3, { duration: 600, easing: Easing.in(Easing.cubic) });
      bookTranslateX.value = withTiming(SW * 0.4, { duration: 600, easing: Easing.in(Easing.cubic) });
      bookOpacity.value = withDelay(400, withTiming(0, { duration: 200 }));
    }, 700);

    setTimeout(() => {
      setTimerState('idle');
      setRemainingSeconds(totalSeconds);
      bookScale.value = 1;
      bookTranslateY.value = 0;
      bookTranslateX.value = 0;
      bookOpacity.value = 1;
    }, 2000);
  };

  const handleAbandon = () => {
    Alert.alert('Vazgeç', 'Okumayı bırakmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet, vazgeç',
        style: 'destructive',
        onPress: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          abandonOpacity.value = withTiming(0, { duration: 600 });
          abandonScale.value = withTiming(0.8, { duration: 600 });
          setTimeout(() => {
            setTimerState('idle');
            setRemainingSeconds(totalSeconds);
            abandonOpacity.value = 1;
            abandonScale.value = 1;
          }, 700);
        },
      },
    ]);
  };

  const bookAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bookScale.value },
      { translateY: bookTranslateY.value },
      { translateX: bookTranslateX.value },
    ],
    opacity: timerState === 'idle' ? abandonOpacity.value : bookOpacity.value,
  }));

  const abandonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: abandonScale.value }],
    opacity: abandonOpacity.value,
  }));

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const ss = String(remainingSeconds % 60).padStart(2, '0');
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference * (1 - progress);

  const todayCount = getTodayCount();
  const todayMins = getTodayMinutes();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.headerTitle}>📖 Kitap Okuma</Text>

      {/* Circular progress ring */}
      <View style={styles.progressRingWrap}>
        <View style={styles.ring}>
          <View style={[styles.ringBg, { borderColor: APP_COLORS.border }]} />
          <View
            style={[
              styles.ringFill,
              {
                borderColor: currentBook.color,
                borderWidth: 5,
                borderRadius: 70,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
          <Text
            style={styles.timerText}
            accessibilityLabel={`${mm} dakika ${ss} saniye kaldı`}
          >
            {mm}:{ss}
          </Text>
          {isRunning && (
            <Text style={styles.timerSub}>devam ediyor</Text>
          )}
        </View>
      </View>

      {/* Book Display */}
      <View style={styles.bookArea}>
        <Animated.View style={bookAnimStyle}>
          {timerState === 'idle' ? (
            <ClosedBook
              color={currentBook.color}
              darkColor={currentBook.darkColor}
              height={110}
              label={currentBook.label}
              breathing
            />
          ) : (
            <OpenBook
              color={currentBook.color}
              darkColor={currentBook.darkColor}
              isFlipping={isRunning}
              flipInterval={getFlipInterval()}
            />
          )}
        </Animated.View>
      </View>

      {/* Controls */}
      {timerState === 'idle' ? (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => setSelectorVisible(true)}
          >
            <View style={[styles.colorPreview, { backgroundColor: currentBook.color }]} />
            <Text style={styles.selectorBtnText}>
              {currentBook.colorName} {currentBook.label ? `· ${currentBook.label}` : ''}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: currentBook.color }]}
            onPress={handleStart}
            accessibilityLabel="Okumaya Başla"
          >
            <Text style={styles.startBtnText}>📖 Okumaya Başla</Text>
          </TouchableOpacity>

          {/* Today stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{todayCount}</Text>
              <Text style={styles.statLabel}>kitap bugün</Text>
            </View>
            <View style={[styles.statCard, styles.statCardRight]}>
              <Text style={styles.statNum}>{todayMins}</Text>
              <Text style={styles.statLabel}>dakika bugün</Text>
            </View>
          </View>
        </View>
      ) : (
        <Animated.View style={[styles.controls, abandonAnimStyle]}>
          <TouchableOpacity style={styles.abandonBtn} onPress={handleAbandon}>
            <Text style={styles.abandonBtnText}>🔥 Vazgeç</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <BookSelectorSheet
        visible={selectorVisible}
        currentBook={currentBook}
        onSelect={(book) => {
          setCurrentBook({
            ...book,
            height: randomBookHeight(book.color + Date.now()),
          });
          setSelectorVisible(false);
        }}
        onClose={() => setSelectorVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    alignItems: 'center',
  },
  headerTitle: {
    color: APP_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  progressRingWrap: {
    marginBottom: 20,
  },
  ring: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 5,
    borderColor: APP_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  ringBg: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
  },
  ringFill: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  timerText: {
    color: APP_COLORS.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
  },
  timerSub: {
    color: APP_COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 1,
  },
  bookArea: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  controls: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 12,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 10,
  },
  colorPreview: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  selectorBtnText: {
    flex: 1,
    color: APP_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  chevron: {
    color: APP_COLORS.textMuted,
    fontSize: 20,
  },
  startBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  statCardRight: {},
  statNum: {
    color: APP_COLORS.primaryLight,
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  abandonBtn: {
    backgroundColor: APP_COLORS.danger + '22',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.danger + '44',
  },
  abandonBtnText: {
    color: APP_COLORS.danger,
    fontSize: 16,
    fontWeight: '700',
  },
});

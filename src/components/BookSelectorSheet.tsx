import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { APP_COLORS, BOOK_COLORS } from '../constants/colors';
import { BookConfig } from '../types';

const { width } = Dimensions.get('window');

interface BookSelectorSheetProps {
  visible: boolean;
  currentBook: BookConfig;
  onSelect: (book: BookConfig) => void;
  onClose: () => void;
}

const BookSelectorSheet: React.FC<BookSelectorSheetProps> = ({
  visible,
  currentBook,
  onSelect,
  onClose,
}) => {
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(300, { duration: 300 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: visible ? 'auto' : 'none',
  }));

  if (!visible && translateY.value >= 299) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, overlayStyle]}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Kitap Seç</Text>
        <View style={styles.colorGrid}>
          {BOOK_COLORS.map((c) => (
            <TouchableOpacity
              key={c.hex}
              style={[
                styles.colorDot,
                { backgroundColor: c.hex },
                currentBook.color === c.hex && styles.colorDotSelected,
              ]}
              onPress={() =>
                onSelect({
                  color: c.hex,
                  darkColor: c.dark,
                  colorName: c.name,
                  label: currentBook.label,
                  height: currentBook.height,
                })
              }
            >
              {currentBook.color === c.hex && <View style={styles.checkmark} />}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.selectedName}>{currentBook.colorName}</Text>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Tamam</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: APP_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: APP_COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: APP_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  colorDot: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  selectedName: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BookSelectorSheet;

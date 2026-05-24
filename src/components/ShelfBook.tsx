import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useEffect as useAnimatedEffect,
} from 'react-native-reanimated';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Session } from '../types';
import { APP_COLORS } from '../constants/colors';

interface ShelfBookProps {
  session: Session;
  isNew?: boolean;
  onPress: (session: Session) => void;
}

const ShelfBook: React.FC<ShelfBookProps> = ({ session, isNew = false, onPress }) => {
  const translateY = useSharedValue(isNew ? -80 : 0);
  const opacity = useSharedValue(isNew ? 0 : 1);

  useAnimatedEffect(() => {
    if (isNew) {
      translateY.value = withSpring(0, { mass: 1, damping: 14, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const bookWidth = session.book.height * 0.55;

  return (
    <Animated.View style={[animStyle]}>
      <TouchableOpacity
        onPress={() => onPress(session)}
        activeOpacity={0.8}
        style={[styles.bookContainer, { height: session.book.height, width: bookWidth }]}
      >
        {/* Page edge layers */}
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.pageEdge,
              {
                width: bookWidth - 4,
                height: session.book.height - i * 1.5,
                right: -(i + 1) * 1.2,
                backgroundColor: i % 2 === 0 ? '#F0E8D0' : '#E8DEC5',
              },
            ]}
          />
        ))}

        {/* Cover */}
        <View
          style={[
            styles.cover,
            {
              backgroundColor: session.book.color,
              width: bookWidth,
              height: session.book.height,
            },
          ]}
        >
          <View style={[styles.spine, { backgroundColor: session.book.darkColor }]} />
          <View style={styles.sheen} />
          {session.book.label ? (
            <View style={styles.labelWrap}>
              <Text style={styles.label} numberOfLines={3}>
                {session.book.label}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bookContainer: {
    position: 'relative',
    alignSelf: 'flex-end',
    marginHorizontal: 3,
  },
  pageEdge: {
    position: 'absolute',
    borderRadius: 1,
    bottom: 0,
  },
  cover: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  spine: {
    width: 7,
    height: '100%',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 7,
    width: '35%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  labelWrap: {
    position: 'absolute',
    left: 10,
    top: 4,
    right: 3,
    bottom: 4,
    justifyContent: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default ShelfBook;

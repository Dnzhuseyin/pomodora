import React, { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

interface OpenBookProps {
  color: string;
  darkColor: string;
  isFlipping?: boolean;
  flipInterval?: number;
  onFlip?: () => void;
}

const BOOK_WIDTH = 220;
const BOOK_HEIGHT = 160;

const OpenBook: React.FC<OpenBookProps> = ({
  color,
  darkColor,
  isFlipping = false,
  flipInterval = 4000,
  onFlip,
}) => {
  const pageRotate = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFlip = () => {
    if (onFlip) runOnJS(onFlip)();
    pageRotate.value = 0;
    pageRotate.value = withTiming(-180, {
      duration: 800,
      easing: Easing.inOut(Easing.sine),
    });
  };

  useEffect(() => {
    if (!isFlipping) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    doFlip();
    timerRef.current = setInterval(doFlip, flipInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFlipping, flipInterval]);

  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${pageRotate.value}deg` }],
  }));

  const pageBackStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${pageRotate.value + 180}deg` },
    ],
    opacity: pageRotate.value < -90 ? 1 : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Book body */}
      <View style={[styles.bookBody, { backgroundColor: darkColor }]}>
        {/* Spine center */}
        <View style={[styles.spineCenter, { backgroundColor: darkColor }]} />

        {/* Left page */}
        <View style={[styles.leftPage, { backgroundColor: '#F9F3E3' }]}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.textLine,
                { width: `${60 + (i % 3) * 10}%`, opacity: 0.25 + (i % 2) * 0.1 },
              ]}
            />
          ))}
        </View>

        {/* Right page (static base) */}
        <View style={[styles.rightPage, { backgroundColor: '#F5EDD4' }]}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.textLine,
                { width: `${55 + (i % 4) * 8}%`, opacity: 0.2 + (i % 2) * 0.1 },
              ]}
            />
          ))}
        </View>

        {/* Flipping page (front) */}
        <Animated.View style={[styles.flippingPage, styles.pageFront, pageStyle]}>
          <View style={{ flex: 1, backgroundColor: '#F5EDD4', padding: 12 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[styles.textLine, { width: `${50 + i * 8}%`, backgroundColor: '#C8B89A' }]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Flipping page (back) */}
        <Animated.View style={[styles.flippingPage, styles.pageBack, pageBackStyle]}>
          <View style={{ flex: 1, backgroundColor: '#EDE0C4', padding: 12 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[styles.textLine, { width: `${55 + i * 6}%`, backgroundColor: '#B8A88A' }]}
              />
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Cover flaps */}
      <View style={[styles.leftCover, { backgroundColor: color }]}>
        <View style={[styles.coverSpine, { backgroundColor: darkColor }]} />
      </View>
      <View style={[styles.rightCover, { backgroundColor: color }]} />

      {/* Shadow */}
      <View style={styles.shadow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT + 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBody: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  spineCenter: {
    width: 6,
    height: '100%',
    zIndex: 10,
  },
  leftPage: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  rightPage: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  textLine: {
    height: 6,
    backgroundColor: '#8A7A62',
    borderRadius: 3,
    marginBottom: 6,
  },
  flippingPage: {
    position: 'absolute',
    right: 0,
    width: BOOK_WIDTH / 2 - 3,
    height: BOOK_HEIGHT,
    zIndex: 5,
    backfaceVisibility: 'hidden',
    transformOrigin: 'left center',
  },
  pageFront: {},
  pageBack: {},
  leftCover: {
    position: 'absolute',
    left: -2,
    top: 0,
    width: 14,
    height: BOOK_HEIGHT,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    zIndex: 15,
  },
  coverSpine: {
    width: 6,
    height: '100%',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  rightCover: {
    position: 'absolute',
    right: -2,
    top: 0,
    width: 10,
    height: BOOK_HEIGHT,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    zIndex: 15,
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    width: BOOK_WIDTH - 20,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    zIndex: -1,
  },
});

export default OpenBook;

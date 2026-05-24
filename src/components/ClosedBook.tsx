import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { View, Text, StyleSheet } from 'react-native';

interface ClosedBookProps {
  color: string;
  darkColor: string;
  height?: number;
  label?: string;
  breathing?: boolean;
  scale?: number;
}

const ClosedBook: React.FC<ClosedBookProps> = ({
  color,
  darkColor,
  height = 65,
  label,
  breathing = false,
  scale: scaleProp = 1,
}) => {
  const breathe = useSharedValue(0);
  const bookWidth = height * 0.65;

  useEffect(() => {
    if (breathing) {
      breathe.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sine) }),
        -1,
        true,
      );
    } else {
      breathe.value = 0;
    }
  }, [breathing]);

  const containerStyle = useAnimatedStyle(() => {
    const s = interpolate(breathe.value, [0, 1], [1.0, 1.03]);
    return { transform: [{ scale: s * scaleProp }] };
  });

  const PAGE_LAYERS = 4;

  return (
    <Animated.View style={[styles.wrapper, containerStyle]}>
      {/* Page edge layers (right side) */}
      {Array.from({ length: PAGE_LAYERS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.pageLayer,
            {
              width: bookWidth - 6,
              height: height - i * 2,
              right: -(i + 1) * 1.5,
              bottom: i * 1,
              backgroundColor: i % 2 === 0 ? '#F5EDD4' : '#EDE5CC',
              borderRadius: 1,
            },
          ]}
        />
      ))}

      {/* Main cover */}
      <View
        style={[
          styles.cover,
          {
            width: bookWidth,
            height,
            backgroundColor: color,
            borderRadius: 3,
          },
        ]}
      >
        {/* Spine (left edge) */}
        <View
          style={[
            styles.spine,
            { backgroundColor: darkColor, height },
          ]}
        />
        {/* Cover sheen */}
        <View style={styles.sheen} />
        {/* Label on spine */}
        {label ? (
          <View style={styles.labelContainer}>
            <Text style={styles.labelText} numberOfLines={2}>
              {label}
            </Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'flex-start',
  },
  cover: {
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
    position: 'relative',
  },
  spine: {
    width: 10,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: '30%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  pageLayer: {
    position: 'absolute',
    borderRadius: 2,
  },
  labelContainer: {
    position: 'absolute',
    left: 14,
    top: 6,
    bottom: 6,
    right: 4,
    justifyContent: 'center',
  },
  labelText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    writingDirection: 'ltr',
  },
});

export default ClosedBook;

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { Colors, Spacing } from '../../theme';

type SkeletonType = 'trip' | 'profile' | 'chat' | 'map' | 'feed';

interface SkeletonCardProps {
  type?: SkeletonType;
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ type = 'trip', count = 1 }) => {
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const [reduceMotion, setReduceMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReduceMotion(enabled);
    });

    if (!reduceMotion) {
      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.85,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerLoop.start();
      return () => shimmerLoop.stop();
    }
  }, [opacityAnim, reduceMotion]);

  const renderSingleSkeleton = (key: number) => {
    return (
      <View
        key={key}
        style={styles.cardContainer}
        aria-busy={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading content"
      >
        {type === 'trip' && (
          <View style={styles.tripContent}>
            <View style={styles.rowBetween}>
              <Animated.View style={[styles.box, { width: 90, height: 22, opacity: opacityAnim }]} />
              <Animated.View style={[styles.box, { width: 70, height: 22, opacity: opacityAnim }]} />
            </View>
            <View style={styles.timelineRow}>
              <View style={styles.dotsLine}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <View style={styles.dot} />
              </View>
              <View style={styles.timelineTexts}>
                <Animated.View style={[styles.box, { width: '80%', height: 16, marginBottom: 8, opacity: opacityAnim }]} />
                <Animated.View style={[styles.box, { width: '60%', height: 16, opacity: opacityAnim }]} />
              </View>
            </View>
          </View>
        )}

        {type === 'profile' && (
          <View style={styles.profileContent}>
            <Animated.View style={[styles.avatarCircle, { opacity: opacityAnim }]} />
            <Animated.View style={[styles.box, { width: 140, height: 20, marginBottom: 6, opacity: opacityAnim }]} />
            <Animated.View style={[styles.box, { width: 180, height: 14, opacity: opacityAnim }]} />
          </View>
        )}

        {type === 'chat' && (
          <View style={styles.chatContent}>
            <Animated.View style={[styles.avatarSmall, { opacity: opacityAnim }]} />
            <View style={styles.chatMeta}>
              <Animated.View style={[styles.box, { width: 120, height: 16, marginBottom: 6, opacity: opacityAnim }]} />
              <Animated.View style={[styles.box, { width: '90%', height: 14, opacity: opacityAnim }]} />
            </View>
          </View>
        )}

        {type === 'map' && (
          <View style={styles.mapContent}>
            <Animated.View style={[styles.box, { width: '100%', height: 140, borderRadius: 12, marginBottom: 12, opacity: opacityAnim }]} />
            <Animated.View style={[styles.box, { width: 150, height: 18, marginBottom: 6, opacity: opacityAnim }]} />
            <Animated.View style={[styles.box, { width: 100, height: 14, opacity: opacityAnim }]} />
          </View>
        )}

        {type === 'feed' && (
          <View style={styles.feedContent}>
            <Animated.View style={[styles.box, { width: '100%', height: 18, marginBottom: 8, opacity: opacityAnim }]} />
            <Animated.View style={[styles.box, { width: '75%', height: 14, marginBottom: 12, opacity: opacityAnim }]} />
            <Animated.View style={[styles.box, { width: '40%', height: 14, opacity: opacityAnim }]} />
          </View>
        )}
      </View>
    );
  };

  return <>{Array.from({ length: count }).map((_, i) => renderSingleSkeleton(i))}</>;
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  box: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  tripContent: {
    paddingVertical: Spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsLine: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  line: {
    width: 2,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  timelineTexts: {
    flex: 1,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    marginRight: Spacing.md,
  },
  chatMeta: {
    flex: 1,
  },
  mapContent: {
    paddingVertical: Spacing.xs,
  },
  feedContent: {
    paddingVertical: Spacing.xs,
  },
});

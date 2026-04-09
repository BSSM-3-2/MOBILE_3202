import { Ionicons } from '@expo/vector-icons';
import { Image, ImageLoadEventData } from 'expo-image';
import { useState } from 'react';
import { Dimensions, ImageSourcePropType, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_SCALE = 3;

export default function FeedImage({
    image,
    onDoubleTap,
}: {
    image: ImageSourcePropType;
    onDoubleTap?: () => void;
}) {
    const [imageHeight, setImageHeight] = useState(SCREEN_WIDTH);

    // TODO: scale, savedScale 선언 (실습 2-1)
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    // TODO: heartOpacity, heartScale 선언 (실습 3-1)
    const heartOpacity = useSharedValue(0);
    const heartScale = useSharedValue(0);

    // TODO: pinchGesture 정의 (실습 2-2)
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            cancelAnimation(scale);
            savedScale.value = scale.value;
        })
        .onUpdate(e => {
            scale.value = savedScale.value * e.scale;
            if (scale.value > MAX_SCALE) scale.value = MAX_SCALE;
            if (scale.value < 1) scale.value = 1;
        })
        .onEnd(() => {
            if (scale.value > 1) {
                scale.value = withSpring(1);
            }

            savedScale.value = scale.value;
        });

    // TODO: doubleTapGesture 정의 (실습 3-2)
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            heartOpacity.value = withSequence(
                withTiming(1, { duration: 200 }),
                withTiming(0, { duration: 200 }),
            );
            heartScale.value = withSequence(
                withSpring(1.2, { stiffness: 500 }),
                withSpring(1, { stiffness: 500 }),
            );
            if (onDoubleTap) {
                runOnJS(onDoubleTap)();
            }
        });

    // TODO: Gesture.Simultaneous로 합성 (실습 3-3)
    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        doubleTapGesture,
    );

    // TODO: imageAnimatedStyle 정의 (실습 2-3)
    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    // TODO: heartAnimatedStyle 정의 (실습 3-4)
    const heartAnimatedStyle = useAnimatedStyle(() => ({
        opacity: heartOpacity.value,
        transform: [{ scale: heartScale.value }],
    }));

    const handleImageLoad = (e: ImageLoadEventData) => {
        const { width, height } = e.source;
        const ratio = height / width;
        setImageHeight(SCREEN_WIDTH * ratio);
    };

    return (
        // TODO: GestureDetector + Animated.View 감싸기 (실습 2-4)
        // TODO: 하트 오버레이 추가 (실습 3-5)
        <GestureDetector gesture={composedGesture}>
            <Animated.View
                style={[styles.imageContainer, { height: imageHeight }]}
            >
                <Animated.View style={imageAnimatedStyle}>
                    <Image
                        source={image}
                        style={{ width: SCREEN_WIDTH, height: imageHeight }}
                        onLoad={handleImageLoad}
                    />
                </Animated.View>
                <Animated.View
                    pointerEvents='none'
                    style={[styles.heartOverlay, heartAnimatedStyle]}
                >
                    <Ionicons name='heart' size={96} color='white' />
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        width: SCREEN_WIDTH,
        overflow: 'hidden',
    },
    heartOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

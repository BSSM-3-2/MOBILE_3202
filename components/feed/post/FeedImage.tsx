import { Image, ImageLoadEventData } from 'expo-image';
import { useState } from 'react';
import { Dimensions, ImageSourcePropType, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
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

    // TODO: pinchGesture 정의 (실습 2-2)
    const pinchGesture = Gesture.Pinch()
        .onUpdate(e => {
            scale.value = savedScale.value * e.scale;
            if (scale.value > MAX_SCALE) scale.value = MAX_SCALE;
            if (scale.value < 1) scale.value = 1;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    // TODO: doubleTapGesture 정의 (실습 3-2)
    const doubleTapGesture = Gesture.Tap().numberOfTaps(2);

    // TODO: Gesture.Simultaneous로 합성 (실습 3-3)
    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        doubleTapGesture,
    );

    // TODO: imageAnimatedStyle 정의 (실습 2-3)
    const imageAnimatedStyle = useAnimatedStyle(() => {
        const currentScale = scale.value;

        return {
            transform: [{ scale: currentScale }],
        };
    });

    // TODO: heartAnimatedStyle 정의 (실습 3-4)
    const heartAnimatedStyle = useAnimatedStyle(() => ({}));

    const handleImageLoad = (e: ImageLoadEventData) => {
        const { width, height } = e.source;
        const ratio = height / width;
        setImageHeight(SCREEN_WIDTH * ratio);
    };

    return (
        // TODO: GestureDetector + Animated.View 감싸기 (실습 2-4)
        // TODO: 하트 오버레이 추가 (실습 3-5)
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={styles.imageContainer}>
                <Animated.View style={imageAnimatedStyle}>
                    <Image
                        source={image}
                        style={{ width: SCREEN_WIDTH, height: imageHeight }}
                        onLoad={handleImageLoad}
                    />
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

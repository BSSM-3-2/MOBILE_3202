import { Ionicons } from '@expo/vector-icons';
import { Post } from '@type/Post';
import * as Haptics from 'expo-haptics';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { FeedPost } from './FeedPost';

const DELETE_AREA_WIDTH = 80;
const DELETE_THRESHOLD = -60;

function SwipeableFeedPost({
    post,
    onDelete,
}: {
    post: Post;
    onDelete: (id: string) => void;
}) {
    const translateX = useSharedValue(0);
    const cardScale = useSharedValue(1);
    const startX = useSharedValue(0);

    const triggerLongPressHaptic = () => {
        if (process.env.EXPO_OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const panGesture = Gesture.Pan()
        // Activate only when horizontal intent is clear.
        .activeOffsetX([-12, 12])
        // Give vertical scroll priority when finger moves mostly up/down.
        .failOffsetY([-8, 8])
        .onBegin(() => {
            startX.value = translateX.value;
        })
        .onUpdate(e => {
            const nextX = startX.value + e.translationX;
            translateX.value = Math.max(-DELETE_AREA_WIDTH, Math.min(0, nextX));
        })
        .onEnd(() => {
            if (translateX.value < DELETE_THRESHOLD) {
                translateX.value = withSpring(-DELETE_AREA_WIDTH);
            } else {
                translateX.value = withSpring(0);
            }
        });

    const longPressGesture = Gesture.LongPress()
        .onStart(() => {
            cardScale.value = withTiming(0.98, { duration: 150 });
            runOnJS(triggerLongPressHaptic)();
        })
        .onFinalize(() => {
            cardScale.value = withSpring(1);
        });

    const composedGesture = Gesture.Race(longPressGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: cardScale.value },
        ],
    }));

    const handleDeletePress = () => {
        translateX.value = withTiming(-DELETE_AREA_WIDTH, {}, () => {
            runOnJS(onDelete)(post.id);
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.deleteArea}>
                <TouchableOpacity
                    onPress={handleDeletePress}
                    style={styles.deleteButton}
                >
                    <Ionicons name='trash-outline' size={24} color='white' />
                </TouchableOpacity>
            </View>

            <GestureDetector gesture={composedGesture}>
                <Animated.View style={animatedStyle}>
                    <FeedPost post={post} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    deleteArea: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DELETE_AREA_WIDTH,
        backgroundColor: '#ED4956',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});

export { SwipeableFeedPost };

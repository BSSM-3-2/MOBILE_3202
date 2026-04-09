import { FeedColors, Spacing } from '@/constants/theme';
import { useFeedStore } from '@/store/feed-store';
import { ThemedText } from '@components/themed-text';
import { ThemedView } from '@components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';

function FeedPostActions({
    postId,
    initialLikes,
    initialLiked = false,
    commentCount = 0,
}: {
    postId: string;
    initialLikes: number;
    initialLiked?: boolean;
    commentCount?: number;
}) {
    const [saved, setSaved] = useState(false);
    const { posts, toggleLike } = useFeedStore();

    const post = posts.find(p => p.id === postId);
    const liked = post?.liked ?? initialLiked;
    const likeCount = post?.likes ?? initialLikes;

    const heartScale = useSharedValue(1);

    // TODO: heartAnimatedStyle 정의 (실습 1-2)
    const heartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const handleLike = () => {
        // TODO: 하트 애니메이션 실행 (실습 1-3),
        toggleLike(postId);
        heartScale.value = withSequence(
            withSpring(1.3, { stiffness: 1000, damping: 22, mass: 0.2 }),
            withSpring(1, { stiffness: 1000, damping: 20, mass: 0.9 }),
        );
    };

    const handleSave = () => setSaved(prev => !prev);

    return (
        <ThemedView style={styles.actions}>
            <ThemedView style={styles.leftActions}>
                <TouchableOpacity
                    onPress={handleLike}
                    style={[styles.actionButton, styles.row]}
                >
                    {/* TODO: Animated.View + heartAnimatedStyle (실습 1-4) */}
                    <Animated.View style={heartAnimatedStyle}>
                        <Ionicons
                            name={liked ? 'heart' : 'heart-outline'}
                            size={26}
                            color={
                                liked
                                    ? FeedColors.likeActive
                                    : FeedColors.primaryText
                            }
                        />
                    </Animated.View>
                    <ThemedText style={styles.countText}>
                        {likeCount.toLocaleString()}
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.row]}>
                    <Ionicons
                        name='chatbubble-outline'
                        size={24}
                        color={FeedColors.primaryText}
                    />
                    <ThemedText style={styles.countText}>
                        {commentCount.toLocaleString()}
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons
                        name='paper-plane-outline'
                        size={24}
                        color={FeedColors.primaryText}
                    />
                </TouchableOpacity>
            </ThemedView>

            <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                <Ionicons
                    name={saved ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={FeedColors.primaryText}
                />
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.md,
    },
    leftActions: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    actionButton: {
        padding: 2,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.xs,
        alignItems: 'center',
    },
    countText: {
        fontWeight: '600',
    },
});

export { FeedPostActions };

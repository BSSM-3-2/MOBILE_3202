import { useFeedStore } from '@/store/feed-store';
import { resolveImageSource } from '@/utils/image';
import ContentContainer from '@components/container';
import FeedImage from '@components/feed/post/FeedImage';
import { ThemedView } from '@components/themed-view';
import { Post } from '@type/Post';
import { StyleSheet } from 'react-native';
import { FeedPostActions } from './FeedPostActions';
import { FeedPostCaption } from './FeedPostCaption';
import { FeedPostHeader } from './FeedPostHeader';

function FeedPost({ post }: { post: Post }) {
    const user = post.author;
    const { posts, toggleLike } = useFeedStore();

    if (!user) return null;

    // TODO: 최신 liked 상태 가져오기 (실습 3-6)
    const latestPost = posts.find(p => p.id === post.id);
    const liked = latestPost?.liked ?? post.liked;

    // TODO: handleDoubleTap 작성 (실습 3-7)
    const handleDoubleTap = () => {
        void toggleLike(post.id);
    };

    return (
        <ThemedView style={styles.feedMargin}>
            <FeedPostHeader user={user} />
            {/* TODO: onDoubleTap 연결 (실습 3-8) */}
            <FeedImage
                image={resolveImageSource(post.images[0])}
                onDoubleTap={handleDoubleTap}
            />
            <ContentContainer style={{ gap: 4 }}>
                <FeedPostActions
                    postId={post.id}
                    initialLikes={post.likes}
                    initialLiked={post.liked}
                    commentCount={post.commentCount ?? post.comments.length}
                />
                <FeedPostCaption
                    username={user.username}
                    caption={post.caption}
                    timestamp={post.timestamp}
                />
            </ContentContainer>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    feedMargin: {
        marginBottom: 20,
    },
});

export { FeedPost };

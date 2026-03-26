import { Post } from '@type/Post';
import { FlatList, StyleSheet } from 'react-native';
import { FeedPost } from './post/FeedPost';

function FeedList({ posts }: { posts: Post[] }) {
    return (
        <FlatList
            data={posts}
            renderItem={({ item }) => <FeedPost post={item} />}
            keyExtractor={item => item.id}
            style={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});

export { FeedList };

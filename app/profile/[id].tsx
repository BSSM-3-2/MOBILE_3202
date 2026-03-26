// import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import MOCK_POSTS from '@/mock/posts';
import { MOCK_USERS_MAP } from '@/mock/users';
import ProfileFeedList from '@components/profile/feed/ProfileFeedList';
import { ThemedView } from '@components/themed-view';

import { useLocalSearchParams } from 'expo-router';

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();

    const user = MOCK_USERS_MAP[id as string];
    const posts = MOCK_POSTS.filter(post => post.userId === id);

    if (!user) {
        return (
            <ThemedView style={styles.notFound}>
                <Text style={styles.notFoundText}>유저를 찾을 수 없어요.</Text>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ProfileFeedList
                posts={posts}
                user={user}
                userAnalytics={{
                    post: posts.length,
                }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    notFound: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFoundText: {
        fontSize: 16,
        opacity: 0.5,
    },
});

import { Grid } from '@/constants/theme';
import MOCK_USER from '@/mock/user';
import User from '@/types/User';
import { resolveImageSource } from '@/utils/image';
import { Post } from '@type/Post';
import { Image } from 'expo-image';
import { Dimensions, FlatList, StyleSheet } from 'react-native';
import { ProfileHeader } from '../ProfileHeader';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / Grid.profileColumnCount;

type ProfileFeedListProps = {
    posts: Post[];
    user?: User;
    userAnalytics?: {
        post: number;
    };
};

export default function ProfileFeedList({
    posts,
    user = MOCK_USER,
    userAnalytics,
}: ProfileFeedListProps) {
    return (
        <FlatList
            ListHeaderComponent={
                <ProfileHeader user={user} userAnalytics={userAnalytics} />
            }
            data={posts}
            renderItem={({ item }) => (
                <Image
                    style={styles.image}
                    contentFit={'cover'}
                    source={resolveImageSource(item.images[0])}
                    key={item.id}
                />
            )}
            keyExtractor={item => item.id}
            style={styles.container}
            numColumns={Grid.profileColumnCount}
        />
    );
}

const styles = StyleSheet.create({
    image: {
        height: ITEM_SIZE * Grid.profileImageRatio,
        width: ITEM_SIZE - Grid.gap,
        paddingRight: 1.5 * Grid.gap,
        paddingBottom: 1.5 * Grid.gap,
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 3,
    },
});

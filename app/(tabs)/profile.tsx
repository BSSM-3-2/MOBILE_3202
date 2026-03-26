import MOCK_USER from '@/mock/user';
import { ThemedView } from '@components/themed-view';

import MOCK_POSTS from '@/mock/posts';
import ContentContainer from '@components/container';
import NavigationTop from '@components/navigation/NavigationTop';
import ProfileFeedList from '@components/profile/feed/ProfileFeedList';

export default function ProfileScreen() {
    return (
        <ThemedView style={{ flex: 1 }}>
            <ContentContainer isTopElement={true}>
                <NavigationTop title={MOCK_USER.username} />
            </ContentContainer>
            <ProfileFeedList posts={MOCK_POSTS} />
        </ThemedView>
    );
}

import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import {
    AvatarSizes,
    Colors,
    FeedColors,
    FontSizes,
    Spacing,
} from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlaygroundStageTwoScreen() {
    const inset = useSafeAreaInsets();

    return (
        <View style={[styles.contentContainer, { paddingTop: inset.top + 20 }]}>
            <View style={styles.contentPadding}>
                <Text
                    style={[
                        styles.title,
                        {
                            borderColor: Colors.light.text,
                        },
                    ]}
                >
                    Playground 2
                </Text>
            </View>
            <View
                style={[
                    styles.playgroundGap,
                    styles.contentPadding,
                    styles.flexDirectionRow,
                ]}
            >
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                    style={styles.avatar}
                />
                <View
                    style={[
                        {
                            flex: 1,
                            gap: Spacing.sm,
                        },
                    ]}
                >
                    <View style={[styles.flexDirectionColumn, { gap: 8 }]}>
                        <Text style={styles.displayName}>{'애옹이'}</Text>
                        <View style={styles.infoParent}>
                            <View
                                style={[
                                    styles.infoContainer,
                                    styles.flexDirectionColumn,
                                ]}
                            >
                                <Text style={styles.infoValue}>
                                    {parseInt('215').toLocaleString()}
                                </Text>
                                <Text style={styles.infoKey}>posts</Text>
                            </View>
                            <View
                                style={[
                                    styles.infoContainer,
                                    styles.flexDirectionColumn,
                                ]}
                            >
                                <Text style={styles.infoValue}>
                                    {parseInt('2341').toLocaleString()}
                                </Text>
                                <Text style={styles.infoKey}>followers</Text>
                            </View>
                            <View
                                style={[
                                    styles.infoContainer,
                                    styles.flexDirectionColumn,
                                ]}
                            >
                                <Text style={styles.infoValue}>
                                    {parseInt('324').toLocaleString()}
                                </Text>
                                <Text style={styles.infoKey}>following</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contentPadding: {
        paddingHorizontal: 16,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    playgroundGap: {
        marginTop: Spacing.xxl,
        gap: Spacing.xxl,
    },
    title: {
        fontSize: 24,
        paddingBottom: 20,
        fontWeight: 'bold',
        borderBottomWidth: 1,
    },
    infoParent: {
        flexDirection: 'row',
        gap: Spacing.xxl,
        width: 'auto',
    },
    infoContainer: {
        flexDirection: 'row',
    },
    infoKey: {
        fontSize: FontSizes.sm,
        lineHeight: FontSizes.sm + 2,
        fontWeight: '400',
    },
    infoValue: {
        fontSize: FontSizes.md,
        lineHeight: FontSizes.lg + 2,
        fontWeight: '700',
    },
    avatar: {
        width: AvatarSizes.xl,
        height: AvatarSizes.xl,
        borderRadius: AvatarSizes.xl / 2,
    },
    displayName: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: FeedColors.primaryText,
    },
    username: {
        fontSize: FontSizes.sm,
        color: '#8E8E8E',
    },
    bio: {
        fontSize: FontSizes.sm,
        color: FeedColors.primaryText,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
    },
    flexDirectionRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    flexDirectionColumn: {
        flexDirection: 'column',
    },
});

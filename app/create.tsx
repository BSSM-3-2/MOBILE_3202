import { createPost } from '@/api/content';
import { FeedColors, FontSizes, Pretendard, Spacing } from '@/constants/theme';
import { useFeedStore } from '@/store/feed-store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SelectedImage {
    uri: string;
    name: string;
    type: string;
}

// 공통 유틸: 알림 권한 확인
async function checkNotificationPermission(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
}

// 실습 8: Android Notification Channel 생성
// importance 값을 바꿔가며 heads-up 알림 동작 차이 확인
async function setupNotificationChannels() {
    if (Platform.OS !== 'android') {
        return;
    }

    const channels = [
        {
            id: 'urgent_channel',
            name: 'Urgent Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF0000',
        },
        {
            id: 'high_channel',
            name: 'High Priority Notifications',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
        },
        {
            id: 'default_channel',
            name: 'Default Notifications',
            importance: Notifications.AndroidImportance.DEFAULT,
        },
        {
            id: 'low_channel',
            name: 'Low Priority Notifications',
            importance: Notifications.AndroidImportance.LOW,
        },
        {
            id: 'min_channel',
            name: 'Minimal Notifications',
            importance: Notifications.AndroidImportance.MIN,
        },
    ];

    for (const channel of channels) {
        await Notifications.setNotificationChannelAsync(channel.id, {
            name: channel.name,
            importance: channel.importance,
            vibrationPattern: channel.vibrationPattern,
            lightColor: channel.lightColor,
        } as any);
    }
}

// 업로드 성공 후 로컬 알림 예약
async function scheduleUploadNotification(
    caption: string,
    channelId: string = 'upload_channel',
) {
    // 실습 6-1: 알림 권한 확인
    if (!(await checkNotificationPermission())) {
        return;
    }

    // 기본 채널이 없으면 생성
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(channelId, {
            name: 'Upload Notifications',
            importance: Notifications.AndroidImportance.HIGH,
        });
    }

    // 실습 6-2: 3초 딜레이로 로컬 알림 예약 발송
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '게시물이 업로드되었습니다',
            body: caption || '사진이 성공적으로 공유되었습니다.',
            data: {
                postType: 'upload',
                caption: caption,
            },
        },
        trigger: {
            type: 'timeInterval' as any,
            seconds: 3,
        },
    });
}

export default function CreateScreen() {
    const insets = useSafeAreaInsets();
    const { prependPost } = useFeedStore();
    const router = useRouter();

    const [images, setImages] = useState<SelectedImage[]>([]);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);

    // 실습 8: 컴포넌트 마운트 시 알림 채널 설정
    useEffect(() => {
        setupNotificationChannels();
    }, []);

    const canSubmit =
        (images.length > 0 || caption.trim().length > 0) && !loading;

    // ── 이미지 선택 ──────────────────────────────────────────────
    const handlePickImage = async () => {
        // TODO 실습 1-1: 현재 권한 상태 확인
        const { status: currentStatus, canAskAgain } =
            await ImagePicker.getMediaLibraryPermissionsAsync();

        // 이미 허용된 상태면 바로 갤러리 실행
        if (currentStatus === 'granted') {
            ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            }).then(result => {
                if (!result.canceled && result.assets.length > 0) {
                    const asset = result.assets[0];
                    const selectedImage: SelectedImage = {
                        uri: asset.uri,
                        name: asset.fileName || `image_${Date.now()}.jpg`,
                        type: asset.type || 'image/jpeg',
                    };
                    setImages(prev => [...prev, selectedImage]);
                }
            });
            return;
        }

        // TODO 실습 1-2: 미허용 상태면 권한 요청
        if (currentStatus === 'denied') {
            // canAskAgain이 false면 설정으로 바로 유도
            if (!canAskAgain) {
                Linking.openSettings();
                return;
            }

            // canAskAgain이 true면 권한 요청
            const { status: requestStatus } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (requestStatus !== 'granted') {
                Alert.alert(
                    '권한 거부',
                    '사진을 선택할 권한이 거부되었습니다. 권한을 허용해야 사진을 선택할 수 있습니다.',
                );
                return;
            }

            // 권한이 허용되면 갤러리 실행
            ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            }).then(result => {
                if (!result.canceled && result.assets.length > 0) {
                    const asset = result.assets[0];
                    const selectedImage: SelectedImage = {
                        uri: asset.uri,
                        name: asset.fileName || `image_${Date.now()}.jpg`,
                        type: asset.type || 'image/jpeg',
                    };
                    setImages(prev => [...prev, selectedImage]);
                }
            });
            return;
        }

        // TODO 실습 3: iOS Pre-permission 다이얼로그
        // iOS 미결정 상태면 커스텀 Alert로 먼저 사용 목적 안내
        if (Platform.OS === 'ios') {
            Alert.alert(
                '미디어 라이브러리 접근',
                '게시물에 사진을 추가하기 위해 미디어 라이브러리 접근 권한이 필요합니다.',
                [
                    { text: '나중에', style: 'cancel' },
                    {
                        text: '괜찮아요',
                        onPress: async () => {
                            const { status: requestStatus } =
                                await ImagePicker.requestMediaLibraryPermissionsAsync();

                            if (requestStatus !== 'granted') {
                                Alert.alert(
                                    '권한 거부',
                                    '사진을 선택할 권한이 거부되었습니다. 권한을 허용해야 사진을 선택할 수 있습니다.',
                                );
                                return;
                            }

                            // 권한이 허용되면 갤러리 실행
                            ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                quality: 0.7,
                            }).then(result => {
                                if (
                                    !result.canceled &&
                                    result.assets.length > 0
                                ) {
                                    const asset = result.assets[0];
                                    const selectedImage: SelectedImage = {
                                        uri: asset.uri,
                                        name:
                                            asset.fileName ||
                                            `image_${Date.now()}.jpg`,
                                        type: asset.type || 'image/jpeg',
                                    };
                                    setImages(prev => [...prev, selectedImage]);
                                }
                            });
                        },
                    },
                ],
            );
            return;
        }

        // Android는 바로 권한 요청
        const { status: requestStatus } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (requestStatus !== 'granted') {
            Alert.alert(
                '권한 거부',
                '사진을 선택할 권한이 거부되었습니다. 권한을 허용해야 사진을 선택할 수 있습니다.',
            );
            return;
        }

        // 권한이 허용되면 갤러리 실행
        ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        }).then(result => {
            if (!result.canceled && result.assets.length > 0) {
                const asset = result.assets[0];
                const selectedImage: SelectedImage = {
                    uri: asset.uri,
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    type: asset.type || 'image/jpeg',
                };
                setImages(prev => [...prev, selectedImage]);
            }
        });
    };

    // 실습 3-1 (iOS)
    //latform.OS === 'ios'이고 아직 미결정 상태라면
    // 스텀 Alert로 사용 목적을 먼저 안내한 뒤 시스템 팝업을 띄우세요
    // 미결정 상태(undetermined)면 권한 요청

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // ── 업로드 ────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!canSubmit) return;
        setLoading(true);
        try {
            const post = await createPost({
                caption: caption.trim() || undefined,
                images: images.length > 0 ? images : undefined,
            });

            // 피드 맨 앞에 낙관적으로 추가
            prependPost(post);

            // 로컬 알림 예약
            await scheduleUploadNotification(caption.trim());

            // 초기화
            setImages([]);
            setCaption('');
        } catch (error) {
            console.error('[handleSubmit] Upload failed:', error);
            Alert.alert(
                '업로드 실패',
                '게시물을 올리는 데 실패했습니다. 다시 시도해 주세요.',
            );
        } finally {
            setLoading(false);
        }
    };

    // 실습 8: 각 중요도에 따른 테스트 알림 발송
    const testNotification = async (channelName: string) => {
        if (!(await checkNotificationPermission())) {
            Alert.alert('권한 필요', '알림 권한이 필요합니다.');
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `테스트: ${channelName}`,
                body: `${channelName} 채널의 알림입니다.`,
            },
            trigger: {
                type: 'timeInterval' as any,
                seconds: 1,
            },
        });
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
                    <Ionicons name='chevron-back' size={26} color='#262626' />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>새 게시물</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    hitSlop={8}
                >
                    {loading ? (
                        <ActivityIndicator size='small' color='#0095F6' />
                    ) : (
                        <Text
                            style={[
                                styles.shareButton,
                                !canSubmit && styles.shareButtonDisabled,
                            ]}
                        >
                            공유
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
                {/* 이미지 선택 영역 */}
                <View style={styles.imageSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imageRow}
                    >
                        {/* 추가 버튼 */}
                        {images.length < 10 && (
                            <TouchableOpacity
                                style={styles.addImageButton}
                                onPress={handlePickImage}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name='image-outline'
                                    size={32}
                                    color='#8e8e8e'
                                />
                                <Text style={styles.addImageLabel}>
                                    {images.length === 0
                                        ? '사진 선택'
                                        : `+추가 (${images.length}/10)`}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* 선택된 이미지 썸네일 */}
                        {images.map((img, index) => (
                            <View key={img.uri} style={styles.thumbWrapper}>
                                <Image
                                    source={{ uri: img.uri }}
                                    style={styles.thumb}
                                />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveImage(index)}
                                    hitSlop={4}
                                >
                                    <Ionicons
                                        name='close-circle'
                                        size={20}
                                        color='#fff'
                                    />
                                </TouchableOpacity>
                                {index === 0 && (
                                    <View style={styles.coverBadge}>
                                        <Text style={styles.coverBadgeText}>
                                            대표
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 캡션 입력 */}
                <View style={styles.captionSection}>
                    <TextInput
                        style={styles.captionInput}
                        placeholder='문구를 입력하세요...'
                        placeholderTextColor='#999'
                        value={caption}
                        onChangeText={setCaption}
                        multiline
                        maxLength={2200}
                        textAlignVertical='top'
                    />
                    <Text style={styles.captionCount}>
                        {caption.length} / 2200
                    </Text>
                </View>

                {/* 실습 8: 알림 채널 테스트 섹션 (Android) */}
                {Platform.OS === 'android' && (
                    <View style={styles.testSection}>
                        <Text style={styles.testTitle}>
                            알림 채널 테스트 (importance 비교)
                        </Text>
                        <Text style={styles.testGuide}>
                            각 버튼을 클릭하여 다른 중요도의 알림을 테스트하세요.
                            실제 앱을 삭제 후 재설치해야 importance 변경이 적용됩니다.
                        </Text>

                        <TouchableOpacity
                            style={[styles.testButton, styles.maxButton]}
                            onPress={() =>
                                testNotification('MAX (긴급)')
                            }
                        >
                            <Text style={styles.testButtonText}>
                                MAX - Heads-up 표시
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.testButton, styles.highButton]}
                            onPress={() =>
                                testNotification('HIGH (높음)')
                            }
                        >
                            <Text style={styles.testButtonText}>
                                HIGH - Heads-up 표시 가능
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.testButton, styles.defaultButton]}
                            onPress={() =>
                                testNotification(
                                    'DEFAULT (기본)',
                                )
                            }
                        >
                            <Text style={styles.testButtonText}>
                                DEFAULT - 알림창에만 표시
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.testButton, styles.lowButton]}
                            onPress={() =>
                                testNotification('LOW (낮음)')
                            }
                        >
                            <Text style={styles.testButtonText}>
                                LOW - 소리/진동 없음
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.testButton, styles.minButton]}
                            onPress={() =>
                                testNotification('MIN (최소)')
                            }
                        >
                            <Text style={styles.testButtonText}>
                                MIN - 거의 보이지 않음
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const THUMB_SIZE = 100;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DBDBDB',
    },
    headerTitle: {
        fontFamily: Pretendard.semiBold,
        fontSize: FontSizes.md,
        color: FeedColors.primaryText,
    },
    shareButton: {
        fontFamily: Pretendard.semiBold,
        fontSize: FontSizes.sm,
        color: '#0095F6',
    },
    shareButtonDisabled: {
        color: '#B2DFFC',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageSection: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DBDBDB',
        paddingVertical: Spacing.xl,
    },
    imageRow: {
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
        alignItems: 'flex-start',
    },
    addImageButton: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#DBDBDB',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#FAFAFA',
    },
    addImageLabel: {
        fontFamily: Pretendard.medium,
        fontSize: 11,
        color: '#8e8e8e',
        textAlign: 'center',
    },
    thumbWrapper: {
        position: 'relative',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    coverBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    coverBadgeText: {
        fontFamily: Pretendard.semiBold,
        fontSize: 10,
        color: '#fff',
    },
    captionSection: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DBDBDB',
    },
    captionInput: {
        fontFamily: Pretendard.regular,
        fontSize: FontSizes.sm,
        color: FeedColors.primaryText,
        minHeight: 100,
        lineHeight: 22,
        ...Platform.select({ android: { paddingTop: 0 } }),
    },
    captionCount: {
        fontFamily: Pretendard.regular,
        fontSize: 12,
        color: '#c7c7c7',
        textAlign: 'right',
        marginTop: 4,
    },
    hint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
    },
    hintText: {
        fontFamily: Pretendard.regular,
        fontSize: FontSizes.xs,
        color: '#8e8e8e',
    },
    testSection: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#DBDBDB',
    },
    testTitle: {
        fontFamily: Pretendard.semiBold,
        fontSize: FontSizes.md,
        color: FeedColors.primaryText,
        marginBottom: 8,
    },
    testGuide: {
        fontFamily: Pretendard.regular,
        fontSize: FontSizes.xs,
        color: '#999',
        marginBottom: 12,
        lineHeight: 16,
    },
    testButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginBottom: 8,
        alignItems: 'center',
    },
    testButtonText: {
        fontFamily: Pretendard.medium,
        fontSize: FontSizes.sm,
        color: '#fff',
    },
    maxButton: {
        backgroundColor: '#FF6B6B',
    },
    highButton: {
        backgroundColor: '#FF8C42',
    },
    defaultButton: {
        backgroundColor: '#FFA500',
    },
    lowButton: {
        backgroundColor: '#90CAF9',
    },
    minButton: {
        backgroundColor: '#B0BEC5',
    },
});

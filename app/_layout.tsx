import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePushRegistration } from '@/hooks/use-push-registration';
import { useAuthStore } from '@/store/auth-store';
import { ThemedText } from '@components/themed-text';
import * as Notifications from 'expo-notifications';
import { StyleSheet } from 'react-native';

// TODO 실습 5-1
// setNotificationHandler로 Foreground 배너를 활성화하세요
// shouldShowAlert, shouldPlaySound 옵션 값을 채워보세요
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true, // 배너 표시 여부
        shouldPlaySound: true, // 소리 재생 여부
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
    }),
});

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    anchor: '(tabs)',
};

const AUTH_ROUTES = new Set(['login', 'signup']);

function AuthGuard() {
    const { accessToken } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    usePushRegistration();

    useEffect(() => {
        // 실습 7-3: Killed 상태에서 진입한 알림 데이터 확인
        const getInitialNotification = async () => {
            const response = await Notifications.getLastNotificationResponseAsync();
            if (response) {
                console.log('Killed 상태 - 초기 알림:', response);
                // 여기서 알림 데이터를 기반으로 특정 화면으로 네비게이션할 수 있음
            }
        };
        getInitialNotification();

        // 실습 7-1: Foreground에서 알림 수신
        const foregroundSub = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('Foreground 알림 수신:', notification);
                // Foreground 상태에서는 setNotificationHandler 설정에 따라 배너/소리가 표시됨
            }
        );

        // 실습 7-2: Background/Killed에서 알림 탭 이벤트
        const responseSub = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('알림 탭 이벤트:', response);
                // Background 또는 Killed 상태에서 알림을 탭했을 때
                // 여기서 알림 데이터를 기반으로 화면 네비게이션 처리
            }
        );

        // 실습 7-4: Cleanup - 리스너 구독 해제
        return () => {
            foregroundSub.remove();
            responseSub.remove();
        };
    }, []);

    useEffect(() => {
        const currentRoute = segments[0] as string | undefined;
        const inAuthRoute = AUTH_ROUTES.has(currentRoute ?? '');

        if (!accessToken && !inAuthRoute) {
            router.replace('/login' as never);
        } else if (accessToken && inAuthRoute) {
            router.replace('/(tabs)');
        }
    }, [accessToken, segments]);

    return null;
}

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
        'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
        'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
        'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
        'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
    });

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync();
    }, [loaded]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider
                value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
                <AuthGuard />
                <Stack>
                    <Stack.Screen
                        name='(tabs)'
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='create'
                        options={{
                            headerShown: false,
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name='signup'
                        options={{
                            headerShown: true,
                            headerTitle: () => (
                                <ThemedText style={styles.default}>
                                    회원가입
                                </ThemedText>
                            ),
                            headerBackTitle: '뒤로',
                        }}
                    />
                    <Stack.Screen
                        name='login'
                        options={{
                            headerShown: true,
                            headerTitle: () => (
                                <ThemedText style={styles.default}>
                                    로그인
                                </ThemedText>
                            ),
                            headerBackTitle: '뒤로',
                        }}
                    />
                    <Stack.Screen
                        name='profile/[id]'
                        options={{
                            headerShown: true,
                            headerTitle: () => (
                                <ThemedText style={styles.default}>
                                    사용자 프로필
                                </ThemedText>
                            ),
                            headerBackTitle: '홈으로',
                        }}
                    />
                </Stack>
                <StatusBar style='auto' />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 19,
        fontFamily: 'Pretendard-Bold',
    },
});

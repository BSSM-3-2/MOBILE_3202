import { getFeed, likePost, unlikePost } from '@/api/content';
import { Post } from '@type/Post';
import { create } from 'zustand';

interface FeedState {
    posts: Post[];
    page: number;
    hasNext: boolean;
    loading: boolean;
    error: string | null;

    fetchFeed: () => Promise<void>;
    loadMore: () => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
    posts: [],
    page: 1,
    hasNext: false,
    loading: false,
    error: null,

    fetchFeed: async () => {
        set({ loading: true, error: null });
        try {
            const { data, pagination } = await getFeed(1);
            set({
                posts: data,
                page: pagination.page,
                hasNext: pagination.hasNext,
                loading: false,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : '피드를 불러오지 못했습니다.';
            set({ error: message, loading: false });
        }
    },

    loadMore: async () => {
        const { loading, hasNext, page, posts } = get();
        if (loading || !hasNext) return;

        set({ loading: true });
        try {
            const nextPage = page + 1;
            const { data, pagination } = await getFeed(nextPage);
            set({
                posts: [...posts, ...data],
                page: nextPage,
                hasNext: pagination.hasNext,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    // 낙관적 업데이트: UI를 먼저 바꾸고 API 호출 → 실패 시 원상복구
    toggleLike: async (postId: string) => {
        const { posts } = get();
        const target = posts.find(p => p.id === postId);
        if (!target) return;

        const prevLiked = target.liked;
        const prevLikes = target.likes;
        const nextLiked = !prevLiked;
        const nextLikes = Math.max(0, prevLikes + (nextLiked ? 1 : -1));

        // ① UI 즉시 반영
        set({
            posts: get().posts.map(post =>
                post.id === postId
                    ? { ...post, liked: nextLiked, likes: nextLikes }
                    : post,
            ),
            error: null,
        });

        try {
            // ② API 호출
            const result = prevLiked
                ? await unlikePost(postId)
                : await likePost(postId);

            // ③ 서버 응답으로 동기화
            set({
                posts: get().posts.map(post =>
                    post.id === postId
                        ? {
                              ...post,
                              liked: result.liked,
                              likes: result.likes,
                          }
                        : post,
                ),
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : '좋아요 처리에 실패했습니다.';

            // ④ 실패 시 롤백
            set({
                posts: get().posts.map(post =>
                    post.id === postId
                        ? {
                              ...post,
                              liked: prevLiked,
                              likes: prevLikes,
                          }
                        : post,
                ),
                error: message,
            });
        }
    },
}));

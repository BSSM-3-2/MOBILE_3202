import { ImageType } from '@type/Post';
import { ImageSourcePropType } from 'react-native';

const BASE_URL = 'https://bssm-api.zer0base.me';

function resolveRemoteUrl(url: string): string {
    if (url.startsWith('http')) return url;
    // url이 /로 시작하지 않으면 / 추가
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${BASE_URL}${path}`;
}

export function resolveImageSource(image: ImageType): ImageSourcePropType {
    if (!image.url) {
        console.warn('[resolveImageSource] Image URL is missing:', image);
        return { uri: '' };
    }

    const uri = resolveRemoteUrl(image.url);
    console.log('[resolveImageSource] Resolved URI:', uri);
    return { uri };
}

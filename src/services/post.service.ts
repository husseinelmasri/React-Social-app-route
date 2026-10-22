import axios from 'axios';
import type { PostCardI } from '../types/postCard.types';

const baseUrl = import.meta.env.VITE_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function fetchFeed(): Promise<PostCardI[]> {
  const { data } = await axios.get(`${baseUrl}/posts?limit=50`, {
    headers: authHeaders(),
  });
  const list: PostCardI[] =
    data?.data?.posts ??
    data?.posts ??
    data?.data ??
    (Array.isArray(data) ? data : []);
  return Array.isArray(list) ? list : [];
}

export async function getSinglePost(postId: string): Promise<PostCardI | null> {
  const { data } = await axios.get(`${baseUrl}/posts/${postId}`, {
    headers: authHeaders(),
  });

  const raw: PostCardI | null =
    data?.data?.post ?? data?.post ?? data?.data ?? data ?? null;

  if (!raw) return null;

  let fromFeed: PostCardI | undefined;
  try {
    const feed = await fetchFeed();
    fromFeed = feed.find((p) => p._id === postId);
  } catch (e) {
    console.warn('Feed merge failed', e);
  }

  if (!fromFeed) return raw;

  const topComment =
    raw.topComment && raw.topComment.content
      ? raw.topComment
      : (fromFeed.topComment ?? null);

  const commentsCount = Math.max(
    raw.commentsCount ?? 0,
    fromFeed.commentsCount ?? 0,
  );
  const likesCount = Math.max(raw.likesCount ?? 0, fromFeed.likesCount ?? 0);
  const sharesCount = Math.max(raw.sharesCount ?? 0, fromFeed.sharesCount ?? 0);

  return {
    ...fromFeed,
    ...raw,
    topComment,
    commentsCount,
    likesCount,
    sharesCount,
    likes: raw.likes?.length ? raw.likes : (fromFeed.likes ?? []),
  };
}

export async function createPost(formData: FormData) {
  const data = await axios.post(`${baseUrl}/posts`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('userToken')}`,
    },
  });
  return data;
}

function pickFirstString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    for (const key of Object.keys(v as Record<string, unknown>)) {
      const found = pickFirstString((v as Record<string, unknown>)[key]);
      if (found !== null) return found;
    }
  }
  return null;
}

export async function updatePost(
  postId: string,
  body: string,
  imageFile?: File | null,
  removeImage?: boolean,
): Promise<Partial<PostCardI> & { _id: string }> {
  const formData = new FormData();
  formData.append('body', body);
  if (imageFile) formData.append('image', imageFile);
  if (removeImage && !imageFile) formData.append('removeImage', 'true');

  const { data } = await axios.put(`${baseUrl}/posts/${postId}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('userToken')}`,
    },
  });

  const raw = (data?.data?.post ?? data?.post ?? data?.data ?? data) as any;

  const safeBody = pickFirstString(raw?.body) ?? body;
  const safeImage =
    typeof raw?.image === 'string' && raw.image.length > 0
      ? raw.image
      : undefined;

  return {
    _id: raw?._id ?? postId,
    body: safeBody,
    image: (removeImage && !imageFile ? null : safeImage) as any,
    privacy: typeof raw?.privacy === 'string' ? raw.privacy : undefined,
  } as Partial<PostCardI> & { _id: string };
}
export async function deletePost(postId: string) {
  const data = await axios.delete(`${baseUrl}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('userToken')}`,
    },
  });
  return data;
}

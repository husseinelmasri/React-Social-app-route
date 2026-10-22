import axios from 'axios';
import type { TopComment } from '../types/postCard.types';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function authHeaders(hasFile = false): Record<string, string> {
  const token = localStorage.getItem('userToken');
  return {
    ...(hasFile ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { token } : {}),
  };
}

function extractList(data: any): TopComment[] {
  const raw = data?.data?.comments ?? data?.comments ?? data?.data ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (c): c is TopComment =>
      c != null &&
      typeof c === 'object' &&
      typeof c._id === 'string' &&
      (c.content == null || typeof c.content === 'string'),
  );
}

function extractOne(data: any): TopComment | null {
  const c = data?.data?.comment ?? data?.comment ?? data?.data ?? data;
  if (c != null && typeof c === 'object' && typeof c._id === 'string') {
    return c as TopComment;
  }
  return null;
}

export async function getPostComments(postId: string): Promise<TopComment[]> {
  const { data } = await axios.get(`${BASE_URL}/posts/${postId}/comments`, {
    headers: authHeaders(),
  });
  return extractList(data);
}

export async function createPostComments(
  postId: string,
  content: string,
  imageFile?: File | null,
): Promise<TopComment> {
  const url = `${BASE_URL}/posts/${postId}/comments`;

  let body: FormData | { content: string };
  let headers: Record<string, string>;

  if (imageFile) {
    const fd = new FormData();
    fd.append('content', content);
    fd.append('image', imageFile);
    body = fd;
    headers = authHeaders(true);
  } else {
    body = { content };
    headers = authHeaders(false);
  }

  try {
    const { data } = await axios.post(url, body, { headers });
    const comment = extractOne(data);
    if (!comment) throw new Error('Malformed comment response from server');
    return comment;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('=== createPostComments FAILED ===');
      console.error('status:', err.response?.status);
      console.error('server message:', err.response?.data?.message);
      console.error('server errors:', err.response?.data?.errors);
      console.error('full response:', err.response?.data);
    }
    throw err;
  }
}

export async function updateComment(
  postId: string,
  commentId: string,
  content: string,
  imageFile?: File | null,
  removeImage?: boolean,
): Promise<TopComment> {
  const url = `${BASE_URL}/posts/${postId}/comments/${commentId}`;

  let body: FormData | { content: string; removeImage?: boolean };
  let headers: Record<string, string>;

  if (imageFile || removeImage) {
    const fd = new FormData();
    fd.append('content', content);
    if (imageFile) fd.append('image', imageFile);
    if (removeImage) fd.append('removeImage', 'true');
    body = fd;
    headers = authHeaders(true);
  } else {
    body = { content };
    headers = authHeaders(false);
  }

  try {
    const { data } = await axios.put(url, body, { headers });
    const comment = extractOne(data);
    if (!comment) throw new Error('Malformed comment response from server');
    return comment;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('=== updateComment FAILED ===');
      console.error('status:', err.response?.status);
      console.error('server message:', err.response?.data?.message);
      console.error('full response:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<void> {
  const url = `${BASE_URL}/posts/${postId}/comments/${commentId}`;

  try {
    await axios.delete(url, { headers: authHeaders() });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('=== deleteComment FAILED ===');
      console.error('status:', err.response?.status);
      console.error('server message:', err.response?.data?.message);
      console.error('full response:', err.response?.data);
    }
    throw err;
  }
}

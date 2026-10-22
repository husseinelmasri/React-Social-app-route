export interface PostCardI {
  _id: string;
  body: string;
  privacy: 'public' | 'friends' | 'private' | string;
  user: PostUser;
  sharedPost: PostCardI | null;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment: TopComment | null;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
  bookmarked: boolean;
  image?: string;
}

export interface PostUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface TopComment {
  _id: string;
  content: string;
  // Can be an object (populated) OR a string (an id) — depends on the API
  commentCreator: CommentCreator | string | null;
  post: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
  image?: string; // 👈 URL of the attached image, if any
}

/** Type guard: is this a populated CommentCreator object? */
export function isPopulatedCreator(
  value: TopComment['commentCreator'],
): value is CommentCreator {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as CommentCreator)._id === 'string'
  );
}

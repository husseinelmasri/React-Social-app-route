import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

import PostCard from '../../components/Post/PostCard';
import PostSkeleton from '../../components/Post/PostSkeleton';
import type { PostCardI, TopComment } from '../../types/postCard.types';
import { getSinglePost } from '../../services/post.service';
import { getPostComments } from '../../services/comments.service';

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allComments, setAllComments] = useState<TopComment[]>([]);
  const [post, setPost] = useState<PostCardI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function getComments(postId: string) {
    try {
      const comments = await getPostComments(postId);
      setAllComments(comments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    getComments(id);

    async function fetchPost() {
      setIsLoading(true);
      setError(null);
      try {
        const found = await getSinglePost(id!);
        if (!cancelled) setPost(found);
      } catch (err) {
        if (cancelled) return;
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? 'Failed to load post');
        } else {
          setError('Something went wrong');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPost();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/feed');
  };

  return (
    <div className="mx-auto max-w-2xl py-6 px-4">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm">
        <ArrowLeft size={16} />
        Back
      </button>

      {isLoading && <PostSkeleton />}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && !post && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            This post no longer exists.
          </p>
          <Link
            to="/feed"
            className="text-sm font-semibold text-blue-600 hover:underline">
            Go back to feed
          </Link>
        </div>
      )}

      {!isLoading && !error && post && (
        <PostCard
          post={post}
          hideViewDetails
          defaultShowComments
          allComments={allComments}
          onCommentAdded={(c) => setAllComments((prev) => [c, ...prev])}
          onDeleted={() => navigate('/feed', { replace: true })}
        />
      )}
    </div>
  );
}

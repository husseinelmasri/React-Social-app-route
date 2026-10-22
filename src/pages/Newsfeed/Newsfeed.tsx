import SuggestedFriends from '../../components/SuggestedFriends/SuggestedFriends';
import Sidebar from '../../components/Sidebar/Sidebar';
import PostCard from '../../components/Post/PostCard';
import { getAllPosts } from '../../services/feed.service';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { PostCardI } from '../../types/postCard.types';
import PostSkeleton from '../../components/Post/PostSkeleton';
import CreatPost from '../../components/Post/CreatePost';

export default function Newsfeed() {
  const [posts, setPosts] = useState<PostCardI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadFeed() {
    try {
      const response = await getAllPosts();
      const list: PostCardI[] =
        response?.data?.data?.posts ??
        response?.data?.posts ??
        response?.data?.data ??
        (Array.isArray(response?.data) ? response.data : []) ??
        [];
      setPosts(list);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('FEED ERROR:', error.response?.data);
      }
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <title>Social App | Newsfeed</title>
      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-2">
          <Sidebar />
        </aside>

        <section className="col-span-12 md:col-span-7 flex flex-col gap-4 min-w-0">
          <CreatPost getAllPosts={loadFeed} />
          {isLoading ? (
            <PostSkeleton />
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
              No posts to show.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={(id) =>
                  setPosts((prev) => prev.filter((p) => p._id !== id))
                }
              />
            ))
          )}
        </section>

        <aside className="col-span-12 md:col-span-3">
          <SuggestedFriends />
        </aside>
      </div>
    </div>
  );
}

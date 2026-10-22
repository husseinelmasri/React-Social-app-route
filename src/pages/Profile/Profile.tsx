import { useContext, useEffect, useState } from 'react';
import { Bookmark, ImageIcon, Mail, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { UserContext } from '../../components/context/userContext';
import PostCard from '../../components/Post/PostCard';
import PostSkeleton from '../../components/Post/PostSkeleton';
import type { PostCardI } from '../../types/postCard.types';
import { getAllPosts } from '../../services/feed.service';
import useGet from '../../components/hooks/useGet';

type Tab = 'posts' | 'saved';

type MyPostsResponse = {
  data?: {
    posts?: PostCardI[];
  };
  posts?: PostCardI[];
};

export default function Profile() {
  const userCtx = useContext(UserContext);
  const user = userCtx?.userDetails ?? null;

  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [savedPosts, setSavedPosts] = useState<PostCardI[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const myPostsResponse = useGet<MyPostsResponse>(
    user?._id ? `${baseUrl}/users/${user._id}/posts` : null,
  );

  const [myPosts, setMyPosts] = useState<PostCardI[]>([]);
  const [prevResponse, setPrevResponse] = useState(myPostsResponse);

  if (myPostsResponse !== prevResponse) {
    setPrevResponse(myPostsResponse);
    if (myPostsResponse) {
      setMyPosts(myPostsResponse.data?.posts ?? myPostsResponse.posts ?? []);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadSaved() {
      try {
        setIsLoadingSaved(true);
        const res = await getAllPosts();
        const list: PostCardI[] =
          res?.data?.data?.posts ??
          res?.data?.posts ??
          res?.data?.data ??
          (Array.isArray(res?.data) ? res.data : []) ??
          [];

        if (cancelled) return;
        setSavedPosts(list.filter((p) => p.bookmarked));
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message ?? 'Failed to load posts');
        }
        setSavedPosts([]);
      } finally {
        if (!cancelled) setIsLoadingSaved(false);
      }
    }

    if (user?._id) loadSaved();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const currentList = activeTab === 'posts' ? myPosts : savedPosts;
  const currentCount = currentList.length;
  const isLoading = activeTab === 'posts' ? !myPostsResponse : isLoadingSaved;

  if (!user) {
    return (
      <main className="min-h-screen bg-sec py-6">
        <div className="container mx-auto max-w-6xl px-4">
          <PostSkeleton />
        </div>
      </main>
    );
  }

  const followersCount = user.followersCount ?? user.followers?.length ?? 0;
  const followingCount = user.followingCount ?? user.following?.length ?? 0;
  const bookmarksCount = user.bookmarksCount ?? user.bookmarks?.length ?? 0;

  return (
    <main className="min-h-screen bg-sec py-6">
      <title>Social App | Profile</title>
      <div className="container mx-auto max-w-6xl px-4">
        <section className="relative">
          <div className="h-36 rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-slate-700 sm:h-44" />

          <div className="relative mx-2 -mt-16 rounded-3xl bg-white p-5 shadow-sm sm:mx-4 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={
                    user.photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name,
                    )}&background=001f6b&color=fff`
                  }
                  alt={user.name}
                  className="size-24 shrink-0 rounded-full object-cover ring-4 ring-white sm:size-28"
                />
                <div>
                  <h1 className="text-2xl font-bold capitalize text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                    <Sparkles size={12} />
                    Route Posts member
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:min-w-80">
                <Stat label="Followers" value={followersCount} />
                <Stat label="Following" value={followingCount} />
                <Stat label="Bookmarks" value={bookmarksCount} />
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-gray-900">About</h2>
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {user.email}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles size={16} className="text-gray-400" />
                  Active on Route Posts
                </p>
              </div>

              <div className="grid gap-3">
                <StatCard label="My Posts" value={myPosts.length} />
                <StatCard label="Saved Posts" value={savedPosts.length} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <TabButton
              active={activeTab === 'posts'}
              onClick={() => setActiveTab('posts')}
              icon={<ImageIcon size={16} />}
              label="My Posts"
            />
            <TabButton
              active={activeTab === 'saved'}
              onClick={() => setActiveTab('saved')}
              icon={<Bookmark size={16} />}
              label="Saved"
            />
          </div>
          <span className="grid size-7 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
            {currentCount}
          </span>
        </section>

        <section className="mt-3 space-y-4">
          {isLoading ? (
            <PostSkeleton />
          ) : currentList.length === 0 ? (
            <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-gray-400 shadow-sm">
              {activeTab === 'posts'
                ? 'You have not posted yet.'
                : 'You have no saved posts.'}
            </p>
          ) : (
            currentList.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={(id) => {
                  setMyPosts((prev) => prev.filter((p) => p._id !== id));
                  setSavedPosts((prev) => prev.filter((p) => p._id !== id));
                }}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
      }`}>
      {icon}
      {label}
    </button>
  );
}

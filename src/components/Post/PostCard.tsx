import { useMemo, useRef, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Users,
  Lock,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  ImagePlus,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import type { PostCardI, TopComment } from '../../types/postCard.types';
import { isPopulatedCreator } from '../../types/postCard.types';
import {
  getPostComments,
  createPostComments,
  updateComment,
  deleteComment,
} from '../../services/comments.service';
import { UserContext } from '../context/userContext';

import { Button, Dropdown, Label } from '@heroui/react';
import { AlertDialog } from '@heroui/react';
import Editpost from './EditPost';
import { deletePost } from '../../services/post.service';

const privacyMap = {
  public: { label: 'Public', Icon: Globe },
  friends: { label: 'Friends', Icon: Users },
  private: { label: 'Only me', Icon: Lock },
} as const;

const INITIAL_VISIBLE = 1;
const step = 2;
const maxImageMb = 5;

function timeAgo(iso: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

type PostCardProps = {
  post: PostCardI;
  hideViewDetails?: boolean;
  defaultShowComments?: boolean;
  allComments?: TopComment[];
  onCommentAdded?: (comment: TopComment) => void;
  onDeleted?: (postId: string) => void;
};

export default function PostCard({
  post,
  hideViewDetails = false,
  defaultShowComments = false,
  allComments,
  onCommentAdded,
  onDeleted,
}: PostCardProps) {
  const userCtx = useContext(UserContext);
  const userDetails = userCtx?.userDetails ?? null;

  const [localPost, setLocalPost] = useState<PostCardI>(post);

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const [showEditPost, setShowEditPost] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showComments, setShowComments] = useState(defaultShowComments);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const [fetchedComments, setFetchedComments] = useState<TopComment[] | null>(
    null,
  );
  const [isFetchingComments, setIsFetchingComments] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  const [deleteCommentTarget, setDeleteCommentTarget] = useState<string | null>(
    null,
  );
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const { Icon: PrivacyIcon } =
    privacyMap[localPost.privacy as keyof typeof privacyMap] ??
    privacyMap.public;

  const author = localPost.user;
  const totalComments = localPost.commentsCount ?? 0;
  const totalLikes = localPost.likesCount ?? 0;
  const totalShares = localPost.sharesCount ?? 0;

  const isMyPost = localPost.user?._id === userDetails?._id;

  const fullComments: TopComment[] = useMemo(() => {
    const serverPool = allComments ?? fetchedComments ?? null;
    if (serverPool) return serverPool;
    return localPost.topComment ? [localPost.topComment] : [];
  }, [allComments, fetchedComments, localPost.topComment]);

  const visibleComments = fullComments.slice(0, visibleCount);

  const hasMoreInPool = fullComments.length > visibleCount;
  const hasMoreOnServer =
    !allComments &&
    !fetchedComments &&
    totalComments > fullComments.length &&
    fullComments.length > 0;
  const hasMore = hasMoreInPool || hasMoreOnServer;

  async function handleShowMore() {
    if (!allComments && !fetchedComments && hasMoreOnServer) {
      try {
        setIsFetchingComments(true);
        const comments = await getPostComments(localPost._id);
        setFetchedComments(comments);
        setVisibleCount((c) => Math.min(c + step, comments.length));
      } catch (err) {
        console.error('Failed to load comments', err);
        toast.error('Failed to load comments');
      } finally {
        setIsFetchingComments(false);
      }
      return;
    }

    setVisibleCount((c) => Math.min(c + step, fullComments.length));
  }

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);
      await deletePost(localPost._id);
      toast.success('Post deleted');
      setShowDeleteConfirm(false);
      onDeleted?.(localPost._id);
    } catch (err) {
      console.error('Failed to delete post', err);

      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Could not delete post')
        : 'Could not delete post';

      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsDeleting(false);
    }
  }

  function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > maxImageMb * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxImageMb}MB`);
      e.target.value = '';
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleAddComment() {
    const content = newComment.trim();
    if ((!content && !imageFile) || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const created = await createPostComments(
        localPost._id,
        content,
        imageFile,
      );

      if (onCommentAdded) {
        onCommentAdded(created);
      } else {
        setFetchedComments((prev) => {
          const base =
            prev ?? (localPost.topComment ? [localPost.topComment] : []);
          return [created, ...base];
        });
      }

      setVisibleCount((c) => c + 1);
      setNewComment('');
      clearImage();
      toast.success('Comment added');
    } catch (err) {
      console.error('Failed to add comment', err);

      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ??
          err.response?.data?.errors ??
          'Could not add comment')
        : 'Could not add comment';

      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateComment(commentId: string) {
    if (!editCommentText.trim() || isUpdatingComment) return;

    try {
      setIsUpdatingComment(true);
      const updated = await updateComment(
        localPost._id,
        commentId,
        editCommentText,
      );

      setFetchedComments((prev) =>
        prev
          ? prev.map((c) => (c._id === commentId ? { ...c, ...updated } : c))
          : prev,
      );
      setEditingCommentId(null);
      toast.success('Comment updated');
    } catch (err) {
      console.error('Failed to update comment', err);
      toast.error('Could not update comment');
    } finally {
      setIsUpdatingComment(false);
    }
  }

  async function handleConfirmDeleteComment() {
    if (!deleteCommentTarget || isDeletingComment) return;

    try {
      setIsDeletingComment(true);
      await deleteComment(localPost._id, deleteCommentTarget);

      setFetchedComments((prev) =>
        prev ? prev.filter((c) => c._id !== deleteCommentTarget) : prev,
      );
      setDeleteCommentTarget(null);
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Failed to delete comment', err);
      toast.error('Could not delete comment');
    } finally {
      setIsDeletingComment(false);
    }
  }

  return (
    <article className="w-full bg-white text-[#050505] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-[#dddfe2]">
      <header className="flex items-start gap-2 px-4 pt-3 pb-2">
        {author?.photo ? (
          <img
            src={author.photo}
            alt={author.name}
            className="size-10 shrink-0 rounded-full object-cover bg-gray-200"
          />
        ) : (
          <div className="size-10 shrink-0 rounded-full bg-gray-200" />
        )}
        <div className="min-w-0 grow">
          <p className="text-[15px] font-semibold text-[#050505] leading-tight hover:underline cursor-pointer truncate">
            {author?.name ?? 'Unknown'}
          </p>
          <div className="flex items-center gap-1 text-[13px] text-[#65676b] leading-tight">
            <span>{timeAgo(localPost.createdAt)}</span>
            <span>·</span>
            <PrivacyIcon size={12} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Dropdown>
            <Button
              aria-label="Menu"
              isIconOnly
              variant="ghost"
              className="size-9 min-w-9 rounded-full p-0 text-[#65676b] hover:bg-sec">
              <MoreHorizontal size={20} />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === 'edit-post') setShowEditPost(true);
                  else if (key === 'delete-post') setShowDeleteConfirm(true);
                  else console.log(`Selected: ${key}`);
                }}>
                {isMyPost ? (
                  <>
                    <Dropdown.Item id="save-post" textValue="Save Post">
                      <Label>Save Post</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="edit-post" textValue="Edit Post">
                      <Label>Edit Post</Label>
                    </Dropdown.Item>
                    <Dropdown.Item
                      id="delete-post"
                      textValue="Delete Post"
                      variant="danger">
                      <Label>Delete Post</Label>
                    </Dropdown.Item>
                  </>
                ) : (
                  <Dropdown.Item id="save-post" textValue="Save Post">
                    <Label>Save Post</Label>
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </header>

      {showEditPost ? (
        <Editpost
          key={localPost._id}
          post={localPost}
          onCancel={() => setShowEditPost(false)}
          onUpdated={(updated) => {
            setLocalPost((prev) => {
              const nextImage =
                updated.image === null
                  ? undefined
                  : updated.image !== undefined
                    ? updated.image
                    : prev.image;

              return {
                ...prev,
                ...updated,
                user: prev.user ?? updated.user,
                sharedPost: updated.sharedPost ?? prev.sharedPost,
                topComment: updated.topComment?.content
                  ? updated.topComment
                  : prev.topComment,
                image: nextImage,
              };
            });
            setShowEditPost(false);
          }}
        />
      ) : (
        <>
          {typeof localPost.body === 'string' &&
            localPost.body.trim().length > 0 && (
              <div className="px-4 pb-3">
                <p className="text-[15px] text-[#050505] whitespace-pre-line leading-snug">
                  {localPost.body}
                </p>
              </div>
            )}

          {localPost.image && (
            <img
              src={localPost.image}
              alt="post"
              className="w-full max-h-140 object-cover"
              loading="lazy"
            />
          )}
        </>
      )}

      {localPost.sharedPost && (
        <div className="mx-4 mb-3 rounded-lg border border-[#dddfe2] overflow-hidden">
          <div className="p-3 bg-white">
            <p className="text-[13px] font-semibold text-[#050505]">
              {localPost.sharedPost.user?.name}
            </p>
            <p className="text-[13px] text-[#65676b]">
              @{localPost.sharedPost.user?.username}
            </p>
          </div>
          <div className="px-3 pb-3 bg-white">
            <p className="text-[15px] text-[#050505]">
              {localPost.sharedPost.body}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-[13px] text-[#65676b]">
        <button
          type="button"
          className="flex items-center gap-1 hover:underline">
          <span className="grid size-4.5 place-items-center rounded-full bg-[#1877f2] text-white">
            <ThumbsUp size={10} fill="currentColor" />
          </span>
          <span>{totalLikes.toLocaleString()}</span>
        </button>
        <div className="flex items-center gap-3">
          <button type="button" className="hover:underline">
            {totalComments} comments
          </button>
          <span>{totalShares} shares</span>
        </div>
      </div>

      <div className="border-t border-[#ced0d4] mx-4" />

      <div className="grid grid-cols-3 px-2 py-1">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-sec transition">
          <ThumbsUp size={18} /> Like
        </button>
        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center justify-center gap-2 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-sec transition">
          <MessageCircle size={18} /> Comment
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-sec transition">
          <Share2 size={18} /> Share
        </button>
      </div>

      {!hideViewDetails && (
        <div className="px-4 pb-3 text-center">
          <Link
            to={`/postDetails/${localPost._id}`}
            className="text-[13px] font-semibold text-[#1877f2] hover:underline">
            View Details
          </Link>
        </div>
      )}

      {!showComments &&
        localPost.topComment &&
        (() => {
          const creator = isPopulatedCreator(
            localPost.topComment.commentCreator,
          )
            ? localPost.topComment.commentCreator
            : null;
          const safeName = creator?.name ?? 'Unknown';
          const safePhoto = creator?.photo ?? '';
          const safeContent =
            typeof localPost.topComment.content === 'string'
              ? localPost.topComment.content
              : '';
          const isMyComment = creator?._id === userDetails?._id;

          return (
            <div className="border-t border-[#ced0d4] px-4 py-3">
              <p className="mb-2 text-[12px] font-bold text-green-600">
                Top Comment
              </p>
              <div className="flex items-start gap-2">
                {safePhoto ? (
                  <img
                    src={safePhoto}
                    alt={safeName}
                    className="size-8 shrink-0 rounded-full object-cover bg-gray-200"
                  />
                ) : (
                  <div className="size-8 shrink-0 rounded-full bg-gray-300" />
                )}
                <div className="min-w-0 grow">
                  <div className="flex items-start gap-1">
                    <div className="min-w-0">
                      <div className="rounded-2xl bg-sec px-3 py-2">
                        <p className="text-[13px] font-semibold text-[#050505]">
                          {safeName}
                        </p>
                        {safeContent && (
                          <p className="text-[15px] text-[#050505]">
                            {safeContent}
                          </p>
                        )}
                        {localPost.topComment.image && (
                          <img
                            src={localPost.topComment.image}
                            alt="comment attachment"
                            className="mt-2 max-h-60 w-auto rounded-lg object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>

                    <div className="ml-auto shrink-0">
                      <Dropdown>
                        <Button
                          aria-label="Comment options"
                          isIconOnly
                          variant="ghost"
                          className="size-7 min-w-7 rounded-full p-0 text-[#65676b] hover:bg-[#e4e6eb] data-[hover=true]:bg-[#e4e6eb]">
                          <MoreHorizontal size={16} />
                        </Button>
                        <Dropdown.Popover>
                          <Dropdown.Menu
                            onAction={(key) => {
                              if (key === 'edit-comment') {
                                setEditingCommentId(localPost.topComment!._id);
                                setEditCommentText(safeContent);
                              } else if (key === 'delete-comment') {
                                setDeleteCommentTarget(
                                  localPost.topComment!._id,
                                );
                              }
                            }}>
                            {isMyComment ? (
                              <>
                                <Dropdown.Item
                                  id="save-comment"
                                  textValue="Save Comment">
                                  <Label>Save Comment</Label>
                                </Dropdown.Item>
                                <Dropdown.Item
                                  id="edit-comment"
                                  textValue="Edit Comment">
                                  <Label>Edit Comment</Label>
                                </Dropdown.Item>
                                <Dropdown.Item
                                  id="delete-comment"
                                  textValue="Delete Comment"
                                  variant="danger">
                                  <Label>Delete Comment</Label>
                                </Dropdown.Item>
                              </>
                            ) : (
                              <Dropdown.Item
                                id="save-comment"
                                textValue="Save Comment">
                                <Label>Save Comment</Label>
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown.Popover>
                      </Dropdown>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-3 pl-3 text-[12px] font-semibold text-[#65676b]">
                    <span>{timeAgo(localPost.topComment.createdAt)}</span>
                    <button type="button" className="hover:underline">
                      Like
                    </button>
                    <button type="button" className="hover:underline">
                      Reply
                    </button>
                    <span>{localPost.topComment.likes?.length ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {showComments && (
        <div className="border-t border-[#ced0d4] px-4 py-3 space-y-3">
          {visibleComments.length > 0 ? (
            visibleComments.map((comment) => {
              const creator = isPopulatedCreator(comment.commentCreator)
                ? comment.commentCreator
                : null;
              const safeName = creator?.name ?? 'Unknown';
              const safePhoto = creator?.photo ?? '';
              const safeContent =
                typeof comment.content === 'string' ? comment.content : '';
              const isMyComment = creator?._id === userDetails?._id;

              if (!creator) {
                console.warn('Malformed comment from API:', comment);
              }

              return (
                <div key={comment._id} className="flex items-start gap-2">
                  {safePhoto ? (
                    <img
                      src={safePhoto}
                      alt={safeName}
                      className="size-8 shrink-0 rounded-full object-cover bg-gray-200"
                    />
                  ) : (
                    <div className="size-8 shrink-0 rounded-full bg-gray-300" />
                  )}
                  <div className="min-w-0 grow">
                    <div className="flex items-start gap-1">
                      <div className="min-w-0">
                        <div className="rounded-2xl bg-sec px-3 py-2">
                          <p className="text-[13px] font-semibold text-[#050505]">
                            {safeName}
                          </p>
                          {editingCommentId === comment._id ? (
                            <div className="mt-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editCommentText}
                                onChange={(e) =>
                                  setEditCommentText(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleUpdateComment(comment._id);
                                  }
                                }}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateComment(comment._id)}
                                disabled={isUpdatingComment}
                                className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50">
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCommentId(null)}
                                className="text-xs font-semibold text-gray-500 hover:underline">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            safeContent && (
                              <p className="text-[15px] text-[#050505]">
                                {safeContent}
                              </p>
                            )
                          )}

                          {comment.image && (
                            <img
                              src={comment.image}
                              alt="comment attachment"
                              className="mt-2 max-h-60 w-auto rounded-lg object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                      </div>

                      <div className="ml-auto shrink-0">
                        <Dropdown>
                          <Button
                            aria-label="Comment options"
                            isIconOnly
                            variant="ghost"
                            className="size-7 min-w-7 rounded-full p-0 text-[#65676b] hover:bg-[#e4e6eb] data-[hover=true]:bg-[#e4e6eb]">
                            <MoreHorizontal size={16} />
                          </Button>
                          <Dropdown.Popover>
                            <Dropdown.Menu
                              onAction={(key) => {
                                if (key === 'edit-comment') {
                                  setEditingCommentId(comment._id);
                                  setEditCommentText(safeContent);
                                } else if (key === 'delete-comment') {
                                  setDeleteCommentTarget(comment._id);
                                }
                              }}>
                              {isMyComment ? (
                                <>
                                  <Dropdown.Item
                                    id="save-comment"
                                    textValue="Save Comment">
                                    <Label>Save Comment</Label>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    id="edit-comment"
                                    textValue="Edit Comment">
                                    <Label>Edit Comment</Label>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    id="delete-comment"
                                    textValue="Delete Comment"
                                    variant="danger">
                                    <Label>Delete Comment</Label>
                                  </Dropdown.Item>
                                </>
                              ) : (
                                <Dropdown.Item
                                  id="save-comment"
                                  textValue="Save Comment">
                                  <Label>Save Comment</Label>
                                </Dropdown.Item>
                              )}
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-3 pl-3 text-[12px] font-semibold text-[#65676b]">
                      <span>{timeAgo(comment.createdAt)}</span>
                      <button type="button" className="hover:underline">
                        Like
                      </button>
                      <button type="button" className="hover:underline">
                        Reply
                      </button>
                      <span>{comment.likes?.length ?? 0}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[13px] text-[#65676b]">No comments yet.</p>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={handleShowMore}
              disabled={isFetchingComments}
              className="text-[13px] font-semibold text-[#65676b] hover:underline disabled:opacity-50">
              {isFetchingComments ? 'Loading comments…' : `View more comments`}
            </button>
          )}

          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="preview"
                className="max-h-40 rounded-xl border border-[#dddfe2]"
              />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-black/70 text-white hover:bg-black">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-sec px-3 py-1.5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#65676b]"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePickImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach image"
                className="text-[#65676b] hover:text-[#1877f2] transition">
                <ImagePlus size={18} />
              </button>

              <button
                type="button"
                onClick={handleAddComment}
                disabled={isSubmitting || (!newComment.trim() && !imageFile)}
                aria-label="Send comment"
                className="text-[#65676b] hover:text-[#1877f2] transition disabled:opacity-40">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-100">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>
                  Delete post permanently?
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will permanently delete this post and all of its data.
                  This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleConfirmDelete}
                  isDisabled={isDeleting}>
                  {isDeleting ? 'Deleting…' : 'Delete Post'}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      <AlertDialog
        isOpen={!!deleteCommentTarget}
        onOpenChange={(open) => !open && setDeleteCommentTarget(null)}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-100">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Delete comment?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>This action cannot be undone.</p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  slot="close"
                  variant="tertiary"
                  isDisabled={isDeletingComment}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleConfirmDeleteComment}
                  isDisabled={isDeletingComment}>
                  {isDeletingComment ? 'Deleting…' : 'Delete'}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </article>
  );
}

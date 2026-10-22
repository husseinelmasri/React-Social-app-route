import { ImageIcon, Send, Smile, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { updatePost } from '../../services/post.service';
import { toast } from 'react-hot-toast';
import type { PostCardI } from '../../types/postCard.types';

const MAX_IMAGE_MB = 5;

type EditpostProps = {
  post: PostCardI;
  onCancel: () => void;
  onUpdated: (updated: Partial<PostCardI> & { _id: string }) => void;
};

export default function Editpost({ post, onCancel, onUpdated }: EditpostProps) {
  const [body, setBody] = useState(post.body ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_IMAGE_MB}MB`);
      e.target.value = '';
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
    e.target.value = '';
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (post.image) setRemoveImage(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const willHaveImage = !!imageFile || (!!post.image && !removeImage);

    if (!body.trim() && !willHaveImage) {
      toast.error('Post must have text or an image');
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await updatePost(post._id, body, imageFile, removeImage);
      toast.success('Post updated');
      onUpdated(updated);
    } catch (err) {
      console.error('Failed to update post', err);

      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ??
          err.response?.data?.errors ??
          'Could not update post')
        : 'Could not update post';

      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`What's on your mind,`}
        rows={4}
        className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200"
      />

      {imagePreview && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <button
            type="button"
            aria-label="Remove image"
            onClick={clearImage}
            className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-white/90 text-gray-700 hover:bg-white">
            <X size={16} />
          </button>
          <img
            src={imagePreview}
            alt="New post image"
            className="max-h-64 w-full object-cover"
          />
        </div>
      )}

      {!imagePreview && post.image && !removeImage && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <button
            type="button"
            aria-label="Remove image"
            onClick={clearImage}
            className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-white/90 text-gray-700 hover:bg-white">
            <X size={16} />
          </button>
          <img
            src={post.image}
            alt="Current post image"
            className="max-h-64 w-full object-cover"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900">
            <ImageIcon
              size={18}
              className="pointer-events-none text-emerald-500"
            />
            Photo/video
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePickImage}
            />
          </label>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900">
            <Smile size={18} className="pointer-events-none text-amber-500" />
            Feeling/activity
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300">
            {isSubmitting ? 'Saving…' : 'Edit Post'}
            <Send size={14} />
          </button>
        </div>
      </div>
    </form>
  );
}

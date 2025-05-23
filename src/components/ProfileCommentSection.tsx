"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ProfileCommentSectionProps {
  profileId: number;
}

interface ProfileComment {
  id: number;
  text: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    profileImage?: string | null;
  };
}

export default function ProfileCommentSection({ profileId }: ProfileCommentSectionProps) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const authLoading = status === 'loading';
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const COMMENTS_PER_PAGE = 5;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/profile-comments?profileId=${profileId}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        setComments(data.comments);
        setTotal(data.total);
        setLoading(false);
      });
  }, [profileId, page]);

  const totalPages = Math.ceil(total / COMMENTS_PER_PAGE);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!newComment.trim()) return;
    setPosting(true);
    const res = await fetch('/api/profile-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment, profileId }),
    });
    setPosting(false);
    if (res.ok) {
      setNewComment('');
      // Refresh comments (show new comment on first page)
      setPage(1);
      setLoading(true);
      fetch(`/api/profile-comments?profileId=${profileId}&page=1`)
        .then(res => res.json())
        .then(data => {
          setComments(data.comments);
          setTotal(data.total);
          setLoading(false);
        });
    } else {
      let data = {};
      try {
        data = await res.json();
      } catch {
        setError('Failed to post comment');
        return;
      }
      setError((data as any).error || 'Failed to post comment');
    }
  }

  async function handleDelete(commentId: number) {
    setDeleteTarget(commentId);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (deleteTarget == null) return;
    const res = await fetch('/api/profile-comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId: deleteTarget }),
    });
    setShowDeleteModal(false);
    setDeleteTarget(null);
    if (res.ok) {
      // Refresh comments
      setLoading(true);
      fetch(`/api/profile-comments?profileId=${profileId}&page=${page}`)
        .then(res => res.json())
        .then(data => {
          setComments(data.comments);
          setTotal(data.total);
          setLoading(false);
        });
    } else {
      let data = {};
      try {
        data = await res.json();
      } catch {
        setError('Failed to delete comment');
        return;
      }
      setError((data as any).error || 'Failed to delete comment');
    }
  }

  function cancelDelete() {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  }

  const canDelete = (comment: ProfileComment) => {
    if (!user) return false;
    return Number(user.id) === comment.user.id || Number(user.id) === profileId;
  };

  const canComment = user && !authLoading;

  return (
    <div>
      {canComment && (
        <form onSubmit={handlePost} className="mb-4 flex flex-col gap-2">
          <textarea
            className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 text-sm lowercase resize-none"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={2}
            maxLength={300}
            disabled={posting}
            placeholder="write a comment..."
          />
          <button
            type="submit"
            className="self-start text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 lowercase"
            disabled={posting || !newComment.trim()}
          >
            {posting ? 'posting...' : 'post comment'}
          </button>
          {error && <span className="text-xs text-red-500 font-bold lowercase mt-1">{error}</span>}
        </form>
      )}
      {loading ? (
        <div className="text-gray-400 lowercase">loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-400 lowercase">no comments yet</div>
      ) : (
        <ul className="space-y-4">
          {comments.map(comment => (
            <li key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex items-center gap-2 mb-1">
                {comment.user.profileImage ? (
                  <img src={comment.user.profileImage} alt={comment.user.username} className="w-6 h-6 rounded-full object-cover border border-black dark:border-white" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 font-bold">{comment.user.username[0].toUpperCase()}</span>
                )}
                <Link href={`/profile/${comment.user.username}`} className="font-bold text-xs lowercase hover:text-blue-600 dark:hover:text-blue-400">
                  {comment.user.username}
                </Link>
                <span className="text-xs text-gray-400 ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
                {canDelete(comment) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="ml-2 text-xs font-bold text-red-600 lowercase hover:underline bg-transparent border-none p-0 shadow-none focus:outline-none"
                    style={{ background: 'none', border: 'none', padding: 0 }}
                  >
                    delete
                  </button>
                )}
              </div>
              <div className="text-gray-700 dark:text-gray-200 text-sm lowercase">{comment.text}</div>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          <button
            className="px-2 py-1 border border-black dark:border-white rounded text-xs font-bold lowercase bg-white dark:bg-[#0A0A0A] text-black dark:text-white disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            prev
          </button>
          <span className="text-xs font-bold lowercase">page {page} of {totalPages}</span>
          <button
            className="px-2 py-1 border border-black dark:border-white rounded text-xs font-bold lowercase bg-white dark:bg-[#0A0A0A] text-black dark:text-white disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            next
          </button>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#18181b] rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <div className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100 lowercase">delete comment?</div>
            <div className="mb-6 text-gray-600 dark:text-gray-300 text-sm">Are you sure you want to delete this comment?</div>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-1 rounded text-xs font-bold lowercase border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
              >
                delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-1 rounded text-xs font-bold lowercase border-2 border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
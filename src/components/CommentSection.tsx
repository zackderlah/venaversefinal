"use client";

import { useEffect, useState } from "react";
import { useSession } from 'next-auth/react';
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: { id: number; username: string; profileImage?: string | null };
}

export default function CommentSection({ reviewId }: { reviewId: number }) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const authLoading = status === 'loading';
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [reviewId]);

  async function fetchComments() {
    setLoading(true);
    const res = await fetch(`/api/reviews/${reviewId}/comments`);
    if (res.ok) {
      setComments(await res.json());
    }
    setLoading(false);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newComment.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/reviews/${reviewId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment }),
    });
    setPosting(false);
    if (res.ok) {
      setNewComment("");
      fetchComments();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to post comment");
    }
  }

  async function handleDelete(commentId: number) {
    setDeleteTarget(commentId);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (deleteTarget == null) return;
    const res = await fetch(`/api/reviews/${reviewId}/comments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: deleteTarget }),
    });
    setShowDeleteModal(false);
    setDeleteTarget(null);
    if (res.ok) {
      fetchComments();
    } else {
      alert("Failed to delete comment");
    }
  }

  function cancelDelete() {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight lowercase">comments</h2>
      {authLoading || loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <div className="text-sm lowercase text-vv-faint">no comments yet.</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start justify-between border-b border-vv-line pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/profile/${comment.user.username}`} className="inline-flex items-center gap-2 group">
                      {comment.user.profileImage ? (
                        <Image
                          src={comment.user.profileImage}
                          alt={comment.user.username}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                          priority
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 font-bold">
                          {comment.user.username[0].toUpperCase()}
                        </span>
                      )}
                      <span className="text-sm font-medium lowercase text-vv-fg group-hover:opacity-70">
                        {comment.user.username}
                      </span>
                    </Link>
                    <span className="text-xs text-vv-faint">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-vv-muted">{comment.text}</div>
                </div>
                {user && comment.user.id === Number(user.id) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="ml-4 text-xs text-red-600 hover:underline"
                  >
                    delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {!authLoading && user ? (
        <form onSubmit={handlePost} className="flex flex-col gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none px-4 py-3 text-sm"
            rows={3}
            maxLength={1000}
            placeholder="add a comment..."
            disabled={posting}
          />
          {error && <div className="text-red-600 text-xs">{error}</div>}
          <button
            type="submit"
            className="vv-btn vv-btn-solid self-start disabled:opacity-40"
            disabled={posting || !newComment.trim()}
          >
            {posting ? "posting..." : "post comment"}
          </button>
        </form>
      ) : !authLoading ? (
        <div className="text-sm lowercase text-vv-faint"><Link href="/login" className="text-vv-fg underline underline-offset-2">log in</Link> to post a comment.</div>
      ) : null}
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
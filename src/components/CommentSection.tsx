"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: { id: number; username: string };
}

export default function CommentSection({ reviewId }: { reviewId: number }) {
  const { user, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

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
    if (!window.confirm("Delete this comment?")) return;
    const res = await fetch(`/api/reviews/${reviewId}/comments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    if (res.ok) {
      fetchComments();
    } else {
      alert("Failed to delete comment");
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      {loading ? (
        <div className="text-gray-500">Loading comments...</div>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <div className="text-gray-400">No comments yet.</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-2 flex items-start justify-between">
                <div>
                  <span className="font-semibold text-sm text-black dark:text-white mr-2">@{comment.user.username}</span>
                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  <div className="text-gray-700 dark:text-gray-200 mt-1 text-sm">{comment.text}</div>
                </div>
                {user && comment.user.id === user.id && (
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
        <form onSubmit={handlePost} className="flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="border rounded p-2 text-sm resize-none"
            rows={3}
            maxLength={1000}
            placeholder="Add a comment..."
            disabled={posting}
          />
          {error && <div className="text-red-600 text-xs">{error}</div>}
          <button
            type="submit"
            className="self-end px-6 py-2 border-2 border-pink-500 bg-black text-white rounded-md text-xs font-bold shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] hover:bg-pink-600 hover:text-black hover:border-black transition-all pixel-bar"
            disabled={posting || !newComment.trim()}
            style={{ fontFamily: 'monospace', letterSpacing: '1px', imageRendering: 'pixelated' }}
          >
            {posting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : !authLoading ? (
        <div className="text-gray-500 text-sm">Log in to post a comment.</div>
      ) : null}
    </div>
  );
}

<style jsx global>{`
  .pixel-bar {
    image-rendering: pixelated;
  }
  .dark .pixel-bar {
    background: #fff;
    color: #0A0A0A;
    border-color: #e11d48;
  }
`}</style> 
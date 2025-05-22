"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function ReviewActionsClient({ review }: { review: any }) {
  const { data: session, status } = useSession();
  const currentUser = session?.user;
  const authLoading = status === 'loading';
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = !authLoading && currentUser && (String(review.userId) === String(currentUser.id) || currentUser.isAdmin);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      });
      setShowDeleteModal(false);
      setDeleting(false);
      if (res.ok) {
        router.push('/');
      } else {
        const errorData = await res.json();
        alert(`Failed to delete review: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setShowDeleteModal(false);
      setDeleting(false);
      alert('An error occurred while deleting the review.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (!canEdit) return null;

  return (
    <>
      <div className="mt-2 flex space-x-3">
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/reviews/${review.id}/edit`); }}
          className="text-xs lowercase font-semibold text-blue-600 hover:underline"
        >
          edit review
        </button>
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); handleDelete(); }}
          className="text-xs lowercase font-semibold text-red-600 hover:underline"
        >
          delete
        </button>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#18181b] rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <div className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100 lowercase">delete review?</div>
            <div className="mb-6 text-gray-600 dark:text-gray-300 text-sm">Are you sure you want to delete this review? This action cannot be undone.</div>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-1 rounded text-xs font-bold lowercase border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                disabled={deleting}
              >
                {deleting ? 'deleting...' : 'delete'}
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-1 rounded text-xs font-bold lowercase border-2 border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={deleting}
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
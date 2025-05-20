import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <LoadingSpinner />
    </div>
  );
} 
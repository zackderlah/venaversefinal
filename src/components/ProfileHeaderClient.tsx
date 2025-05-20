"use client";
import { useState, useEffect } from "react";
import ProfileImageUpload from "./ProfileImageUpload";
import LevelBadge from "./LevelBadge";
import { calculateUserXPAndLevel } from "@/utils/level";
import { CATEGORY_TITLES, GENERIC_TITLES, Category } from "@/data/titles";

export default function ProfileHeaderClient({ user, session, isOwner = false }: { user: any, session: any, isOwner?: boolean }) {
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState("");

  // Title selection modal state
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [unlockedTitles, setUnlockedTitles] = useState<any>(null);
  const [titleTab, setTitleTab] = useState<string>(user.selectedTitleCategory || 'film');
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleError, setTitleError] = useState("");

  // Calculate level from reviews
  const { level } = calculateUserXPAndLevel(user?.reviews || []);

  useEffect(() => {
    if (showTitleModal && isOwner) {
      fetch("/api/users/titles")
        .then(res => res.json())
        .then(data => setUnlockedTitles(data))
        .catch(() => setUnlockedTitles(null));
    }
  }, [showTitleModal, isOwner]);

  const handleSelectTitle = async (title: string, category: string) => {
    setTitleLoading(true);
    setTitleError("");
    try {
      const res = await fetch("/api/users/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });
      if (!res.ok) {
        const data = await res.json();
        setTitleError(data.error || "Failed to set title");
      } else {
        setShowTitleModal(false);
        window.location.reload();
      }
    } catch {
      setTitleError("Failed to set title");
    } finally {
      setTitleLoading(false);
    }
  };

  return (
    <div className="review-card flex flex-col md:flex-row items-center md:items-start gap-8 mb-4 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-[#0A0A0A] relative">
      <div className="flex flex-col items-center gap-2 mr-0 md:mr-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-black dark:border-white bg-gray-100 dark:bg-gray-800">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-6xl text-gray-400">👤</span>
            </div>
          )}
        </div>
        {isOwner && <div className="mt-2"><ProfileImageUpload profileImage={user?.profileImage} /></div>}
      </div>
      <div className="flex-1 w-full flex flex-col justify-center md:justify-start items-center md:items-start">
        {/* Header row: username/title left, level badge right */}
        <div className="flex items-center justify-between w-full mb-2">
          <h1 className="text-4xl font-black tracking-tight lowercase flex items-center gap-3">
            {user.username}
            {user.selectedTitle ? (
              <span
                className={`ml-1 text-sm font-bold lowercase align-middle cursor-pointer hover:underline relative translate-y-[4px] ${
                  user.selectedTitleCategory === 'film' ? 'text-blue-600' :
                  user.selectedTitleCategory === 'music' ? 'text-purple-600' :
                  user.selectedTitleCategory === 'anime' ? 'text-red-600' :
                  user.selectedTitleCategory === 'books' ? 'text-green-600' :
                  user.selectedTitleCategory === 'generic' ? 'text-yellow-700' :
                  'text-gray-700'
                }`}
                title={user.selectedTitleCategory ? `${user.selectedTitleCategory} title` : ''}
                onClick={isOwner ? () => setShowTitleModal(true) : undefined}
                style={isOwner ? { cursor: 'pointer' } : {}}
              >
                {user.selectedTitle}
              </span>
            ) : isOwner && (
              <span
                className="ml-1 text-sm font-bold lowercase align-middle cursor-pointer hover:underline relative translate-y-[4px] text-gray-400"
                onClick={() => setShowTitleModal(true)}
              >
                add title
              </span>
            )}
          </h1>
          <LevelBadge level={level} href={`/profile/${user.username}/level`} />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-300 text-sm mb-2 lowercase">
          <span>member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</span>
          <span>•</span>
          <a href={`/profile/${user.username}/reviews`} className="underline hover:text-blue-600 cursor-pointer">
            {user?.reviews.length || 0} reviews
          </a>
        </div>
        <div className="text-gray-600 dark:text-gray-300 text-base lowercase mt-2 text-center md:text-left w-full flex items-center gap-2">
          {isOwner ? (
            editingBio ? (
              <form className="flex flex-col w-full gap-2" onSubmit={async (e) => {
                e.preventDefault();
                setBioLoading(true);
                setBioError("");
                try {
                  const res = await fetch("/api/users/bio", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bio }),
                  });
                  if (!res.ok) throw new Error("Failed to update bio");
                  window.location.reload();
                } catch (err) {
                  setBioError("failed to update bio");
                } finally {
                  setBioLoading(false);
                }
              }}>
                <textarea
                  className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 text-sm lowercase resize-none"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  maxLength={300}
                  disabled={bioLoading}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1 text-xs font-bold border-2 border-black dark:border-white rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 lowercase hover:bg-blue-200 hover:dark:bg-blue-800 transition-all" disabled={bioLoading}>save</button>
                  <button type="button" className="px-3 py-1 text-xs font-bold border-2 border-black dark:border-white rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 lowercase hover:bg-gray-200 hover:dark:bg-gray-700 transition-all" onClick={() => { setEditingBio(false); setBio(user?.bio || ""); }} disabled={bioLoading}>cancel</button>
                </div>
                {bioError && <span className="text-xs text-red-500 font-bold lowercase mt-1">{bioError}</span>}
              </form>
            ) : (
              <div className="flex flex-col w-full gap-2">
                <span className="flex-1">{user?.bio || "no bio yet. click edit to add one!"}</span>
                <span
                  className="text-xs font-bold text-blue-600 lowercase hover:text-blue-800 cursor-pointer self-start"
                  onClick={() => setEditingBio(true)}
                  aria-label="edit bio"
                >edit bio</span>
              </div>
            )
          ) : (
            <span className="flex-1">{user?.bio || "no bio yet."}</span>
          )}
        </div>
        {/* Title selection modal */}
        {showTitleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-[#18181b] rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold" onClick={() => setShowTitleModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4 lowercase">select your title</h2>
              {unlockedTitles ? (
                <>
                  <div className="mb-2 font-bold text-sm text-gray-600 dark:text-gray-400 lowercase">categories</div>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {['film','music','anime','books','generic'].map(tab => (
                      <button
                        key={tab}
                        className={`px-3 py-1 rounded text-xs font-bold lowercase border-2 transition-colors duration-150 ${
                          titleTab === tab ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-700'
                        } ${
                          tab === 'film' ? 'text-blue-600' :
                          tab === 'music' ? 'text-purple-600' :
                          tab === 'anime' ? 'text-red-600' :
                          tab === 'books' ? 'text-green-600' :
                          tab === 'generic' ? 'text-yellow-700' :
                          ''
                        }`}
                        onClick={() => setTitleTab(tab)}
                        type="button"
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="mb-2 font-bold text-sm text-gray-600 dark:text-gray-400 lowercase">titles unlocked</div>
                  <div className="flex flex-col gap-1 mb-2">
                    {(titleTab === 'generic' ? unlockedTitles.unlockedGeneric : unlockedTitles.unlockedByCategory[titleTab]).map((t: string, idx: number) => (
                      <button
                        key={t}
                        className={`text-left w-full py-1 px-2 rounded text-xs font-bold lowercase transition-colors duration-150 ${
                          titleTab === 'film' ? 'text-blue-600' :
                          titleTab === 'music' ? 'text-purple-600' :
                          titleTab === 'anime' ? 'text-red-600' :
                          titleTab === 'books' ? 'text-green-600' :
                          titleTab === 'generic' ? 'text-yellow-700' :
                          ''
                        } ${
                          user.selectedTitle === t && user.selectedTitleCategory === titleTab ? 'font-extrabold underline' : ''
                        }`}
                        disabled={titleLoading}
                        onClick={() => handleSelectTitle(t, titleTab)}
                        type="button"
                        style={{ background: 'none', border: 'none' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {titleError && <div className="text-xs text-red-500 font-bold mb-2">{titleError}</div>}
                  {titleLoading && <div className="text-xs text-gray-500">updating...</div>}
                </>
              ) : (
                <div className="text-gray-500 text-sm">loading titles...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

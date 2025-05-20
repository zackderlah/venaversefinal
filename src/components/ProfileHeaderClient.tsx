"use client";
import { useState } from "react";
import ProfileImageUpload from "./ProfileImageUpload";
import LevelBadge from "./LevelBadge";
import { calculateUserXPAndLevel } from "@/utils/level";

export default function ProfileHeaderClient({ user, session, isOwner = false }: { user: any, session: any, isOwner?: boolean }) {
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState("");

  // Calculate level from reviews
  const { level } = calculateUserXPAndLevel(user?.reviews || []);

  return (
    <div className="review-card flex flex-col md:flex-row items-center md:items-start gap-8 mb-4 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-[#0A0A0A] relative">
      {/* Level badge top right */}
      <div className="absolute top-4 right-4 z-10">
        <LevelBadge level={level} href={`/profile/${user.username}/level`} />
      </div>
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
        <h1 className="text-4xl font-black tracking-tight lowercase mb-2">{user.username}</h1>
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
              <>
                <span className="flex-1">{user?.bio || "no bio yet. click edit to add one!"}</span>
                <button
                  className="ml-2 px-2 py-1 text-xs font-bold border border-black dark:border-white rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 lowercase hover:bg-gray-200 hover:dark:bg-gray-700 transition-all"
                  onClick={() => setEditingBio(true)}
                  aria-label="edit bio"
                >edit bio</button>
              </>
            )
          ) : (
            <span className="flex-1">{user?.bio || "no bio yet."}</span>
          )}
        </div>
      </div>
    </div>
  );
}

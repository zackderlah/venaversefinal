"use client";
import { useState } from "react";
import LevelBadge from "./LevelBadge";
import BannerPicker from "./BannerPicker";
import EditProfileModal from "./EditProfileModal";
import TitlePicker from "./TitlePicker";
import { bannerClassName, bannerStyle, getBanner } from "@/data/banners";
import { calculateUserXPAndLevel } from "@/utils/level";
import { FILM_TV_CATEGORY } from "@/lib/reviewCategories";

export default function ProfileHeaderClient({ user, session, isOwner = false }: { user: any, session: any, isOwner?: boolean }) {

  const [showTitleModal, setShowTitleModal] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const banner = getBanner(user.selectedBanner);

  // Calculate level from reviews
  const { level } = calculateUserXPAndLevel(user?.reviews || []);

  return (
    <div className="relative isolate flex flex-col items-center gap-6 pb-4 md:flex-row md:items-start md:gap-8 md:pb-6">
      {banner && (
        // Bleeds to the frame edges and up to the site header; the overlay keeps text readable.
        <div
          className="pointer-events-none absolute -bottom-6 -left-5 -right-5 -top-12 -z-10 md:-bottom-8 md:-left-8 md:-right-8 md:-top-16"
          aria-hidden="true"
        >
          <div className={`absolute inset-0 ${bannerClassName(banner)}`} style={bannerStyle(banner)} />
          <div className="vv-banner-scrim absolute inset-0" />
        </div>
      )}
      {/* Profile Picture Section - Centered on mobile */}
      <div className="flex flex-col items-center gap-3 md:gap-2 mr-0 md:mr-8 w-full md:w-auto">
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-vv-line bg-vv-raised flex-shrink-0">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-4xl md:text-6xl text-gray-400">👤</span>
            </div>
          )}
        </div>
      </div>
      
      {/* User Info Section */}
      <div className="flex-1 w-full flex flex-col items-center md:items-start gap-3 md:gap-2">
        {/* Username, Title, and Level - Better mobile layout */}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between w-full gap-2 md:gap-0">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3">
            <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.035em] lowercase text-center md:text-[2.75rem] md:text-left">
              {user.username}
            </h1>
            {user.selectedTitle ? (
              <span
                className={`text-xs md:text-sm font-bold lowercase ${
                  (user.selectedTitleCategory === FILM_TV_CATEGORY || user.selectedTitleCategory === 'film') ? 'text-blue-600' :
                  user.selectedTitleCategory === 'music' ? 'text-purple-600' :
                  user.selectedTitleCategory === 'anime' ? 'text-red-600' :
                  user.selectedTitleCategory === 'books' ? 'text-green-600' :
                  user.selectedTitleCategory === 'games' ? 'text-cyan-600' :
                  user.selectedTitleCategory === 'generic' ? 'text-yellow-700' :
                  'text-gray-700'
                }`}
                title={user.selectedTitleCategory ? `${user.selectedTitleCategory} title` : ''}
              >
                {user.selectedTitle}
              </span>
            ) : null}
          </div>
          <div className="md:ml-auto">
            <LevelBadge level={level} href={`/profile/${user.username}/level`} />
          </div>
        </div>
        
        {/* Member Info - Better spacing on mobile */}
        <div className="vv-eyebrow flex flex-col items-center justify-center gap-1 md:flex-row md:justify-start md:gap-4">
          <span>member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</span>
          <span className="hidden md:inline">•</span>
          <a href={`/profile/${user.username}/reviews`} className="underline underline-offset-2 hover:text-vv-fg">
            {user?.reviews.length || 0} reviews
          </a>
        </div>
        
        {/* Bio Section - Better mobile formatting */}
        <p className="mt-2 w-full text-center text-[15px] leading-relaxed text-vv-muted lowercase md:text-left">
          {user?.bio || "no bio yet."}
        </p>
        {isOwner && (
          <button type="button" className="vv-btn mt-1" onClick={() => setShowEditProfile(true)}>
            edit profile
          </button>
        )}
        {showEditProfile && (
          <EditProfileModal
            user={user}
            onClose={() => setShowEditProfile(false)}
            onChangeTitle={() => { setShowEditProfile(false); setShowTitleModal(true); }}
            onChangeBanner={() => { setShowEditProfile(false); setShowBannerPicker(true); }}
          />
        )}
        {showBannerPicker && (
          <BannerPicker selectedBanner={user.selectedBanner ?? null} onClose={() => setShowBannerPicker(false)} />
        )}
        {showTitleModal && (
          <TitlePicker
            selectedTitle={user.selectedTitle ?? null}
            selectedTitleCategory={user.selectedTitleCategory ?? null}
            onClose={() => setShowTitleModal(false)}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ProfileImageUpload from "./ProfileImageUpload";
import { bannerClassName, bannerStyle, getBanner } from "@/data/banners";

/** One place for the profile owner to change their photo, bio, title and banner. */
export default function EditProfileModal({
  user,
  onClose,
  onChangeTitle,
  onChangeBanner,
}: {
  user: any;
  onClose: () => void;
  /** Close this panel and open the title picker. */
  onChangeTitle: () => void;
  /** Close this panel and open the banner picker. */
  onChangeBanner: () => void;
}) {
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const banner = getBanner(user.selectedBanner);
  const bioChanged = bio !== (user?.bio || "");

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const saveBio = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (!res.ok) throw new Error();
      window.location.reload();
    } catch {
      setError("failed to update bio");
      setSaving(false);
    }
  };

  const sectionLabel = "vv-eyebrow mb-3 block";

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="vv-shell vv-panel relative flex max-h-[min(92vh,760px)] w-full max-w-lg flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-heading"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-vv-line px-6 py-4">
          <h2 id="edit-profile-heading" className="text-xl font-semibold tracking-tight lowercase">
            edit profile
          </h2>
          <button type="button" onClick={onClose} className="vv-icon-btn shrink-0" aria-label="close">
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-6 py-6">
          <section>
            <span className={sectionLabel}>photo</span>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-vv-line bg-vv-raised">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <ProfileImageUpload profileImage={user?.profileImage} />
            </div>
          </section>

          <section>
            <label htmlFor="edit-profile-bio" className={sectionLabel}>bio</label>
            <textarea
              id="edit-profile-bio"
              className="w-full resize-none px-4 py-3 text-sm lowercase"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              disabled={saving}
              placeholder="say something about yourself"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-vv-faint">{bio.length}/300</span>
              <button
                type="button"
                className="vv-btn vv-btn-solid disabled:opacity-40"
                disabled={saving || !bioChanged}
                onClick={saveBio}
              >
                {saving ? "saving..." : "save bio"}
              </button>
            </div>
            {error && <p className="mt-2 text-xs lowercase text-red-500">{error}</p>}
          </section>

          <section>
            <span className={sectionLabel}>title</span>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm lowercase text-vv-muted">{user.selectedTitle || "no title selected"}</span>
              <button type="button" className="vv-btn" onClick={onChangeTitle}>
                change title
              </button>
            </div>
          </section>

          <section>
            <span className={sectionLabel}>banner</span>
            <div className="flex items-center gap-3">
              <span
                className={`block h-12 flex-1 rounded-lg border border-vv-line ${banner ? bannerClassName(banner) : "bg-vv-raised"}`}
                style={banner ? bannerStyle(banner) : undefined}
                aria-hidden="true"
              />
              <button type="button" className="vv-btn shrink-0" onClick={onChangeBanner}>
                {banner ? "change banner" : "add banner"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}

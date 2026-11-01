"use client";

import { useState, ChangeEvent } from "react";
import { useSession } from 'next-auth/react';

export default function ProfileImageUpload({ profileImage }: { profileImage?: string }) {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'venaverse');
      const cloudName = 'dgpkcrmkf'; // TODO: Replace with your actual cloud name
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Cloudinary upload failed');
      // Update profile image in DB
      const response = await fetch("/api/users/profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: data.secure_url }),
      });
      if (!response.ok) throw new Error('Failed to update profile image in DB');
      // Refresh the session token so the header avatar picks up the new image.
      await update();
      window.location.reload();
    } catch (err) {
      setError("Failed to update profile image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <label htmlFor="profile-upload" className="vv-btn cursor-pointer">
        {uploading ? 'uploading...' : 'upload new photo'}
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-red-500 text-xs font-bold lowercase mt-1 text-center">{error}</p>}
    </div>
  );
} 
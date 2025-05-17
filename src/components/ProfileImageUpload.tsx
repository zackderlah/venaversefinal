"use client";

import { useState, ChangeEvent } from "react";
import { useSession } from 'next-auth/react';

export default function ProfileImageUpload({ profileImage }: { profileImage?: string }) {
  console.log('ProfileImageUpload received profileImage:', profileImage);
  const { data: session } = useSession();
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
      window.location.reload();
    } catch (err) {
      setError("Failed to update profile image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border border-black dark:border-white bg-gray-100 dark:bg-gray-800">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : user?.image ? (
          <img
            src={user.image}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-4xl text-gray-400">👤</span>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none rounded-full border border-black dark:border-white" style={{boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}} />
      </div>
      <label htmlFor="profile-upload" className="mt-2 px-4 py-2 bg-white dark:bg-[#0A0A0A] border-2 border-black dark:border-white rounded-lg font-black text-xs lowercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:dark:bg-gray-900 transition-all">
        {uploading ? 'uploading...' : 'change profile photo'}
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-red-500 text-xs font-bold lowercase mt-1">{error}</p>}
    </div>
  );
} 
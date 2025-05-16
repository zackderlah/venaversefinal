"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CldUploadWidget } from "next-cloudinary";

export default function ProfileImageUpload() {
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (result: any) => {
    try {
      setUploading(true);
      setError("");
      
      const response = await fetch("/api/users/profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: result.info.secure_url }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile image");
      }

      const data = await response.json();
      await refreshUser();
    } catch (err) {
      setError("Failed to update profile image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-black dark:border-white">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-4xl text-gray-400">👤</span>
          </div>
        )}
      </div>

      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}
        onUpload={handleUpload}
      >
        {({ open }) => (
          <button
            onClick={() => open()}
            disabled={uploading}
            className="px-4 py-2 text-sm border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black rounded-md font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-gray-900 hover:dark:bg-gray-100 transition-all pixel-bar"
            style={{ fontFamily: 'monospace', letterSpacing: '1px', imageRendering: 'pixelated', textTransform: 'lowercase' }}
          >
            {uploading ? "uploading..." : "change picture"}
          </button>
        )}
      </CldUploadWidget>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
} 
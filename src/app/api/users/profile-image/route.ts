import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "profile_pictures",
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    // Update user's profile image in database
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { profileImage: result.secure_url }
    });

    return NextResponse.json({ profileImage: user.profileImage });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
} 
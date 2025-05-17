import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log('Received profile image upload request');
    const session = await getServerSession(authOptions);
    console.log('Session in API route:', session);
    if (!session?.user?.email) {
      console.error('No user email in session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    const { imageUrl } = body;
    if (!imageUrl) {
      console.error('No imageUrl in request body');
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Fetch user by email to get the id
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    console.log('Fetched user by email:', dbUser);
    if (!dbUser) {
      console.error('No user found in DB for email:', session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try updating user's profile image by id
    let user;
    try {
      console.log('Attempting to update user id:', dbUser.id, 'with imageUrl:', imageUrl);
      user = await prisma.user.update({
        where: { id: dbUser.id },
        data: { profileImage: imageUrl }
      });
      console.log('After update, user.profileImage:', user.profileImage);
    } catch (updateError) {
      console.error('Prisma update error:', updateError);
      return NextResponse.json({ error: 'Prisma update error', details: String(updateError) }, { status: 500 });
    }

    return NextResponse.json({ profileImage: user.profileImage });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { error: "Failed to update profile image", details: String(error) },
      { status: 500 }
    );
  }
} 
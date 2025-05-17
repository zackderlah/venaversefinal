import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { bio } = body;
    if (typeof bio !== "string" || bio.length > 300) {
      return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { bio },
    });
    return NextResponse.json({ bio: user.bio });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update bio" }, { status: 500 });
  }
} 
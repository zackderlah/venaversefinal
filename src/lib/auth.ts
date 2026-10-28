import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const TOKEN_REFRESH_MS = 5 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        // Try to find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
          image: user.profileImage,
          isAdmin: user.isAdmin,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async jwt({ token, user }) {
      // If user is present (on login), set token fields
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.isAdmin = user.isAdmin;
        token.refreshedAt = Date.now();
      } else if (token.email && Date.now() - ((token.refreshedAt as number) || 0) > TOKEN_REFRESH_MS) {
        // Refresh profileImage/isAdmin from the DB occasionally rather than on every
        // session read: this callback runs on every page render and API call.
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { profileImage: true, isAdmin: true },
        });
        if (dbUser) {
          token.picture = dbUser.profileImage;
          token.isAdmin = dbUser.isAdmin;
        }
        token.refreshedAt = Date.now();
      }
      return token;
    }
  }
}; 
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ghlLocationId: user.ghlLocationId,
          ghlApiToken: user.ghlApiToken, // per-client sub-account token
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Ensure user exists in our DB before allowing Google login
        if (!user.email) return false;
        
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        
        if (!dbUser) {
          // You could throw an error here, but returning false redirects them to an unauthenticated state
          return false; 
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        if ('role' in user) {
          // Credentials login (user object came from authorize function)
          token.id = user.id;
          token.role = (user as any).role;
          token.ghlLocationId = (user as any).ghlLocationId;
          token.ghlApiToken = (user as any).ghlApiToken;
        } else {
          // Google OAuth login (user object came from Google profile)
          // We need to fetch their role and GHL info from our DB
          if (user.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email }
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role;
              token.ghlLocationId = dbUser.ghlLocationId;
              token.ghlApiToken = dbUser.ghlApiToken;
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).ghlLocationId = token.ghlLocationId as string;
        (session.user as any).ghlApiToken = token.ghlApiToken as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

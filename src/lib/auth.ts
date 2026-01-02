import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow users that exist in admin_users table
      if (!user.email) {
        return false;
      }

      const adminUser = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, user.email))
        .limit(1);

      if (adminUser.length === 0) {
        // User not in admin_users table - deny access
        return '/admin/login?error=AccessDenied';
      }

      // Update googleId and image if not set
      if (account?.providerAccountId && profile) {
        await db
          .update(adminUsers)
          .set({
            googleId: account.providerAccountId,
            image: (profile as { picture?: string }).picture || null,
            updatedAt: new Date(),
          })
          .where(eq(adminUsers.email, user.email));
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        // Fetch admin user data
        const adminUser = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, token.email))
          .limit(1);

        if (adminUser.length > 0) {
          session.user.id = adminUser[0].id;
          session.user.role = adminUser[0].role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
});

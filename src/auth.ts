import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import PostgresAdapter from '@auth/pg-adapter';
import { getPool } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(getPool()),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user, trigger }) {
      if (user) token.id = user.id;
      // Set once when the adapter creates the account; read by analytics
      if (trigger === 'signUp') token.isNewUser = true;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.isNewUser) session.isNewUser = true;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
});

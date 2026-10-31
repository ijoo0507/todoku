import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    // True when this account was created during the current sign-in
    isNewUser?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isNewUser?: boolean;
  }
}

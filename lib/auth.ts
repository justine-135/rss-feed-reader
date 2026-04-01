import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authConfigReady = Boolean(githubClientId && githubClientSecret && authSecret);

export const authOptions: NextAuthOptions = {
  providers: authConfigReady
    ? [
        GithubProvider({
          clientId: githubClientId!,
          clientSecret: githubClientSecret!,
        }),
      ]
    : [],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
      }

      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const target = new URL(url);

        if (target.origin === baseUrl) {
          return url;
        }
      } catch {}

      return `${baseUrl}/dashboard`;
    },
  },
  logger: {
    error(code, metadata) {
      const message =
        metadata && typeof metadata === "object" && "message" in metadata
          ? String(metadata.message)
          : "";

      // Ignore stale auth cookies from previous session strategies or secrets.
      if (code === "JWT_SESSION_ERROR" && message.includes("decryption operation failed")) {
        return;
      }

      console.error(`[next-auth][error][${code}]`, metadata);
    },
  },
  secret: authSecret,
};

export async function getSafeServerSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("Failed to read auth session.", error);
    return null;
  }
}

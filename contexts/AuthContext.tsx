
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { authClient, setBearerToken, clearAuthTokens, getBearerToken } from "@/lib/auth";
import { useRouter, useSegments } from "expo-router";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function openOAuthPopup(provider: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const popupUrl = `${window.location.origin}/auth-popup?provider=${provider}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      popupUrl,
      "oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      reject(new Error("Failed to open popup. Please allow popups."));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "oauth-success" && event.data?.token) {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        resolve(event.data.token);
      } else if (event.data?.type === "oauth-error") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        reject(new Error(event.data.error || "OAuth failed"));
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        reject(new Error("Authentication cancelled"));
      }
    }, 500);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Initial session check on mount
  useEffect(() => {
    console.log("[AuthProvider] App launched - checking for existing session");
    checkAndRestoreSession();

    // Listen for deep links (e.g. from social auth redirects)
    const subscription = Linking.addEventListener("url", (event) => {
      console.log("[AuthProvider] Deep link received:", event.url);
      // Allow time for the client to process the token if needed
      setTimeout(() => {
        console.log("[AuthProvider] Refreshing session after deep link");
        fetchUser();
      }, 500);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Navigation guard: redirect based on auth state
  useEffect(() => {
    if (loading) {
      console.log("[AuthProvider] Still loading session, skipping navigation guard");
      return;
    }

    const inAuthGroup = segments[0] === "auth" || segments[0] === "auth-popup" || segments[0] === "auth-callback";
    const inAdminGroup = segments[0] === "(admin)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inPublicRoute = segments[0] === "go" || segments[0] === "memorial";

    console.log("[AuthProvider] Navigation guard check", {
      user: user ? user.email : "null",
      segments,
      inAuthGroup,
      inAdminGroup,
      inTabsGroup,
      inPublicRoute,
    });

    if (user && inAuthGroup) {
      // User is logged in but on auth screen -> redirect to admin dashboard
      console.log("[AuthProvider] User logged in, redirecting from auth to admin dashboard");
      router.replace("/(admin)");
    } else if (!user && (inAdminGroup || (inTabsGroup && segments[1] !== "(home)"))) {
      // User is not logged in but trying to access protected routes -> redirect to auth
      console.log("[AuthProvider] User not logged in, redirecting to auth screen");
      router.replace("/auth");
    } else if (!user && !inAuthGroup && !inPublicRoute && segments.length === 0) {
      // User is not logged in and on root -> redirect to auth
      console.log("[AuthProvider] User not logged in on root, redirecting to auth screen");
      router.replace("/auth");
    }
  }, [user, loading, segments]);

  /**
   * Check for existing session on app launch
   * This ensures login persistence across app restarts
   */
  const checkAndRestoreSession = async () => {
    try {
      setLoading(true);
      console.log("[AuthProvider] Checking SecureStore for existing token...");
      
      // First, check if we have a stored token
      const storedToken = await getBearerToken();
      
      if (storedToken) {
        console.log("[AuthProvider] Found stored token, attempting to restore session");
        // We have a token, try to get the session
        const session = await authClient.getSession();
        
        if (session?.data?.user) {
          console.log("[AuthProvider] Session restored successfully:", session.data.user.email);
          setUser(session.data.user as User);
          
          // Update token if it changed (token rotation)
          if (session.data.session?.token && session.data.session.token !== storedToken) {
            console.log("[AuthProvider] Token rotated, updating SecureStore");
            await setBearerToken(session.data.session.token);
          }
        } else {
          console.log("[AuthProvider] Token exists but session invalid, clearing tokens");
          await clearAuthTokens();
          setUser(null);
        }
      } else {
        console.log("[AuthProvider] No stored token found, user needs to log in");
        setUser(null);
      }
    } catch (error) {
      console.error("[AuthProvider] Failed to restore session:", error);
      // Clear potentially corrupted tokens
      await clearAuthTokens();
      setUser(null);
    } finally {
      setLoading(false);
      console.log("[AuthProvider] Session check complete");
    }
  };

  const fetchUser = async () => {
    try {
      console.log("[AuthProvider] Fetching user session from Better Auth...");
      const session = await authClient.getSession();
      
      if (session?.data?.user) {
        console.log("[AuthProvider] Session found, user:", session.data.user.email);
        setUser(session.data.user as User);
        
        // Sync token to SecureStore for utils/api.ts
        if (session.data.session?.token) {
          console.log("[AuthProvider] Syncing bearer token to SecureStore");
          await setBearerToken(session.data.session.token);
        }
      } else {
        console.log("[AuthProvider] No session found, user is logged out");
        setUser(null);
        await clearAuthTokens();
      }
    } catch (error) {
      console.error("[AuthProvider] Failed to fetch user session:", error);
      setUser(null);
      await clearAuthTokens();
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("[AuthProvider] Signing in with email:", email);
      const result = await authClient.signIn.email({ email, password });
      
      // Store token immediately after successful sign-in
      if (result?.data?.session?.token) {
        console.log("[AuthProvider] Sign-in successful, storing token");
        await setBearerToken(result.data.session.token);
      }
      
      await fetchUser();
      console.log("[AuthProvider] Email sign-in successful");
    } catch (error) {
      console.error("[AuthProvider] Email sign in failed:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      console.log("[AuthProvider] Signing up with email:", email);
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      
      // Store token immediately after successful sign-up
      if (result?.data?.session?.token) {
        console.log("[AuthProvider] Sign-up successful, storing token");
        await setBearerToken(result.data.session.token);
      }
      
      await fetchUser();
      console.log("[AuthProvider] Email sign-up successful");
    } catch (error) {
      console.error("[AuthProvider] Email sign up failed:", error);
      throw error;
    }
  };

  const signInWithSocial = async (provider: "google" | "apple" | "github") => {
    try {
      console.log("[AuthProvider] Signing in with", provider);
      if (Platform.OS === "web") {
        const token = await openOAuthPopup(provider);
        await setBearerToken(token);
        await fetchUser();
      } else {
        // Native: Use expo-linking to generate a proper deep link
        const callbackURL = Linking.createURL("/(admin)");
        console.log("[AuthProvider] Using callback URL:", callbackURL);
        
        const result = await authClient.signIn.social({
          provider,
          callbackURL,
        });
        
        console.log("[AuthProvider] Social sign-in initiated, result:", result);
        
        // The redirect will reload the app or be handled by deep linking
        // fetchUser will be called via the URL event listener
        // But we'll also call it here in case the redirect doesn't trigger
        setTimeout(() => {
          console.log("[AuthProvider] Checking session after social sign-in");
          fetchUser();
        }, 1000);
      }
      console.log("[AuthProvider] Social sign-in successful");
    } catch (error) {
      console.error(`[AuthProvider] ${provider} sign in failed:`, error);
      throw error;
    }
  };

  const signInWithGoogle = () => signInWithSocial("google");
  const signInWithApple = () => signInWithSocial("apple");
  const signInWithGitHub = () => signInWithSocial("github");

  const signOut = async () => {
    try {
      console.log("[AuthProvider] Signing out...");
      await authClient.signOut();
      console.log("[AuthProvider] Sign out API call successful");
    } catch (error) {
      console.error("[AuthProvider] Sign out failed (API):", error);
    } finally {
      // Always clear local state, even if API call fails (ONE CLICK OUT)
      console.log("[AuthProvider] Clearing local auth state");
      setUser(null);
      await clearAuthTokens();
      console.log("[AuthProvider] Sign out complete, redirecting to auth");
      router.replace("/auth");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithGitHub,
        signOut,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

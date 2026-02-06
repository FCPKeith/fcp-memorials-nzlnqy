
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.backendUrl || "https://pwesm38m2s562pv8mecxsgwjqsk4267e.app.specular.dev";

export const BEARER_TOKEN_KEY = "fcp-memorials_bearer_token";
export const SESSION_TOKEN_KEY = "fcp-memorials_session_token";

// Platform-specific storage: localStorage for web, SecureStore for native
const storage = Platform.OS === "web"
  ? {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      deleteItem: (key: string) => localStorage.removeItem(key),
    }
  : SecureStore;

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "fcpmemorials",
      storagePrefix: "fcp-memorials",
      storage,
    }),
  ],
});

/**
 * Store bearer token securely
 * iOS: Keychain via SecureStore
 * Android: EncryptedSharedPreferences via SecureStore
 * Web: localStorage
 */
export async function setBearerToken(token: string) {
  console.log("[Auth] Storing bearer token securely");
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(BEARER_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(BEARER_TOKEN_KEY, token);
    }
    console.log("[Auth] Bearer token stored successfully");
  } catch (error) {
    console.error("[Auth] Failed to store bearer token:", error);
    throw error;
  }
}

/**
 * Get bearer token from secure storage
 */
export async function getBearerToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(BEARER_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(BEARER_TOKEN_KEY);
    }
  } catch (error) {
    console.error("[Auth] Failed to retrieve bearer token:", error);
    return null;
  }
}

/**
 * Clear all authentication tokens
 */
export async function clearAuthTokens() {
  console.log("[Auth] Clearing all authentication tokens");
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(BEARER_TOKEN_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      // Clear all Better Auth related keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("fcp-memorials")) {
          localStorage.removeItem(key);
        }
      });
    } else {
      await SecureStore.deleteItemAsync(BEARER_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
      // Clear all Better Auth related keys
      const allKeys = await SecureStore.getItemAsync("fcp-memorials_keys");
      if (allKeys) {
        const keys = JSON.parse(allKeys);
        for (const key of keys) {
          await SecureStore.deleteItemAsync(key);
        }
      }
    }
    console.log("[Auth] All tokens cleared successfully");
  } catch (error) {
    console.error("[Auth] Failed to clear tokens:", error);
  }
}

export { API_URL };

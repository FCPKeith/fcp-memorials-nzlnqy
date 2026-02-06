
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Modal } from "@/components/ui/Modal";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const router = useRouter();
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signInWithGitHub, loading: authLoading } =
    useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // If user is already logged in, redirect to admin
  useEffect(() => {
    if (!authLoading && user) {
      console.log("AuthScreen: User already logged in, redirecting to admin");
      router.replace("/(admin)");
    }
  }, [user, authLoading]);

  // Show loading state while checking session
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter email and password");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      console.log("AuthScreen: Attempting email auth, mode:", mode);
      if (mode === "signin") {
        await signInWithEmail(email, password);
        console.log("AuthScreen: Sign-in successful, navigation will be handled by AuthContext");
      } else {
        await signUpWithEmail(email, password, name);
        console.log("AuthScreen: Sign-up successful");
        setSuccessMessage("Account created successfully!");
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error("AuthScreen: Email auth failed:", error);
      setErrorMessage(error.message || "Authentication failed");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "apple" | "github") => {
    setLoading(true);
    try {
      console.log("AuthScreen: Attempting social auth with", provider);
      if (provider === "google") {
        await signInWithGoogle();
      } else if (provider === "apple") {
        await signInWithApple();
      } else if (provider === "github") {
        await signInWithGitHub();
      }
      console.log("AuthScreen: Social auth successful, navigation will be handled by AuthContext");
    } catch (error: any) {
      console.error("AuthScreen: Social auth failed:", error);
      setErrorMessage(error.message || "Authentication failed");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>FCP Memorials</Text>
          <Text style={styles.subtitle}>
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </Text>

          {mode === "signup" && (
            <TextInput
              style={styles.input}
              placeholder="Name (optional)"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === "signin" ? "Sign In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            <Text style={styles.switchModeText}>
              {mode === "signin"
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialAuth("google")}
            disabled={loading}
          >
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={() => handleSocialAuth("apple")}
              disabled={loading}
            >
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Continue with Apple
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: "OK",
            onPress: () => setShowErrorModal(false),
            style: "primary",
          },
        ]}
      />

      <Modal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        buttons={[
          {
            text: "Continue",
            onPress: () => setShowSuccessModal(false),
            style: "primary",
          },
        ]}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  loadingText: {
    marginTop: 16,
    color: "#fff",
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
    color: "#999",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#2a2a2a",
    color: "#fff",
  },
  primaryButton: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchModeText: {
    color: "#007AFF",
    fontSize: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 14,
  },
  socialButton: {
    height: 50,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#2a2a2a",
  },
  socialButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  appleButton: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  appleButtonText: {
    color: "#fff",
  },
});

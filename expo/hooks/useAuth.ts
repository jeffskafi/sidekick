import { useState, useCallback } from 'react';
import * as WebBrowser from "expo-web-browser";
import { useOAuth, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "./useWarmUpBrowser";
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const { isSignedIn, isLoaded, signOut: clerkSignOut, getToken } = useClerkAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { startOAuthFlow } = useOAuth({ 
    strategy: "oauth_google",
    redirectUrl: Constants.expoConfig?.scheme + "://oauth-native-callback",
  });
  
  useWarmUpBrowser();

  const signInWithGoogle = useCallback(async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const result = await startOAuthFlow();
      
      if (result.createdSessionId) {
        if (result.setActive) {
          await result.setActive({ session: result.createdSessionId });
        }
        console.log("OAuth success, session created");
      } else {
        console.log("OAuth flow failed", result);
      }
    } catch (err) {
      console.error("OAuth error", err);
    } finally {
      setIsAuthenticating(false);
    }
  }, [startOAuthFlow]);

  const signOut = useCallback(async () => {
    try {
      await clerkSignOut();
    } catch (err) {
      console.error("Error signing out", err);
    }
  }, [clerkSignOut]);

  return { 
    isSignedIn, 
    isLoading: !isLoaded || isAuthenticating, 
    signIn: signInWithGoogle, 
    signOut,
    getToken,
  };
}
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

export const CLERK_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY;
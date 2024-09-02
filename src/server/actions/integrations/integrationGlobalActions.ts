'use server'

import { auth, clerkClient } from '@clerk/nextjs/server';

export async function getIntegrations() {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const integrations = [
    'oauth_google',
    'oauth_github',
  ] as const;

  try {
    const integrationData = await Promise.all(
      integrations.map(async (provider) => {
        try {
          const authInfo = await clerkClient().users.getUserOauthAccessToken(userId, provider);
          const data = authInfo.data[0];
          return data ? {
          provider,
          externalAccountId: data.externalAccountId,
          token: data.token,
          scopes: data.scopes,
            tokenSecret: data.tokenSecret
          } : null;
        } catch (error) {
          console.error(`Error fetching ${provider} integration:`, error);
          return null;
        }
      })
    );

    return integrationData.filter(Boolean);
  } catch (error) {
    console.error("Error fetching integrations:", error);
    throw new Error('Failed to fetch integrations');
  }
}

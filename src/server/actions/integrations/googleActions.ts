'use server'

import { auth, clerkClient } from '@clerk/nextjs/server';

interface GoogleCalendarEvent {
    id: string;
    summary: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    // Add other relevant fields as needed
}

interface GoogleUserProfile {
    id: string;
    email: string;
    name: string;
    picture: string;
}

export async function getGoogleCalendarEvents() {
    const { userId } = auth();
    if (!userId) throw new Error('Unauthorized');

    const googleAuthInfo = await clerkClient().users.getUserOauthAccessToken(userId, "oauth_google")
    const token = googleAuthInfo.data[0]?.token
    try {
        // const token = await getGoogleTokenForUser(userId);
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${new URLSearchParams({
            timeMin: new Date().toISOString(),
            maxResults: '10',
            singleEvents: 'true',
            orderBy: 'startTime',
        }).toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch Google Calendar events');
        const data = await response.json() as { items: GoogleCalendarEvent[] };
        return data.items;
    } catch (error) {
        console.error("Error fetching Google Calendar events:", error);
        throw new Error('Failed to fetch Google Calendar events');
    }
}

export async function getGoogleUserProfile() {
    const { userId } = auth();
    if (!userId) throw new Error('Unauthorized');

    const googleAuthInfo = await clerkClient().users.getUserOauthAccessToken(userId, "oauth_google");
    const token = googleAuthInfo.data[0]?.token;

    try {
        const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch Google user profile');
        const data = await response.json() as GoogleUserProfile;
        return data;
    } catch (error) {
        console.error("Error fetching Google user profile:", error);
    }
}

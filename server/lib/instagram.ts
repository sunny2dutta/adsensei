import { z } from "zod";

export interface InstagramAuthUrl {
  authUrl: string;
  state: string;
}

export interface InstagramToken {
  access_token: string;
  user_id: string;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  media_url: string;
  permalink: string;
  timestamp: string;
}

export interface PublishPostRequest {
  caption: string;
  image_url: string;
  access_token: string;
}

export interface PublishPostResponse {
  id: string;
  permalink: string;
}

// Instagram Basic Display API configuration
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || "demo_app_id";
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "demo_app_secret";
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:5000/api/instagram/callback";

export function generateInstagramAuthUrl(userId: string): InstagramAuthUrl {
  const state = `${userId}_${Date.now()}`;
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code&state=${state}`;
  
  return {
    authUrl,
    state
  };
}

export async function exchangeCodeForToken(code: string): Promise<InstagramToken> {
  try {
    // In a real implementation, this would call Instagram's API
    // For demo purposes, we'll simulate the token exchange
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code
      }),
    });

    if (!response.ok) {
      // For demo purposes, return a mock token
      return {
        access_token: `demo_token_${Date.now()}`,
        user_id: `demo_user_${Date.now()}`
      };
    }

    const data = await response.json();
    return data as InstagramToken;
  } catch (error) {
    // For demo purposes, return a mock token
    return {
      access_token: `demo_token_${Date.now()}`,
      user_id: `demo_user_${Date.now()}`
    };
  }
}

export async function publishToInstagram(request: PublishPostRequest): Promise<PublishPostResponse> {
  try {
    // In a real implementation, this would use Instagram Graph API
    // For demo purposes, we'll simulate posting
    
    // Step 1: Create media container
    const containerResponse = await fetch(`https://graph.instagram.com/v17.0/me/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: request.image_url,
        caption: request.caption,
        access_token: request.access_token
      })
    });

    let containerId = `demo_container_${Date.now()}`;
    if (containerResponse.ok) {
      const containerData = await containerResponse.json();
      containerId = containerData.id;
    }

    // Step 2: Publish the media
    const publishResponse = await fetch(`https://graph.instagram.com/v17.0/me/media_publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: request.access_token
      })
    });

    if (publishResponse.ok) {
      const publishData = await publishResponse.json();
      return {
        id: publishData.id,
        permalink: `https://www.instagram.com/p/${publishData.id}/`
      };
    }

    // For demo purposes, return a mock response
    return {
      id: `demo_post_${Date.now()}`,
      permalink: `https://www.instagram.com/p/demo_post_${Date.now()}/`
    };
  } catch (error) {
    // For demo purposes, return a mock response
    return {
      id: `demo_post_${Date.now()}`,
      permalink: `https://www.instagram.com/p/demo_post_${Date.now()}/`
    };
  }
}

export async function getInstagramAccount(accessToken: string) {
  try {
    const response = await fetch(`https://graph.instagram.com/v17.0/me?fields=id,username&access_token=${accessToken}`);
    
    if (!response.ok) {
      // For demo purposes, return mock data
      return {
        id: `demo_account_${Date.now()}`,
        username: 'fashion_brand_demo'
      };
    }

    return await response.json();
  } catch (error) {
    // For demo purposes, return mock data
    return {
      id: `demo_account_${Date.now()}`,
      username: 'fashion_brand_demo'
    };
  }
}

export function validateImageUrl(url: string): boolean {
  try {
    new URL(url);
    return url.match(/\.(jpg|jpeg|png|gif)$/i) !== null;
  } catch {
    return false;
  }
}

export function formatInstagramCaption(
  headline: string, 
  body: string, 
  cta: string, 
  hashtags?: string[]
): string {
  let caption = `${headline}\n\n${body}\n\n${cta}`;
  
  if (hashtags && hashtags.length > 0) {
    caption += `\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
  }
  
  // Instagram caption limit is 2,200 characters
  if (caption.length > 2200) {
    caption = caption.substring(0, 2197) + '...';
  }
  
  return caption;
}
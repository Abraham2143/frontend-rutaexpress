import {
  BrowserCacheLocation,
  InteractionType,
  PublicClientApplication
} from '@azure/msal-browser';

import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';


const CLIENT_ID = 'af669402-d208-48a2-bed7-56d4a6f3371d';
const TENANT_ID = '86277ca6-e8ef-4000-96b5-190477b8912d';
const APP_ORIGIN = window.location.origin;
const API_GATEWAY_URL = 'https://x29deu7hn0.execute-api.us-east-1.amazonaws.com';

export const API_SCOPE = `api://${CLIENT_ID}/access_as_user`;

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: `${APP_ORIGIN}/login`,
    postLogoutRedirectUri: `${APP_ORIGIN}/login`
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage
  }
});

export const msalGuardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: ['openid', 'profile', API_SCOPE]
  }
};

export const msalInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map<string, Array<string>>([
    [`${API_GATEWAY_URL}/api/catalog/services`, [API_SCOPE]],
    [`${API_GATEWAY_URL}/api/catalog/services/*`, [API_SCOPE]],
    [`${API_GATEWAY_URL}/api/shipments`, [API_SCOPE]],
    [`${API_GATEWAY_URL}/api/shipments/*`, [API_SCOPE]]
  ])
};
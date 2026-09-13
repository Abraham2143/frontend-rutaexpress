import {
  BrowserCacheLocation,
  InteractionType,
  PublicClientApplication
} from '@azure/msal-browser';

import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

export const msalInstance =
  new PublicClientApplication({

    auth: {
      clientId: 'af669402-d208-48a2-bed7-56d4a6f3371d',
      authority:
        'https://login.microsoftonline.com/86277ca6-e8ef-4000-96b5-190477b8912d',
      redirectUri:
        'http://localhost:4200'
    },

    cache: {
      cacheLocation:
        BrowserCacheLocation.LocalStorage
    }

  });

export const msalGuardConfig:
  MsalGuardConfiguration = {

    interactionType:
      InteractionType.Redirect,

    authRequest: {
      scopes: [
        'openid',
        'profile'
      ]
    }

  };

export const msalInterceptorConfig:
  MsalInterceptorConfiguration = {

    interactionType:
      InteractionType.Redirect,

    protectedResourceMap:
      new Map()

  };
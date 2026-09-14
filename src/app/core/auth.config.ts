import {
  BrowserCacheLocation,
  InteractionType,
  PublicClientApplication
} from '@azure/msal-browser';

import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';


/* =====================================================
   MICROSOFT ENTRA
===================================================== */

const CLIENT_ID =
  'af669402-d208-48a2-bed7-56d4a6f3371d';

const TENANT_ID =
  '86277ca6-e8ef-4000-96b5-190477b8912d';


/* =====================================================
   API GATEWAY
===================================================== */

const API_GATEWAY_URL =
  'https://x29deu7hn0.execute-api.us-east-1.amazonaws.com';


/* =====================================================
   SCOPE DE LA API
===================================================== */

export const API_SCOPE =
  `api://${CLIENT_ID}/access_as_user`;


/* =====================================================
   MSAL INSTANCE
===================================================== */

export const msalInstance =
  new PublicClientApplication({

    auth: {

      clientId:
        CLIENT_ID,

      authority:
        `https://login.microsoftonline.com/${TENANT_ID}`,

      redirectUri:
        'http://localhost:4200',

      postLogoutRedirectUri:
        'http://localhost:4200/login'

    },

    cache: {

      cacheLocation:
        BrowserCacheLocation.LocalStorage

    }

  });


/* =====================================================
   MSAL GUARD
===================================================== */

export const msalGuardConfig:
  MsalGuardConfiguration = {

    interactionType:
      InteractionType.Redirect,

    authRequest: {

      scopes: [

        'openid',

        'profile',

        API_SCOPE

      ]

    }

  };


/* =====================================================
   MSAL INTERCEPTOR

   Angular
      ↓
   API Gateway
      ↓
   Authorization: Bearer <access_token>
===================================================== */

export const msalInterceptorConfig:
  MsalInterceptorConfiguration = {

    interactionType:
      InteractionType.Redirect,

    protectedResourceMap:
      new Map<string, Array<string>>([

        [
          `https://x29deu7hn0.execute-api.us-east-1.amazonaws.com/api/catalog/services`,
          [
            API_SCOPE
          ]
        ],

        [
          `https://x29deu7hn0.execute-api.us-east-1.amazonaws.com/api/catalog/services/*`,
          [
            API_SCOPE
          ]
        ],

        [
          `https://x29deu7hn0.execute-api.us-east-1.amazonaws.com/api/shipments`,
          [
            API_SCOPE
          ]
        ],

        [
          `${API_GATEWAY_URL}/api/shipments/*`,
          [
            API_SCOPE
          ]
        ]

      ])

  };
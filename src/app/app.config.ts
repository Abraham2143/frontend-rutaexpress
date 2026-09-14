import {
  ApplicationConfig,
  inject,
  provideAppInitializer
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import {
  IPublicClientApplication
} from '@azure/msal-browser';

import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalInterceptor,
  MsalService
} from '@azure/msal-angular';

import {
  routes
} from './app.routes';

import {
  msalGuardConfig,
  msalInstance,
  msalInterceptorConfig
} from './core/auth.config';


export const appConfig:
  ApplicationConfig = {

    providers: [

      provideRouter(
        routes
      ),


      /*
        Necesario para:

        CatalogService
        ShipmentsService
        MsalInterceptor
      */

      provideHttpClient(
        withInterceptorsFromDi()
      ),


      /* =========================
         MSAL
      ========================== */

      {
        provide:
          MSAL_INSTANCE,

        useValue:
          msalInstance
      },


      {
        provide:
          MSAL_GUARD_CONFIG,

        useValue:
          msalGuardConfig
      },


      {
        provide:
          MSAL_INTERCEPTOR_CONFIG,

        useValue:
          msalInterceptorConfig
      },


      /*
        Intercepta las llamadas HTTP
        protegidas y agrega:

        Authorization:
        Bearer <access_token>
      */

      {
        provide:
          HTTP_INTERCEPTORS,

        useClass:
          MsalInterceptor,

        multi:
          true
      },


      MsalService,

      MsalGuard,

      MsalBroadcastService,


      /* =========================
         INICIALIZAR MSAL
      ========================== */

      provideAppInitializer(() => {

        const instance =
          inject(
            MSAL_INSTANCE
          ) as IPublicClientApplication;


        return instance.initialize();

      })

    ]

  };
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideRouter } from '@angular/router';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

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
  IPublicClientApplication
} from '@azure/msal-browser';

import { routes } from './app.routes';

import {
  msalGuardConfig,
  msalInstance,
  msalInterceptorConfig
} from './core/auth.config';


export const appConfig: ApplicationConfig = {

  providers: [

    provideBrowserGlobalErrorListeners(),

    /*
      Inicializa MSAL antes de que
      Angular comience a utilizarlo.
    */
    provideAppInitializer(() => {

      const instance =
        inject(
          MSAL_INSTANCE
        ) as IPublicClientApplication;

      return instance.initialize();

    }),

    provideRouter(routes),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    {
      provide: MSAL_INSTANCE,
      useValue: msalInstance
    },

    {
      provide: MSAL_GUARD_CONFIG,
      useValue: msalGuardConfig
    },

    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: msalInterceptorConfig
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService

  ]

};
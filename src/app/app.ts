import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  Router,
  RouterOutlet
} from '@angular/router';

import {
  MsalService
} from '@azure/msal-angular';


@Component({
  selector: 'app-root',

  imports: [
    RouterOutlet
  ],

  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App implements OnInit {

  protected readonly title =
    signal(
      'frontend-rutaexpress'
    );


  constructor(
    private authService:
      MsalService,

    private router:
      Router
  ) {}


  async ngOnInit():
    Promise<void> {

    /*
      Procesamos el regreso desde
      Microsoft después del login.
    */
    const result =
      await this.authService
        .instance
        .handleRedirectPromise();


    /*
      Si Microsoft acaba de
      autenticar al usuario.
    */
    if (result?.account) {

      this.authService
        .instance
        .setActiveAccount(
          result.account
        );


      console.log(
        'Usuario autenticado:',
        result.account
      );


      await this.router.navigate([
        '/dashboard'
      ]);

      return;
    }


    /*
      Si ya existía una sesión
      guardada anteriormente.
    */
    const accounts =
      this.authService
        .instance
        .getAllAccounts();


    if (accounts.length > 0) {

      this.authService
        .instance
        .setActiveAccount(
          accounts[0]
        );

    }

  }

}
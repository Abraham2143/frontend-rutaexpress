import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  authReady = false;

  constructor(
    private authService: MsalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService
      .handleRedirectObservable({ navigateToLoginRequestUrl: false })
      .subscribe({
        next: (result) => {
          const account =
            result?.account ??
            this.authService.instance.getActiveAccount() ??
            this.authService.instance.getAllAccounts()[0] ??
            null;

          if (account) {
            this.authService.instance.setActiveAccount(account);

            const currentPath = this.router.url.split(/[?#]/, 1)[0];

            if (
              !currentPath ||
              currentPath === '/' ||
              currentPath === '/login'
            ) {
              void this.router.navigateByUrl('/dashboard').finally(() => {
                this.authReady = true;
              });
              return;
            }
          }

          this.authReady = true;
        },
        error: (error) => {
          console.error('Error al procesar el redirect de MSAL:', error);
          this.authReady = true;
        }
      });
  }
}

export { App as AppComponent };
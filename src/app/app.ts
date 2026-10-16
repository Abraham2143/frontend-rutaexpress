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

          const currentPath = this.router.url.split(/[?#]/, 1)[0];

          if (!account) {
            if (currentPath === '/auth/callback') {
              void this.router.navigateByUrl('/login', { replaceUrl: true });
            }
            return;
          }

          this.authService.instance.setActiveAccount(account);

          if (
            result?.account ||
            currentPath === '/auth/callback' ||
            currentPath === '/login' ||
            currentPath === '/' ||
            currentPath === ''
          ) {
            void this.router.navigateByUrl('/dashboard', { replaceUrl: true });
          }
        },
        error: (error) => {
          console.error('Error al procesar el redirect de MSAL:', error);

          if (this.router.url.startsWith('/auth/callback')) {
            void this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      });
  }
}

export { App as AppComponent };
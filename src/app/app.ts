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
    this.authService.handleRedirectObservable().subscribe({
      next: (result) => {
        // 1. Si la redirección viene de Microsoft con el token listo
        if (result && result.account) {
          this.authService.instance.setActiveAccount(result.account);
          this.router.navigate(['/dashboard']);
          return;
        }

        // 2. Si ya existía una sesión guardada previamente
        const accounts = this.authService.instance.getAllAccounts();
        if (accounts.length > 0) {
          this.authService.instance.setActiveAccount(accounts[0]);
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: (error) => {
        console.error('Error al procesar el redirect de MSAL:', error);
      }
    });
  }

}

export { App as AppComponent };
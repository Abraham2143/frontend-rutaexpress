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
        // 1. Establecer la cuenta activa tras la redirección
        if (result) {
          this.authService.instance.setActiveAccount(result.account);
        } else {
          const accounts = this.authService.instance.getAllAccounts();
          if (accounts.length > 0) {
            this.authService.instance.setActiveAccount(accounts[0]);
          }
        }

        // 2. Si el usuario ya está autenticado y está en /login o en la raíz, enviarlo al dashboard
        const activeAccount = this.authService.instance.getActiveAccount();
        if (activeAccount) {
          const currentPath = window.location.pathname;
          if (currentPath === '/login' || currentPath === '/') {
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: (error) => console.error('Error al procesar redirect de MSAL:', error)
    });
  }

}

export { App as AppComponent };
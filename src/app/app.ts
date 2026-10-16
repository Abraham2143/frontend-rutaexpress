import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor(private authService: MsalService) {}

  ngOnInit(): void {
    this.authService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          this.authService.instance.setActiveAccount(result.account);
        } else {
          const accounts = this.authService.instance.getAllAccounts();
          if (accounts.length > 0) {
            this.authService.instance.setActiveAccount(accounts[0]);
          }
        }
      },
      error: (error) => console.error('Error en MSAL redirect:', error)
    });
  }

}

export { App as AppComponent };
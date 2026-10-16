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
    // Procesa el retorno de MSAL para desbloquear la pantalla tras autenticarse
    this.authService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          this.authService.instance.setActiveAccount(result.account);
        }
      },
      error: (error) => console.error('Error al procesar redirect de MSAL:', error)
    });
  }

}

export { App as AppComponent };
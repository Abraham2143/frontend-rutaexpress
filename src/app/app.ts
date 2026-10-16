import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(private authService: MsalService) {}

  ngOnInit(): void {
    // Procesa el retorno desde Azure AD para desbloquear la interfaz
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
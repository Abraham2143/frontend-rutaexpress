import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <main class="callback" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <p>Validando tu sesión y abriendo RutaExpress...</p>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .callback {
      min-height: 100vh;
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 16px;
      padding: 24px;
      box-sizing: border-box;
      background: #f5f7fb;
      color: #1f2937;
      font-family: Arial, sans-serif;
      text-align: center;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 4px solid #d1d5db;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AuthCallback {}
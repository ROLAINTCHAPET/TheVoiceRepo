import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <div class="logo">
            <span class="logo-text">THE</span>
            <span class="logo-accent">VOICE</span>
          </div>
          <p class="subtitle">Système de vote 2025</p>
        </div>
        
        <div class="auth-options">
          <div class="user-section">
            <h3>Voter en tant qu'utilisateur</h3>
            <p>Accès direct au système de vote</p>
            <button class="user-btn" (click)="loginAsUser()">
              <span>🎤</span>
              <span>Commencer à voter</span>
            </button>
          </div>
          
          <div class="divider">
            <span>OU</span>
          </div>
          
          <div class="admin-section">
            <h3>Connexion Administrateur</h3>
            <form (ngSubmit)="loginAsAdmin()" #loginForm="ngForm">
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  [(ngModel)]="email" 
                  required 
                  placeholder="blabla@thevoice.fr">
              </div>
              
              <div class="form-group">
                <label for="password">Mot de passe</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  [(ngModel)]="password" 
                  required 
                  placeholder="••••••••">
              </div>
              
              <div class="error-message" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>
              
              <button type="submit" class="admin-btn" [disabled]="!loginForm.form.valid">
                <span>🔐</span>
                <span>Connexion Admin</span>
              </button>
            </form>
          </div>
        </div>
        
        <div class="demo-info">
          <p><strong>La meilleure voix de cette année</strong></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .login-card {
      background: white;
      border-radius: 24px;
      padding: 48px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .logo-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo {
      margin-bottom: 12px;
    }

    .logo-text {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #1a1a1a;
    }

    .logo-accent {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #E31E24;
      margin-left: 12px;
    }

    .subtitle {
      color: #6b7280;
      font-size: 16px;
      font-weight: 500;
    }

    .auth-options {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .user-section, .admin-section {
      text-align: center;
    }

    .user-section h3, .admin-section h3 {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .user-section p {
      color: #6b7280;
      margin: 0 0 20px 0;
      font-size: 14px;
    }

    .user-btn, .admin-btn {
      width: 100%;
      padding: 16px 24px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .user-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .user-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
    }

    .admin-btn {
      background: linear-gradient(135deg, #E31E24 0%, #c41e3a 100%);
      color: white;
    }

    .admin-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(227, 30, 36, 0.3);
    }

    .admin-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }

    .divider {
      text-align: center;
      position: relative;
      margin: 20px 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e5e7eb;
    }

    .divider span {
      background: white;
      padding: 0 16px;
      color: #9ca3af;
      font-size: 14px;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #E31E24;
    }

    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      text-align: center;
    }

    .demo-info {
      margin-top: 32px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 12px;
      text-align: center;
    }

    .demo-info p {
      color: #6b7280;
      font-size: 12px;
      margin: 0;
    }

    @media (max-width: 768px) {
      .login-card {
        padding: 32px 24px;
        margin: 16px;
      }
      
      .logo-text, .logo-accent {
        font-size: 28px;
      }
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  loginAsUser(): void {
    this.authService.loginAsUser();
  }

  loginAsAdmin(): void {
    const success = this.authService.login(this.email, this.password);
    if (!success) {
      this.errorMessage = 'Email ou mot de passe incorrect';
    } else {
      this.errorMessage = '';
    }
  }
}
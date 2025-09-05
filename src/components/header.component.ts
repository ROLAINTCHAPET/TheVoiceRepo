import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-text">THE</span>
          <span class="logo-accent">VOICE</span>
        </div>
        <div class="subtitle">
          <span class="season">Saison 2025</span>
          <span class="live">• LIVE •</span>
        </div>
      </div>
      <div class="header-decoration"></div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header-content {
      position: relative;
      z-index: 2;
    }

    .logo {
      margin-bottom: 8px;
    }

    .logo-text {
      font-size: 48px;
      font-weight: 900;
      letter-spacing: 4px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .logo-accent {
      font-size: 48px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #E31E24;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      margin-left: 16px;
      position: relative;
    }

    .logo-accent::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #E31E24, #f59e0b);
      border-radius: 2px;
    }

    .subtitle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 500;
      color: #d1d5db;
    }

    .season {
      letter-spacing: 1px;
    }

    .live {
      color: #E31E24;
      font-weight: 700;
      animation: pulse 2s infinite;
    }

    .header-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 20%, rgba(227, 30, 36, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(0.95);
      }
    }

    @media (max-width: 768px) {
      .header {
        padding: 24px 16px;
      }
      
      .logo-text, .logo-accent {
        font-size: 36px;
        letter-spacing: 2px;
      }
      
      .logo-accent {
        margin-left: 8px;
      }
      
      .subtitle {
        font-size: 14px;
      }
    }
  `]
})
export class HeaderComponent {}
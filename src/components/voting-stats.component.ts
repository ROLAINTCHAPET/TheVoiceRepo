import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voting-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="voting-stats">
      <h2 class="stats-title">Résultats en direct</h2>
      <div class="total-votes">
        <span class="votes-number">{{ totalVotes }}</span>
        <span class="votes-label">vote{{ totalVotes > 1 ? 's' : '' }} total{{ totalVotes > 1 ? 'aux' : '' }}</span>
      </div>
      <div class="stats-note" *ngIf="totalVotes === 0">
        Les votes n'ont pas encore commencé
      </div>
    </div>
  `,
  styles: [`
    .voting-stats {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      padding: 32px;
      border-radius: 20px;
      text-align: center;
      margin-bottom: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    }

    .stats-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 20px 0;
      color: #E31E24;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .total-votes {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 12px;
    }

    .votes-number {
      font-size: 48px;
      font-weight: 900;
      color: #f59e0b;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .votes-label {
      font-size: 18px;
      font-weight: 500;
      color: #d1d5db;
    }

    .stats-note {
      color: #9ca3af;
      font-style: italic;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .voting-stats {
        padding: 24px 16px;
        margin-bottom: 24px;
      }
      
      .stats-title {
        font-size: 20px;
      }
      
      .votes-number {
        font-size: 36px;
      }
      
      .votes-label {
        font-size: 16px;
      }
    }
  `]
})
export class VotingStatsComponent {
  @Input() totalVotes: number = 0;
}
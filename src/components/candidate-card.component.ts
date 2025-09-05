import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../models/candidate.interface';

@Component({
  selector: 'app-candidate-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="candidate-card" 
         [class.voted]="hasVoted && votedCandidateId === candidate.id"
         [class.other-voted]="hasVoted && votedCandidateId !== candidate.id">
      <div class="candidate-photo">
        <img [src]="candidate.photoUrl" 
             [alt]="candidate.name" 
             loading="lazy">
        <div class="photo-overlay"></div>
      </div>
      
      <div class="candidate-info">
        <h3 class="candidate-name">{{ candidate.name }}</h3>
        <div class="candidate-details">
          <span class="age">{{ candidate.age }} ans</span>
          <span class="city">{{ candidate.city }}</span>
        </div>
        <p class="candidate-description">{{ candidate.description }}</p>
        
        <div class="vote-section">
          <button 
            class="vote-btn"
            [disabled]="hasVoted"
            (click)="onVote()">
            <span class="vote-text">
              {{ getVoteButtonText() }}
            </span>
            <span class="vote-icon">
              {{ getVoteButtonIcon() }}
            </span>
          </button>
          
          <div class="vote-stats" *ngIf="totalVotes > 0">
            <div class="vote-count">{{ candidate.votes }} votes</div>
            <div class="vote-percentage">{{ votePercentage }}%</div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="votePercentage"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .candidate-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      border: 2px solid transparent;
    }

    .candidate-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
    }

    .candidate-card.voted {
      border-color: #E31E24;
      background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%);
    }

    .candidate-card.other-voted {
      opacity: 0.6;
      transform: scale(0.98);
    }

    .candidate-photo {
      position: relative;
      width: 100%;
      height: 280px;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .candidate-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .candidate-card:hover .candidate-photo img {
      transform: scale(1.05);
    }

    .photo-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .candidate-card:hover .photo-overlay {
      opacity: 1;
    }

    .candidate-info {
      text-align: center;
    }

    .candidate-name {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .candidate-details {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .age, .city {
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
    }

    .candidate-description {
      color: #4b5563;
      font-size: 14px;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .vote-section {
      margin-top: 20px;
    }

    .vote-btn {
      width: 100%;
      background: linear-gradient(135deg, #E31E24 0%, #c41e3a 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 16px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      overflow: hidden;
    }

    .vote-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.6s ease;
    }

    .vote-btn:hover::before {
      left: 100%;
    }

    .vote-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(227, 30, 36, 0.4);
    }

    .vote-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .vote-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }

    .vote-btn:disabled:hover {
      transform: none;
      box-shadow: none;
    }

    .vote-text {
      transition: all 0.3s ease;
    }

    .vote-icon {
      font-size: 18px;
      transition: all 0.3s ease;
    }

    .vote-stats {
      margin-top: 16px;
      text-align: center;
    }

    .vote-count {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .vote-percentage {
      font-size: 24px;
      font-weight: 700;
      color: #E31E24;
      margin-bottom: 8px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #E31E24, #f59e0b);
      border-radius: 4px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 768px) {
      .candidate-card {
        padding: 20px;
      }
      
      .candidate-photo {
        height: 240px;
      }
      
      .candidate-name {
        font-size: 22px;
      }
      
      .vote-btn {
        padding: 14px 20px;
        font-size: 15px;
      }
    }
  `]
})
export class CandidateCardComponent {
  @Input() candidate!: Candidate;
  @Input() totalVotes: number = 0;
  @Input() hasVoted: boolean = false;
  @Input() votedCandidateId: number | null = null;
  @Output() vote = new EventEmitter<number>();

  get votePercentage(): number {
    if (this.totalVotes === 0) return 0;
    return Math.round((this.candidate.votes / this.totalVotes) * 100);
  }

  onVote(): void {
    if (!this.hasVoted) {
      this.vote.emit(this.candidate.id);
    }
  }

  getVoteButtonText(): string {
    if (!this.hasVoted) return 'Voter';
    if (this.votedCandidateId === this.candidate.id) return 'Voté !';
    return 'Vote fermé';
  }

  getVoteButtonIcon(): string {
    if (!this.hasVoted) return '🎤';
    if (this.votedCandidateId === this.candidate.id) return '✓';
    return '🔒';
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingService } from '../services/voting.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Vote, VoteNotification } from '../models/vote.interface';
import { Candidate } from '../models/candidate.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div class="header-content">
          <h1>Dashboard Administrateur</h1>
          <div class="header-actions">
            <button class="debug-btn" (click)="debugVotingState()">
              🐛 Debug
            </button>
            <button class="logout-btn" (click)="logout()">
              <span>Déconnexion</span>
              <span>🚪</span>
            </button>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-number">{{ totalConfirmedVotes }}</div>
              <div class="stat-label">Votes confirmés</div>
            </div>
          </div>
          
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <div class="stat-number">{{ pendingVotes.length }}</div>
              <div class="stat-label">Votes en attente</div>
            </div>
          </div>
          
          <div class="stat-card candidates">
            <div class="stat-icon">🎤</div>
            <div class="stat-info">
              <div class="stat-number">{{ candidates.length }}</div>
              <div class="stat-label">Candidats</div>
            </div>
          </div>
          
          <div class="stat-card notifications">
            <div class="stat-icon">🔔</div>
            <div class="stat-info">
              <div class="stat-number">{{ unreadNotifications }}</div>
              <div class="stat-label">Notifications</div>
            </div>
          </div>
        </div>

        <!-- Pending Votes Section -->
        <div class="section">
          <h2>Votes en attente de confirmation</h2>
          <div class="pending-votes" *ngIf="pendingVotes.length > 0; else noPendingVotes">
            <div class="vote-card" *ngFor="let vote of pendingVotes; trackBy: trackByVoteId">
              <div class="vote-info">
                <div class="candidate-info">
                  <h3>{{ getCandidateName(vote.candidateId) }}</h3>
                  <p class="vote-time">{{ vote.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</p>
                </div>
                <div class="vote-details">
                  <p><strong>ID:</strong> {{ vote.id }}</p>
                  <p *ngIf="vote.userAgent"><strong>User Agent:</strong> {{ vote.userAgent?.substring(0, 50) }}...</p>
                  <p *ngIf="vote.ipAddress"><strong>IP:</strong> {{ vote.ipAddress }}</p>
                  <p *ngIf="vote.transactionId"><strong>Transaction:</strong> {{ vote.transactionId }}</p>
                  <p><strong>Status:</strong> <span class="status" [class]="vote.status">{{ vote.status }}</span></p>
                </div>
              </div>
              
              <!-- Section du reçu améliorée -->
              <div class="receipt-section">
                <div *ngIf="vote.receiptPreviewUrl; else noReceiptTemplate">
                  <h4>📸 Screenshot du reçu</h4>
                  <div class="receipt-container">
                    <img 
                      [src]="vote.receiptPreviewUrl" 
                      alt="Screenshot du reçu"
                      class="receipt-image"
                      (click)="openReceiptModal(vote.receiptPreviewUrl)"
                      (error)="onReceiptImageError($event, vote.id)"
                      (load)="onReceiptImageLoad(vote.id)"
                    >
                    <div class="receipt-overlay" (click)="openReceiptModal(vote.receiptPreviewUrl)">
                      🔍 Cliquer pour agrandir
                    </div>
                  </div>
                  <div class="receipt-info">
                    <small>Taille: {{ getImageSize(vote.receiptPreviewUrl) }}</small>
                  </div>
                </div>
                
                <ng-template #noReceiptTemplate>
                  <div class="no-receipt-warning">
                    <span class="warning-icon">⚠️</span>
                    <div class="warning-text">
                      <h4>Aucun reçu fourni</h4>
                      <p>Ce vote n'a pas de justificatif de paiement</p>
                    </div>
                  </div>
                </ng-template>
              </div>

              <div class="vote-actions">
                <button 
                  class="confirm-btn" 
                  (click)="confirmVote(vote.id)"
                  [disabled]="!vote.receiptPreviewUrl"
                  [title]="!vote.receiptPreviewUrl ? 'Aucun reçu fourni' : 'Confirmer le vote'">
                  <span>✅</span>
                  <span>Confirmer</span>
                </button>
                <button class="reject-btn" (click)="rejectVote(vote.id)">
                  <span>❌</span>
                  <span>Rejeter</span>
                </button>
              </div>
            </div>
          </div>
          
          <ng-template #noPendingVotes>
            <div class="empty-state">
              <div class="empty-icon">✨</div>
              <p>Aucun vote en attente</p>
            </div>
          </ng-template>
        </div>

        <!-- Candidates Statistics -->
        <div class="section">
          <h2>Statistiques par candidat</h2>
          <div class="candidates-stats">
            <div class="candidate-stat" *ngFor="let candidate of candidates">
              <div class="candidate-photo">
                <img [src]="candidate.photoUrl" [alt]="candidate.name" (error)="onCandidateImageError($event)">
              </div>
              <div class="candidate-details">
                <h3>{{ candidate.name }}</h3>
                <p>{{ candidate.city }}, {{ candidate.age }} ans</p>
                <div class="vote-stats">
                  <span class="vote-count">{{ candidate.votes }} votes</span>
                  <span class="vote-percentage">{{ getVotePercentage(candidate.id) }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getVotePercentage(candidate.id)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Notifications -->
        <div class="section">
          <h2>Notifications récentes</h2>
          <div class="notifications" *ngIf="notifications.length > 0; else noNotifications">
            <div class="notification" 
                 *ngFor="let notification of notifications.slice(0, 5)"
                 [class.unread]="!notification.read"
                 (click)="markAsRead(notification.id)">
              <div class="notification-icon">🔔</div>
              <div class="notification-content">
                <p><strong>Nouveau vote:</strong> {{ notification.candidateName }}</p>
                <span class="notification-time">{{ notification.timestamp | date:'HH:mm:ss' }}</span>
              </div>
            </div>
          </div>
          
          <ng-template #noNotifications>
            <div class="empty-state">
              <div class="empty-icon">🔕</div>
              <p>Aucune notification</p>
            </div>
          </ng-template>
        </div>

        <!-- Reset Section -->
        <div class="section">
          <h2>Actions administrateur</h2>
          <div class="admin-actions">
            <button class="reset-btn" (click)="resetAllVotes()" *ngIf="totalConfirmedVotes > 0">
              <span>🔄</span>
              <span>Réinitialiser tous les votes</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal pour agrandir les reçus -->
      <div *ngIf="modalReceiptUrl" class="receipt-modal" (click)="closeReceiptModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Reçu de paiement</h3>
            <button class="close-btn" (click)="closeReceiptModal()">×</button>
          </div>
          <div class="modal-body">
            <img [src]="modalReceiptUrl" alt="Reçu de paiement" class="modal-receipt-image">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    }

    .dashboard-header {
      background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
      color: white;
      padding: 24px;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .debug-btn {
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .debug-btn:hover {
      background: #d97706;
    }

    .logout-btn {
      background: #E31E24;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logout-btn:hover {
      background: #c41e3a;
      transform: translateY(-1px);
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 32px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .stat-card.total .stat-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .stat-card.pending .stat-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .stat-card.candidates .stat-icon {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .stat-card.notifications .stat-icon {
      background: linear-gradient(135deg, #E31E24 0%, #c41e3a 100%);
    }

    .stat-number {
      font-size: 32px;
      font-weight: 900;
      color: #1a1a1a;
      line-height: 1;
    }

    .stat-label {
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
    }

    .section {
      background: white;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .section h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 24px 0;
    }

    .vote-card {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }

    .vote-card:hover {
      border-color: #E31E24;
    }

    .vote-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .candidate-info h3 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 4px 0;
    }

    .vote-time {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }

    .vote-details p {
      color: #4b5563;
      font-size: 12px;
      margin: 0 0 4px 0;
    }

    .status {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status.pending {
      background: #fbbf24;
      color: #92400e;
    }

    .status.confirmed {
      background: #34d399;
      color: #065f46;
    }

    .status.rejected {
      background: #f87171;
      color: #991b1b;
    }

    .receipt-section {
      margin-bottom: 20px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .receipt-section h4 {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 12px 0;
    }

    .receipt-container {
      position: relative;
      display: inline-block;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .receipt-image {
      max-width: 200px;
      max-height: 150px;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition: transform 0.3s ease;
      display: block;
    }

    .receipt-image:hover {
      transform: scale(1.05);
    }

    .receipt-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      cursor: pointer;
      font-size: 12px;
      text-align: center;
    }

    .receipt-container:hover .receipt-overlay {
      opacity: 1;
    }

    .receipt-info {
      margin-top: 8px;
    }

    .receipt-info small {
      color: #6b7280;
      font-size: 11px;
    }

    .no-receipt-warning {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #fef3cd;
      border: 1px solid #f59e0b;
      border-radius: 8px;
    }

    .warning-icon {
      font-size: 24px;
    }

    .warning-text h4 {
      margin: 0 0 4px 0;
      color: #92400e;
      font-size: 14px;
    }

    .warning-text p {
      margin: 0;
      color: #a16207;
      font-size: 12px;
    }

    .vote-actions {
      display: flex;
      gap: 12px;
    }

    .confirm-btn, .reject-btn {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .confirm-btn:disabled {
      background: #d1d5db;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .confirm-btn:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .reject-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    .reject-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .receipt-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      color: #1a1a1a;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      padding: 4px;
    }

    .close-btn:hover {
      color: #1a1a1a;
    }

    .modal-body {
      padding: 20px;
      text-align: center;
    }

    .modal-receipt-image {
      max-width: 100%;
      max-height: 70vh;
      border-radius: 8px;
    }

    .candidates-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .candidate-stat {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .candidate-photo {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .candidate-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .candidate-details {
      flex: 1;
    }

    .candidate-details h3 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 4px 0;
    }

    .candidate-details p {
      color: #6b7280;
      font-size: 14px;
      margin: 0 0 12px 0;
    }

    .vote-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
    }

    .vote-count {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .vote-percentage {
      font-size: 16px;
      font-weight: 700;
      color: #E31E24;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #E31E24, #f59e0b);
      border-radius: 3px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .notifications {
      max-height: 300px;
      overflow-y: auto;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
    }

    .notification.unread {
      background: #fef3f2;
      border-color: #E31E24;
    }

    .notification:hover {
      background: #f3f4f6;
    }

    .notification-icon {
      font-size: 20px;
    }

    .notification-content {
      flex: 1;
    }

    .notification-content p {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #1a1a1a;
    }

    .notification-time {
      font-size: 12px;
      color: #6b7280;
    }

    .admin-actions {
      display: flex;
      gap: 16px;
    }

    .reset-btn {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .reset-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        padding: 24px 16px;
      }
      
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }
      
      .stat-card {
        padding: 16px;
      }
      
      .section {
        padding: 24px 16px;
      }
      
      .vote-info {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .candidates-stats {
        grid-template-columns: 1fr;
      }

      .receipt-image {
        max-width: 150px;
        max-height: 100px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  candidates: Candidate[] = [];
  pendingVotes: Vote[] = [];
  notifications: VoteNotification[] = [];
  totalConfirmedVotes: number = 0;
  unreadNotifications: number = 0;
  modalReceiptUrl: string | null = null;

  constructor(
    private votingService: VotingService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.votingService.candidates$.subscribe(candidates => {
      this.candidates = candidates;
    });

    this.votingService.votes$.subscribe(votes => {
      this.pendingVotes = votes.filter(vote => vote.status === 'pending');
      this.totalConfirmedVotes = votes.filter(vote => vote.status === 'confirmed').length;
      
      // Log pour debug
      console.log('Votes mis à jour:', votes);
      console.log('Votes en attente:', this.pendingVotes);
    });

    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.unreadNotifications = this.notificationService.getUnreadCount();
    });
  }

  // Nouvelles méthodes pour gérer les images
  trackByVoteId(index: number, vote: Vote): string {
    return vote.id;
  }

  onReceiptImageError(event: any, voteId: string): void {
    console.error(`Erreur de chargement de l'image pour le vote ${voteId}:`, event);
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiM5OTkiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
  }

  onReceiptImageLoad(voteId: string): void {
    console.log(`Image chargée avec succès pour le vote ${voteId}`);
  }

  onCandidateImageError(event: any): void {
    event.target.src = 'assets/candidats/default-avatar.png';
  }

  openReceiptModal(receiptUrl: string): void {
    this.modalReceiptUrl = receiptUrl;
    document.body.style.overflow = 'hidden';
  }

  closeReceiptModal(): void {
    this.modalReceiptUrl = null;
    document.body.style.overflow = 'auto';
  }

  getImageSize(base64String: string): string {
    if (!base64String) return 'N/A';
    
    try {
      // Estimation approximative de la taille en base64
      const sizeInBytes = Math.round((base64String.length * 3) / 4);
      if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
      } else if (sizeInBytes < 1024 * 1024) {
        return `${Math.round(sizeInBytes / 1024)} KB`;
      } else {
        return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
      }
    } catch (error) {
      return 'N/A';
    }
  }

  // Méthode pour déboguer l'état du service de vote
  debugVotingState(): void {
    console.log('=== DEBUG VOTING STATE ===');
    this.votingService.debugState();
    
    console.log('Composant - Votes en attente:', this.pendingVotes);
    console.log('Composant - Votes confirmés:', this.totalConfirmedVotes);
    
    // Vérifier spécifiquement les reçus
    this.pendingVotes.forEach(vote => {
      console.log(`Vote ${vote.id}:`, {
        candidateId: vote.candidateId,
        candidateName: this.getCandidateName(vote.candidateId),
        status: vote.status,
        hasReceipt: !!vote.receiptPreviewUrl,
        receiptLength: vote.receiptPreviewUrl?.length || 0,
        receiptPreview: vote.receiptPreviewUrl?.substring(0, 50)
      });
    });
    console.log('========================');
  }

  confirmVote(voteId: string): void {
    console.log('Confirmation du vote:', voteId);
    this.votingService.validateVote(voteId);
  }

  rejectVote(voteId: string): void {
    console.log('Rejet du vote:', voteId);
    this.votingService.rejectVote(voteId);
  }

  getCandidateName(candidateId: number): string {
    const candidate = this.candidates.find(c => c.id === candidateId);
    return candidate ? candidate.name : 'Candidat inconnu';
  }

  getVotePercentage(candidateId: number): number {
    return this.votingService.getVotePercentage(candidateId);
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  resetAllVotes(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les votes ?')) {
      this.votingService.resetVotes();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
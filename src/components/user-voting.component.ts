import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingService } from '../services/voting.service';
import { AuthService } from '../services/auth.service';
import { Candidate } from '../models/candidate.interface';
import { Vote } from '../models/vote.interface';
import { CandidateCardComponent } from './candidate-card.component';
import { HeaderComponent } from './header.component';
import { VotingStatsComponent } from './voting-stats.component';
import { ScreenshotUploadComponent } from './screenshot-upload.component';

@Component({
  selector: 'app-user-voting',
  standalone: true,
  imports: [CommonModule, CandidateCardComponent, HeaderComponent, VotingStatsComponent, ScreenshotUploadComponent],
  template: `
    <div class="app">
      <app-header></app-header>
      <main class="main-content">
        <div class="user-header">
          <button class="logout-btn" (click)="logout()">
            <span>Déconnexion</span>
            <span>🚪</span>
          </button>
        </div>

        <app-voting-stats [totalVotes]="totalVotes"></app-voting-stats>

        <!-- Message de confirmation quand le vote est validé -->
        <div class="confirmation-message" *ngIf="showConfirmationMessage">
          <div class="success-icon">✅</div>
          <h2>Votre vote a été enregistré !</h2>
          <p>Merci pour votre participation. Votre vote pour <strong>{{ getVotedCandidateName() }}</strong> a été confirmé avec succès.</p>
        </div>

        <!-- Instruction de vote initial -->
        <div class="voting-instruction" *ngIf="!hasVoted">
          <h2>Votez pour votre candidat préféré</h2>
          <p>Choisissez le talent qui vous a le plus impressionné cette soirée</p>
        </div>

        <!-- Messages d'état du vote -->
        <div class="voting-instruction" *ngIf="hasVoted && !showConfirmationMessage && !showScreenshotUpload">
          <h2>{{ getStatusMessage() }}</h2>
          <p *ngIf="currentVoteStatus === 'pending' && !hasReceipt()">
            Votre vote est enregistré mais nécessite une confirmation avec un reçu de paiement.
          </p>
          <p *ngIf="currentVoteStatus === 'pending' && hasReceipt()">
            Votre reçu a été envoyé et sera validé par l'administrateur sous peu.
          </p>
          <p *ngIf="currentVoteStatus === 'rejected'">
            Votre vote a été rejeté. Veuillez contacter l'assistance ou réessayer avec un nouveau reçu.
          </p>
        </div>

        <!-- Section upload de screenshot -->
        <div class="screenshot-section" *ngIf="hasVoted && currentVoteStatus === 'pending' && !hasReceipt() && !showScreenshotUpload">
          <div class="screenshot-prompt">
            <h3>Confirmez votre vote</h3>
            <p>Téléchargez une capture d'écran de votre reçu de paiement pour finaliser votre vote</p>
            <button class="upload-btn" (click)="showScreenshotUpload = true">
              <span>📷</span>
              <span>Ajouter un reçu</span>
            </button>
          </div>
        </div>

        <app-screenshot-upload
          *ngIf="showScreenshotUpload"
          (screenshotUploaded)="onScreenshotUploaded($event)"
          (cancelled)="showScreenshotUpload = false">
        </app-screenshot-upload>

        <!-- Grille des candidats (cachée si vote confirmé) -->
        <div class="candidates-grid" *ngIf="!showConfirmationMessage">
          <app-candidate-card
            *ngFor="let candidate of candidates"
            [candidate]="candidate"
            [totalVotes]="totalVotes"
            [hasVoted]="hasVoted"
            [votedCandidateId]="votedCandidateId"
            (vote)="onVote($event)">
          </app-candidate-card>
        </div>

        <!-- Loading indicator -->
        <div class="loading" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Traitement en cours...</p>
        </div>

        <!-- Error message -->
        <div class="error-message" *ngIf="errorMessage">
          <p>{{ errorMessage }}</p>
          <button class="retry-btn" (click)="clearError()">Fermer</button>
        </div>
      </main>

      <footer class="footer">
        <p>&copy; 2025 The Voice - Système de vote en direct</p>
      </footer>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
      width: 100%;
    }

    .user-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }

    .logout-btn {
      background: #6b7280;
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
      background: #4b5563;
      transform: translateY(-1px);
    }

    .confirmation-message {
      text-align: center;
      margin-bottom: 40px;
      padding: 40px 32px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #22c55e;
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(34, 197, 94, 0.15);
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .success-icon {
      font-size: 64px;
      margin-bottom: 16px;
      animation: bounce 0.6s ease-in-out;
    }

    @keyframes bounce {
      0%, 20%, 60%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      80% {
        transform: translateY(-5px);
      }
    }

    .confirmation-message h2 {
      font-size: 36px;
      font-weight: 800;
      color: #166534;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }

    .confirmation-message p {
      font-size: 18px;
      color: #166534;
      margin: 0;
      line-height: 1.6;
    }

    .voting-instruction {
      text-align: center;
      margin-bottom: 40px;
      padding: 32px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    }

    .voting-instruction h2 {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }

    .voting-instruction p {
      font-size: 18px;
      color: #6b7280;
      margin: 0;
      line-height: 1.6;
    }

    .screenshot-section {
      margin-bottom: 40px;
    }

    .screenshot-prompt {
      background: linear-gradient(135deg, #fef3f2 0%, #fee2e2 100%);
      border: 2px solid #E31E24;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
    }

    .screenshot-prompt h3 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 12px 0;
    }

    .screenshot-prompt p {
      color: #6b7280;
      margin: 0 0 24px 0;
      font-size: 16px;
    }

    .upload-btn {
      background: linear-gradient(135deg, #E31E24 0%, #c41e3a 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .upload-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(227, 30, 36, 0.3);
    }

    .candidates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
      margin-bottom: 40px;
    }

    .loading {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      margin: 24px 0;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #E31E24;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 16px;
      border-radius: 12px;
      margin: 24px 0;
      text-align: center;
    }

    .retry-btn {
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      margin-top: 12px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .retry-btn:hover {
      background: #b91c1c;
    }

    .footer {
      background: #1a1a1a;
      color: #9ca3af;
      text-align: center;
      padding: 24px;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 24px 16px;
      }

      .voting-instruction, .confirmation-message {
        padding: 24px 20px;
        margin-bottom: 32px;
      }

      .voting-instruction h2, .confirmation-message h2 {
        font-size: 24px;
      }

      .screenshot-prompt {
        padding: 24px 20px;
      }

      .candidates-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .success-icon {
        font-size: 48px;
      }
    }
  `]
})
export class UserVotingComponent implements OnInit, OnDestroy {
  candidates: Candidate[] = [];
  totalVotes: number = 0;
  hasVoted: boolean = false;
  votedCandidateId: number | null = null;
  userVoteMessage: string = '';
  showScreenshotUpload: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Nouvelles propriétés pour la gestion des confirmations
  showConfirmationMessage: boolean = false;
  currentVoteStatus: 'pending' | 'confirmed' | 'rejected' | null = null;
  currentVote: Vote | null = null;
  private pollInterval: any = null;

  constructor(
    private votingService: VotingService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    
    try {
      // Charger les données depuis le backend
      await this.votingService.loadVotes();
      
      // S'abonner aux changements des candidats
      this.votingService.candidates$.subscribe(candidates => {
        this.candidates = candidates;
        this.totalVotes = this.votingService.getTotalVotes();
      });

      // Mettre à jour les données locales
      this.updateLocalData();

      // Poll pour les mises à jour du statut des votes toutes les 3 secondes
      this.pollInterval = setInterval(() => {
        this.refreshData();
      }, 3000);

    } catch (error) {
      console.error('Erreur lors du chargement initial:', error);
      this.errorMessage = 'Erreur lors du chargement des données. Veuillez rafraîchir la page.';
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    // Nettoyer l'intervalle quand le composant est détruit
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private updateLocalData(): void {
    this.hasVoted = this.votingService.getHasVoted();
    this.votedCandidateId = this.votingService.getVotedCandidateId();
    this.userVoteMessage = this.votingService.getUserVoteMessage();
    
    // Récupérer le vote actuel de l'utilisateur
    if (this.votedCandidateId) {
      this.currentVote = this.votingService.votes$.value.find(
        v => v.candidateId === this.votedCandidateId
      ) || null;
      
      if (this.currentVote) {
        const previousStatus = this.currentVoteStatus;
        this.currentVoteStatus = this.currentVote.status;
        
        // Détecter quand le vote passe en "confirmed" pour afficher le message
        if (previousStatus !== 'confirmed' && this.currentVoteStatus === 'confirmed') {
          this.showConfirmationMessage = true;
          // Cacher le message après 10 secondes
          setTimeout(() => {
            this.showConfirmationMessage = false;
          }, 10000);
        }
      }
    }
  }

  private async refreshData(): Promise<void> {
    try {
      await this.votingService.refresh();
      this.updateLocalData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  }

  async onVote(candidateId: number): Promise<void> {
    this.isLoading = true;
    this.clearError();
    
    try {
      const voteResult = await this.votingService.vote(candidateId);
      
      if (voteResult) {
        this.updateLocalData();
        console.log('Vote créé avec succès:', voteResult);
      } else {
        this.errorMessage = 'Erreur lors de la création du vote. Veuillez réessayer.';
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      this.errorMessage = 'Erreur lors du vote. Vérifiez votre connexion et réessayez.';
    } finally {
      this.isLoading = false;
    }
  }

  async onScreenshotUploaded(screenshotBase64: string): Promise<void> {
    if (!this.currentVote) {
      this.errorMessage = 'Erreur : aucun vote trouvé pour attacher le reçu.';
      return;
    }

    this.isLoading = true;
    this.clearError();

    try {
      // Attacher le screenshot au vote via le backend
      const success = await this.votingService.attachReceipt(this.currentVote.id, screenshotBase64);
      
      if (success) {
        this.showScreenshotUpload = false;
        // Rafraîchir les données pour obtenir la dernière version
        await this.refreshData();
      } else {
        this.errorMessage = 'Erreur lors de l\'envoi du reçu. Veuillez réessayer.';
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload du reçu:', error);
      this.errorMessage = 'Erreur réseau lors de l\'envoi. Vérifiez votre connexion.';
    } finally {
      this.isLoading = false;
    }
  }

  // Méthodes utilitaires pour l'affichage
  getStatusMessage(): string {
    if (!this.currentVote) return 'Merci pour votre vote !';
    
    switch (this.currentVoteStatus) {
      case 'pending':
        return this.hasReceipt() 
          ? 'Reçu envoyé - En attente de validation' 
          : 'Vote enregistré - Ajoutez votre reçu';
      case 'confirmed':
        return 'Vote confirmé avec succès !';
      case 'rejected':
        return 'Vote rejeté - Action requise';
      default:
        return 'Merci pour votre vote !';
    }
  }

  getVotedCandidateName(): string {
    if (!this.votedCandidateId) return '';
    return this.votingService.getCandidateName(this.votedCandidateId);
  }

  hasReceipt(): boolean {
    return this.currentVote ? !!this.currentVote.receiptPreviewUrl : false;
  }

  clearError(): void {
    this.errorMessage = '';
  }

  logout(): void {
    this.authService.logout();
  }
}
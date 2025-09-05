// src/services/voting.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Candidate } from '../models/candidate.interface';
import { Vote } from '../models/vote.interface';

@Injectable({
  providedIn: 'root',
})
export class VotingService {
  private readonly API_URL = 'http://localhost:3000';
  
  // Liste des candidats (statique pour l'instant, peut être déplacée vers le backend plus tard)
  candidates$ = new BehaviorSubject<Candidate[]>([
    {
      id: 1,
      name: 'Odrée',
      age: 19,
      city: 'Douala',
      votes: 0,
      description: 'Finaliste',
      photoUrl: 'assets/candidats/Odree.jpeg',
    },
    {
      id: 2,
      name: 'Francine',
      age: 19,
      city: 'Douala',
      votes: 0,
      description: 'Finaliste',
      photoUrl: 'assets/candidats/Francine.jpeg',
    },
    {
      id: 3,
      name: 'Brandon',
      age: 16,
      city: 'Douala',
      votes: 0,
      description: 'Finaliste',
      photoUrl: 'assets/candidats/Brandon.jpeg',
    },
    {
      id: 4,
      name: 'Solange',
      age: 20,
      city: 'Douala',
      votes: 0,
      description: 'Finaliste',
      photoUrl: 'assets/candidats/Solange.jpeg',
    },
  ]);

  // Liste des votes (chargée depuis le backend)
  votes$ = new BehaviorSubject<Vote[]>([]);

  constructor(private http: HttpClient) {
    this.loadVotes();
  }

  // Charger les votes depuis le backend
  async loadVotes(): Promise<void> {
    try {
      const votes = await firstValueFrom(
        this.http.get<Vote[]>(`${this.API_URL}/votes`)
      );
      this.votes$.next(votes);
      this.updateCandidateVoteCounts(votes);
      console.log('Votes chargés depuis le backend:', votes);
    } catch (error) {
      console.error('Erreur lors du chargement des votes:', error);
    }
  }

  // Mettre à jour les compteurs de votes des candidats
  private updateCandidateVoteCounts(votes: Vote[]): void {
    const voteCounts = votes
      .filter(vote => vote.status === 'confirmed')
      .reduce((counts, vote) => {
        counts[vote.candidateId] = (counts[vote.candidateId] || 0) + 1;
        return counts;
      }, {} as { [key: number]: number });

    const updatedCandidates = this.candidates$.value.map(candidate => ({
      ...candidate,
      votes: voteCounts[candidate.id] || 0
    }));

    this.candidates$.next(updatedCandidates);
  }

  // Ajouter un vote
  async vote(candidateId: number, transactionId?: string, receiptPreviewUrl?: string): Promise<Vote | null> {
    try {
      const voteData = {
        candidateId,
        transactionId,
        receiptPreviewUrl
      };

      const newVote = await firstValueFrom(
        this.http.post<Vote>(`${this.API_URL}/votes`, voteData)
      );

      // Recharger tous les votes pour mettre à jour l'état local
      await this.loadVotes();
      
      console.log('Vote créé:', newVote);
      return newVote;
    } catch (error) {
      console.error('Erreur lors de la création du vote:', error);
      return null;
    }
  }

  // Attacher un reçu (base64) à un vote existant
  async attachReceipt(voteId: string, base64Image: string): Promise<boolean> {
    try {
      console.log('Tentative d\'attachement de reçu pour vote ID:', voteId);
      console.log('Image base64 reçue (premiers 50 caractères):', base64Image.substring(0, 50));
      
      const updatedVote = await firstValueFrom(
        this.http.post<Vote>(`${this.API_URL}/votes/${voteId}/receipt`, {
          receiptPreviewUrl: base64Image
        })
      );

      // Recharger tous les votes pour mettre à jour l'état local
      await this.loadVotes();
      
      console.log('Reçu attaché avec succès:', updatedVote);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'attachement du reçu:', error);
      return false;
    }
  }

  // Obtenir un vote par ID
  getVoteById(voteId: string): Vote | null {
    return this.votes$.value.find(v => v.id === voteId) || null;
  }

  // Vérifier si un vote a un reçu
  hasReceipt(voteId: string): boolean {
    const vote = this.getVoteById(voteId);
    return vote ? !!vote.receiptPreviewUrl : false;
  }

  // Valider un vote (nécessite une route backend)
  async validateVote(voteId: string): Promise<boolean> {
    try {
      console.log('Validation du vote ID:', voteId);
      // Pour l'instant, mise à jour locale en attendant la route backend
      const votes = this.votes$.value.map(v =>
        v.id === voteId ? { ...v, status: 'confirmed' as 'confirmed' } : v
      );
      this.votes$.next(votes);
      this.updateCandidateVoteCounts(votes);
      console.log('Vote validé');
      return true;
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      return false;
    }
  }

  // Rejeter un vote (nécessite une route backend)
  async rejectVote(voteId: string): Promise<boolean> {
    try {
      console.log('Rejet du vote ID:', voteId);
      // Pour l'instant, mise à jour locale en attendant la route backend
      const votes = this.votes$.value.map(v =>
        v.id === voteId ? { ...v, status: 'rejected' as 'rejected' } : v
      );
      this.votes$.next(votes);
      this.updateCandidateVoteCounts(votes);
      console.log('Vote rejeté');
      return true;
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      return false;
    }
  }

  // Obtenir tous les votes avec reçus (pour l'admin)
  getVotesWithReceipts(): Vote[] {
    return this.votes$.value.filter(v => v.receiptPreviewUrl);
  }

  // Obtenir les votes en attente (pour l'admin)
  getPendingVotes(): Vote[] {
    return this.votes$.value.filter(v => v.status === 'pending');
  }

  // Obtenir les votes confirmés
  getConfirmedVotes(): Vote[] {
    return this.votes$.value.filter(v => v.status === 'confirmed');
  }

  // Obtenir les votes rejetés
  getRejectedVotes(): Vote[] {
    return this.votes$.value.filter(v => v.status === 'rejected');
  }

  // Statistiques
  getTotalVotes(): number {
    return this.votes$.value.length;
  }

  getVotePercentage(candidateId: number): number {
    const total = this.getConfirmedVotes().length || 1;
    const votesFor = this.getConfirmedVotes().filter(v => v.candidateId === candidateId).length;
    return Math.round((votesFor / total) * 100);
  }

  // Obtenir le nom du candidat par ID
  getCandidateName(candidateId: number): string {
    const candidate = this.candidates$.value.find(c => c.id === candidateId);
    return candidate ? candidate.name : 'Candidat inconnu';
  }

  // Vérifier si un utilisateur a déjà voté (simulation)
  getHasVoted(): boolean {
    return this.votes$.value.length > 0;
  }

  getVotedCandidateId(): number | null {
    return this.votes$.value.length > 0 ? this.votes$.value[0].candidateId : null;
  }

  getUserVoteMessage(): string {
    if (!this.getHasVoted()) return 'Vous n\'avez pas encore voté.';
    
    const candidateId = this.getVotedCandidateId();
    const candidate = this.candidates$.value.find(c => c.id === candidateId);
    return candidate ? `Vous avez voté pour ${candidate.name}.` : '';
  }

  // Réinitialiser tous les votes (nécessite une route backend)
  async resetVotes(): Promise<boolean> {
    try {
      // Pour l'instant, remise à zéro locale
      // Vous devriez ajouter une route DELETE /votes dans votre backend
      const resetCandidates = this.candidates$.value.map(c => ({ ...c, votes: 0 }));
      this.candidates$.next(resetCandidates);
      this.votes$.next([]);
      console.log('Tous les votes ont été réinitialisés');
      return true;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      return false;
    }
  }

  // Méthode pour déboguer - afficher l'état actuel
  debugState(): void {
    console.log('=== DEBUG STATE ===');
    console.log('Candidats:', this.candidates$.value);
    console.log('Votes:', this.votes$.value);
    console.log('Votes avec reçus:', this.getVotesWithReceipts());
    console.log('Votes en attente:', this.getPendingVotes());
    console.log('==================');
  }

  // Rafraîchir les données depuis le backend
  async refresh(): Promise<void> {
    await this.loadVotes();
  }
}
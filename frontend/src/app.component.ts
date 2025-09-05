import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { User } from './models/user.interface';
import { LoginComponent } from './components/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { UserVotingComponent } from './components/user-voting.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, AdminDashboardComponent, UserVotingComponent],
  template: `
    <div class="app-container">
      <app-login *ngIf="!currentUser"></app-login>
      <app-admin-dashboard *ngIf="currentUser?.role === 'admin'"></app-admin-dashboard>
      <app-user-voting *ngIf="currentUser?.role === 'user'"></app-user-voting>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}
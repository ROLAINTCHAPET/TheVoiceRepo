import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Admin credentials (in real app, this would be in a secure backend)
  private adminCredentials = {
    email: 'admin@thevoice.fr',
    password: 'admin123'
  };

  constructor() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): boolean {
    if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
      const adminUser: User = {
        id: '1',
        email: email,
        role: 'admin',
        isAuthenticated: true
      };
      this.currentUserSubject.next(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }
    return false;
  }

  loginAsUser(): void {
    const user: User = {
      id: Date.now().toString(),
      email: 'user@anonymous.com',
      role: 'user',
      isAuthenticated: true
    };
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || false;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user?.isAuthenticated || false;
  }
}
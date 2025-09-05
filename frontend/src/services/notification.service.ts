import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VoteNotification } from '../models/vote.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<VoteNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  addNotification(candidateName: string, voteId: string): void {
    const notification: VoteNotification = {
      id: Date.now().toString(),
      voteId: voteId,
      candidateName: candidateName,
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    this.notificationsSubject.next(notifications);
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(notif => !notif.read).length;
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }
}
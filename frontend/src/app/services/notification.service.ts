import { Injectable, signal } from '@angular/core';

export type NotifType = 'success' | 'error';

export interface AppNotification {
  id: number;
  message: string;
  type: NotifType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<AppNotification[]>([]);
  private counter = 0;

  show(message: string, type: NotifType): void {
    const id = this.counter++;
    this.notifications.update(list => [...list, { id, message, type }]);
    setTimeout(() => {
      this.notifications.update(list => list.filter(n => n.id !== id));
    }, 4000);
  }
}

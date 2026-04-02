import { Injectable } from '@nestjs/common';

export interface NotificationPayload {
  type: 'review:new' | 'review:new-reply' | 'review:flagged' | 'product:update';
  productId?: string;
  reviewId?: string;
  replyId?: string;
  userId?: string;
  data: any;
  timestamp: Date;
}

@Injectable()
export class NotificationsService {
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  addUser(userId: string, socketId: string) {
    this.connectedUsers.set(userId, socketId);
  }

  removeUser(socketId: string) {
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  getUserSocket(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }

  getAllConnectedUsers(): Map<string, string> {
    return this.connectedUsers;
  }
}

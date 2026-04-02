import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { NotificationsService, NotificationPayload } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private authService: AuthService,
    private notificationsService: NotificationsService,
  ) {}

  handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      console.log('🔌 Connection attempt. Token present:', !!token);
      
      if (!token) {
        const errorMsg = 'No token provided in auth handshake';
        this.logger.warn('❌ ' + errorMsg);
        console.error(errorMsg);
        socket.emit('auth_error', { message: errorMsg });
        return socket.disconnect();
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Token received (length:', token.length + ')');
      }
      
      const user = this.authService.validateToken(token);
      
      if (!user) {
        const errorMsg = 'Token validation failed - returned null';
        this.logger.warn('❌ ' + errorMsg);
        console.error(errorMsg);
        console.error('Token for reference:', token.substring(0, 50) + '...');
        socket.emit('auth_error', { message: errorMsg, tokenLength: token.length });
        return socket.disconnect();
      }

      socket.data.user = user;
      this.notificationsService.addUser(user.id, socket.id);
      
      // Join a general notifications room for this user
      socket.join(`user-${user.id}`);
      
      this.logger.log(`✅ User ${user.id} (${user.email}) connected via socket ${socket.id}`);
      this.logger.log(`📊 Total connected users: ${this.notificationsService.getAllConnectedUsers().size}`);
      console.log('✅ User successfully added to notifications service');
    } catch (error) {
      this.logger.error('❌ Connection error:', error);
      console.error('Detailed error:', error);
      socket.emit('auth_error', { message: 'Connection error', error: error instanceof Error ? error.message : String(error) });
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.notificationsService.removeUser(socket.id);
    this.logger.log(`❌ User disconnected: ${socket.id}`);
    this.logger.log(`📊 Total connected users: ${this.notificationsService.getAllConnectedUsers().size}`);
  }

  // Listen for client notifications
  @SubscribeMessage('message')
  handleMessage(socket: Socket, data: any) {
    console.log('Message from client:', data);
  }

  // Broadcast new review notification to all connected users
  broadcastNewReview(data: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }
    
    if (!data?.productId) {
      this.logger.error('Invalid notification - missing productId');
      return;
    }

    console.log(`📡 Broadcasting review:new event to ALL users for product "${data.productId}"`);
    
    // Emit to all connected clients
    this.server.emit('review:new', {
      reviewId: data.reviewId || data.data?._id,
      productId: data.productId,
      data: data.data,
      timestamp: new Date(),
    });
    
    console.log(`✅ review:new event emitted to all connected users`);
  }

  // Broadcast new reply notification to all connected users
  broadcastNewReply(data: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }
    
    if (!data?.reviewId || !data?.productId) {
      this.logger.error('Invalid notification - missing reviewId or productId');
      return;
    }

    console.log(`📡 Broadcasting review:new-reply event to ALL users for product "${data.productId}"`);
    
    // Emit to all connected clients so they see the new reply
    this.server.emit('review:new-reply', {
      reviewId: data.reviewId,
      productId: data.productId,
      data: data.data,
      timestamp: new Date(),
    });
    
    console.log(`✅ review:new-reply event emitted to all connected users`);
  }

  // Send direct notification to review owner
  sendReplyNotification(reviewOwnerId: string, notification: NotificationPayload) {
    console.log(`📡 Sending reply notification to user ${reviewOwnerId}`);
    const socketId = this.notificationsService.getUserSocket(reviewOwnerId);
    if (socketId) {
      this.server.to(socketId).emit('review:new-reply', {
        reviewId: notification.reviewId,
        replyId: notification.replyId,
        data: notification.data,
        timestamp: new Date(),
      });
      console.log(`✅ review:new-reply event sent to socket ${socketId}`);
    } else {
      console.warn(`⚠️ User ${reviewOwnerId} is not connected`);
    }
  }

  // Send admin review flagged notification
  sendReviewFlaggedNotification(reviewOwnerId: string, notification: NotificationPayload) {
    const socketId = this.notificationsService.getUserSocket(reviewOwnerId);
    if (socketId) {
      this.server.to(socketId).emit('review:flagged', {
        reviewId: notification.reviewId,
        data: notification.data,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast product update notification
  broadcastProductUpdate(notification: NotificationPayload) {
    this.server.emit('product:update', {
      productId: notification.productId,
      data: notification.data,
      timestamp: new Date(),
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.server.engine.clientsCount;
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationsDBService } from '../services/notifications-db.service';

/**
 * Notifications Controller
 * REST API endpoints for user notifications (not WebSocket)
 */
@Controller('api/notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsDBService: NotificationsDBService) {}

  /**
   * GET /api/notifications - Get user's notifications
   * @requires JWT authentication
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @Request() req: any,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    try {
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
      const offsetNum = Math.max(0, parseInt(offset) || 0);

      const { notifications, total } = await this.notificationsDBService.getUserNotifications(
        req.user.id,
        limitNum,
        offsetNum,
      );

      return {
        success: true,
        data: notifications,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
        },
      };
    } catch (error: any) {
      this.logger.error(`Error fetching notifications: ${error?.message}`);
      throw error;
    }
  }

  /**
   * GET /api/notifications/unread-count - Get count of unread notifications
   * @requires JWT authentication
   */
  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Request() req: any) {
    try {
      const count = await this.notificationsDBService.getUnreadCount(req.user.id);
      return {
        success: true,
        unreadCount: count,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching unread count: ${error?.message}`);
      throw error;
    }
  }

  /**
   * PUT /api/notifications/:id/read - Mark notification as read
   * @requires JWT authentication
   */
  @Put(':id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') notificationId: string) {
    try {
      const notification = await this.notificationsDBService.markAsRead(notificationId);
      return {
        success: true,
        message: 'Notification marked as read',
        data: notification,
      };
    } catch (error: any) {
      this.logger.error(`Error marking notification as read: ${error?.message}`);
      throw error;
    }
  }

  /**
   * DELETE /api/notifications/:id - Delete notification
   * @requires JWT authentication
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Param('id') notificationId: string) {
    try {
      await this.notificationsDBService.deleteNotification(notificationId);
      return {
        success: true,
        message: 'Notification deleted',
      };
    } catch (error: any) {
      this.logger.error(`Error deleting notification: ${error?.message}`);
      throw error;
    }
  }

  /**
   * PUT /api/notifications/read-all - Mark all notifications as read
   * @requires JWT authentication
   */
  @Put('actions/read-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req: any) {
    try {
      const result = await this.notificationsDBService.markAllAsRead(req.user.id);
      return {
        success: true,
        message: 'All notifications marked as read',
        data: result,
      };
    } catch (error: any) {
      this.logger.error(`Error marking all notifications as read: ${error?.message}`);
      throw error;
    }
  }

  /**
   * DELETE /api/notifications - Delete all notifications
   * @requires JWT authentication
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAllNotifications(@Request() req: any) {
    try {
      const result = await this.notificationsDBService.deleteAllNotifications(req.user.id);
      return {
        success: true,
        message: 'All notifications deleted',
        data: result,
      };
    } catch (error: any) {
      this.logger.error(`Error deleting all notifications: ${error?.message}`);
      throw error;
    }
  }
}

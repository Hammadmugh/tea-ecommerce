import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationsDBService {
  private readonly logger = new Logger(NotificationsDBService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(
    userId: Types.ObjectId | string,
    type: string,
    message: string,
    data?: any,
  ): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId,
      type,
      message,
      data,
      isRead: false,
    });

    const saved = await notification.save();
    this.logger.log(`📌 Notification created for user ${userId}: ${message}`);
    return saved;
  }

  async getUserNotifications(
    userId: Types.ObjectId | string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ notifications: any[]; total: number }> {
    const total = await this.notificationModel.countDocuments({ userId });
    const notifications = await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean()
      .exec();

    return { notifications: notifications as any[], total };
  }

  async markAsRead(notificationId: string | Types.ObjectId): Promise<NotificationDocument | null> {
    const updated = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true, updatedAt: new Date() },
      { new: true },
    );
    this.logger.log(`✅ Notification ${notificationId} marked as read`);
    return updated as any;
  }

  async deleteNotification(notificationId: string | Types.ObjectId): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId);
    this.logger.log(`🗑️ Notification ${notificationId} deleted`);
  }

  async markAllAsRead(userId: Types.ObjectId | string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, updatedAt: new Date() },
    );
    this.logger.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    return { modifiedCount: result.modifiedCount };
  }

  async deleteAllNotifications(userId: Types.ObjectId | string): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel.deleteMany({ userId });
    this.logger.log(`🗑️ Deleted ${result.deletedCount} notifications for user ${userId}`);
    return { deletedCount: result.deletedCount };
  }

  async getUnreadCount(userId: Types.ObjectId | string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, isRead: false });
  }
}

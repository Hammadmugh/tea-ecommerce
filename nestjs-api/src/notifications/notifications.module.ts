import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationsDBService } from './services/notifications-db.service';
import { NotificationsController } from './controllers/notifications.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService, NotificationsDBService],
  exports: [NotificationsService, NotificationsDBService, NotificationsGateway],
})
export class NotificationsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';

// Load .env file explicitly from the correct path
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Log JWT configuration on startup
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('❌ CRITICAL: JWT_SECRET not set in environment!');
  console.error('Please ensure .env file has: JWT_SECRET=abcAbc');
  process.exit(1);
}
console.log('🔐 App.module: JWT_SECRET loaded successfully');
console.log('🔑 JWT_SECRET value:', jwtSecret);

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-tea'
    ),
    AuthModule,
    ReviewsModule,
    NotificationsModule,
  ],
})
export class AppModule {}

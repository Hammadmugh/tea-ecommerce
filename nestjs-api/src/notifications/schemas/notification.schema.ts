import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  })
  userId!: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ['review', 'reply', 'helpful', 'unhelpful', 'flagged'],
    index: true 
  })
  type!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ 
    type: String,
    required: false
  })
  productId?: string;

  @Prop({ 
    type: Types.ObjectId,
    ref: 'Review',
    required: false 
  })
  reviewId?: Types.ObjectId;

  @Prop({ 
    type: Types.ObjectId,
    ref: 'Review',
    required: false 
  })
  replyId?: Types.ObjectId;

  @Prop({ default: false, index: true })
  isRead!: boolean;

  @Prop({ type: Object, default: {} })
  data?: any;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

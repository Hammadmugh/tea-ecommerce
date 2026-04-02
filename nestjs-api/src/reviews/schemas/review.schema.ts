import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Reply Document Type
export type ReplyDocument = Reply & Document;

@Schema({ timestamps: true })
export class Reply {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  userName!: string;

  @Prop({ required: true })
  userEmail!: string;

  @Prop({ required: true, minlength: 5, maxlength: 500, trim: true })
  content!: string;

  @Prop({ default: false })
  isAdminReply!: boolean;

  @Prop({ default: false })
  isFlagged!: boolean;

  @Prop({ default: 0, min: 0 })
  upvotes!: number;

  @Prop({ default: 0, min: 0 })
  downvotes!: number;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);

// Review Document Type
export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ 
    type: String,
    required: true,
    index: true,
    trim: true 
  })
  productId!: string;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  userName!: string;

  @Prop({ required: true, lowercase: true })
  userEmail!: string;

  @Prop({ 
    required: true, 
    minlength: 20, 
    maxlength: 2000, 
    trim: true 
  })
  comment!: string;

  @Prop({ 
    required: true, 
    min: 1, 
    max: 5, 
    type: Number 
  })
  rating!: number;

  @Prop({ 
    type: [ReplySchema], 
    default: [] 
  })
  replies!: Reply[];

  @Prop({ default: 0, min: 0 })
  helpfulCount!: number;

  @Prop({ default: 0, min: 0 })
  unhelpfulCount!: number;

  @Prop({ default: false })
  isVerifiedPurchase!: boolean;

  @Prop({ default: false })
  isFlagged!: boolean;

  @Prop({ 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  })
  moderationStatus!: string;

  @Prop({ default: false })
  isModerated!: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes for performance optimization
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ moderationStatus: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ 'replies.userId': 1 });

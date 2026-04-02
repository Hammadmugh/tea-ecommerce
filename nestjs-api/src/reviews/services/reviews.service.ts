import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { 
  CreateReviewDto, 
  UpdateReviewDto, 
  CreateReplyDto, 
  UpdateReplyDto,
  PaginationDto 
} from '../dtos/review.dto';
import { NotificationsGateway } from '../../notifications/notifications.gateway';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Create a new product review
   * @param createReviewDto - Review data
   * @param userId - ID of the user creating the review
   * @param userName - Name of the user
   * @param userEmail - Email of the user
   * @returns Created review document
   */
  async createReview(
    createReviewDto: CreateReviewDto,
    userId: string,
    userName: string,
    userEmail: string,
  ): Promise<ReviewDocument> {
    try {
      // Validate that user hasn't already reviewed this product
      const existingReview = await this.reviewModel.findOne({
        productId: createReviewDto.productId.trim(),
        userId: new Types.ObjectId(userId),
      });

      if (existingReview) {
        throw new BadRequestException('You have already reviewed this product');
      }

      const review = new this.reviewModel({
        ...createReviewDto,
        productId: createReviewDto.productId.trim(),
        userId: new Types.ObjectId(userId),
        userName,
        userEmail,
        moderationStatus: 'approved',
      });

      const savedReview = await review.save();
      this.logger.log(`Review created with ID: ${savedReview._id}`);
      
      // 🔔 Broadcast new review notification to all users
      try {
        this.logger.log(`🔔 Broadcasting new review event to all connected users`);
        this.notificationsGateway.broadcastNewReview({
          type: 'review:new',
          reviewId: savedReview._id.toString(),
          productId: createReviewDto.productId,
          data: {
            _id: savedReview._id,
            productId: savedReview.productId,
            userName: savedReview.userName,
            comment: savedReview.comment,
            rating: savedReview.rating,
            createdAt: savedReview.createdAt,
          },
          timestamp: new Date(),
        });
        this.logger.log(`✅ Review event broadcasted successfully`);
      } catch (error) {
        this.logger.error(`❌ Error broadcasting review notification: ${error}`);
      }
      
      return savedReview;
    } catch (error: any) {
      this.logger.error(`Error creating review: ${error?.message || error}`, error);
      throw error;
    }
  }

  /**
   * Get all reviews for a specific product with pagination
   * @param productId - Product ID (slug or MongoDB ObjectId)
   * @param page - Page number
   * @param limit - Items per page
   * @returns Reviews with pagination metadata
   */
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    reviews: ReviewDocument[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    try {
      // Validate pagination parameters
      page = Math.max(1, page);
      limit = Math.min(100, Math.max(1, limit));
      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        this.reviewModel
          .find({
            productId: productId.trim(),
            moderationStatus: 'approved',
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.reviewModel.countDocuments({
          productId: productId.trim(),
          moderationStatus: 'approved',
        }),
      ]);

      return {
        reviews: reviews as any,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching product reviews: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Get a single review by ID
   * @param reviewId - Review ID
   * @returns Review document
   */
  async getReviewById(reviewId: string): Promise<ReviewDocument> {
    try {
      if (!Types.ObjectId.isValid(reviewId)) {
        throw new BadRequestException('Invalid review ID format');
      }

      const review = await this.reviewModel.findById(reviewId);
      
      if (!review) {
        throw new NotFoundException(`Review with ID ${reviewId} not found`);
      }
      
      return review;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error fetching review: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Update a review (owner only)
   * @param reviewId - Review ID
   * @param userId - ID of user attempting update
   * @param updateReviewDto - Updated review data
   * @returns Updated review
   */
  async updateReview(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewDocument> {
    try {
      const review = await this.getReviewById(reviewId);

      // Verify ownership
      if (review.userId.toString() !== userId) {
        throw new ForbiddenException('You can only update your own reviews');
      }

      Object.assign(review, updateReviewDto);
      review.updatedAt = new Date();
      
      const updatedReview = await review.save();
      this.logger.log(`Review ${reviewId} updated`);
      
      return updatedReview;
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error updating review: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Delete a review (owner or admin only)
   * @param reviewId - Review ID
   * @param userId - User ID
   * @param isAdmin - Whether user is admin
   * @returns Deleted review
   */
  async deleteReview(
    reviewId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<ReviewDocument> {
    try {
      const review = await this.getReviewById(reviewId);

      // Verify ownership or admin rights
      if (review.userId.toString() !== userId && !isAdmin) {
        throw new ForbiddenException('You can only delete your own reviews');
      }

      const deletedReview = await this.reviewModel.findByIdAndDelete(reviewId) as ReviewDocument | null;
      if (!deletedReview) {
        throw new NotFoundException(`Review with ID ${reviewId} not found`);
      }
      this.logger.log(`Review ${reviewId} deleted`);
      
      return deletedReview;
    } catch (error: any) {
      this.logger.error(`Error deleting review: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Add a reply to a review
   * @param reviewId - Review ID
   * @param createReplyDto - Reply data
   * @param userId - ID of user adding reply
   * @param userName - Name of user
   * @param userEmail - Email of user
   * @returns Updated review with new reply
   */
  async addReply(
    reviewId: string,
    createReplyDto: CreateReplyDto,
    userId: string,
    userName: string,
    userEmail: string,
  ): Promise<ReviewDocument> {
    try {
      const review = await this.getReviewById(reviewId);

      const newReply = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        userName,
        userEmail,
        content: createReplyDto.content,
        isAdminReply: createReplyDto.isAdminReply || false,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      review.replies.push(newReply as any);
      
      const updatedReview = await review.save();
      this.logger.log(`Reply added to review ${reviewId}`);
      
      // 🔔 Send direct notification to review owner (only if not the person replying)
      const reviewOwnerId = review.userId.toString();
      if (reviewOwnerId !== userId) {
        this.notificationsGateway.sendReplyNotification(
          reviewOwnerId,
          {
            type: 'review:new-reply',
            reviewId: reviewId,
            replyId: (newReply as any)._id.toString(),
            data: {
              reviewId,
              userName,
              content: createReplyDto.content,
              isAdminReply: createReplyDto.isAdminReply || false,
              createdAt: new Date(),
            },
            timestamp: new Date(),
          }
        );
      }
      
      return updatedReview;
    } catch (error: any) {
      this.logger.error(`Error adding reply: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Delete a reply from a review
   * @param reviewId - Review ID
   * @param replyId - Reply ID
   * @param userId - User ID
   * @param isAdmin - Whether user is admin
   * @returns Updated review
   */
  async deleteReply(
    reviewId: string,
    replyId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<ReviewDocument> {
    try {
      const review = await this.getReviewById(reviewId);

      const replyIndex = review.replies.findIndex(
        (r) => (r as any)._id?.toString() === replyId,
      );
      
      if (replyIndex === -1) {
        throw new NotFoundException(`Reply with ID ${replyId} not found`);
      }

      const reply = review.replies[replyIndex];

      // Verify ownership or admin rights
      if (reply.userId.toString() !== userId && !isAdmin) {
        throw new ForbiddenException('You can only delete your own replies');
      }

      review.replies.splice(replyIndex, 1);
      
      const updatedReview = await review.save();
      this.logger.log(`Reply ${replyId} deleted from review ${reviewId}`);
      
      return updatedReview;
    } catch (error: any) {
      this.logger.error(`Error deleting reply: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Update a reply in a review
   * @param reviewId - Review ID
   * @param replyId - Reply ID
   * @param updateReplyDto - Updated reply data
   * @param userId - User ID
   * @param isAdmin - Whether user is admin
   * @returns Updated review
   */
  async updateReply(
    reviewId: string,
    replyId: string,
    updateReplyDto: UpdateReplyDto,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<ReviewDocument> {
    try {
      const review = await this.getReviewById(reviewId);

      const reply = review.replies.find((r) => (r as any)._id?.toString() === replyId);
      if (!reply) {
        throw new NotFoundException(`Reply with ID ${replyId} not found`);
      }

      // Verify ownership or admin rights
      if (reply.userId.toString() !== userId && !isAdmin) {
        throw new ForbiddenException('You can only edit your own replies');
      }

      Object.assign(reply, updateReplyDto);
      reply.updatedAt = new Date();
      
      const updatedReview = await review.save();
      this.logger.log(`Reply ${replyId} updated in review ${reviewId}`);
      
      return updatedReview;
    } catch (error: any) {
      this.logger.error(`Error updating reply: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Flag a review for moderation
   * @param reviewId - Review ID
   * @returns Updated review
   */
  async flagReview(reviewId: string): Promise<ReviewDocument> {
    try {
      const review = await this.getReviewById(reviewId);
      review.isFlagged = true;
      
      const updatedReview = await review.save();
      this.logger.warn(`Review ${reviewId} flagged for moderation`);
      
      return updatedReview;
    } catch (error: any) {
      this.logger.error(`Error flagging review: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Get average rating for a product
   * @param productId - Product ID (slug or MongoDB ObjectId)
   * @returns Average rating and count
   */
  async getProductAverageRating(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    try {
      const result = await this.reviewModel.aggregate([
        {
          $match: {
            productId: productId.trim(),
            moderationStatus: 'approved',
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            rating1: {
              $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
            },
            rating2: {
              $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
            },
            rating3: {
              $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
            },
            rating4: {
              $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
            },
            rating5: {
              $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
            },
          },
        },
      ]);

      if (!result || result.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const data = result[0];
      return {
        averageRating: Math.round(data.averageRating * 10) / 10,
        totalReviews: data.totalReviews,
        ratingDistribution: {
          1: data.rating1,
          2: data.rating2,
          3: data.rating3,
          4: data.rating4,
          5: data.rating5,
        },
      };
    } catch (error: any) {
      this.logger.error(`Error calculating average rating: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Mark review as helpful
   * @param reviewId - Review ID
   * @returns Updated review
   */
  async markHelpful(reviewId: string): Promise<ReviewDocument> {
    try {
      const review = await this.getReviewById(reviewId);
      review.helpfulCount = (review.helpfulCount || 0) + 1;
      
      const updatedReview = await review.save();
      this.logger.log(`Review ${reviewId} marked as helpful`);
      
      // 🔔 Notify review author about the helpful vote
      this.notificationsGateway.sendReplyNotification(
        review.userId.toString(),
        {
          type: 'review:new-reply',
          reviewId: reviewId,
          data: {
            type: 'helpful-vote',
            reviewId,
            helpfulCount: updatedReview.helpfulCount,
          },
          timestamp: new Date(),
        }
      );
      
      return updatedReview;
    } catch (error: any) {
      this.logger.error(`Error marking review as helpful: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Mark review as unhelpful
   * @param reviewId - Review ID
   * @returns Updated review
   */
  async markUnhelpful(reviewId: string): Promise<ReviewDocument> {
    try {
      const review = await this.getReviewById(reviewId);
      review.unhelpfulCount = (review.unhelpfulCount || 0) + 1;
      
      const updatedReview = await review.save();
      this.logger.log(`Review ${reviewId} marked as unhelpful`);
      
      // 🔔 Notify review author about the unhelpful vote
      this.notificationsGateway.sendReplyNotification(
        review.userId.toString(),
        {
          type: 'review:new-reply',
          reviewId: reviewId,
          data: {
            type: 'unhelpful-vote',
            reviewId,
            unhelpfulCount: updatedReview.unhelpfulCount,
          },
          timestamp: new Date(),
        }
      );
      
      return updatedReview;
    } catch (error: any) {
      this.logger.error(`Error marking review as unhelpful: ${error?.message || error}`);
      throw error;
    }
  }

  // Unflag review (admin only)
  async unflagReview(reviewId: string): Promise<ReviewDocument> {
    const review = await this.getReviewById(reviewId);
    review.isFlagged = false;
    return review.save();
  }

  // Get reviews by user
  async getUserReviews(userId: string, page: number = 1, limit: number = 10): Promise<{ reviews: ReviewDocument[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const reviews = await this.reviewModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.reviewModel.countDocuments({ userId: new Types.ObjectId(userId) });

    return {
      reviews,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

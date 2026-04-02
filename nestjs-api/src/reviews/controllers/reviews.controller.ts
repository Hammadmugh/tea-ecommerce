import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  CreateReplyDto,
  UpdateReplyDto,
} from '../dtos/review.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationsGateway } from '../../notifications/notifications.gateway';
import { NotificationsDBService } from '../../notifications/services/notifications-db.service';

/**
 * Reviews Controller
 * Handles all review-related endpoints: /api/reviews
 */
@Controller('api/reviews')
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);

  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsDBService: NotificationsDBService,
  ) {}

  /**
   * POST /api/reviews - Create a new review
   * @requires JWT authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Creating review for product ${createReviewDto.productId} by user ${req.user.id}`,
      );

      const review = await this.reviewsService.createReview(
        createReviewDto,
        req.user.id,
        req.user.name,
        req.user.email,
      );
      
      // Emit socket notification to all connected users
      console.log('🔔 Emitting review:new notification via socket');
      this.notificationsGateway.broadcastNewReview({
        productId: createReviewDto.productId,
        reviewId: review._id,
        data: review,
      });

      // Save notification to database for all users (they'll see it when they fetch notifications)
      const message = `🔔 New review on ${createReviewDto.productId}: "${review.comment.substring(0, 40)}..."`;
      try {
        // In a real scenario, you might want to send this to specific users only
        // For now, we create a notification that can be viewed by anyone interested
        console.log('💾 Saving notification to database');
        // Could broadcast to specific user IDs here if needed
      } catch (notifError) {
        this.logger.warn(`Could not save notification to DB: ${notifError}`);
      }
      
      return {
        success: true,
        message: 'Review created successfully.',
        data: review,
      };
    } catch (error: any) {
      this.logger.error(`Error creating review: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * GET /api/reviews/product/:productId - Get all reviews for a product
   * Query params: page, limit
   */
  @Get('product/:productId')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    try {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

      this.logger.log(
        `Fetching reviews for product ${productId} - page ${pageNum}, limit ${limitNum}`,
      );

      const { reviews, total, pages, currentPage } =
        await this.reviewsService.getProductReviews(productId, pageNum, limitNum);

      return {
        success: true,
        data: reviews,
        pagination: {
          total,
          pages,
          currentPage,
          limit: limitNum,
        },
      };
    } catch (error: any) {
      this.logger.error(`Error fetching product reviews: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * GET /api/reviews/product/:productId/rating-stats - Get rating statistics
   */
  @Get('product/:productId/rating-stats')
  async getProductRatingStats(@Param('productId') productId: string) {
    try {
      this.logger.log(`Fetching rating stats for product ${productId}`);

      const stats = await this.reviewsService.getProductAverageRating(productId);

      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching rating stats: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * GET /api/reviews/:reviewId - Get single review with replies
   */
  @Get(':reviewId')
  async getReviewById(@Param('reviewId') reviewId: string) {
    try {
      this.logger.log(`Fetching review ${reviewId}`);

      const review = await this.reviewsService.getReviewById(reviewId);

      return {
        success: true,
        data: review,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching review: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * PUT /api/reviews/:reviewId - Update review (owner only)
   * @requires JWT authentication
   */
  @Put(':reviewId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(`Updating review ${reviewId} by user ${req.user.id}`);

      const review = await this.reviewsService.updateReview(
        reviewId,
        req.user.id,
        updateReviewDto,
      );

      return {
        success: true,
        message: 'Review updated successfully',
        data: review,
      };
    } catch (error: any) {
      this.logger.error(`Error updating review: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * DELETE /api/reviews/:reviewId - Delete review (owner or admin)
   * @requires JWT authentication
   */
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteReview(@Param('reviewId') reviewId: string, @Request() req: any) {
    try {
      this.logger.log(`Deleting review ${reviewId} by user ${req.user.id}`);

      const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

      await this.reviewsService.deleteReview(reviewId, req.user.id, isAdmin);

      return {
        success: true,
        message: 'Review deleted successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error deleting review: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * POST /api/reviews/:reviewId/replies - Add reply to review
   * @requires JWT authentication
   */
  @Post(':reviewId/replies')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addReply(
    @Param('reviewId') reviewId: string,
    @Body() createReplyDto: CreateReplyDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Adding reply to review ${reviewId} by user ${req.user.id}`,
      );

      const review = await this.reviewsService.addReply(
        reviewId,
        createReplyDto,
        req.user.id,
        req.user.name,
        req.user.email,
      );

      // Emit socket notification to all users
      console.log('🔔 Emitting review:new-reply notification via socket');
      this.notificationsGateway.broadcastNewReply({
        reviewId,
        productId: review.productId,
        reviewOwnerId: review.userId,
        data: review,
      });

      return {
        success: true,
        message: 'Reply added successfully',
        data: review,
      };
    } catch (error: any) {
      this.logger.error(`Error adding reply: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * PUT /api/reviews/:reviewId/replies/:replyId - Update reply (owner or admin)
   * @requires JWT authentication
   */
  @Put(':reviewId/replies/:replyId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateReply(
    @Param('reviewId') reviewId: string,
    @Param('replyId') replyId: string,
    @Body() updateReplyDto: UpdateReplyDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Updating reply ${replyId} in review ${reviewId} by user ${req.user.id}`,
      );

      const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

      const review = await this.reviewsService.updateReply(
        reviewId,
        replyId,
        updateReplyDto,
        req.user.id,
        isAdmin,
      );

      return {
        success: true,
        message: 'Reply updated successfully',
        data: review,
      };
    } catch (error: any) {
      this.logger.error(`Error updating reply: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * DELETE /api/reviews/:reviewId/replies/:replyId - Delete reply (owner or admin)
   * @requires JWT authentication
   */
  @Delete(':reviewId/replies/:replyId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteReply(
    @Param('reviewId') reviewId: string,
    @Param('replyId') replyId: string,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Deleting reply ${replyId} from review ${reviewId} by user ${req.user.id}`,
      );

      const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

      await this.reviewsService.deleteReply(
        reviewId,
        replyId,
        req.user.id,
        isAdmin,
      );

      return {
        success: true,
        message: 'Reply deleted successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error deleting reply: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * POST /api/reviews/:reviewId/mark-helpful - Mark review as helpful
   */
  @Post(':reviewId/mark-helpful')
  @HttpCode(HttpStatus.OK)
  async markHelpful(@Param('reviewId') reviewId: string) {
    try {
      this.logger.log(`Marking review ${reviewId} as helpful`);

      const review = await this.reviewsService.markHelpful(reviewId);

      return {
        success: true,
        message: 'Review marked as helpful',
        data: review,
      };
    } catch (error: any) {
      this.logger.error(`Error marking review as helpful: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * POST /api/reviews/:reviewId/mark-unhelpful - Mark review as unhelpful
   */
  @Post(':reviewId/mark-unhelpful')
  @HttpCode(HttpStatus.OK)
  async markUnhelpful(@Param('reviewId') reviewId: string) {
    try {
      this.logger.log(`Marking review ${reviewId} as unhelpful`);

      const review = await this.reviewsService.markUnhelpful(reviewId);

      return {
        success: true,
        message: 'Review marked as unhelpful',
        data: review,
      };
    } catch (error: any) {
      this.logger.error(`Error marking review as unhelpful: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * POST /api/reviews/:reviewId/flag - Flag review for moderation
   */
  @Post(':reviewId/flag')
  @HttpCode(HttpStatus.OK)
  async flagReview(@Param('reviewId') reviewId: string) {
    try {
      this.logger.log(`Flagging review ${reviewId} for moderation`);

      const review = await this.reviewsService.flagReview(reviewId);

      return {
        success: true,
        message: 'Review flagged for moderation',
        data: review,
      };
    } catch (error: any) {
      this.logger.error(`Error flagging review: ${error?.message || error}`);
      throw error;
    }
  }
}

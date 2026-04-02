import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  Min, 
  Max, 
  IsOptional, 
  IsMongoId,
  MinLength,
  MaxLength,
  IsEmail,
  Matches
} from 'class-validator';

/**
 * DTO for creating a new review
 */
export class CreateReviewDto {
  @Matches(/^([0-9a-fA-F]{24}|[a-z0-9]+(-[a-z0-9]+)*)$/, { 
    message: 'Invalid product ID format (must be MongoDB ID or product slug)' 
  })
  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId!: string;

  @IsString({ message: 'Comment must be a string' })
  @MinLength(20, { message: 'Comment must be at least 20 characters' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  @IsNotEmpty({ message: 'Comment is required' })
  comment!: string;

  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be between 1 and 5' })
  @Max(5, { message: 'Rating must be between 1 and 5' })
  @IsNotEmpty({ message: 'Rating is required' })
  rating!: number;

  @IsOptional()
  @IsMongoId({ message: 'Invalid product variant ID' })
  variantId?: string;

  @IsOptional()
  @IsString()
  images?: string[];
}

/**
 * DTO for updating a review
 */
export class UpdateReviewDto {
  @IsString({ message: 'Comment must be a string' })
  @MinLength(20, { message: 'Comment must be at least 20 characters' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  @IsOptional()
  comment?: string;

  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be between 1 and 5' })
  @Max(5, { message: 'Rating must be between 1 and 5' })
  @IsOptional()
  rating?: number;
}

/**
 * DTO for creating a reply to a review
 */
export class CreateReplyDto {
  @IsString({ message: 'Reply content must be a string' })
  @MinLength(5, { message: 'Reply must be at least 5 characters' })
  @MaxLength(500, { message: 'Reply must not exceed 500 characters' })
  @IsNotEmpty({ message: 'Reply content is required' })
  content!: string;

  @IsOptional()
  isAdminReply?: boolean;
}

/**
 * DTO for updating a reply
 */
export class UpdateReplyDto {
  @IsString({ message: 'Reply content must be a string' })
  @MinLength(5, { message: 'Reply must be at least 5 characters' })
  @MaxLength(500, { message: 'Reply must not exceed 500 characters' })
  @IsOptional()
  content?: string;
}

/**
 * DTO for pagination queries
 */
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

/**
 * Response DTO for reviews with metadata
 */
export class ReviewResponseDto {
  _id!: string;
  productId!: string;
  userId!: string;
  userName!: string;
  userEmail!: string;
  comment!: string;
  rating!: number;
  helpfulCount!: number;
  unhelpfulCount!: number;
  isVerifiedPurchase!: boolean;
  moderationStatus!: string;
  replies!: any[];
  createdAt!: Date;
  updatedAt!: Date;
}

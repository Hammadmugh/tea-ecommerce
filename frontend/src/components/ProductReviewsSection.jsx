import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Trash2, Edit2, AlertCircle, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import { createReview, getProductReviews, updateReview, deleteReview, getProductAverageRating, addReplyToReview, deleteReply, markHelpful, markUnhelpful } from '../services/reviewApi';
import { onNewReview, onNewReply } from '../services/socketService';

export default function ProductReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ comment: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [replyingToReviewId, setReplyingToReviewId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [votedReviews, setVotedReviews] = useState({});
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  // Toggle expand/collapse for replies
  const toggleRepliesExpanded = (reviewId) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  // Load reviews and rating
  useEffect(() => {
    loadReviews();
    loadAverageRating();
  }, [productId, page]);

  // Subscribe to real-time reviews
  useEffect(() => {
    const unsubscribe = onNewReview((data) => {
      if (data.productId === productId && page === 1) {
        setReviews(prev => [data.data || data, ...prev]);
      }
    });

    return unsubscribe;
  }, [productId, page]);

  // Subscribe to real-time replies and votes
  useEffect(() => {
    const unsubscribe = onNewReply((data) => {
      if (data.type === 'helpful-vote' || data.type === 'unhelpful-vote') {
        // Update helpful/unhelpful count in real-time
        setReviews(prev => prev.map(review =>
          review._id === data.reviewId
            ? {
              ...review,
              helpfulCount: data.type === 'helpful-vote' ? data.helpfulCount : review.helpfulCount,
              unhelpfulCount: data.type === 'unhelpful-vote' ? data.unhelpfulCount : review.unhelpfulCount,
            }
            : review
        ));
      } else {
        // New reply notification - reload reviews to show new reply
        loadReviews();
      }
    });

    return unsubscribe;
  }, [productId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await getProductReviews(productId, page, 10);
      setReviews(response.data);
      setTotalPages(response.pagination.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAverageRating = async () => {
    try {
      const response = await getProductAverageRating(productId);
      setAverageRating(response.data.average);
    } catch (err) {
      console.error('Failed to load rating:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      setError('Please log in to leave a review');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateReview(editingId, formData);
        setEditingId(null);
      } else {
        await createReview({
          ...formData,
          productId,
        });
      }
      setFormData({ comment: '', rating: 5 });
      setShowForm(false);
      loadReviews();
      loadAverageRating();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(reviewId);
      loadReviews();
      loadAverageRating();
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const canEditReview = (review) => user && (user.id === review.userId || user.role === 'admin');

  const handleAddReply = async (reviewId) => {
    if (!user || !user.id) {
      setError('Please log in to add a reply');
      return;
    }

    if (!replyContent.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      setIsSubmittingReply(true);
      await addReplyToReview(reviewId, { content: replyContent });
      setReplyContent('');
      setReplyingToReviewId(null);
      loadReviews();
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to add reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      await deleteReply(reviewId, replyId);
      loadReviews();
    } catch (err) {
      setError('Failed to delete reply');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!user || !user.id) {
      setError('Please log in to vote');
      return;
    }

    try {
      await markHelpful(reviewId);
      setVotedReviews(prev => ({ ...prev, [reviewId]: 'helpful' }));
      loadReviews();
    } catch (err) {
      setError(err.message || 'Failed to mark as helpful');
    }
  };

  const handleMarkUnhelpful = async (reviewId) => {
    if (!user || !user.id) {
      setError('Please log in to vote');
      return;
    }

    try {
      await markUnhelpful(reviewId);
      setVotedReviews(prev => ({ ...prev, [reviewId]: 'unhelpful' }));
      loadReviews();
    } catch (err) {
      setError(err.message || 'Failed to mark as unhelpful');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {averageRating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">{averageRating}/5</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Write a Review
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    className={formData.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this product... (minimum 20 characters)"
              rows={5}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              minLength="20"
              maxLength="2000"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.comment.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : editingId ? 'Update Review' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ comment: '', rating: 5 });
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">by {review.userName} • {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                {canEditReview(review) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData({ comment: review.comment, rating: review.rating });
                        setEditingId(review._id);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Voting Buttons */}
              <div className="flex gap-4 mb-3 pb-3 border-b">
                <button
                  onClick={() => handleMarkHelpful(review._id)}
                  className={`flex items-center gap-1 text-sm ${votedReviews[review._id] === 'helpful' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
                >
                  <ThumbsUp size={16} />
                  Helpful {review.helpful > 0 && `(${review.helpful})`}
                </button>
                <button
                  onClick={() => handleMarkUnhelpful(review._id)}
                  className={`flex items-center gap-1 text-sm ${votedReviews[review._id] === 'unhelpful' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                >
                  <ThumbsDown size={16} />
                  Not Helpful {review.unhelpful > 0 && `(${review.unhelpful})`}
                </button>
              </div>

              {/* Replies Section */}
              {review.replies && review.replies.length > 0 && (
                <div className="bg-gray-50 rounded-lg mt-3 mb-3">
                  {/* Collapsible Header */}
                  <button
                    onClick={() => toggleRepliesExpanded(review._id)}
                    className="w-full px-3 py-3 flex gap-2 items-center hover:bg-gray-100 transition-colors text-left"
                  >
                    <MessageCircle size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">
                      {review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`ml-auto text-gray-600 transition-transform duration-200 ${
                        expandedReplies.has(review._id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded Replies List */}
                  {expandedReplies.has(review._id) && (
                    <div className="px-3 pb-3 space-y-2 border-t border-gray-200">
                      {review.replies.map((reply) => (
                        <div key={reply._id} className="bg-white p-3 rounded text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">
                                {reply.userName} 
                                {reply.isAdminReply && (
                                  <span className="text-blue-600 text-xs font-bold ml-2">[ADMIN]</span>
                                )}
                              </p>
                              <p className="text-gray-700 mt-1">{reply.content}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {canEditReview({ userId: reply.userId, userRole: reply.userRole }) && (
                              <button
                                onClick={() => handleDeleteReply(review._id, reply._id)}
                                className="text-red-600 hover:text-red-700 ml-2 shrink-0"
                                title="Delete reply"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reply Form Toggle */}
              {replyingToReviewId !== review._id && (
                <button
                  onClick={() => {
                    if (!user || !user.id) {
                      setError('Please log in to reply');
                      return;
                    }
                    setReplyingToReviewId(review._id);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm flex gap-2 items-center"
                >
                  <MessageCircle size={14} /> Reply
                </button>
              )}

              {/* Reply Form */}
              {replyingToReviewId === review._id && (
                <div className="bg-blue-50 rounded-lg p-3 mt-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddReply(review._id)}
                      disabled={isSubmittingReply}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {isSubmittingReply ? 'Submitting...' : 'Reply'}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingToReviewId(null);
                        setReplyContent('');
                      }}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-100 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

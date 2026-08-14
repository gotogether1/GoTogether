import { getFirestoreDb } from '../config/firebase-admin.js';
import { ApiError } from '../utils/api-error.js';
import { BookingService } from './booking.service.js';

export interface ReviewData {
  id?: string;
  bookingId: string;
  authorId: string;
  recipientId: string;
  rating: number;
  text?: string;
  createdAt: string;
}

export class ReviewService {
  private static collection = 'reviews';

  static async createReview(authorId: string, bookingId: string, recipientId: string, rating: number, text?: string): Promise<ReviewData> {
    const db = getFirestoreDb();
    const reviewId = `${bookingId}_${authorId}`;
    const reviewRef = db.collection(this.collection).doc(reviewId);

    return db.runTransaction(async (transaction) => {
      const snap = await transaction.get(reviewRef);
      if (snap.exists) {
        throw ApiError.conflict('You have already submitted a review for this booking');
      }

      const bookingRef = db.collection('bookings').doc(bookingId);
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists) {
        throw ApiError.notFound('Booking not found');
      }

      const booking = bookingSnap.data()!;
      if (booking.riderId !== authorId && booking.driverId !== authorId) {
        throw ApiError.forbidden('Only participants of this booking may submit a review');
      }

      const now = new Date().toISOString();
      const review: ReviewData = {
        id: reviewId,
        bookingId,
        authorId,
        recipientId,
        rating,
        text: text || '',
        createdAt: now,
      };

      transaction.set(reviewRef, review);

      // Recalculate average rating for recipient
      const userRef = db.collection('users').doc(recipientId);
      const userSnap = await transaction.get(userRef);

      if (userSnap.exists) {
        const u = userSnap.data()!;
        const currentCount = u.completedRideCount || 0;
        const currentAvg = u.averageRating || 5.0;
        const newCount = currentCount + 1;
        const newAvg = Number(((currentAvg * currentCount + rating) / newCount).toFixed(1));

        transaction.update(userRef, {
          averageRating: newAvg,
          completedRideCount: newCount,
          updatedAt: now,
        });
      }

      return review;
    });
  }

  static async getUserReviews(uid: string): Promise<ReviewData[]> {
    const db = getFirestoreDb();
    const snap = await db.collection(this.collection)
      .where('recipientId', '==', uid)
      .get();

    return snap.docs.map(d => d.data() as ReviewData);
  }
}

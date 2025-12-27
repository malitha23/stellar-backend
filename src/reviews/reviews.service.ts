import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
    ) { }

    async createReview(reviewer: User, revieweeId: number, rating: number, comment?: string) {
        const review = this.reviewRepository.create({
            reviewer,
            reviewee: { id: revieweeId } as User,
            rating,
            comment,
        });

        return this.reviewRepository.save(review);
    }

    async getReviewsForUser(userId: number) {
        return this.reviewRepository.find({
            where: { reviewee: { id: userId } },
            relations: ['reviewer'],
            order: { createdAt: 'DESC' },
        });
    }
}

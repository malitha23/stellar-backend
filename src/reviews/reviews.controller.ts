import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() body: { revieweeId: number, rating: number, comment?: string }) {
        return this.reviewsService.createReview(req.user, body.revieweeId, body.rating, body.comment);
    }

    @Get(':userId')
    get(@Param('userId') userId: string) {
        return this.reviewsService.getReviewsForUser(+userId);
    }
}

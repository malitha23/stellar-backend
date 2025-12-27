import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './availability/entities/availability.entity';
import { AvailabilityService } from './availability/availability.service';
import { AvailabilityController } from './availability/availability.controller';
import { Review } from './reviews/entities/review.entity';
import { ReviewsService } from './reviews/reviews.service';
import { ReviewsController } from './reviews/reviews.controller';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { HeartCoinTransaction } from './gamification/entities/heart-coin-transaction.entity';
import { GamificationService } from './gamification/gamification.service';
import { User } from './users/entities/user.entity';
import { ModelProfile } from './profiles/entities/model-profile.entity';
import { CommunityPost } from './community/entities/community-post.entity';
import { CommunityService } from './community/community.service';
import { CommunityController } from './community/community.controller';
import { Payment } from './payments/entities/payment.entity';
import { PaymentsService } from './payments/payments.service';
import { PaymentsController } from './payments/payments.controller';
import { LeaderboardController } from './gamification/leaderboard.controller';
import { Conversation } from './messages/entities/conversation.entity';
import { Message } from './messages/entities/message.entity';
import { MessagesService } from './messages/messages.service';
import { MessagesController } from './messages/messages.controller';

// Grouping remaining features for faster registration
@Module({
    imports: [
        TypeOrmModule.forFeature([
            Availability,
            Review,
            Notification,
            HeartCoinTransaction,
            User,
            ModelProfile,
            CommunityPost,
            Payment,
            Conversation,
            Message,
        ]),
    ],
    controllers: [
        AvailabilityController,
        ReviewsController,
        NotificationsController,
        CommunityController,
        PaymentsController,
        LeaderboardController,
        MessagesController,
    ],
    providers: [
        AvailabilityService,
        ReviewsService,
        NotificationsService,
        GamificationService,
        CommunityService,
        PaymentsService,
        MessagesService,
    ],
    exports: [
        AvailabilityService,
        ReviewsService,
        NotificationsService,
        GamificationService,
        CommunityService,
        PaymentsService,
        MessagesService,
    ],

})
export class CoreFeaturesModule { }

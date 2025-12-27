import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeartCoinTransaction, TransactionType } from './entities/heart-coin-transaction.entity';
import { User } from '../users/entities/user.entity';
import { ModelProfile } from '../profiles/entities/model-profile.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class GamificationService {
    constructor(
        @InjectRepository(HeartCoinTransaction)
        private transactionRepository: Repository<HeartCoinTransaction>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ModelProfile)
        private profileRepository: Repository<ModelProfile>,
        private notificationsService: NotificationsService,
    ) { }

    async awardCoins(user: User, amount: number, reason: string) {
        const transaction = this.transactionRepository.create({
            user,
            amount,
            type: TransactionType.EARNED,
            reason,
        });

        await this.transactionRepository.save(transaction);

        // Update model profile balance
        const profile = await this.profileRepository.findOne({ where: { user: { id: user.id } } });
        if (profile) {
            profile.heartCoins += amount;
            await this.profileRepository.save(profile);
        }

        // Send notification
        await this.notificationsService.create(
            user,
            'Coins Earned! ❤️',
            `You've earned ${amount} Heart Coins for: ${reason}`,
            NotificationType.COINS_EARNED,
        );

        return transaction;
    }

    async getLeaderboard() {
        return this.profileRepository.find({
            order: { heartCoins: 'DESC' },
            take: 10,
            relations: ['user'],
        });
    }
}

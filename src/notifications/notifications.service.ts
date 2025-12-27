import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) { }

    async create(user: User, title: string, message: string, type: NotificationType, relatedId?: string) {
        const notification = this.notificationRepository.create({
            user,
            title,
            message,
            type,
            relatedId,
        });
        return this.notificationRepository.save(notification);
    }

    async getMyNotifications(user: User) {
        return this.notificationRepository.find({
            where: { user: { id: user.id } },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: number) {
        return this.notificationRepository.update(id, { isRead: true });
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AvailabilityService {
    constructor(
        @InjectRepository(Availability)
        private availabilityRepository: Repository<Availability>,
    ) { }

    async setAvailability(user: User, date: string, isAvailable: boolean, note?: string) {
        let availability = await this.availabilityRepository.findOne({
            where: { user: { id: user.id }, date: new Date(date) },
        });

        if (availability) {
            availability.isAvailable = isAvailable;
            availability.note = note;
        } else {
            availability = this.availabilityRepository.create({
                user,
                date: new Date(date),
                isAvailable,
                note,
            });
        }

        return this.availabilityRepository.save(availability);
    }

    async getUserAvailability(userId: number) {
        return this.availabilityRepository.find({
            where: { user: { id: userId } },
            order: { date: 'ASC' },
        });
    }
}

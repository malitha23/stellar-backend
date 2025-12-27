import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) { }

    async createPayment(payer: User, payeeId: number, modelFee: number, projectId?: number) {
        const platformFee = modelFee * 0.10;
        const totalAmount = modelFee + platformFee;

        const payment = this.paymentRepository.create({
            payer,
            payee: { id: payeeId } as User,
            modelFee,
            platformFee,
            totalAmount,
            project: projectId ? { id: projectId } as any : null,
            status: PaymentStatus.ESCROWED, // Defaulting to escrowed for simulation
        });
        return this.paymentRepository.save(payment);
    }

    async releasePayment(paymentId: number) {
        const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
        if (payment && payment.status === PaymentStatus.ESCROWED) {
            payment.status = PaymentStatus.COMPLETED;
            return this.paymentRepository.save(payment);
        }
        return null;
    }

    async getMyPayments(user: User) {
        return this.paymentRepository.find({
            where: [{ payer: { id: user.id } }, { payee: { id: user.id } }],
            relations: ['payer', 'payee', 'project'],
            order: { createdAt: 'DESC' },
        });
    }
}

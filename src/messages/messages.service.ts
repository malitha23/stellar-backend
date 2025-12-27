import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) { }

    private containsContactDetails(text: string): boolean {
        // Simple regex for phone numbers and email addresses
        const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        return phoneRegex.test(text) || emailRegex.test(text);
    }

    async getConversations(user: User) {
        return this.conversationRepository.find({
            where: [
                { participant1: { id: user.id } },
                { participant2: { id: user.id } },
            ],
            relations: ['participant1', 'participant2', 'project'],
            order: { updatedAt: 'DESC' },
        });
    }

    async getMessages(conversationId: number, user: User) {
        // Verify user is part of conversation
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['participant1', 'participant2'],
        });

        if (!conversation) throw new Error('Conversation not found');
        if (conversation.participant1.id !== user.id && conversation.participant2.id !== user.id) {
            throw new ForbiddenException('Not your conversation');
        }

        return this.messageRepository.find({
            where: { conversation: { id: conversationId } },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });
    }

    async sendMessage(sender: User, conversationId: number, content: string) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['participant1', 'participant2'],
        });

        if (!conversation) throw new Error('Conversation not found');

        const isBlocked = this.containsContactDetails(content);
        const processedContent = isBlocked ? '[Contact details blocked by system]' : content;

        const message = this.messageRepository.create({
            conversation,
            sender,
            content: processedContent,
            isBlocked,
        });

        await this.messageRepository.save(message);

        // Update conversation timestamp
        conversation.updatedAt = new Date();
        await this.conversationRepository.save(conversation);

        return message;
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityPost } from './entities/community-post.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommunityService {
    constructor(
        @InjectRepository(CommunityPost)
        private postRepository: Repository<CommunityPost>,
    ) { }

    async createPost(author: User, content: string, imageUrl?: string) {
        const post = this.postRepository.create({ author, content, imageUrl });
        return this.postRepository.save(post);
    }

    async getFeed() {
        return this.postRepository.find({
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
    }

    async likePost(postId: number) {
        const post = await this.postRepository.findOneBy({ id: postId });
        if (post) {
            post.likesCount += 1;
            return this.postRepository.save(post);
        }
    }
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ModelProfile } from './model-profile.entity';

export enum MediaType {
    PHOTO = 'photo',
    VIDEO = 'video',
}

export enum PortfolioCategory {
    POLAROID = 'polaroid',
    CLOSEUP = 'closeup',
    FULLBODY = 'fullbody',
    ACTING_REEL = 'acting_reel',
    OTHER = 'other',
}

@Entity()
export class ModelPortfolio {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: MediaType,
    })
    mediaType: MediaType;

    @Column()
    mediaUrl: string;

    @Column({
        type: 'enum',
        enum: PortfolioCategory,
        default: PortfolioCategory.OTHER,
    })
    category: PortfolioCategory;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    uploadedAt: Date;

    @ManyToOne(() => ModelProfile, (profile) => profile.portfolio, { onDelete: 'CASCADE' })
    modelProfile: ModelProfile;
}

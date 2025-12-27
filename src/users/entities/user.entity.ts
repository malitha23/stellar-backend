// src/users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { ModelProfile } from '../../profiles/entities/model-profile.entity';
import { DirectorProfile } from '../../profiles/entities/director-profile.entity';
import { Review } from '../../reviews/entities/review.entity';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  MODEL = 'model',
  DIRECTOR = 'director',
  ADMIN = 'admin',
  PUBLIC = 'public'
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PUBLIC,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => ModelProfile, (profile) => profile.user)
  modelProfile: ModelProfile;

  @OneToOne(() => DirectorProfile, (profile) => profile.user)
  directorProfile: DirectorProfile;

  @OneToMany(() => Review, (review) => review.reviewer)
  reviewsGiven: Review[];

  @OneToMany(() => Review, (review) => review.reviewee)
  reviewsReceived: Review[];

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password && this.provider === AuthProvider.LOCAL) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  }
}
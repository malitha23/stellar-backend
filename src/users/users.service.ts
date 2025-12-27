// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, AuthProvider } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      provider: AuthProvider.LOCAL,
    });

    return this.usersRepository.save(user);
  }

  async createGoogleUser(googleUser: {
    email: string;
    name: string;
    googleId: string;
    picture?: string;
    role?: UserRole;
  }): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: [
        { email: googleUser.email },
        { googleId: googleUser.googleId },
      ],
    });

    if (existing) {
      // Update existing user with Google info
      existing.googleId = googleUser.googleId;
      existing.picture = googleUser.picture;
      existing.isEmailVerified = true;
      existing.provider = AuthProvider.GOOGLE;

      if (googleUser.role && !existing.role) {
        existing.role = googleUser.role;
      }

      return this.usersRepository.save(existing);
    }

    const user = this.usersRepository.create({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.googleId,
      picture: googleUser.picture,
      role: googleUser.role || UserRole.PUBLIC,
      isEmailVerified: true,
      provider: AuthProvider.GOOGLE,
    });

    return this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['modelProfile', 'directorProfile']
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['modelProfile', 'directorProfile']
    });
  }

  async findOneByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ googleId });
  }

  async updateRole(userId: number, role: UserRole): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    return this.usersRepository.save(user);
  }

  async setRefreshToken(userId: number, hashedToken: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: hashedToken });
  }

  async removeRefreshToken(userId: number): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  async generateTokens(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      provider: user.provider
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.setRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const user = await this.findOneById(userId);
    if (!user || !user.refreshToken) {
      return false;
    }
    return await bcrypt.compare(refreshToken, user.refreshToken);
  }
}
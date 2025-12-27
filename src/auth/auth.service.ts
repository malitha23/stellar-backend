// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, AuthProvider } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
  ) { }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.provider === AuthProvider.GOOGLE) {
      throw new BadRequestException('Please use Google sign in for this account');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return user;
  }

  async login(user: User, role?: string) {
    // Check if user is trying to login with different role
    if (role && role !== user.role) {
      throw new UnauthorizedException('Selected role does not match your account role');
    }

    const tokens = await this.usersService.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
        provider: user.provider,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }

  async googleLogin(googleUser: {
    email: string;
    name: string;
    googleId: string;
    picture?: string;
    role?: string;
  }) {
    let user = await this.usersService.findOneByEmail(googleUser.email);

    if (!user) {

      throw new NotFoundException('User not found. Please register first.');

    } else if (user.provider === AuthProvider.LOCAL) {
      // Local user trying to login with Google - merge accounts
      user.googleId = googleUser.googleId;
      user.picture = googleUser.picture || user.picture;
      user.isEmailVerified = true;
      user.provider = AuthProvider.GOOGLE;
      await this.usersService['usersRepository'].save(user);
    }

    return this.login(user, googleUser.role);
  }

  async registerGoogleUser(googleUser: {
    email: string;
    name: string;
    googleId: string;
    picture?: string;
    role?: string;
  }) {
    // Check if user already exists

    const user = await this.usersService.createGoogleUser({
      ...googleUser,
      role: googleUser.role as any,
    });

    // Optional: automatically log in after registration
    return this.login(user, googleUser.role);
  }


  async refreshTokens(userId: number, refreshToken: string) {
    const isValid = await this.usersService.validateRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.login(user);
  }

  async logout(userId: number, provider?: AuthProvider, googleToken?: string) {
    // Remove refresh token in DB
    await this.usersService.removeRefreshToken(userId);

    // Optional: revoke Google token if user logged in with Google
    if (provider === AuthProvider.GOOGLE && googleToken) {
      await this.revokeGoogleToken(googleToken);
    }

    return { message: 'Logged out successfully' };
  }

  async revokeGoogleToken(accessToken: string) {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to revoke Google token', await response.text());
        return false;
      }

      return true;
    } catch (e) {
      console.error('Failed to revoke Google token', e);
      return false;
    }
  }


}
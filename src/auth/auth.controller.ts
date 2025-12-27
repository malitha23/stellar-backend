// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthProvider } from 'src/users/entities/user.entity';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleOAuth: GoogleOAuthService,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string; role?: string }
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user, body.role);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  async googleMobileLogin(
    @Body() body: { token: string; role?: string; isWeb?: boolean },
  ) {
    let googleUser;

    if (body.isWeb) {
      // Web: verify accessToken
      googleUser = await this.googleOAuth.verifyGoogleAccessToken(body.token);
    } else {
      // Mobile: verify idToken
      googleUser = await this.googleOAuth.verifyGoogleIdToken(body.token);
    }

    return this.authService.googleLogin({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.googleId,
      picture: googleUser.picture,
      role: body.role,
    });
  }

  @Post('google-register')
  @HttpCode(HttpStatus.OK)
  async googleMobileRegister(
    @Body() body: { token: string; role?: string; isWeb?: boolean },
  ) {
    let googleUser;

    if (body.isWeb) {
      // Web: verify accessToken
      googleUser = await this.googleOAuth.verifyGoogleAccessToken(body.token);
    } else {
      // Mobile: verify idToken
      googleUser = await this.googleOAuth.verifyGoogleIdToken(body.token);
    }

    return this.authService.registerGoogleUser({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.googleId,
      picture: googleUser.picture,
      role: body.role,
    });
  }


  /** Optional: handle authorization code flow for Web if needed */
  @Post('google/callback')
  @HttpCode(HttpStatus.OK)
  async googleCallback(
    @Body() body: { code: string; role?: string },
  ) {
    const tokens = await this.googleOAuth.getTokensFromCode(body.code);
    const googleUser = await this.googleOAuth.verifyGoogleIdToken(tokens.id_token!);

    return this.authService.googleLogin({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.googleId,
      picture: googleUser.picture,
      role: body.role,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: { userId: number; refreshToken: string }
  ) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { userId: number; provider?: AuthProvider; googleToken?: string }) {
    return this.authService.logout(body.userId, body.provider, body.googleToken);
  }

}
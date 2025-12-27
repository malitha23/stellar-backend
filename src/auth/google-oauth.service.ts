// src/auth/google-oauth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch'; // for Web access token verification

@Injectable()
export class GoogleOAuthService {
    private client: OAuth2Client;

    constructor(private configService: ConfigService) {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI') || 'postmessage';

        this.client = new OAuth2Client(clientId, clientSecret, redirectUri);
    }

    /** Mobile / idToken verification */
    async verifyGoogleIdToken(idToken: string) {
        try {
            const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: clientId,
            });
            const payload = ticket.getPayload();

            if (!payload.email_verified) {
                throw new UnauthorizedException('Google email not verified');
            }

            return {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                emailVerified: payload.email_verified,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid Google ID token');
        }
    }

    /** Web / accessToken verification */
    async verifyGoogleAccessToken(accessToken: string) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
            });

            const text = await response.text();

            if (!response.ok) {
                throw new UnauthorizedException('Invalid Google access token');
            }

            const userData = JSON.parse(text);

            return {
                googleId: userData.id,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                emailVerified: userData.verified_email,
            };
        } catch (error) {
            console.error('verifyGoogleAccessToken error:', error);
            throw new UnauthorizedException('Failed to verify Google access token');
        }
    }


    /** For authorization code flow (optional) */
    async getTokensFromCode(code: string) {
        try {
            const { tokens } = await this.client.getToken({
                code,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'postmessage',
            });
            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Failed to exchange code for tokens');
        }
    }
}

// verification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { IdentityVerification } from 'src/profiles/entities/identity-verification.entity';
import { User } from 'src/users/entities/user.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([IdentityVerification, User]),
    ],
    controllers: [VerificationController],
    providers: [VerificationService],
    exports: [VerificationService],
})
export class VerificationModule { }
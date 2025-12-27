import { IsEnum, IsBooleanString } from 'class-validator';
import { DocumentType } from '../entities/identity-verification.entity';

export class SubmitVerificationDto {
    @IsEnum(DocumentType)
    documentType: DocumentType;

    @IsBooleanString()
    isUnder18: string; // "true" | "false"
}

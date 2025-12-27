import { IsNotEmpty, IsOptional, IsString, IsEmail, IsUrl } from 'class-validator';

export class CreateDirectorProfileDto {
    @IsNotEmpty()
    @IsString()
    companyName: string;

    @IsNotEmpty()
    @IsString()
    companyType: string;

    @IsOptional()
    @IsString()
    companyRegistrationNumber?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    officeLocation?: string;

    @IsNotEmpty()
    @IsString()
    contactPersonName: string;

    @IsOptional()
    @IsEmail()
    contactEmail?: string;

    @IsOptional()
    @IsString()
    contactPhone?: string;

    @IsOptional()
    @IsString()
    pastProjects?: string;

    @IsOptional()
    @IsUrl()
    companyWebsite?: string;

    @IsOptional()
    @IsString()
    companyLogoUrl?: string; // Use file upload separately with @UseInterceptors(FileInterceptor)

    @IsOptional()
    @IsString()
    verificationDocumentsUrl?: string;
}


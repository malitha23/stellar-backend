import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectType, ProjectStatus } from '../entities/project.entity';
import { Gender } from '../../profiles/entities/model-profile.entity';

export class CreateProjectRoleDto {
    @IsNotEmpty()
    @IsString()
    roleName: string;

    @IsOptional()
    @IsString()
    roleDescription?: string;

    @IsOptional()
    @IsEnum(Gender)
    requiredGender?: Gender;

    @IsOptional()
    @IsNumber()
    ageRangeStart?: number;

    @IsOptional()
    @IsNumber()
    ageRangeEnd?: number;

    @IsOptional()
    @IsNumber()
    numberOfOpenings?: number;
}

export class CreateProjectDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(ProjectType)
    projectType: ProjectType;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsOptional()
    @IsString()
    productionCompany?: string;

    @IsOptional()
    @IsString()
    budgetRange?: string;

    @IsNotEmpty()
    @IsDateString()
    deadline: string;

    @IsOptional()
    @IsDateString()
    shootDateStart?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProjectRoleDto)
    roles?: CreateProjectRoleDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageUrls?: string[]; // Array of URLs
}

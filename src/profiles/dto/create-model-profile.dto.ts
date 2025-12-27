import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Gender } from '../entities/model-profile.entity';
import { Transform, Type } from 'class-transformer';
import { ProficiencyLevel } from '../entities/model-skill.entity';
import { LanguageProficiency } from '../entities/model-language.entity';

export class CreateModelProfileDto {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    age: number;

    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsOptional()
    @IsNumber()
    height?: number;

    @IsOptional()
    @IsNumber()
    weight?: number;

    @IsOptional()
    @IsString()
    measurements?: string;

    @IsOptional()
    @IsString()
    bioSinhala?: string;

    @IsOptional()
    @IsString()
    bioEnglish?: string;

    @IsOptional()
    @IsString()
    bioTamil?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    skills?: any[];

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    languages?: any[];

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    projectPreferences?: string[];

    @IsOptional()
    @IsNumber()
    minBudget?: number;

    @IsOptional()
    @IsNumber()
    maxBudget?: number;

    @IsOptional()
    availability?: {
        days?: string[];
        startTime?: string;
        endTime?: string;
    };
}

export class CreateModelSkillDto {
    @IsNotEmpty()
    @IsString()
    skillName: string;

    @IsOptional()
    @IsEnum(ProficiencyLevel)
    proficiencyLevel?: ProficiencyLevel = ProficiencyLevel.BEGINNER;
}

export class CreateModelLanguageDto {
    @IsNotEmpty()
    @IsString()
    language: string;

    @IsOptional()
    @IsEnum(LanguageProficiency)
    proficiency?: LanguageProficiency = LanguageProficiency.BASIC;
}
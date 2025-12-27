import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateScreenTestDto {
    @IsInt()
    @IsNotEmpty()
    projectId: number;

    @IsInt()
    @IsOptional()
    roleId?: number;

    @IsInt()
    @IsNotEmpty()
    modelId: number;

    @IsString()
    @IsOptional()
    requestNotes?: string;
}

export class SubmitScreenTestDto {
    @IsUrl()
    @IsNotEmpty()
    videoUrl: string;

    @IsString()
    @IsOptional()
    modelNotes?: string;
}

import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTeamDto {
    @IsString()
    name: string;

    @IsOptional()
    logo: string | undefined;

    @IsOptional()
    team_img?: string | undefined;

    @IsNumber()
    id_users: number;

    @IsNumber()
    is_male: boolean;
}
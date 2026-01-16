import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class CreatePlayersDto {
    @IsString()
    name: string;

    @IsString()
    first_name: string;

    @IsDate()
    birth_date: Date;

    @IsString()
    profil_img: string;

    @IsString()
    bacc_file: string;

    @IsString()
    cin_file: string;

    @IsNumber()
    id_teams: number;

    @IsBoolean()
    is_starter: boolean;

    @IsNumber()
    id_positions: number;
}
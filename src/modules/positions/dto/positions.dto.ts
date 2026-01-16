import { IsString } from "class-validator";


export class CreatePositionsDto {
    @IsString()
    name: string;

    @IsString()
    acronym: string;
}
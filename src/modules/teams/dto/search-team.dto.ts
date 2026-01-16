import { IsBoolean, IsNumber } from "class-validator";

export class SearchTeamDto {

    @IsNumber()
    query: string;

    @IsBoolean()
    is_male?: boolean;
    
    @IsNumber()
    id_user?: number;
}

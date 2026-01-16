import { Exclude, Expose } from 'class-transformer';

export class TeamResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    logo?: string;

    @Expose()
    team_img?: string;

    @Expose()
    is_male?: boolean;

    @Expose()
    userId: number;

    @Expose()
    user?: {
        id: number;
        name: string;
        user_name: string;
        email?: string;
    };
}
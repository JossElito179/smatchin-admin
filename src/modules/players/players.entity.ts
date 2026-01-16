import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Team } from "../teams/teams.entity";
import { Positions } from "../positions/positions.entity";

@Entity('players')
export class Players {

    @PrimaryGeneratedColumn({ name: 'id_players' })
    id_players: number;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 50 })
    first_name: string;

    @Column({ type: 'date' })
    birth_date: Date;

    @Column({ type: 'text', nullable: true })
    profil_img: string;

    @Column({ type: 'text', nullable: true })
    bacc_file: string;

    @Column({ type: 'text', nullable: true })
    cin_file: string;

    @Column()
    id_teams: number;

    @Column()
    id_positions: number;

    @Column()
    is_starter: boolean;

    @ManyToOne(() => Team, (team) => team.players)
    @JoinColumn({ name: 'id_teams' })
    team: Team;

    @ManyToOne(() => Positions, (position) => position.players)
    @JoinColumn({ name: 'id_positions' })
    position: Positions;

}
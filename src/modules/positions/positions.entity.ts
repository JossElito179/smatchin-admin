import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Players } from "../players/players.entity";


@Entity('positions')
export class Positions {

    @PrimaryGeneratedColumn({ name: 'id_positions' })
    id_positions: number;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 10 })
    acronym: string;

    @OneToMany(() => Players, (player) => player.position)
    players: Players[];
}
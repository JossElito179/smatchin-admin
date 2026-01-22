import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/users.entity';
import { Players } from '../players/players.entity';

@Entity('teams')
export class Team {
    @PrimaryGeneratedColumn({ name: 'id_teams' })
    id: number;

    @Column({ length: 50 })
    name: string;

    @Column({ type: 'boolean' })
    is_admin: boolean;

    @Column({ type: 'text', nullable: true })
    logo: string;

    @Column({ type: 'text', nullable: true })
    team_img: string;

    @Column()
    id_users: number;

    @Column({ type: 'boolean' })
    is_male: boolean;

    @ManyToOne(() => User, (user) => user.teams)
    @JoinColumn({ name: 'id_users' })
    user: User;

    @OneToMany(() => Players, (player) => player.team)
    players: Players[];
}

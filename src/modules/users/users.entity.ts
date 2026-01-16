import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Team } from '../teams/teams.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id_users' })
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50, unique: true })
  user_name: string;

  @Column({ type: 'boolean' })
  role: boolean;

  @Column({ length: 100, unique: true })
  phone_number: string;

  @Column({ length: 100 })
  password: string;

  @Column({ type: 'text', nullable: true })
  profil_img: string;

  @Column({ length: 50, nullable: true })
  email: string;

  @OneToMany(() => Team, (team) => team.user)
  teams: Team[];
}

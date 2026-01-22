import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Team } from './teams.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { User } from '../users/users.entity';
import { FileManager } from '../services/file-manager';
import { FileService } from '../supabase/file.service';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private teamsRepository: Repository<Team>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private fileService: FileService
    ) { }

    async findAll(): Promise<Team[]> {
        return await this.teamsRepository.find({
            relations: ['user'],
            select: {
                user: {
                    id: true,
                    name: true,
                    user_name: true,
                    email: true
                }
            }
        });
    }

    async create(createTeamDto: CreateTeamDto, logoFile?: Express.Multer.File, teamImgFile?: Express.Multer.File): Promise<Team> {
        const user = await this.usersRepository.findOne({
            where: { id: createTeamDto.id_users }
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${createTeamDto.id_users} not found`);
        }

        let logoUrl = '';
        let teamImgUrl = '';

        if (logoFile) {
            logoUrl = await this.fileService.uploadFile(logoFile);
        }

        if (teamImgFile) {
            teamImgUrl = await this.fileService.uploadFile(teamImgFile);
        }

        const team = this.teamsRepository.create({
            name: createTeamDto.name,
            id_users: createTeamDto.id_users,
            is_male: createTeamDto.is_male,
            is_admin: createTeamDto.is_admin,
            logo: logoUrl,
            team_img: teamImgUrl,
            user
        });

        return await this.teamsRepository.save(team);
    }

    async findByNameOrUserNameOrTeamName(
        query?: string,
        is_male?: boolean
    ): Promise<Team[]> {

        const qb = this.teamsRepository
            .createQueryBuilder('teams')
            .leftJoinAndSelect('teams.user', 'user')
            .leftJoinAndSelect('teams.players', 'players');

        if (query) {
            qb.andWhere(
                new Brackets(qb => {
                    qb.where('user.name LIKE :query')
                        .orWhere('user.first_name LIKE :query')
                        .orWhere('teams.name LIKE :query');
                }),
                { query: `%${query}%` }
            );
        }

        if (is_male !== null) {
            qb.andWhere('teams.is_male = :is_male', { is_male });
        }

        return qb.getMany();
    }

    async findByUserIdWithSearch(
        query?: string,
        is_male?: boolean,
        id_user?: number
    ): Promise<Team[]> {
        const qb = this.teamsRepository
            .createQueryBuilder('teams')
            .leftJoinAndSelect('teams.user', 'user')
            .leftJoinAndSelect('teams.players', 'players')
            .where('user.id = :id_user', { id_user });

        if (query) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.where('user.name LIKE :query', { query: `%${query}%` })
                        .orWhere('user.first_name LIKE :query', { query: `%${query}%` })
                        .orWhere('teams.name LIKE :query', { query: `%${query}%` });
                }),
            );
        }

        if (is_male !== undefined) {
            qb.andWhere('teams.is_male = :is_male', { is_male });
        }

        return qb.getMany();
    }

    async findOne(id: number): Promise<Team> {
        const team = await this.teamsRepository.findOne({
            where: { id },
            relations: ['user'],
            select: {
                user: {
                    id: true,
                    name: true,
                    user_name: true,
                    first_name: true,
                    email: true
                }
            }
        });

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        return team;
    }

    async findByUserId(userId: number): Promise<Team[]> {
        return await this.teamsRepository.find({
            where: { user: { id: userId } },
            relations: ['user']
        });
    }

    async update(
        id: number,
        updateTeamDto: UpdateTeamDto,
        logoFile?: Express.Multer.File,
        teamImgFile?: Express.Multer.File
    ): Promise<Team> {
        const team = await this.teamsRepository.findOne({ where: { id } });


        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (updateTeamDto.is_admin) {
            team.is_admin = updateTeamDto.is_admin;
        }
        if (updateTeamDto.name !== undefined) {
            team.name = updateTeamDto.name;
        }
        if (updateTeamDto.is_male !== undefined) {
            team.is_male = updateTeamDto.is_male;
        }

        if (logoFile) {
            team.logo = await this.fileService.updateFile(team.logo, logoFile)
        }

        if (teamImgFile) {
            team.team_img = await this.fileService.updateFile(team.team_img, teamImgFile);
        }

        return this.teamsRepository.save(team);
    }

    async remove(id: number): Promise<void> {
        const team = await this.teamsRepository.findOne({ where: { id } });

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.logo) {

            this.fileService.deleteFile(team.logo);
        }

        if (team.team_img) {
            this.fileService.deleteFile(team.team_img);
        }

        await this.teamsRepository.remove(team);
    }


}
import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Players } from "./players.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Team } from "../teams/teams.entity";
import { CreatePlayersDto } from "./dto/create-players.dto";
import { Positions } from "../positions/positions.entity";
import { FileManager } from "../services/file-manager";
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import JSZip from "jszip";
import axios from "axios";


@Injectable()
export class PlayersService {

    constructor(
        @InjectRepository(Players)
        private repo: Repository<Players>,
        @InjectRepository(Team)
        private teamRepo: Repository<Team>,
        @InjectRepository(Positions)
        private positionRepo: Repository<Positions>,
        private fileManager: FileManager
    ) { }

    async create(createPlayersDto: CreatePlayersDto, profil_img?: Express.Multer.File, bacc_file?: Express.Multer.File, cin_file?: Express.Multer.File): Promise<Players> {
        const team = await this.teamRepo.findOne({
            where: { id: createPlayersDto.id_teams }
        });

        const position = await this.positionRepo.findOne({
            where: { id_positions: createPlayersDto.id_positions }
        });

        if (!team) {
            throw new NotFoundException(`Team with ID ${createPlayersDto.id_teams} not found`);
        }

        if (!position) {
            throw new NotFoundException(`Position with ID ${createPlayersDto.id_positions} not found`);
        }

        let profilUrl = '';
        let baccURL = '';
        let cinURL = '';

        if (profil_img) {
            profilUrl = await this.fileManager.saveFileLocally(profil_img, 'profil/' + CreatePlayersDto.name);
        }

        if (bacc_file) {
            baccURL = await this.fileManager.saveFileLocally(bacc_file, 'bac/' + CreatePlayersDto.name);
        }
        if (cin_file) {
            cinURL = await this.fileManager.saveFileLocally(cin_file, 'cin/' + CreatePlayersDto.name);
        }


        const player = this.repo.create({
            ...createPlayersDto,
            profil_img: profilUrl,
            bacc_file: baccURL,
            cin_file: cinURL,
            team,
            position
        });

        return await this.repo.save(player);
    }

    async findAll(): Promise<Players[]> {
        return await this.repo.find({
            relations: ['team', 'position']
        });
    }

    async findOne(id: number): Promise<Players> {
        const player = await this.repo.findOne({
            where: { id_players: id },
            relations: ['team', 'position']
        });

        if (!player) {
            throw new NotFoundException(`Player with ID ${id} not found`);
        }
        return player;
    }

    async findByTeamId(teamId: number): Promise<Players[]> {
        return await this.repo.find({
            where: { team: { id: teamId } },
            relations: ['team', 'position']
        });
    }

    async findStartersByTeamId(teamId: number): Promise<Players[]> {
        return await this.repo.find({
            where: {
                team: { id: teamId },
                is_starter: true
            },
            relations: ['team', 'position']
        });
    }

    async findByNameOrFirstName(
        searchTerm?: string,
        id_teams?: number
    ): Promise<Players[]> {

        const query = this.repo
            .createQueryBuilder('player')
            .leftJoinAndSelect('player.team', 'team')
            .leftJoinAndSelect('player.position', 'position');

        if (searchTerm) {
            query.andWhere(
                '(player.name LIKE :search OR player.first_name LIKE :search)',
                { search: `%${searchTerm}%` }
            );
        }

        if (id_teams) {
            query.andWhere('team.id = :teamId', { teamId: id_teams });
        }

        return await query.getMany();
    }


    async remove(id: number): Promise<void> {
        const player = await this.findOne(id)
        if (!player) {
            throw new NotFoundException(`Player with ID ${id} not found`);
        }

        if (player.profil_img) {
            this.fileManager.deleteFile(player.profil_img);
        }

        if (player.bacc_file) {
            this.fileManager.deleteFile(player.bacc_file);
        }

        if (player.cin_file) {
            this.fileManager.deleteFile(player.cin_file);
        }
        await this.repo.remove(player);
    }

    async update(id: number, updatePlayersDto: Partial<CreatePlayersDto>, profil_img?: Express.Multer.File, bacc_file?: Express.Multer.File, cin_file?: Express.Multer.File): Promise<Players> {
        const player = await this.findOne(id);

        if (profil_img) {
            if (player.profil_img) {
                this.fileManager.deleteFile(player.profil_img);
            }
            player.profil_img = await this.fileManager.saveFileLocally(
                profil_img,
                'profil/' + (updatePlayersDto.name ?? player.name)
            );
        }

        if (bacc_file) {
            if (player.bacc_file) {
                this.fileManager.deleteFile(player.bacc_file);
            }
            player.bacc_file = await this.fileManager.saveFileLocally(
                bacc_file,
                'bac/' + (updatePlayersDto.name ?? player.name)
            );
        }

        if (cin_file) {
            if (player.cin_file) {
                this.fileManager.deleteFile(player.cin_file);
            }
            player.cin_file = await this.fileManager.saveFileLocally(
                cin_file,
                'cin/' + (updatePlayersDto.name ?? player.name)
            );
        }


        Object.assign(player, updatePlayersDto);
        return await this.repo.save(player);
    }



    async exportPlayersWithImages(res: Response, id_teams: number): Promise<void> {
        try {
            const players = await this.repo.find({
                where: { id_teams },
                relations: ['team', 'position'],
                order: { id_players: 'ASC' },
            });

            console.log(players);

            const zip = new JSZip();

            const excelBuffer = await this.createExcelFile(players);
            zip.file('players.xlsx', excelBuffer);

            await this.addImagesToZip(zip, players);

            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename=players_with_images.zip');
            res.setHeader('Content-Length', zipBuffer.length);

            res.end(zipBuffer);
        } catch (error) {
            throw new Error(`Failed to export players with images: ${error.message}`);
        }
    }

    private async createExcelFile(players: Players[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Players');

        worksheet.columns = [
            { header: 'name', key: 'name', width: 20 },
            { header: 'profile', key: 'profile', width: 30 },
            { header: 'category', key: 'category', width: 20 },
            { header: 'type', key: 'type', width: 15 },
            { header: 'accessplus', key: 'accessplus', width: 10 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };

        players.forEach((player) => {
            worksheet.addRow({
                name: player.name + ' ' + player.first_name,
                profile: this.getFileNameFromUrl(`https://smatchin-admin-production.up.railway.app${player.profil_img!}`) === 'smatchin-admin-production.up.railway.appnull' ? ' ' : this.getFileNameFromUrl(`https://smatchin-admin-production.up.railway.app${player.profil_img!}`) ,
                category: player.team?.name || 'N/A',
                type: player.position?.name || 'N/A',
                accessplus:' ',
            });
        });


        worksheet.columns.forEach((column) => {
            const maxLength = column.values
                ? Math.max(...column.values.map(v => v ? v.toString().length : 0))
                : 0;
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }

    private async addImagesToZip(zip: JSZip, players: Players[]): Promise<void> {
        const imgFolder = zip.folder('images');

        const downloadPromises = players.map(async (player) => {
            const hasValidImage = this.hasValidProfileImage(player.profil_img);

            if (!hasValidImage) {
                const placeholder = this.createPlaceholderImage();
                const fileName = `player_${player.id_players}_no_image.png`;
                imgFolder?.file(fileName, placeholder);
                return;
            }

            try {
                const imageBuffer = await this.downloadImage(`https://smatchin-admin-production.up.railway.app${player.profil_img!}`);
                const fileName = this.getFileNameFromUrl(player.profil_img!);
                imgFolder?.file(fileName, imageBuffer);
            } catch (error) {
                console.error(`Failed to download image for player ${player.id_players}:`, error);
                const placeholder = this.createPlaceholderImage();
                const fileName = `player_${player.id_players}_error.png`;
                imgFolder?.file(fileName, placeholder);
            }
        });

        await Promise.all(downloadPromises);
    }

    private hasValidProfileImage(imageUrl: string | null | undefined): boolean {
        if (!imageUrl) return false;

        const trimmed = imageUrl.trim();
        if (trimmed === '') return false;

        const imagePatterns = [
            /\.(jpg|jpeg|png|gif|bmp|webp)$/i,
            /^data:image\//i,
            /^https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp)/i,
            /^\/uploads\//,
            /^\.\.?\/.*\.(jpg|jpeg|png|gif|bmp|webp)$/i
        ];

        return imagePatterns.some(pattern => pattern.test(trimmed));
    }

    private async downloadImage(url: string): Promise<Buffer> {
        if (url.startsWith('http')) {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        }

        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            const fs = require('fs');
            const path = require('path');

            const absolutePath = path.resolve(url);

            if (fs.existsSync(absolutePath)) {
                return fs.readFileSync(absolutePath);
            } else {
                throw new Error(`File not found: ${absolutePath}`);
            }
        }

        if (url.startsWith('data:image')) {
            const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
            return Buffer.from(base64Data, 'base64');
        }

        throw new Error(`Unsupported image format: ${url}`);
    }

    private getFileNameFromUrl(url: string): string {
        if (url.includes('/')) {
            const parts = url.split('/');
            return parts[parts.length - 1].split('?')[0];
        }
        return url;
    }

    private createPlaceholderImage(): Buffer {
        const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#ccc"/>
      <text x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12">No Image</text>
    </svg>`;

        return Buffer.from(svg);
    }


}
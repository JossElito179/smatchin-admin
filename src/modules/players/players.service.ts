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
import { FileService } from "../supabase/file.service";


@Injectable()
export class PlayersService {

    constructor(
        @InjectRepository(Players)
        private repo: Repository<Players>,
        @InjectRepository(Team)
        private teamRepo: Repository<Team>,
        @InjectRepository(Positions)
        private positionRepo: Repository<Positions>,
        private fileManager: FileManager,
        private fileService: FileService
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
            profilUrl = await this.fileService.uploadFile(profil_img);
        }

        if (bacc_file) {
            baccURL = await this.fileService.uploadFile(bacc_file);
        }
        if (cin_file) {
            cinURL = await this.fileService.uploadFile(cin_file);
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
            this.fileService.deleteFile(player.profil_img);
        }

        if (player.bacc_file) {
            this.fileService.deleteFile(player.bacc_file);
        }

        if (player.cin_file) {
            this.fileService.deleteFile(player.cin_file);
        }
        await this.repo.remove(player);
    }

    async update(id: number, updatePlayersDto: Partial<CreatePlayersDto>, profil_img?: Express.Multer.File, bacc_file?: Express.Multer.File, cin_file?: Express.Multer.File): Promise<Players> {
        const player = await this.findOne(id);

        if (profil_img) {
            player.profil_img = await this.fileService.updateFile(player.profil_img, profil_img);
        }

        if (bacc_file) {
            player.bacc_file = await this.fileService.updateFile(player.bacc_file, bacc_file);
        }

        if (cin_file) {
            player.cin_file = await this.fileService.updateFile(player.cin_file, cin_file);
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

            console.log('Players found:', players.length);

            const zip = new JSZip();

            const excelBuffer = await this.createExcelFile(players);
            zip.file('players.xlsx', excelBuffer);

            await this.addImagesToZip(zip, players);

            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=players_team_${id_teams}.zip`);
            res.setHeader('Content-Length', zipBuffer.length);

            res.end(zipBuffer);
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error(`Failed to export players with images: ${error.message}`);
        }
    }

    private async createExcelFile(players: Players[]) {
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
            const imageName = player.profil_img
                ? this.getImageFileName(player)
                : 'Pas d\'image';

            worksheet.addRow({
                name: player.name + ' ' + player.first_name,
                profile: imageName,
                category: player.team?.name || 'N/A',
                type: player.position?.name || 'N/A',
                accessplus: ' ',
            });
        });

        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            if (column) {
                column.eachCell?.({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = Math.min(Math.max(maxLength + 2, 10), 50);
            }
        });

        return await workbook.xlsx.writeBuffer();
    }

    private async addImagesToZip(zip: JSZip, players: Players[]): Promise<void> {
        const imgFolder = zip.folder('images');

        if (!Array.isArray(players)) {
            console.error('Players is not an array');
            return;
        }

        console.log(`Processing images for ${players.length} players`);

        const promises = players.map(async (player) => {
            return this.processSinglePlayerImage(player, imgFolder);
        });

        await Promise.all(promises);
    }

    private async processSinglePlayerImage(player: Players, imgFolder: JSZip | null): Promise<void> {
        if (player.profil_img && this.isSupabaseUrl(player.profil_img)) {
            try {
                const imageBuffer = await this.downloadImageFromSupabase(player.profil_img);
                const fileName = this.getImageFileName(player);
                imgFolder?.file(fileName, imageBuffer);
            } catch (error) {
                console.error(`Error downloading image for player ${player.id_players}:`, error.message);
                this.addPlaceholderImage(player, imgFolder, 'error');
            }
        } else {
            this.addPlaceholderImage(player, imgFolder, 'no_image');
        }
    }

    private addPlaceholderImage(player: Players, imgFolder: JSZip | null, type: 'no_image' | 'error'): void {
        const placeholder = this.createPlaceholderImage(player);
        const fileName = `player_${player.id_players}_${type}.png`;
        imgFolder?.file(fileName, placeholder);
    }

    private async downloadImageFromSupabase(imageUrl: string): Promise<Buffer> {
        try {
            if (imageUrl.includes('supabase.co/storage/v1/object/public/')) {
                const response = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000,
                    headers: {
                        'Accept': 'image/*'
                    }
                });

                return Buffer.from(response.data);
            }

            if (!imageUrl.includes('http')) {
                throw new Error('Image URL format not supported');
            }

            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 10000
            });

            return Buffer.from(response.data);
        } catch (error) {
            console.error(`Download failed for ${imageUrl}:`, error.message);
            throw new Error(`Failed to download image: ${error.message}`);
        }
    }

    private isSupabaseUrl(url: string): boolean {
        return url.includes('supabase.co') || url.includes('supabase.in') || url.includes('supabase.com');
    }

    private extractFileNameFromSupabaseUrl(url: string): string {
        try {
            if (url.includes('/object/public/')) {
                const parts = url.split('/');
                const bucketIndex = parts.indexOf('public') + 1;
                if (bucketIndex < parts.length) {
                    return parts.slice(bucketIndex).join('/');
                }
            }

            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            return pathname.split('/').pop() || 'image.jpg';
        } catch {
            return url.split('/').pop() || 'image.jpg';
        }
    }

    private getImageFileName(player: Players): string {
        const name = `${player.name}_${player.first_name}`.replace(/[^a-zA-Z0-9]/g, '_');
        const ext = this.getImageExtension(player.profil_img || '');
        return `player_${player.id_players}_${name}${ext}`;
    }

    private getImageExtension(url: string): string {
        const match = url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i);
        if (match) {
            return match[1].toLowerCase() === 'jpeg' ? '.jpg' : `.${match[1].toLowerCase()}`;
        }
        return '.jpg'; 
    }

    private createPlaceholderImage(player?: Players): Buffer {
        const playerName = player ? `${player.name} ${player.first_name}`.substring(0, 20) : 'No Image';
        const playerId = player ? `ID: ${player.id_players}` : '';

        const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#f0f0f0"/>
            <circle cx="100" cy="70" r="30" fill="#ccc"/>
            <rect x="70" y="100" width="60" height="40" fill="#ddd"/>
            <text x="100" y="165" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
                ${playerName}
            </text>
            <text x="100" y="180" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
                ${playerId}
            </text>
        </svg>`;

        return Buffer.from(svg);
    }
}
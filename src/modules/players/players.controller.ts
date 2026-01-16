import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { PlayersService } from "./players.service";
import { CreatePlayersDto } from "./dto/create-players.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import express from 'express';

@Controller('players')
export class PlayersController {

    constructor(
        private readonly playersService: PlayersService
    ) { }

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'profilImg', maxCount: 1 },
            { name: 'baccFile', maxCount: 1 },
            { name: 'cinFile', maxCount: 1 },
        ]),
    )
    async createPlayer(@Body() dto: CreatePlayersDto, @UploadedFiles() files: {
            profilImg?: Express.Multer.File[],
            baccFile?: Express.Multer.File[],
            cinFile?: Express.Multer.File[],
        }) {
        return this.playersService.create(dto,files?.profilImg?.[0],files?.baccFile?.[0], files?.cinFile?.[0]);
    }

    @Get(':id')
    async findPlayerById(@Param('id') id: number) {
        return this.playersService.findOne(id);
    }

    @Put(':id')
        @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'profilImg', maxCount: 1 },
            { name: 'baccFile', maxCount: 1 },
            { name: 'cinFile', maxCount: 1 },
        ]),
    )
    async updatePlayer(@Param('id') id: number, @Body() dto: CreatePlayersDto, @UploadedFiles() files: {
            profilImg?: Express.Multer.File[],
            baccFile?: Express.Multer.File[],
            cinFile?: Express.Multer.File[],
        }) {
        return this.playersService.update(id, dto, files?.profilImg?.[0],files?.baccFile?.[0], files?.cinFile?.[0]);
    }

  @Get('export/:id_team')
  async exportPlayers(@Res() res: express.Response,@Param('id_team') id_team: number ) {
    try {
      await this.playersService.exportPlayersWithImages(res, id_team);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to export players',
        error: error.message,
      });
    }
  }

    @Delete(':id')
    async deletePlayer(@Param('id') id: number) {
        return this.playersService.remove(id);
    }

    @Get('findStarter/:id_team')
    async findStarterPlayers(@Param('id_team') id_team: number) {
        return this.playersService.findStartersByTeamId(id_team);
    }

    @Post('searchPlayer')
    async searchPlayer(@Body() dto: { searchTerm?: string, id_teams: number }) {
        return this.playersService.findByNameOrFirstName(dto.searchTerm, dto.id_teams);
    }
}
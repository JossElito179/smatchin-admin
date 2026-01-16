import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseInterceptors,
    ClassSerializerInterceptor,
    UploadedFiles
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './teams.entity';
import { SearchTeamDto } from './dto/search-team.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('teams')
@UseInterceptors(ClassSerializerInterceptor)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'logoImg', maxCount: 1 },
            { name: 'teamImg', maxCount: 1 },
        ]),
    )
    create(@Body() createTeamDto: CreateTeamDto, @UploadedFiles() files: {
        logoImg?: Express.Multer.File[],
        teamImg?: Express.Multer.File[]
    }): Promise<Team> {
        return this.teamsService.create(createTeamDto, files?.logoImg?.[0], files?.teamImg?.[0]);
    }

    @Get()
    findAll(): Promise<Team[]> {
        return this.teamsService.findAll();
    }

    @Get('user/:userId')
    findByUser(@Param('userId', ParseIntPipe) userId: number): Promise<Team[]> {
        return this.teamsService.findByUserId(userId);
    }

    @Post('all/with-search')
    async search(@Body() dto?: SearchTeamDto) {
        return this.teamsService.findByNameOrUserNameOrTeamName(dto?.query, dto?.is_male);
    }

    @Post('all/with-search/user-id')
    async searchWithUserId(@Body() dto?: SearchTeamDto) {
        return this.teamsService.findByUserIdWithSearch(dto?.query, dto?.is_male, dto?.id_user);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Team> {
        return this.teamsService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'logoImg', maxCount: 1 },
            { name: 'teamImg', maxCount: 1 },
        ]),
    )
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTeamDto: UpdateTeamDto,
        @UploadedFiles() files: {
            logoImg?: Express.Multer.File[],
            teamImg?: Express.Multer.File[]
        }): Promise<Team> {
        return this.teamsService.update(id, updateTeamDto, files?.logoImg?.[0], files?.teamImg?.[0]);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.teamsService.remove(id);
    }
}
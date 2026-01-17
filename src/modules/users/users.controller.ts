import { Controller, Post, Body, Get, ParseIntPipe, Param, UseInterceptors, UploadedFiles, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-users.dto';
import { SearchTeamDto } from '../teams/dto/search-team.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilImg', maxCount: 1 },
    ]),
  )
  async create(@Body() dto: CreateUserDto, @UploadedFiles() files: {
    profilImg?: Express.Multer.File[],
  }) {
    return this.usersService.createThis(dto, files?.profilImg?.[0]);
  }

  @Post('all/with-search')
  async search(@Body() dto?: SearchTeamDto) {
    return this.usersService.findByNameOrUserNameOrTeamName(dto?.query, dto?.is_male);
  }

  @Get('all')
  async findAll() {
    return this.usersService.findAllUser();
  }

  @Get('find/:id')
  async findById(@Param('id', ParseIntPipe) id_user: number) {
    return this.usersService.findById(id_user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id_user: number) {
    return this.usersService.findOne(id_user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id_user: number) {
    return this.usersService.remove(id_user);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilImg', maxCount: 1 },
    ]),
  )

  async updateUser(@Param('id') id: number, @Body() dto: CreateUserDto, @UploadedFiles() files: {
    profilImg?: Express.Multer.File[],
  }) {
    return this.usersService.update(id, dto, files?.profilImg?.[0]);
  }
}

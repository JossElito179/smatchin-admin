import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Players } from './players.entity';
import { Team } from '../teams/teams.entity';
import { Positions } from '../positions/positions.entity';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { FileManager } from '../services/file-manager';

@Module({
  imports: [TypeOrmModule.forFeature([Players, Team, Positions])],
  providers: [PlayersService, FileManager],
  controllers: [PlayersController],
  exports: [PlayersService,FileManager],
})
export class PlayersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Players } from './players.entity';
import { Team } from '../teams/teams.entity';
import { Positions } from '../positions/positions.entity';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { FileManager } from '../services/file-manager';
import { FileService } from '../supabase/file.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [TypeOrmModule.forFeature([Players, Team, Positions])],
  providers: [PlayersService, FileManager, FileService, SupabaseService],
  controllers: [PlayersController],
  exports: [PlayersService,FileManager, FileService, SupabaseService],
})
export class PlayersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { Team } from '../teams/teams.entity';
import { FileManager } from '../services/file-manager';
import { BrevoEmailService } from '../services/brevo.email.service';
import { FileService } from '../supabase/file.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Team])],
  providers: [UsersService, FileManager, BrevoEmailService, FileService, SupabaseService],
  controllers: [UsersController],
  exports: [UsersService, FileManager, BrevoEmailService, FileService, SupabaseService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { Team } from '../teams/teams.entity';
import { FileManager } from '../services/file-manager';
import { BrevoEmailService } from '../services/brevo.email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Team])],
  providers: [UsersService, FileManager, BrevoEmailService],
  controllers: [UsersController],
  exports: [UsersService, FileManager, BrevoEmailService],
})
export class UsersModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Team } from "./teams.entity";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";
import { User } from "../users/users.entity";
import { FileManager } from "../services/file-manager";
import { FileService } from "../supabase/file.service";
import { SupabaseService } from "../supabase/supabase.service";

@Module({
    imports: [  TypeOrmModule.forFeature([ Team, User])],
    controllers: [ TeamsController ],
    providers: [ TeamsService, FileManager, FileService, SupabaseService ],
    exports: [ TeamsService, FileManager, FileService, SupabaseService ]
})
export class TeamsModule {}
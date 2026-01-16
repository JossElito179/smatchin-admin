import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Team } from "./teams.entity";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";
import { User } from "../users/users.entity";
import { FileManager } from "../services/file-manager";

@Module({
    imports: [  TypeOrmModule.forFeature([ Team, User])],
    controllers: [ TeamsController ],
    providers: [ TeamsService, FileManager ],
    exports: [ TeamsService, FileManager ]
})
export class TeamsModule {}
import { Module } from "@nestjs/common";
import { PositionsController } from "./positions.controller";
import { PositionsService } from "./positions.service";
import { Positions } from "./positions.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [ 
        TypeOrmModule.forFeature([Positions])
    ],
    controllers: [PositionsController],
    providers: [PositionsService],
    exports: [PositionsService]
})

export class PositionsModule {}
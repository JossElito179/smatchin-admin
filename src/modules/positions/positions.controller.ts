import { Body, Controller, Get, Post } from "@nestjs/common";
import { PositionsService } from "./positions.service";
import { CreatePositionsDto } from "./dto/positions.dto";

@Controller('positions')
export class PositionsController {

    constructor(
        private service: PositionsService
    ) {}

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Post()
    async create( @Body() dto: CreatePositionsDto ) {
        return this.service.create(dto);
    }
}
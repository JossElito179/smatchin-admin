import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Positions } from "./positions.entity";
import { CreatePositionsDto } from "./dto/positions.dto";


export class PositionsService { 
    constructor(
        @InjectRepository(Positions)
        private repo: Repository<Positions>
    ) { }

    async findAll(): Promise<Positions[]> {
        return await this.repo.find();
    }

    async create(data: CreatePositionsDto): Promise<Positions> {
        const position = this.repo.create(data);
        return await this.repo.save(position);
    }
}
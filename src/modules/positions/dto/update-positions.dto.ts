import { PartialType } from "@nestjs/mapped-types";
import { CreatePlayersDto } from "src/modules/players/dto/create-players.dto";

export class UpdatePositionsDto extends PartialType(CreatePlayersDto)  {}
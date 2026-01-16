import { PartialType } from "@nestjs/mapped-types";
import { CreatePlayersDto } from "./create-players.dto";

export class UpdatePlayersDto extends PartialType(CreatePlayersDto) {}
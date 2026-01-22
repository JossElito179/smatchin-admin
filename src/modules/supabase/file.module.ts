import { Module } from "@nestjs/common";
import { FileService } from "../supabase/file.service";
import { SupabaseService } from "./supabase.service";

@Module({
    providers: [ FileService, SupabaseService ],
    exports: [ FileService, SupabaseService ]
})
export class TeamsModule {}
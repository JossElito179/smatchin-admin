import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { SupabaseServise } from "./supabase.service";

@Injectable()
export class FileService {

    constructor(private readonly supabaseService: SupabaseServise) { }
    private readonly bucket: string = "image-check";

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileName = `${Date.now()}-${file.originalname}`;

        const { error } = await this.supabaseService.supabase.storage
            .from(this.bucket)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        const { data } = this.supabaseService.supabase.storage
            .from(this.bucket)
            .getPublicUrl(fileName);

        return data.publicUrl;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        const filePath = this.extractFilePath(fileUrl);

        const { error } = await this.supabaseService.supabase.storage
            .from(this.bucket)
            .remove([filePath + '']);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    extractFilePath(fileUrl: string): string | undefined {
        return fileUrl.split('/').pop();
    }


    async updateFile(
        oldFileUrl: string,
        newFile: Express.Multer.File,
    ): Promise<string> {

        await this.deleteFile(oldFileUrl);

        const newFileName = `${Date.now()}-${newFile.originalname}`;

        const { error } = await this.supabaseService.supabase.storage
            .from(this.bucket)
            .upload(newFileName, newFile.buffer, {
                contentType: newFile.mimetype,
            });

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        const { data } = this.supabaseService.supabase.storage
            .from(this.bucket)
            .getPublicUrl(newFileName);

        return data.publicUrl;
    }

}

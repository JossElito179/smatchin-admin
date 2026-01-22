import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import axios from "axios";

@Injectable()
export class FileService {
    private readonly logger = new Logger();

    constructor(private readonly supabaseService: SupabaseService) { }
    private readonly bucket: string = "image-check";

    async onModuleInit() {
        await this.testConnection();
    }

    async testConnection(): Promise<void> {
        try {
            this.logger.log('Testing Supabase connection...');

            const { data: buckets, error: bucketsError } = await this.supabaseService.supabase.storage
                .listBuckets();

            if (bucketsError) {
                this.logger.error('Storage connection failed:', bucketsError.message);
                throw new Error(`Storage connection failed: ${bucketsError.message}`);
            }

            this.logger.log(`✅ Storage connected. Available buckets: ${buckets.map(b => b.name).join(', ')}`);

            const bucketExists = buckets.some(bucket => bucket.name === this.bucket);

            if (!bucketExists) {
                this.logger.warn(`⚠️ Bucket "${this.bucket}" not found. Available buckets: ${buckets.map(b => b.name).join(', ')}`);
                await this.createBucketIfNotExists();
            } else {
                this.logger.log(`✅ Bucket "${this.bucket}" found.`);
            }

            try {
                const { error: tableError } = await this.supabaseService.supabase
                    .from('profiles')
                    .select('count')
                    .limit(1);

                if (!tableError) {
                    this.logger.log('✅ Database connection successful');
                }
            } catch (tableError) {
                this.logger.warn('ℹ️ Could not test database tables (storage only mode)');
            }

            const { data: authData } = await this.supabaseService.supabase.auth.getSession();
            this.logger.log(`✅ Authentication configured. Session: ${authData.session ? 'Active' : 'None'}`);

            this.logger.log('🎉 Supabase connection established successfully!');

        } catch (error) {
            this.logger.error('❌ Supabase connection test failed:', error.message);
            this.logger.error('Full error:', error);

            this.logger.debug('Checking environment configuration...');
            this.logger.debug(`Supabase URL: ${process.env.SUPABASE_URL ? 'Set' : 'Missing'}`);
            this.logger.debug(`Supabase Key: ${process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY ? 'Set' : 'Missing'}`);

            throw new Error(`Supabase connection failed: ${error.message}`);
        }
    }

    private async createBucketIfNotExists(): Promise<void> {
        try {
            this.logger.log(`Creating bucket "${this.bucket}"...`);

            const { data, error } = await this.supabaseService.supabase.storage
                .createBucket(this.bucket, {
                    public: true,
                    fileSizeLimit: 52428800
                });

            if (error) {
                this.logger.error(`Failed to create bucket "${this.bucket}":`, error.message);
                return;
            }

            this.logger.log(`✅ Bucket "${this.bucket}" created successfully`);

        } catch (error) {
            this.logger.error(`Error creating bucket:`, error.message);
        }
    }

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
        console.log(data.publicUrl)
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

        if (oldFileUrl) {
            await this.deleteFile(oldFileUrl);
        }

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

    async downloadFile(fileUrl: string): Promise<Buffer> {
        try {
            if (fileUrl.includes('public/')) {
                const response = await axios.get(fileUrl, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                return Buffer.from(response.data);
            }

            const filePath = this.extractFilePath(fileUrl);
            if (!filePath) {
                throw new Error('Could not extract file path from URL');
            }

            const { data, error } = await this.supabaseService.supabase.storage
                .from(this.bucket)
                .download(filePath);

            if (error) {
                throw new Error(`Supabase download error: ${error.message}`);
            }

            const arrayBuffer = await data.arrayBuffer();
            return Buffer.from(arrayBuffer);

        } catch (error) {
            console.error('Download file error:', error);
            throw new InternalServerErrorException(`Failed to download file: ${error.message}`);
        }
    }
}

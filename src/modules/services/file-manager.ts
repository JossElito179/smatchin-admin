import path from "path";
import * as fs from 'fs';

export class FileManager {

    public deleteFile(filePath: string) {
        try {
            const absolutePath = path.join(
                process.cwd(),
                filePath.replace(/^\/+/, '')
            );

            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        } catch (error) {
            console.error('Erreur suppression fichier:', error);
        }
    }

    public async saveFileLocally(file: Express.Multer.File, folder: string): Promise<string> {
        const uploadsDir = './uploads';
        const folderPath = path.join(uploadsDir, folder);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const originalName = file.originalname;
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension)
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();

        const fileName = `${baseName}_${Date.now()}${extension}`;
        const filePath = path.join(folderPath, fileName);

        if (file.buffer) {
            fs.writeFileSync(filePath, file.buffer);
        } else if (file.path) {
            fs.copyFileSync(file.path, filePath);
            if (file.path !== filePath) {
                fs.unlinkSync(file.path);
            }
        }
        return `/uploads/${folder}/${fileName}`;
    }
}
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-users.dto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { MailerService } from '@nestjs-modules/mailer/dist/mailer.service';
import { FileManager } from '../services/file-manager';
import { BrevoEmailService } from '../services/brevo.email.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private repo: Repository<User>,
        private readonly mailerService: MailerService,
        private fileManager: FileManager,
        private readonly brevoMailer: BrevoEmailService
    ) { }

    async findByUsername(user_name: string): Promise<User | null> {
        const user = await this.repo.findOne({ where: { user_name } });
        return user;
    }

    async findAllUser(): Promise<User[]> {
        return this.repo.find();
    }

    async create(data: CreateUserDto) {
        const exists = await this.repo.findOne({ where: { user_name: data.user_name }, });
        if (exists) {
            throw new ConflictException('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.repo.create({ ...data, password: hashedPassword, });
        return this.repo.save(user);
    }

    async createThis(data: CreateUserDto, profil_img?: Express.Multer.File) {
        const userName = this.generateUsername(data.name, data.first_name);

        const exists = await this.repo.findOne({
            where: { user_name: userName },
        });

        if (exists) {
            let counter = 1;
            let newUserName = `${userName}${counter}`;

            while (await this.repo.findOne({ where: { user_name: newUserName } })) {
                counter++;
                newUserName = `${userName}${counter}`;
            }
            data.user_name = newUserName;
        } else {
            data.user_name = userName;
        }

        const generatedPassword = this.generateRandomPassword();

        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        let profilUrl = '';

        if (profil_img) {
            profilUrl = await this.fileManager.saveFileLocally(profil_img, 'profil-user/' + data.name);
        }


        const user = this.repo.create({
            ...data,
            password: hashedPassword,
            profil_img: profilUrl
        });

        const savedUser = await this.repo.save(user);

        const message = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin-bottom: 10px;">Bienvenue sur Smatchin Admin</h2>
        <div style="height: 3px; width: 50px; background-color: #007bff; margin: 0 auto;"></div>
    </div>
    
    <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
        Bonjour <strong>${data.first_name}</strong>,
    </p>
    
    <p style="font-size: 15px; color: #555; margin-bottom: 25px; line-height: 1.6;">
        Votre compte Smatchin Admin a été créé avec succès.
    </p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 25px; border-left: 4px solid #007bff;">
        <p style="margin: 0 0 10px 0; color: #333;">
            <strong>Identifiant :</strong> 
            <span style="font-family: monospace; background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-left: 10px;">
                ${data.user_name}
            </span>
        </p>
        <p style="margin: 0; color: #333;">
            <strong>Mot de passe :</strong>
            <span style="font-family: monospace; background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-left: 10px; color: #dc3545; font-weight: bold;">
                ${generatedPassword}
            </span>
        </p>
    </div>
    
    <div style="background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin-bottom: 30px; border: 1px solid #b6d4fe;">
        <p style="margin: 0 0 15px 0; color: #084298; font-weight: bold;">
            🔗 Lien de connexion :
        </p>
        <a href="https://smatchin-front-production.up.railway.app" 
           style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-bottom: 15px;">
            Accéder à Smatchin Admin
        </a>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
            ou copiez ce lien : 
            <span style="font-family: monospace; color: #0056b3; word-break: break-all;">
                https://smatchin-front-production.up.railway.app
            </span>
        </p>
    </div>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #777; font-size: 14px; margin-bottom: 5px;">
        Cordialement,
    </p>
    <p style="color: #555; font-weight: bold; margin-top: 0;">
        L'équipe Check Event
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
        <p style="margin: 0;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
    </div>
</div>
`;

        const plainTextMessage = `Bonjour ${data.first_name},

Votre compte Smatchin Admin a été créé avec succès.

Identifiant : ${data.user_name}
Mot de passe : ${generatedPassword}

Vous pouvez vous connecter via le lien suivant :
https://smatchin-front-production.up.railway.app

Nous vous recommandons de modifier votre mot de passe après votre première connexion.

Cordialement,
L'équipe Check Event`;

        console.log(generatedPassword);

        try {
            await this.brevoMailer.sendEmail(
                data.email,
                'Compte Smatchin Admin - Vos identifiants',
                message,
                {
                    textContent: plainTextMessage 
                }
            );
        } catch (error) {
            console.error('Erreur lors de l\'envoi du mail:', error);
        }

        return savedUser;
    }

    private generateUsername(firstName: string, lastName: string): string {
        const cleanFirstName = firstName
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');

        const cleanLastName = lastName
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');

        return `${cleanFirstName.charAt(0)}${cleanLastName}`.substring(0, 20);
    }

    private generateRandomPassword(length: number = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';

        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
        password += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26));
        password += '0123456789'.charAt(Math.floor(Math.random() * 10));
        password += '!@#$%^&*'.charAt(Math.floor(Math.random() * 8));

        for (let i = 4; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    private async sendMail(to: string, message: string): Promise<void> {
        try {
            const response = await this.mailerService.sendMail({
                to,
                subject: 'Compte Smatchin Admin Créé',
                text: message,
                html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${message}</pre>`, // Version HTML simple
            });

            console.log(`Mail envoyé à ${to}`);

        } catch (error) {
            console.error('Erreur d\'envoi mail:', error.message);
            throw error;
        }
    }

    async findByNameOrUserNameOrTeamName(
        query?: string,
        is_male?: boolean
    ): Promise<User[]> {
        const qb = this.repo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.teams', 'team');

        if (query) {
            qb.andWhere(
                new Brackets(qb => {
                    qb.where('user.name LIKE :query')
                        .orWhere('user.name LIKE :query')
                        .orWhere('user.first_name LIKE :query')
                        .orWhere('team.name LIKE :query');
                }),
                { query: `%${query}%` }
            );
        }

        if (is_male !== null) {
            qb.andWhere('team.is_male = :is_male', { is_male });
        }

        return qb.getMany();
    }


    async findAll(): Promise<User[]> {
        return this.repo.find({
            relations: ['teams'],
        });
    }

    async findById(id_user: number): Promise<User | null> {
        return this.repo.findOne({
            where: { id: id_user },
            select: {
                id: true,
                name: true,
                role: true,
            }
        });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.repo.findOne({
            where: { id: id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id)
        if (!user) {
            throw new NotFoundException(`user with ID ${id} not found`);
        }

        if (user.profil_img) {
            this.fileManager.deleteFile(user.profil_img);
        }
        await this.repo.remove(user);
    }

    async update(id: number, updateUserDto: Partial<CreateUserDto>, profil_img?: Express.Multer.File): Promise<User> {
        const user = await this.findOne(id);

        if (profil_img) {
            if (user.profil_img) {
                this.fileManager.deleteFile(user.profil_img);
            }
            user.profil_img = await this.fileManager.saveFileLocally(
                profil_img,
                'profil-user/' + (updateUserDto.name ?? user.name)
            );
        }
        Object.assign(user, updateUserDto);
        return await this.repo.save(user);
    }

}

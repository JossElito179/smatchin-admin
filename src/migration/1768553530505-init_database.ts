import { MigrationInterface, QueryRunner } from "typeorm";

export class initDatabase1768553530505 implements MigrationInterface {
    name = 'initDatabase1768553530505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id_users\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`first_name\` varchar(50) NOT NULL, \`user_name\` varchar(50) NOT NULL, \`role\` tinyint NOT NULL, \`phone_number\` varchar(100) NOT NULL, \`password\` varchar(100) NOT NULL, \`profil_img\` text NULL, \`email\` varchar(50) NULL, UNIQUE INDEX \`IDX_074a1f262efaca6aba16f7ed92\` (\`user_name\`), UNIQUE INDEX \`IDX_17d1817f241f10a3dbafb169fd\` (\`phone_number\`), PRIMARY KEY (\`id_users\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teams\` (\`id_teams\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`logo\` text NULL, \`team_img\` text NULL, \`id_users\` int NOT NULL, \`is_male\` tinyint NOT NULL, PRIMARY KEY (\`id_teams\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`positions\` (\`id_positions\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`acronym\` varchar(10) NOT NULL, PRIMARY KEY (\`id_positions\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`players\` (\`id_players\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`first_name\` varchar(50) NOT NULL, \`birth_date\` date NOT NULL, \`profil_img\` text NULL, \`bacc_file\` text NULL, \`cin_file\` text NULL, \`id_teams\` int NOT NULL, \`id_positions\` int NOT NULL, \`is_starter\` tinyint NOT NULL, PRIMARY KEY (\`id_players\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`teams\` ADD CONSTRAINT \`FK_ed265bac136acdea480c265e57e\` FOREIGN KEY (\`id_users\`) REFERENCES \`users\`(\`id_users\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD CONSTRAINT \`FK_6c8fab823346a844f220d70e4d0\` FOREIGN KEY (\`id_teams\`) REFERENCES \`teams\`(\`id_teams\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD CONSTRAINT \`FK_39c984290dd013a22855a61bbae\` FOREIGN KEY (\`id_positions\`) REFERENCES \`positions\`(\`id_positions\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`players\` DROP FOREIGN KEY \`FK_39c984290dd013a22855a61bbae\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP FOREIGN KEY \`FK_6c8fab823346a844f220d70e4d0\``);
        await queryRunner.query(`ALTER TABLE \`teams\` DROP FOREIGN KEY \`FK_ed265bac136acdea480c265e57e\``);
        await queryRunner.query(`DROP TABLE \`players\``);
        await queryRunner.query(`DROP TABLE \`positions\``);
        await queryRunner.query(`DROP TABLE \`teams\``);
        await queryRunner.query(`DROP INDEX \`IDX_17d1817f241f10a3dbafb169fd\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_074a1f262efaca6aba16f7ed92\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}

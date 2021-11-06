import {MigrationInterface, QueryRunner} from "typeorm";

export class addLastLoginToUsersTable1636192766251 implements MigrationInterface {
    name = 'addLastLoginToUsersTable1636192766251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `last_login` date NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `last_login`");
    }

}

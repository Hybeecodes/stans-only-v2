import {MigrationInterface, QueryRunner} from "typeorm";

export class addLastLoginToUsersTable1636192893214 implements MigrationInterface {
    name = 'addLastLoginToUsersTable1636192893214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `last_login`");
        await queryRunner.query("ALTER TABLE `users` ADD `last_login` datetime NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `last_login`");
        await queryRunner.query("ALTER TABLE `users` ADD `last_login` date NULL");
    }

}

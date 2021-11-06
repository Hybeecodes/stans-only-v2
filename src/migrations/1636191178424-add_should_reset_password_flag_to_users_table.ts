import {MigrationInterface, QueryRunner} from "typeorm";

export class addShouldResetPasswordFlagToUsersTable1636191178424 implements MigrationInterface {
    name = 'addShouldResetPasswordFlagToUsersTable1636191178424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `should_rest_password` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `should_rest_password`");
    }

}

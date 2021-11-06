import {MigrationInterface, QueryRunner} from "typeorm";

export class addSuspendedFlagToUsersTable1636190191429 implements MigrationInterface {
    name = 'addSuspendedFlagToUsersTable1636190191429'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `is_suspended` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `is_suspended`");
    }

}

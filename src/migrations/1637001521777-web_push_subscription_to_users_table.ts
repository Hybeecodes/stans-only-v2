import {MigrationInterface, QueryRunner} from "typeorm";

export class webPushSubscriptionToUsersTable1637001521777 implements MigrationInterface {
    name = 'webPushSubscriptionToUsersTable1637001521777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `web_push_subscription` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `web_push_subscription`");
    }

}

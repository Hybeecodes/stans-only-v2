import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersTableMigration1622597429096
  implements MigrationInterface
{
  name = 'createUsersTableMigration1622597429096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `first_name` varchar(255) NOT NULL, `last_name` varchar(255) NOT NULL, `user_name` varchar(30) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `phone_number` varchar(255) NULL, `cover_picture_url` varchar(255) NULL, `profile_picture_url` varchar(255) NULL, `is_content_creator` tinyint NOT NULL DEFAULT 0, `bio` text NULL, `location` varchar(255) NULL, `web_link` varchar(255) NULL, `reset_token` varchar(255) NULL, `date_of_birth` date NULL, `is_confirmed` tinyint NOT NULL DEFAULT 0, `email_notification_status` tinyint NOT NULL DEFAULT 0, `push_notification_status` tinyint NOT NULL DEFAULT 0, `status` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE', `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_074a1f262efaca6aba16f7ed92` (`user_name`), UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_074a1f262efaca6aba16f7ed92` ON `users`',
    );
    await queryRunner.query('DROP TABLE `users`');
  }
}

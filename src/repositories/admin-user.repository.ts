import { EntityRepository, Repository } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';

@EntityRepository(AdminUser)
export class AdminUserRepository extends Repository<AdminUser> {
  async findUserById(userId: number) {
    return this.findOne({ where: { id: userId, isDeleted: false } });
  }

  async findUserByEmail(email: string) {
    return this.findOne({ where: { email, isDeleted: false } });
  }

  async findUserByEmailAndResetToken(email: string, resetToken: string) {
    return this.findOne({ where: { email, isDeleted: false, resetToken } });
  }

  async findUserByUserName(userName: string) {
    return this.findOne({ where: { userName, isDeleted: false } });
  }
}

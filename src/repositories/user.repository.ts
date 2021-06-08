import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
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

  async createUser(user: Partial<User>): Promise<User> {
    const newUser = this.create(user);
    return await this.save(newUser);
  }
}

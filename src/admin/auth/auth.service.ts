import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserRepository } from '../../repositories/admin-user.repository';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InviteUserDto } from "./dtos/invite-user.dto";

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(AdminUserRepository)
    private readonly adminRepository: AdminUserRepository,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async inviteAdminUser(input: InviteUserDto): Promise<void> {
    try {

    } catch (e) {
      
    }
  }

  async login(): Promise<void> {}


}

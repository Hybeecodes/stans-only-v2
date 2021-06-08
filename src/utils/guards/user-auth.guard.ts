import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../client/users/users.service';
import { UserDto } from '../../entities/user.entity';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    request.user = await this.validateRequest(request);
    return true;
  }
  async validateRequest(request: {
    headers: { authorization: string };
  }): Promise<UserDto> {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new HttpException(
        'No Authorization Token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const authArr = authorization.split(' ');
    if (authArr[0] !== 'Bearer') {
      throw new HttpException(
        'Invalid Authorization Token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const authToken = authArr[1];
      const { email } = this.jwtService.decode(authToken) as { email: string };
      const user = await this.usersService.getUserByEmail(email);
      if (!user) {
        throw new HttpException(
          'Invalid Authorization Token',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return user.toUserResponse();
    } catch (e) {
      Logger.error(
        `Validate Request Failed: ${JSON.stringify(e)}`,
        UserAuthGuard.name,
      );
      throw new HttpException(
        'Invalid Authorization Token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

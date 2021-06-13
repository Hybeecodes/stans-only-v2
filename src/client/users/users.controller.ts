import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserAuthGuard } from '../../utils/guards/user-auth.guard';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { UpdateNotificationSettingsDto } from './dtos/update-notification-settings.dto';
import { UpdateUserAccountDetailsDto } from './dtos/update-user-account-details.dto';
import { PostsService } from '../posts/posts.service';

@UseGuards(UserAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Get('profile/:username')
  async getUserProfile(@Param('username') username: string) {
    const response = await this.usersService.getUserProfile(username);
    return new SuccessResponseDto('Successful', response);
  }

  @Put('profile')
  async updateUserProfile(
    @Body() input: UpdateUserProfileDto,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.usersService.updateUserProfile(userId, input);
    return new SuccessResponseDto('Profile Update Successful', response);
  }

  @Get('settings/notification')
  async getUserNotificationSettings(@LoggedInUser('id') userId: number) {
    const response = await this.usersService.getUserNotificationSettings(
      userId,
    );
    return new SuccessResponseDto('Successful', response);
  }

  @Get('settings/account')
  async getUserAccountDetails(@LoggedInUser('id') userId: number) {
    const response = await this.usersService.getUserAccountDetails(userId);
    return new SuccessResponseDto('Successful', response);
  }

  @Put('settings/notification')
  async updateUserNotificationSettings(
    @LoggedInUser('id') userId: number,
    @Body() input: UpdateNotificationSettingsDto,
  ) {
    const response = await this.usersService.updateUserNotificationSettings(
      userId,
      input,
    );
    return new SuccessResponseDto(
      'Notification Settings Updated Successful',
      response,
    );
  }

  @Put('settings/account')
  async updateUserAccountDetails(
    @LoggedInUser('id') userId: number,
    @Body() input: UpdateUserAccountDetailsDto,
  ) {
    const response = await this.usersService.updateUserAccountDetails(
      userId,
      input,
    );
    return new SuccessResponseDto(
      'Account Details Updated Successful',
      response,
    );
  }

  @Post('deactivate')
  async deactivateAccount(
    @LoggedInUser('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.usersService.deleteUser(userId);
    return new SuccessResponseDto('Account Deactivated Successful', response);
  }

  ///////////////// User Posts /////////////////
  @Get(':username/posts')
  async getPostsByUser(
    @Param('username') username: string,
  ): Promise<SuccessResponseDto> {
    const response = await this.postsService.findPostsByUsername(username);
    return new SuccessResponseDto('User Posts Successful', response);
  }
}

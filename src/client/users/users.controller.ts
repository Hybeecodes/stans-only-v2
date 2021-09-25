import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { UpdateNotificationSettingsDto } from './dtos/update-notification-settings.dto';
import { UpdateUserAccountDetailsDto } from './dtos/update-user-account-details.dto';
import { PostsService } from '../posts/posts.service';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { SubscriptionService } from '../subscription/subscription.service';
import { NewReportDto } from '../reports/dtos/new-report.dto';
import { ReportedType } from '../../entities/report.entity';
import { ReportsService } from '../reports/reports.service';
import { BlockService } from '../block/block.service';
import { GetPostsQueryDto } from '../posts/dto/get-posts-query.dto';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { PaymentService } from '../../payment/payment.service';
import { TipDto } from './dtos/tip.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly reportsService: ReportsService,
    private readonly blockService: BlockService,
    private readonly bookmarkService: BookmarksService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get('profile/:username')
  async getUserProfile(
    @Param('username') username: string,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.usersService.getUserProfile(username, userId);
    return new SuccessResponseDto('Successful', response);
  }

  @Get('bvn')
  async getBvn(@LoggedInUser('id') userId: number) {
    const response = await this.usersService.fetchUserBvn(userId);
    return new SuccessResponseDto('BVN Retrieved Successfully', response);
  }

  @Put('bvn')
  async updateBVN(
    @Body('bvn') bvn: string,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.usersService.updateUserBvn(userId, bvn);
    return new SuccessResponseDto('BVN Updated Successfully', response);
  }

  @Get('wallet/balance')
  async getWalletBalance(@LoggedInUser('id') userId: number) {
    const response = await this.usersService.getUserWalletBalance(userId);
    return new SuccessResponseDto(
      'Wallet Balance Retrieved Successfully',
      response,
    );
  }

  @Get('wallet/history')
  async getWalletHistory(
    @LoggedInUser('id') userId: number,
    @Query() query: BaseQueryDto,
  ) {
    const response = await this.paymentService.getWalletTransactionHistory(
      userId,
      query,
    );
    return new SuccessResponseDto(
      'Wallet history retrieved successfully',
      response,
    );
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

  @Get(':username/stans-followers')
  async getUserStansFollowingCount(
    @Param('username') username: string,
  ): Promise<SuccessResponseDto> {
    const response = await this.usersService.getUserStansFollowingCount(
      username,
    );
    return new SuccessResponseDto('Successful', response);
  }

  @Get('list/count')
  async getUserListCount(
    @LoggedInUser('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const bookmarkCount = await this.bookmarkService.getUserBookmarksCount(
      userId,
    );
    const blockedUsersCount = await this.blockService.getBlockedUsersCount(
      userId,
    );

    const stansCount = await this.subscriptionService.getSubscribersCount(
      userId,
    );
    const subscriptionsCount =
      await this.subscriptionService.getSubscriptionsCount(userId);
    const response = {
      subscriptionsCount,
      stansCount,
      blockedUsersCount,
      bookmarkCount,
    };
    return new SuccessResponseDto('Successful', response);
  }

  ///////////////// User Posts /////////////////
  @Get(':username/posts')
  async getPostsByUser(
    @Param('username') username: string,
    @Query() queryData: GetPostsQueryDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.postsService.findPostsByUsername(
      username,
      queryData,
    );
    return new SuccessResponseDto('User Posts Successful', response);
  }

  @Post(':userName/block')
  async blockUser(
    @LoggedInUser('id') blockerId: number,
    @Param('userName') userName: string,
  ): Promise<SuccessResponseDto> {
    const response = await this.blockService.blockUser(blockerId, userName);
    return new SuccessResponseDto('User Blocked Successfully', response);
  }

  @Post(':userName/unblock')
  async unBlockUser(
    @LoggedInUser('id') blockerId: number,
    @Param('userName') userName: string,
  ): Promise<SuccessResponseDto> {
    const response = await this.blockService.unblockUser(blockerId, userName);
    return new SuccessResponseDto('User Unblocked Successfully', response);
  }

  @Get(':userName/blocked-users')
  async getBlockedUsers(
    @LoggedInUser('id') userId: number,
    @Query() queryData: BaseQueryDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.blockService.getBlockedUsers(userId, queryData);
    return new SuccessResponseDto('Successful', response);
  }

  ////////////////////Subscription ///////////////////////
  @Post(':userName/subscribe')
  async subscribeToUser(
    @LoggedInUser('id') subscriberId: number,
    @Param('userName') userName: string,
  ): Promise<SuccessResponseDto> {
    const response = await this.subscriptionService.createSubscription(
      subscriberId,
      userName,
    );
    return new SuccessResponseDto('Subscription Successful', response);
  }

  @Post(':userName/tip')
  async tipUser(
    @LoggedInUser('id') giverId: number,
    @Param('userName') userName: string,
    @Body() payload: TipDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.usersService.tipUser(
      giverId,
      userName,
      payload,
    );
    return new SuccessResponseDto('User tipped Successfully', response);
  }

  @Post(':userName/unsubscribe')
  async unsubscribeFromUser(
    @LoggedInUser('id') subscriberId: number,
    @Param('userName') userName: string,
  ): Promise<SuccessResponseDto> {
    const response = await this.subscriptionService.removeSubscription(
      subscriberId,
      userName,
    );
    return new SuccessResponseDto(
      'Subscription Deleted Successfully',
      response,
    );
  }

  @Get(':userName/subscribers')
  async getSubscribers(
    @Param('userName') userName: string,
    @Query() queryData: BaseQueryDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.subscriptionService.getUserSubscribers(
      userName,
      queryData,
    );
    return new SuccessResponseDto('Successful', response);
  }

  @Get(':userName/subscriptions')
  async getSubscriptions(
    @Param('userName') userName: string,
    @Query() queryData: BaseQueryDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.subscriptionService.getUserSubscriptions(
      userName,
      queryData,
    );
    return new SuccessResponseDto('Successful', response);
  }

  @Post(':userName/report')
  async reportPost(
    @Param('userName') userName: string,
    @LoggedInUser('id') userId: number,
    @Body() input: NewReportDto,
  ) {
    const reported = await this.usersService.getUserByUsername(userName);
    if (!reported) {
      throw new HttpException('User Not Found', HttpStatus.BAD_REQUEST);
    }
    const response = await this.reportsService.addReport(
      reported.id,
      ReportedType.USER,
      input,
      userId,
    );
    return new SuccessResponseDto('User Reported Successfully', response);
  }
}

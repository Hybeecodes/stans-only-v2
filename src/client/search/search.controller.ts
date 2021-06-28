import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dtos/users-search-query.dto';
import { SuccessResponseDto } from '../../shared/success-response.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  async searchUsers(@Query() queryInput: SearchQueryDto) {
    const response = await this.searchService.searchUsers(queryInput);
    return new SuccessResponseDto('Success', response);
  }

  @Get('posts')
  async searchPosts(@Query() queryInput: SearchQueryDto) {
    const response = await this.searchService.searchPosts(queryInput);
    return new SuccessResponseDto('Success', response);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { SuggestUserQueryDto } from './dtos/suggest-user-query.dto';

@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get('users')
  async getUserSuggestions(
    @Query() queryInput: SuggestUserQueryDto,
    @LoggedInUser('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.suggestionsService.suggestUsers(
      userId,
      queryInput,
    );
    return new SuccessResponseDto('Success', response);
  }
}

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ReportRepository } from '../../repositories/report.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { NewReportDto } from './dtos/new-report.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReportsService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(ReportRepository)
    private readonly reportRepository: ReportRepository,
    private readonly usersService: UsersService,
  ) {
    this.logger = new Logger(ReportsService.name);
  }

  async addReport(
    reportedId: number,
    reportedType: string,
    input: NewReportDto,
    userId: number,
  ): Promise<void> {
    const reporter = await this.usersService.findUserById(userId);
    try {
      const { reason } = input;
      const newReport = this.reportRepository.create({
        reportedId,
        reason,
        reportedType,
        reporter,
      });
      await this.reportRepository.save(newReport);
    } catch (e) {
      this.logger.error(`Add Report Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Add new Report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

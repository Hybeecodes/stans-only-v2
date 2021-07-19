import { EntityRepository, Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

@EntityRepository(Report)
export class ReportRepository extends Repository<Report> {}

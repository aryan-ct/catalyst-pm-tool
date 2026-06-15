import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { CreateTimesheetDto, CreateTimeLogDto, UpdateTimeLogDto } from './dto/timesheet.dto';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('timesheet')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR)
  @Post()
  async createTimesheet(@Body() createTimesheetDto: CreateTimesheetDto) {
    return this.timesheetService.createTimesheet(createTimesheetDto);
  }

  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR)
  @Get()
  async getAllTimesheets() {
    return this.timesheetService.findAll();
  }

  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR)
  @Get('logs')
  async getTimesheetLogs(
    @Query('projectId') projectId: string,
    @Query('resourceId') resourceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.timesheetService.findLogs(projectId, resourceId, startDate, endDate);
  }

  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR)
  @Patch('logs/:logId')
  async updateTimeLog(@Param('logId') logId: string, @Body() dto: UpdateTimeLogDto) {
    return this.timesheetService.updateTimeLog(logId, dto);
  }

  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR)
  @Delete('logs/:logId')
  async deleteTimeLog(@Param('logId') logId: string) {
    return this.timesheetService.deleteTimeLog(logId);
  }

  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR)
  @Get(':id')
  async getTimesheetById(@Param('id') id: string) {
    return this.timesheetService.findOne(id);
  }

  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.JR_HR)
  @Post(':id/logs')
  async addTimeLog(@Param('id') timesheetId: string, @Body() dto: CreateTimeLogDto) {
    return this.timesheetService.addTimeLog(timesheetId, dto);
  }
}

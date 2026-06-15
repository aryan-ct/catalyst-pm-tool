import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../../config/prima.config';
import {
  CreateTimesheetDto,
  CreateTimeLogDto,
  UpdateTimeLogDto,
} from './dto/timesheet.dto';

@Injectable()
export class TimesheetService {
  async createTimesheet(dto: CreateTimesheetDto) {
    const totalHours =
      dto.logs?.reduce((sum, l) => sum + l.workingHours, 0) ??
      dto.totalHours ??
      0;

    return prisma.$transaction(async (tx) => {
      const timesheet = await tx.timesheet.create({
        data: {
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          projectId: dto.projectId,
          resourceId: dto.resourceId,
          totalHours,
        },
      });

      if (dto.logs && dto.logs.length > 0) {
        await tx.timeLog.createMany({
          data: dto.logs.map((log) => ({
            timesheetId: timesheet.id,
            date: new Date(log.date),
            taskTitle: log.taskTitle,
            workingHours: log.workingHours,
          })),
        });
      }

      return tx.timesheet.findUnique({
        where: { id: timesheet.id },
        include: {
          project: { select: { id: true, name: true } },
          resource: { select: { id: true, name: true } },
          timeLogs: { orderBy: { date: 'asc' } },
        },
      });
    });
  }

  async findAll() {
    return prisma.timesheet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        resource: { select: { id: true, name: true } },
        timeLogs: { orderBy: { date: 'asc' } },
      },
    });
  }

  async findOne(id: string) {
    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        resource: { select: { id: true, name: true } },
        timeLogs: { orderBy: { date: 'asc' } },
      },
    });
    if (!timesheet) throw new NotFoundException('Timesheet not found');
    return timesheet;
  }

  async addTimeLog(timesheetId: string, dto: CreateTimeLogDto) {
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
    });
    if (!timesheet) throw new NotFoundException('Timesheet not found');

    const log = await prisma.timeLog.create({
      data: {
        timesheetId,
        date: new Date(dto.date),
        taskTitle: dto.taskTitle,
        workingHours: dto.workingHours,
      },
    });

    await this.recalculateTotalHours(timesheetId);
    return log;
  }

  async updateTimeLog(logId: string, dto: UpdateTimeLogDto) {
    const log = await prisma.timeLog.findUnique({ where: { id: logId } });
    if (!log) throw new NotFoundException('Time log not found');

    const updated = await prisma.timeLog.update({
      where: { id: logId },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.taskTitle !== undefined && { taskTitle: dto.taskTitle }),
        ...(dto.workingHours !== undefined && {
          workingHours: dto.workingHours,
        }),
      },
    });

    await this.recalculateTotalHours(log.timesheetId);
    return updated;
  }

  async deleteTimeLog(logId: string) {
    const log = await prisma.timeLog.findUnique({ where: { id: logId } });
    if (!log) throw new NotFoundException('Time log not found');

    await prisma.timeLog.delete({ where: { id: logId } });
    await this.recalculateTotalHours(log.timesheetId);
    return { success: true };
  }

  async findLogs(
    projectId: string,
    resourceId: string,
    startDate: string,
    endDate: string,
  ) {
    if (!projectId || !resourceId || !startDate || !endDate) {
      throw new BadRequestException('Missing required query parameters');
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const logs = await prisma.dailyTaskAllocation.findMany({
      where: { projectId, resourceId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });

    const taskIds = logs.map((log) => log.taskId).filter(Boolean) as string[];
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: { id: true, title: true },
    });

    const taskMap = new Map(tasks.map((t) => [t.id, t.title]));

    return logs.map((log) => ({
      ...log,
      taskTitle: log.taskId
        ? taskMap.get(log.taskId) || 'Unknown Task'
        : log.desc || log.description || 'General Task',
    }));
  }

  private async recalculateTotalHours(timesheetId: string) {
    const result = await prisma.timeLog.aggregate({
      where: { timesheetId },
      _sum: { workingHours: true },
    });
    await prisma.timesheet.update({
      where: { id: timesheetId },
      data: { totalHours: result._sum.workingHours ?? 0 },
    });
  }
}

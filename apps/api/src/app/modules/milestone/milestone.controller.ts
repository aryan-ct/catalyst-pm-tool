import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';
import { Roles, UserRole } from '../../decorators/roles.decorator';

@Controller('milestones')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Roles(UserRole.MANAGER)
  @Get('all')
  async findAll() {
    return this.milestoneService.findAllMilestones();
  }

  @Roles(UserRole.MANAGER)
  @Post('create/:project_id')
  async createMilestone(
    @Body() createMilestoneDto: CreateMilestoneDto,
    @Param('project_id') project_id: string,
  ) {
    return this.milestoneService.createMilestone(
      project_id,
      createMilestoneDto,
    );
  }

  @Roles(UserRole.MANAGER)
  @Patch(':id')
  async updateMilestone(
    @Param('id') id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    return this.milestoneService.updateMilestone(id, updateMilestoneDto);
  }
}

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';

@Controller('milestones')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Get('all')
  async findAll() {
    return this.milestoneService.findAllMilestones();
  }

  @Post('create')
  async createMilestone(@Body() createMilestoneDto: CreateMilestoneDto) {
    return this.milestoneService.createMilestone(createMilestoneDto);
  }

  @Patch(':id')
  async updateMilestone(
    @Param('id') id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    return this.milestoneService.updateMilestone(id, updateMilestoneDto);
  }
}

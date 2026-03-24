import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ResourcesModule } from './modules/resource/resources.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { ProjectsModule } from './modules/project/project.module';
import { LeadsModule } from './modules/leads/lead.module';
import { ResourceAllocationsModule } from './modules/resource-allocations/resource-allocations.module';

@Module({
  imports: [
    AuthModule,
    ResourcesModule,
    ProjectsModule,
    LeadsModule,
    ResourceAllocationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

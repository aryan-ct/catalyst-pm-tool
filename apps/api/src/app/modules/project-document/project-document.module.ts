import { Module } from '@nestjs/common';
import { ProjectDocumentController } from './project-document.controller';
import { ProjectDocumentService } from './project-document.service';

@Module({
  controllers: [ProjectDocumentController],
  providers: [ProjectDocumentService],
})
export class ProjectDocumentModule {}

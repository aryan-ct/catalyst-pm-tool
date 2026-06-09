import { Module } from '@nestjs/common';
import { AssetUpdateRequestController } from './asset-update-request.controller';
import { AssetUpdateRequestService } from './asset-update-request.service';

@Module({
  controllers: [AssetUpdateRequestController],
  providers: [AssetUpdateRequestService],
})
export class AssetUpdateRequestModule {}

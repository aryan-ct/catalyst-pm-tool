import { Module } from '@nestjs/common';
import { AssetTrackingController } from './asset-tracking.controller';
import { AssetTrackingService } from './asset-tracking.service';

@Module({
  controllers: [AssetTrackingController],
  providers: [AssetTrackingService],
})
export class AssetTrackingModule {}

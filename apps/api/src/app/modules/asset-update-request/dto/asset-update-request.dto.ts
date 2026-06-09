import { IsObject, IsOptional, IsString } from 'class-validator';

export class ChangeEntry {
  from!: string;
  to!: string;
}

export class CreateAssetUpdateRequestDto {
  @IsString()
  assetId!: string;

  @IsObject()
  requestedChanges!: Record<string, ChangeEntry>;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewAssetUpdateRequestDto {
  @IsOptional()
  @IsString()
  hrComment?: string;
}

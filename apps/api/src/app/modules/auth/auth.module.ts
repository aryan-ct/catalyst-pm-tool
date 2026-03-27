import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../../config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [JwtModule.register(JwtConfig)],
  providers: [JwtStrategy, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

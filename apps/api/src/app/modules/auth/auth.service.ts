import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '../../decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../../config/prima.config';
import { bcryptHashing } from '../../../utils/utils';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const hrEmail = process.env.HR_EMAIL_ID;
    const hrPassword = process.env.HR_PASSWORD;
    const hrName = process.env.HR_NAME;

    if (hrEmail && email === hrEmail) {
      if (hrPassword !== password) {
        throw new UnauthorizedException('You are not authorized.');
      }

      const payload = {
        name: hrName,
        email: hrEmail,
        role: UserRole.HR,
        id: 'catalyst-hr-007',
      };
      const accessToken = this.jwtService.sign(payload);
      return { token: `Bearer ${accessToken}` };
    }

    const resource = await prisma.resource.findUnique({ where: { email } });

    if (!resource || !resource.isActive) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const isValidPassword = await bcryptHashing.verifyPassword(
      password,
      resource.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Email or password was incorrect.');
    }

    const payload = {
      name: resource.name,
      email: resource.email,
      role: resource.role,
      id: resource.id,
    };

    const token = this.jwtService.sign(payload);

    return { token: `Bearer ${token}` };
  }

  async changePassword(
    userId: string,
    userRole: string,
    dto: ChangePasswordDto,
  ) {
    if (userRole === UserRole.HR) {
      throw new BadRequestException(
        'Password change is not available for this account.',
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: userId },
    });

    if (!resource) {
      throw new UnauthorizedException('User not found.');
    }

    const isValid = await bcryptHashing.verifyPassword(
      dto.currentPassword,
      resource.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const newHash = await bcryptHashing.generatePasswordHash(dto.newPassword);
    await prisma.resource.update({
      where: { id: userId },
      data: { password: newHash },
    });

    return { message: 'Password updated successfully.' };
  }
}

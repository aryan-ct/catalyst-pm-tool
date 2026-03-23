import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
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
      };
      const accessToken = this.jwtService.sign(payload);
      return { token: `Bearer_${accessToken}` };
    }

    const resource = await prisma.resource.findUnique({ where: { email } });

    if (!resource) {
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
    };

    const token = this.jwtService.sign(payload);

    return { token: `Bearer_${token}` };
  }
}

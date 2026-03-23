import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '@user/entities/user.entity';
import { AuthUser, JwtPayload } from '@auth/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.query?.token as string || null,
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const { id } = payload;

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is blocked. Contact support');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      isVerified: user.isVerified,
      roles: user.roles.map((role) => role.name),
    };
  }
}

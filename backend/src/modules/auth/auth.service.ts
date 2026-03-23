import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { HashingAdapter } from '@common/adapters';
import { DatabaseExceptionHandler } from '@common/providers/database-exception-handler.provider';
import { HttpResponseMessage } from '@common/utils';
import { generateAlphaNumericToken } from '@common/utils/generate-token-crypto';
import { User } from '@user/entities/user.entity';
import { Role } from '@role/entities/role.entity';
import { EmailService } from '@email/email.service';
import { Token } from './entities/token.entity';
import { TokenType } from './enums';
import { JwtPayload } from './interfaces';
import {
  RegisterUserDto,
  LoginUserDto,
  EmailDto,
  TokenDto,
  UpdatePasswordDto,
} from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly hashingAdapter: HashingAdapter,
    private readonly configService: ConfigService,
    private readonly dbExHandler: DatabaseExceptionHandler,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    try {
      const { password, confirmPassword, ...userData } = registerUserDto;

      const emailEnabled = this.configService.get<boolean>('EMAIL_ENABLED');

      return await this.dataSource.transaction(async (manager) => {
        const userRole = await this.roleRepository.findOne({
          where: { name: 'user' },
        });

        if (!userRole) {
          throw new BadRequestException(
            'Default role not found. Please run the seed endpoint first',
          );
        }

        const hashedPassword = await this.hashingAdapter.hash(password);

        const user = manager.create(User, {
          ...userData,
          password: hashedPassword,
          isVerified: !emailEnabled,
          roles: [userRole],
        });

        await manager.save(user);

        if (emailEnabled) {
          const tokenValue = generateAlphaNumericToken();
          const token = manager.create(Token, {
            user,
            tokenType: TokenType.EMAIL_VERIFICATION,
            token: tokenValue,
          });
          await manager.save(token);

          await this.emailService.sendVerificationEmail(
            user.email,
            user.fullName,
            tokenValue,
          );
        }

        delete (user as Partial<User>).password;

        return HttpResponseMessage.created('User', {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          isVerified: user.isVerified,
        });
      });
    } catch (error) {
      this.logger.error(`Error registering user: ${(error as Error).message}`);
      this.dbExHandler.handle(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;

      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'fullName', 'isActive', 'isVerified'],
        relations: ['roles'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User is blocked. Contact support');
      }

      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Email not verified. Please check your email',
        );
      }

      const isPasswordValid = await this.hashingAdapter.compare(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        roles: user.roles.map((r) => r.name),
      };

      return HttpResponseMessage.success('Login successful', {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles.map((r) => r.name),
        },
        token: this.jwtService.sign(payload),
      });
    } catch (error) {
      this.logger.error(`Error logging in: ${(error as Error).message}`);
      if (error instanceof UnauthorizedException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async verifyEmail(tokenDto: TokenDto) {
    try {
      const tokenRecord = await this.tokenRepository.findOne({
        where: {
          token: tokenDto.token,
          tokenType: TokenType.EMAIL_VERIFICATION,
        },
        relations: ['user'],
      });

      if (!tokenRecord) {
        throw new BadRequestException('Invalid or expired token');
      }

      if (tokenRecord.isExpired()) {
        await this.tokenRepository.remove(tokenRecord);
        throw new BadRequestException('Token has expired. Please request a new one');
      }

      await this.userRepository.update(tokenRecord.user.id, {
        isVerified: true,
      });

      await this.tokenRepository.remove(tokenRecord);

      return HttpResponseMessage.success('Email verified successfully', {
        email: tokenRecord.user.email,
      });
    } catch (error) {
      this.logger.error(`Error verifying email: ${(error as Error).message}`);
      if (error instanceof BadRequestException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async resendToken(emailDto: EmailDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: emailDto.email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isVerified) {
        throw new BadRequestException('Email is already verified');
      }

      await this.tokenRepository.delete({
        user: { id: user.id },
        tokenType: TokenType.EMAIL_VERIFICATION,
      });

      const tokenValue = generateAlphaNumericToken();
      const token = this.tokenRepository.create({
        user,
        tokenType: TokenType.EMAIL_VERIFICATION,
        token: tokenValue,
      });
      await this.tokenRepository.save(token);

      await this.emailService.sendVerificationEmail(
        user.email,
        user.fullName,
        tokenValue,
      );

      return HttpResponseMessage.success('Verification email sent', {
        email: user.email,
      });
    } catch (error) {
      this.logger.error(`Error resending token: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async forgotPassword(emailDto: EmailDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: emailDto.email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.isActive) {
        throw new BadRequestException('User is blocked. Contact support');
      }

      await this.tokenRepository.delete({
        user: { id: user.id },
        tokenType: TokenType.PASSWORD_RESET,
      });

      const tokenValue = generateAlphaNumericToken();
      const token = this.tokenRepository.create({
        user,
        tokenType: TokenType.PASSWORD_RESET,
        token: tokenValue,
      });
      await this.tokenRepository.save(token);

      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.fullName,
        tokenValue,
      );

      return HttpResponseMessage.success('Password reset email sent', {
        email: user.email,
      });
    } catch (error) {
      this.logger.error(
        `Error sending forgot password: ${(error as Error).message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async validateToken(tokenDto: TokenDto) {
    try {
      const tokenRecord = await this.tokenRepository.findOne({
        where: {
          token: tokenDto.token,
          tokenType: TokenType.PASSWORD_RESET,
        },
        relations: ['user'],
      });

      if (!tokenRecord) {
        throw new BadRequestException('Invalid token');
      }

      if (tokenRecord.isExpired()) {
        await this.tokenRepository.remove(tokenRecord);
        throw new BadRequestException('Token has expired');
      }

      return HttpResponseMessage.success('Token is valid', {
        email: tokenRecord.user.email,
        token: tokenRecord.token,
      });
    } catch (error) {
      this.logger.error(`Error validating token: ${(error as Error).message}`);
      if (error instanceof BadRequestException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    try {
      const { email, token, password } = updatePasswordDto;

      const tokenRecord = await this.tokenRepository.findOne({
        where: {
          token,
          tokenType: TokenType.PASSWORD_RESET,
          user: { email },
        },
        relations: ['user'],
      });

      if (!tokenRecord) {
        throw new BadRequestException('Invalid token or email');
      }

      if (tokenRecord.isExpired()) {
        await this.tokenRepository.remove(tokenRecord);
        throw new BadRequestException('Token has expired');
      }

      const hashedPassword = await this.hashingAdapter.hash(password);

      await this.userRepository.update(tokenRecord.user.id, {
        password: hashedPassword,
      });

      await this.tokenRepository.remove(tokenRecord);

      return HttpResponseMessage.success('Password updated successfully', {
        email,
      });
    } catch (error) {
      this.logger.error(
        `Error updating password: ${(error as Error).message}`,
      );
      if (error instanceof BadRequestException) throw error;
      this.dbExHandler.handle(error);
    }
  }
}

import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  RegisterUserDto,
  LoginUserDto,
  EmailDto,
  TokenDto,
  UpdatePasswordDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify email with token' })
  verifyEmail(@Body() tokenDto: TokenDto) {
    return this.authService.verifyEmail(tokenDto);
  }

  @Post('resend-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend verification email' })
  resendToken(@Body() emailDto: EmailDto) {
    return this.authService.resendToken(emailDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send password reset email' })
  forgotPassword(@Body() emailDto: EmailDto) {
    return this.authService.forgotPassword(emailDto);
  }

  @Post('validate-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validate a password reset token' })
  validateToken(@Body() tokenDto: TokenDto) {
    return this.authService.validateToken(tokenDto);
  }

  @Post('update-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update password with reset token' })
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(updatePasswordDto);
  }
}

import { Authenticate, Public } from '@nestjs/authentication';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from '@src/modules/authentication/dto/login.dto.js';
import { RegisterDto } from '@src/modules/authentication/dto/register.dto.js';
import { CredentialService } from '@src/modules/authentication/services/credential.service.js';
import { SessionService } from '@src/modules/authentication/services/session.service.js';
import { UserResponseDto } from '@src/modules/user/dto/user-response.dto.js';
import { UserDocument } from '@src/modules/user/entities/user.schema.js';
import { UserMapper } from '@src/modules/user/mappers/user.mapper.js';

@Controller('auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(
    private readonly credentialService: CredentialService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @Public()
  async register(@Body() data: RegisterDto): Promise<UserResponseDto> {
    const user = await this.credentialService.register(data);

    return UserMapper.toResponseDto(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(@Body() data: LoginDto): Promise<UserResponseDto> {
    const user = await this.sessionService.login(data);

    return UserMapper.toResponseDto(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Authenticate()
  async logout(): Promise<void> {
    await this.sessionService.logout();
  }
}

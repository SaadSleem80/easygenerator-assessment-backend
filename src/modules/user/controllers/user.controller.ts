import { Authenticate, CurrentUser } from '@nestjs/authentication';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from '@src/modules/user/dto/user-response.dto.js';
import type { UserDocument } from '@src/modules/user/entities/user.schema.js';
import { UserMapper } from '@src/modules/user/mappers/user.mapper.js';

@Controller('users')
@ApiTags('Users')
export class UserController {
  @Get('me')
  @Authenticate()
  me(@CurrentUser() user: UserDocument): UserResponseDto {
    return UserMapper.toResponseDto(user);
  }
}

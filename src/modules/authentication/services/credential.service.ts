import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DUMMY_PASSWORD_HASH } from '@src/modules/authentication/constants/auth.constants.js';
import { RegisterDto } from '@src/modules/authentication/dto/register.dto.js';
import { UserDocument } from '@src/modules/user/entities/user.schema.js';
import { UserService } from '@src/modules/user/services/user.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CredentialService {
  constructor(private readonly userService: UserService) {}

  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.userService.findByEmail(email);

    const validatePassword = await bcrypt.compare(
      password,
      user?.password ?? DUMMY_PASSWORD_HASH,
    );

    if (!validatePassword || !user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return user;
  }

  async register(data: RegisterDto): Promise<UserDocument> {
    const user = await this.userService.create(data);

    return user;
  }
}

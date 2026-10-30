import { SignInService } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { LoginDto } from '@src/modules/authentication/dto/login.dto.js';
import { CredentialService } from '@src/modules/authentication/services/credential.service.js';
import { UserDocument } from '@src/modules/user/entities/user.schema.js';

@Injectable()
export class SessionService {
  constructor(
    private readonly credentialService: CredentialService,
    private readonly signInService: SignInService,
  ) {}

  async login(data: LoginDto): Promise<UserDocument> {
    const user = await this.credentialService.verifyCredentials(
      data.email,
      data.password,
    );

    await this.signInService.signIn(user.id, {
      method: 'password',
    });

    return user;
  }

  async logout(): Promise<void> {
    await this.signInService.signOut();
  }
}

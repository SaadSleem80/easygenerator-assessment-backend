import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  SessionCookieProvider,
  type SessionRecord,
} from '@nestjs/authentication';
import type { User } from '@src/modules/user/entities/user.schema.js';
import { UserService } from '@src/modules/user/services/user.service.js';

@Injectable()
export class SessionProvider extends SessionCookieProvider<User> {
  constructor(
    private readonly userService: UserService,
    registry: AuthenticationRegistry,
  ) {
    super();
    // Adds this provider to the chain the guard runs for every request.
    registry.registerProvider(this);
  }

  // Called for every request with a live session cookie.
  // Returning null (the user was deleted) ends the session.
  validate(session: SessionRecord) {
    return this.userService.findById(session.userId);
  }
}

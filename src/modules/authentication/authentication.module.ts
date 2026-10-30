import { Global, Module } from '@nestjs/common';
import { AuthenticationModule as NestAuthenticationModule } from '@nestjs/authentication';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { SessionRepository } from '@src/modules/authentication/repositories/session.repository.js';
import { UserModule } from '@src/modules/user/user.module.js';
import { CredentialService } from '@src/modules/authentication/services/credential.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Session,
  SessionSchema,
} from '@src/modules/authentication/entities/session.schema.js';
import { AuthenticationController } from '@src/modules/authentication/controllers/authentication.controller.js';
import { SessionProvider } from '@src/modules/authentication/providers/session-auth.provider.js';
import { SessionService } from '@src/modules/authentication/services/session.service.js';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    UserModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        AUTH_COOKIE_SECURE: Joi.boolean().required(),
        SESSION_MAX_AGE_DAYS: Joi.number().required(),
        SESSION_IDLE_TIME_DAYS: Joi.number().required(),
      }),
    }),
    NestAuthenticationModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        session: {
          absoluteTtl: `${configService.getOrThrow<number>('SESSION_MAX_AGE_DAYS', 14)}d`,
          idleTtl: `${configService.getOrThrow<number>('SESSION_IDLE_TIME_DAYS', 3)}d`,
          cookie: {
            secure: configService.get<boolean>('AUTH_COOKIE_SECURE', true),
          },
          trustedOrigins: configService
            .get<string>('CORS_ORIGINS')
            ?.split(',')
            .map((origin) => origin.trim()),
        },
      }),
    }),
  ],
  providers: [
    SessionProvider,
    SessionRepository,
    SessionService,
    CredentialService,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}

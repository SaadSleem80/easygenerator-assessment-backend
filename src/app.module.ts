import { Module } from '@nestjs/common';
import { ConfigurationModule } from './core/configuration/configuration.module.js';
import { DatabaseModule } from './core/database/database.module.js';
import { UserModule } from './modules/user/user.module.js';
import { AuthenticationModule } from './modules/authentication/authentication.module.js';

@Module({
  imports: [ConfigurationModule, DatabaseModule, UserModule, AuthenticationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

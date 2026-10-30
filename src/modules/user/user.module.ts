import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from '@src/modules/user/controllers/user.controller.js';
import { User, UserSchema } from '@src/modules/user/entities/user.schema.js';
import { UserService } from '@src/modules/user/services/user.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

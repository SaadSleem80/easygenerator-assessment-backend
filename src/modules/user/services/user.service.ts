import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '@src/modules/user/dto/create-user.dto.js';
import { User, UserDocument } from '@src/modules/user/entities/user.schema.js';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MongoServerError } from 'mongodb';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userEntity: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userEntity.findOne({ email: email.trim().toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return await this.userEntity.findById(id);
  }

  async create(data: CreateUserDto): Promise<UserDocument> {
    const email = data.email.trim().toLowerCase();

    if (await this.userEntity.exists({ email })) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      Number(this.configService.get<string>('BCRYPT_ROUNDS') ?? 10),
    );

    try {
      const user = await this.userEntity.create({
        ...data,
        email: email,
        password: hashedPassword,
      });
      return user;
    } catch (error) {
      // Handle the race condtion
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException('Email already registered');
      }

      this.logger.error(
        'Failed to create user',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}

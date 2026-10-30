import { UserResponseDto } from '@src/modules/user/dto/user-response.dto.js';
import { UserDocument } from '@src/modules/user/entities/user.schema.js';

export class UserMapper {
  static toResponseDto(user: UserDocument): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();
    dto.updatedAt = user.createdAt.toISOString();
    return dto;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {

  @ApiProperty({
    description: "User's email address",
    example: "john.doe@example.com"
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User's password",
    example: "password123"
  })
  @IsNotEmpty()
  password: string;
}

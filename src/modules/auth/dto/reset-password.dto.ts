import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {

    @ApiProperty({
        example: 'reset-token-here',
        description: 'Token received from forgot password API',
    })
    @IsNotEmpty()
    token: string;


    @ApiProperty({
        example: 'newPassword123',
        description: 'New password (min 6 characters)',
    })
    @MinLength(6)
    password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false, enum: ['user', 'admin'] })
    @IsOptional()
    @IsEnum(['user', 'admin'])
    role?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isBlocked?: boolean;

    @ApiProperty({
        required: false,
        type: [Object],
        example: [{
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA',
            phone: '1234567890',
            type: 'shipping',
            isDefault: true
        }]
    })
    @IsOptional()
    addresses?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone: string;
        type: string;
        isDefault: boolean;
    }[];
}

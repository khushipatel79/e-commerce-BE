import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

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

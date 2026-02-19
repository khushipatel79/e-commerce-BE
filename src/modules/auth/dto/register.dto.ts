import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDto {

    @ApiProperty({
        description: "User's full name",
        example: "John Doe"
    })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: "User's email address",
        example: "john.doe@example.com"
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: "User's password (min 6 characters)",
        example: "password123"
    })
    @MinLength(6)
    password: string;
}
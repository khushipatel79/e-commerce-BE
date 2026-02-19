import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags, ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse, ApiResponse } from '@nestjs/swagger';
import { User } from '../users/schemas/user.schema';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiCreatedResponse({
        description: "User registered successfully",
        type: RegisterDto
    })
    @ApiBadRequestResponse({
        description: "Bad Request - User registration failed"
    })
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user and get JWT token' })
    @ApiCreatedResponse({
        description: "User logged in successfully",
        type: LoginDto
    })
    @ApiBadRequestResponse({
        description: "Bad Request - Login failed"
    })
    async login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiOkResponse({ description: 'Profile fetched successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    getProfile(@Req() req: any) {
        return {
            message: "Profile data fetched sucessfully",
            user: req.user,
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('admin')
    @ApiOperation({ summary: 'Admin only route example' })
    @ApiOkResponse({ description: 'Welcome Admin message' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized or Forbidden' })
    adminOnlyRoute() {
        return {
            message: 'Welcome Admin 🔥',
        };
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Send password reset token to email' })
    @ApiResponse({ status: 200, description: 'Reset token sent successfully' })
    forgotPassword(@Body() data: ForgotPasswordDto) {
        return this.authService.forgotPassword(data.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using token' })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    resetPassword(@Body() data: ResetPasswordDto) {
        return this.authService.resetPassword(data.token, data.password);
    }

    @Post('change-password')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Change password for logged-in user' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
        console.log("REQ USER:", req.user);
        return this.authService.changePassword(
            req.user.userId, 
            dto.oldPassword,
            dto.newPassword
        );
    }



}

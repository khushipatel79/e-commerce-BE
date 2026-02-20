import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
    ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags,
    ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse, ApiResponse, ApiBody
} from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // ─── User Routes (Public or Regular) ──────────────────────────────────────

    @Post('register')
    @ApiOperation({ summary: '[Public] User Route: Register a new customer account' })
    @ApiCreatedResponse({ description: 'User registered successfully', type: RegisterDto })
    @ApiBadRequestResponse({ description: 'Email already exists' })
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Post('login')
    @ApiOperation({ summary: '[Public] User Route: Standard Login (Customer/User)' })
    @ApiOkResponse({ description: 'Login successful' })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials or account blocked' })
    async login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    // ─── Admin Dedicated Auth ────────────────────────────────────────────────

    @Post('admin/register')
    @ApiOperation({ summary: '[Admin] Admin Route: Create a new Administrator account' })
    @ApiCreatedResponse({ description: 'Admin registered successfully', type: RegisterDto })
    async adminRegister(@Body() body: RegisterDto) {
        return this.authService.adminRegister(body);
    }

    @Post('admin/login')
    @ApiOperation({ summary: '[Admin] Admin Route: Dedicated login for Admins Only (Strict Role Check)' })
    @ApiOkResponse({ description: 'Admin login successful' })
    @ApiUnauthorizedResponse({ description: 'Access denied or invalid credentials' })
    async adminLogin(@Body() body: LoginDto) {
        return this.authService.adminLogin(body);
    }

    // ─── Profile & Tokens ─────────────────────────────────────────────────────

    @Get('profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '[User & Admin] Profile: View your own identity data' })
    @ApiOkResponse({ description: 'Profile data returned' })
    getProfile(@Req() req: any) {
        return {
            message: 'Profile data fetched successfully',
            user: req.user,
        };
    }

    @Post('refresh')
    @ApiOperation({ summary: '[User & Admin] Token: Get a new access_token using a refresh_token' })
    @ApiBody({ schema: { example: { refresh_token: 'your-refresh-token-here' } } })
    @ApiOkResponse({ description: 'New tokens issued' })
    async refresh(@Body('refresh_token') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Post('logout')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '[User & Admin] Logout: Invalidate session and refresh token' })
    @ApiOkResponse({ description: 'Logged out successfully' })
    async logout(@Req() req: any) {
        return this.authService.logout(req.user.userId);
    }

    // ─── Password Management ──────────────────────────────────────────────────

    @Post('forgot-password')
    @ApiOperation({ summary: '[Public] User Route: Request a password reset email' })
    @ApiOkResponse({ description: 'Reset email sent' })
    forgotPassword(@Body() data: ForgotPasswordDto) {
        return this.authService.forgotPassword(data.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: '[Public] User Route: Set a new password using email token' })
    @ApiOkResponse({ description: 'Password reset successfully' })
    resetPassword(@Body() data: ResetPasswordDto) {
        return this.authService.resetPassword(data.token, data.password);
    }

    @Post('change-password')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '[User & Admin] Settings: Update password while logged in' })
    @ApiOkResponse({ description: 'Password changed successfully' })
    changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.userId, dto.oldPassword, dto.newPassword);
    }

    // ─── Testing ─────────────────────────────────────────────────────────────

    @Get('admin')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin Only] Test: Verify you have Admin permissions' })
    @ApiOkResponse({ description: 'Welcome Admin' })
    adminOnlyRoute() {
        return { message: 'Welcome Admin 🔥' };
    }
}

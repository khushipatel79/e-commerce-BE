import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private readonly mailService: MailService,
    ) { }

    // ─── User Register ────────────────────────────────────────────────────────
    async register(data: RegisterDto) {
        const existingUser = await this.userService.FindByEmail(data.email);
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        await this.userService.create({ ...data, password: hashedPassword });

        return { message: 'User registered successfully' };
    }

    // ─── Admin Register ───────────────────────────────────────────────────────
    async adminRegister(data: RegisterDto) {
        const existingUser = await this.userService.FindByEmail(data.email);
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        // Force role to admin
        await this.userService.create({ ...data, password: hashedPassword, role: 'admin' });

        return { message: 'Admin account created successfully' };
    }

    // ─── User Login (standard) ───────────────────────────────────────────────
    async login(data: LoginDto) {
        const user = await this.userService.FindByEmail(data.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        if (user.isBlocked) throw new UnauthorizedException('Your account has been blocked');

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        return this.generateTokens(user);
    }

    // ─── Admin Login (strict role check) ──────────────────────────────────────
    async adminLogin(data: LoginDto) {
        const user = await this.userService.FindByEmail(data.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        if (user.role !== 'admin') {
            throw new UnauthorizedException('Access denied. This portal is for Admins only.');
        }

        if (user.isBlocked) throw new UnauthorizedException('Your account has been blocked');

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        return this.generateTokens(user);
    }

    // ─── Token Generation Helper ──────────────────────────────────────────────
    private async generateTokens(user: any) {
        const accessToken = this.jwtService.sign(
            { userId: user._id, sub: user._id, email: user.email, role: user.role },
            { expiresIn: '15m' },
        );

        const refreshToken = crypto.randomBytes(40).toString('hex');
        const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');

        // Save hashed refresh token (7 days)
        user.refreshToken = hashedRefresh;
        user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await user.save();

        return {
            message: 'Login successfully',
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    // ─── Refresh Access Token ─────────────────────────────────────────────────
    async refreshToken(token: string) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await this.userService.findByRefreshToken(hashedToken);
        if (!user || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
            throw new UnauthorizedException('Refresh token invalid or expired. Please login again.');
        }

        return this.generateTokens(user);
    }

    // ─── Logout (invalidate tokens) ───────────────────────────────────────────
    async logout(userId: string) {
        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');

        user.refreshToken = undefined;
        user.refreshTokenExpires = undefined;
        await user.save();

        return { message: 'Logged out successfully' };
    }

    // ─── Password Recovery ────────────────────────────────────────────────────
    async forgotPassword(email: string) {
        const user = await this.userService.FindByEmail(email);
        if (!user) throw new BadRequestException('User not found');

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        await this.mailService.sendResetPasswordEmail(user.email, resetLink);

        return { message: 'Password reset email sent successfully' };
    }

    async resetPassword(token: string, newPassword: string) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.userService.findOneByResetToken(hashedToken);

        if (!user) throw new BadRequestException('Token invalid or expired');

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: 'Password reset successfully' };
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new BadRequestException('Old password incorrect');

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return { message: 'Password changed successfully' };
    }
}

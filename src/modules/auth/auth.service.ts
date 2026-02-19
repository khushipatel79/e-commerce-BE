import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt'; //built-in service
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

    // register
    async register(data: RegisterDto) {
        const existingUser = await this.userService.FindByEmail(data.email);

        if (existingUser) {
            throw new BadRequestException('Email is already exist')
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        await this.userService.create({
            ...data,
            password: hashedPassword,
        })

        return {
            message: "User register sucessfully"
        };
    }

    // login
    async login(data: LoginDto) {
        const user = await this.userService.FindByEmail(data.email);

        if (!user) {
            throw new UnauthorizedException("Invalid credentials")
        }

        const isMatch = await bcrypt.compare(data.password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException("Password not match")
        }

        const token = this.jwtService.sign({
            sub: user._id,
            email: user.email,
            role: user.role,
        })

        return {
            message: "Login successfully",
            access_token: token
        }

    }

    async forgotPassword(email: string) {

        const user = await this.userService.FindByEmail(email);

        if (!user) {
            throw new BadRequestException("User with this email not found");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

        // ✅ Send Email Now
        await this.mailService.sendResetPasswordEmail(user.email, resetLink);

        return {
            message: "Password reset email sent successfully",
        };
    }

    async resetPassword(token: string, newPassword: string) {
        // ✅ Hash incoming token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // ✅ Find user with valid token
        const user = await this.userService.findOneByResetToken(hashedToken);

        if (!user) {
            throw new BadRequestException('Token is invalid or expired');
        }

        user.password = await bcrypt.hash(newPassword, 10);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return {
            message: 'Password reset successfully',
        };
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await this.userService.findById(userId);

        if (!user) throw new BadRequestException("User not found");

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            throw new BadRequestException("Old password is incorrect");
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return {
            message: "Password changed successfully",
        };
    }

    generateRefreshToken() {
        return crypto.randomBytes(40).toString("hex");
    }

}

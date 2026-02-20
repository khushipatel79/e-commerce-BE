import { Body, Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // ─── User Profile (Self) ───────────────────────────────────────────────

    @Patch('profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '[User & Admin] Profile: Update your own profile data (name, email, addresses)' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
        return this.usersService.update(req.user.userId, dto);
    }

    // ─── Admin: User Management ───────────────────────────────────────────────

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin Only] User Route: Get a list of all registered users' })
    @ApiResponse({ status: 200, description: 'Return all users list' })
    findAll() {
        return this.usersService.findAll();
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin Only] User Route: Update any user information (role, block status, address)' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin Only] User Route: Permanently delete a user account' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}

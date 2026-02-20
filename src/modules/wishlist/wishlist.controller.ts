import { Controller, Get, Post, Body, Delete, UseGuards, Req, Param } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiNotFoundResponse, ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

class ToggleWishlistDto {
    @ApiProperty({ example: '60d5ecb8b487342e4c8b4567' })
    @IsMongoId()
    @IsNotEmpty()
    productId: string;
}

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    @ApiOperation({ summary: '[Customer] Get current user wishlist' })
    @ApiOkResponse({ description: 'Wishlist retrieved successfully' })
    getWishlist(@Req() req) {
        return this.wishlistService.getWishlist(req.user.userId || req.user.sub);
    }

    @Post('toggle')
    @ApiOperation({ summary: '[Customer] Add or remove product from wishlist' })
    @ApiOkResponse({ description: 'Wishlist updated successfully' })
    toggleWishlist(@Req() req, @Body() toggleDto: ToggleWishlistDto) {
        return this.wishlistService.toggleWishlist(req.user.userId || req.user.sub, toggleDto.productId);
    }

    @Delete()
    @ApiOperation({ summary: '[Customer] Clear entire wishlist' })
    @ApiOkResponse({ description: 'Wishlist cleared successfully' })
    clearWishlist(@Req() req) {
        return this.wishlistService.clearWishlist(req.user.userId || req.user.sub);
    }
}

import { Controller, Get, Post, Body, Patch, Delete, UseGuards, Req, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    @ApiOperation({ summary: '[Customer] Get current user shopping cart' })
    @ApiOkResponse({ description: 'Cart retrieved successfully' })
    getCart(@Req() req) {
        return this.cartService.getCart(req.user.userId || req.user.sub);
    }

    @Post()
    @ApiOperation({ summary: '[Customer] Add product to cart' })
    @ApiCreatedResponse({ description: 'Product added to cart' })
    addToCart(@Req() req, @Body() addToCartDto: AddToCartDto) {
        return this.cartService.addToCart(req.user.userId || req.user.sub, addToCartDto);
    }

    @Patch('quantity')
    @ApiOperation({ summary: '[Customer] Update product quantity in cart' })
    @ApiOkResponse({ description: 'Quantity updated successfully' })
    updateQuantity(@Req() req, @Body() updateCartItemDto: UpdateCartItemDto) {
        return this.cartService.updateQuantity(req.user.userId || req.user.sub, updateCartItemDto);
    }

    @Delete(':productId')
    @ApiOperation({ summary: '[Customer] Remove product from cart' })
    @ApiOkResponse({ description: 'Product removed from cart' })
    @ApiNotFoundResponse({ description: 'Product not found in cart' })
    removeItem(@Req() req, @Param('productId') productId: string) {
        return this.cartService.removeItem(req.user.userId || req.user.sub, productId);
    }

    @Delete()
    @ApiOperation({ summary: '[Customer] Clear entire cart' })
    @ApiOkResponse({ description: 'Cart cleared successfully' })
    clearCart(@Req() req) {
        return this.cartService.clearCart(req.user.userId || req.user.sub);
    }
}

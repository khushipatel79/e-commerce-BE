import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // 📝 Customer Routes
    @Post('checkout')
    @ApiOperation({ summary: '[Customer] Convert current cart to an order (Checkout)' })
    @ApiCreatedResponse({ description: 'Order placed successfully' })
    checkout(@Req() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.userId || req.user.sub, createOrderDto);
    }

    @Get('my-orders')
    @ApiOperation({ summary: '[Customer] Get your order history' })
    @ApiOkResponse({ description: 'Order history retrieved' })
    getMyOrders(@Req() req) {
        return this.ordersService.getUserOrders(req.user.userId || req.user.sub);
    }

    @Get('my-orders/:id')
    @ApiOperation({ summary: '[Customer/Admin] View details of a specific order' })
    @ApiOkResponse({ description: 'Order details retrieved' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    getOrder(@Req() req, @Param('id') id: string) {
        return this.ordersService.getOrderById(id, req.user.userId || req.user.sub);
    }

    @Patch('my-orders/:id/cancel')
    @ApiOperation({ summary: '[Customer] Self-cancel a pending order' })
    @ApiOkResponse({ description: 'Order cancelled successfully' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    cancelOrder(@Req() req, @Param('id') id: string) {
        return this.ordersService.cancelOrder(id, req.user.userId || req.user.sub);
    }

    // 👮 Admin Routes
    @Get('admin/all')
    @Roles('admin')
    @ApiOperation({ summary: '[Admin Only] View all orders in the system' })
    @ApiOkResponse({ description: 'All orders retrieved' })
    getAllOrders() {
        return this.ordersService.getAllOrders();
    }

    @Patch('admin/:id/status')
    @Roles('admin')
    @ApiOperation({ summary: '[Admin Only] Update an order status (Shipped, Delivered, etc.)' })
    @ApiOkResponse({ description: 'Order status updated' })
    updateStatus(@Param('id') id: string, @Body() updateDto: UpdateOrderStatusDto) {
        return this.ordersService.updateOrderStatus(id, updateDto);
    }
}

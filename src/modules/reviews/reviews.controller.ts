import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    // 📝 Public / Customer Routes
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '[Customer] Submit a product review (Delivered items only)' })
    @ApiCreatedResponse({ description: 'Review submitted for approval' })
    submitReview(@Req() req, @Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.submitReview(req.user.userId || req.user.sub, createReviewDto);
    }

    @Get('product/:productId')
    @ApiOperation({ summary: '[Public] Get approved reviews for a specific product' })
    @ApiOkResponse({ description: 'Approved reviews retrieved' })
    getProductReviews(@Param('productId') productId: string) {
        return this.reviewsService.getProductReviews(productId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '[Customer/Admin] Delete a review' })
    @ApiOkResponse({ description: 'Review deleted' })
    deleteReview(@Req() req, @Param('id') id: string) {
        const isAdmin = req.user.role === 'admin';
        return this.reviewsService.deleteReview(id, req.user.userId || req.user.sub, isAdmin);
    }

    @Get('admin/pending')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin Only] View all pending reviews' })
    @ApiOkResponse({ description: 'Pending reviews retrieved' })
    getPending() {
        return this.reviewsService.getAllPendingReviews();
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin Only] Approve or reject a review' })
    @ApiOkResponse({ description: 'Review status updated' })
    updateStatus(@Param('id') id: string, @Body() updateDto: UpdateReviewStatusDto) {
        return this.reviewsService.updateReviewStatus(id, updateDto);
    }
}

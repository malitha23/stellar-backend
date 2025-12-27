import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommunityService } from './community.service';

@Controller('community')
export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() body: { content: string, imageUrl?: string }) {
        return this.communityService.createPost(req.user, body.content, body.imageUrl);
    }

    @Get('feed')
    getFeed() {
        return this.communityService.getFeed();
    }

    @Post(':id/like')
    like(@Param('id') id: string) {
        return this.communityService.likePost(+id);
    }
}

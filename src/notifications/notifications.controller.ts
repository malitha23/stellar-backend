import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    get(@Request() req) {
        return this.notificationsService.getMyNotifications(req.user);
    }

    @Post(':id/read')
    read(@Param('id') id: string) {
        return this.notificationsService.markAsRead(+id);
    }
}

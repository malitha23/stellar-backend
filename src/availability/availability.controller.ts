import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';

@Controller('availability')
@UseGuards(AuthGuard('jwt'))
export class AvailabilityController {
    constructor(private readonly availabilityService: AvailabilityService) { }

    @Post()
    set(@Request() req, @Body() body: { date: string, isAvailable: boolean, note?: string }) {
        return this.availabilityService.setAvailability(req.user, body.date, body.isAvailable, body.note);
    }

    @Get(':userId')
    get(@Param('userId') userId: string) {
        return this.availabilityService.getUserAvailability(+userId);
    }
}

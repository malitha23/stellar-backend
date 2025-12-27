import { Controller, Post, Body, Get, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ScreenTestsService } from './screen-tests.service';
import { CreateScreenTestDto, SubmitScreenTestDto } from './dto/screen-test.dto';
import { AuthGuard } from '@nestjs/passport';
import { ScreenTestStatus } from './entities/screen-test.entity';

@Controller('screen-tests')
@UseGuards(AuthGuard('jwt'))
export class ScreenTestsController {
    constructor(private readonly screenTestsService: ScreenTestsService) { }

    @Post('request')
    createRequest(@Request() req, @Body() dto: CreateScreenTestDto) {
        return this.screenTestsService.createRequest(req.user, dto);
    }

    @Post(':id/submit')
    submit(@Request() req, @Param('id') id: string, @Body() dto: SubmitScreenTestDto) {
        return this.screenTestsService.submitScreenTest(req.user, +id, dto);
    }

    @Get('my')
    getMy(@Request() req) {
        return this.screenTestsService.getMyRequests(req.user);
    }

    @Patch(':id/status')
    updateStatus(
        @Request() req,
        @Param('id') id: string,
        @Body('status') status: ScreenTestStatus,
        @Body('feedback') feedback?: string
    ) {
        return this.screenTestsService.updateStatus(req.user, +id, status, feedback);
    }
}

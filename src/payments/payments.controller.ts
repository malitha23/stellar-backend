import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    create(@Request() req, @Body() body: { payeeId: number, amount: number, projectId?: number }) {
        return this.paymentsService.createPayment(req.user, body.payeeId, body.amount, body.projectId);
    }

    @Get('my')
    get(@Request() req) {
        return this.paymentsService.getMyPayments(req.user);
    }
}

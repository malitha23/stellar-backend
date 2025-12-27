import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get('conversations')
    getConversations(@Req() req) {
        return this.messagesService.getConversations(req.user);
    }

    @Get('conversations/:id')
    getMessages(@Param('id') id: string, @Req() req) {
        return this.messagesService.getMessages(+id, req.user);
    }

    @Post('send')
    sendMessage(
        @Req() req,
        @Body() body: { conversationId: number; content: string },
    ) {
        return this.messagesService.sendMessage(req.user, body.conversationId, body.content);
    }
}

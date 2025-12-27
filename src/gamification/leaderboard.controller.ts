import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GamificationService } from './gamification.service';

@Controller('leaderboard')
export class LeaderboardController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Get()
    getLeaderboard() {
        return this.gamificationService.getLeaderboard();
    }
}

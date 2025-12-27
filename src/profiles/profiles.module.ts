import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { ModelProfile } from './entities/model-profile.entity';
import { DirectorProfile } from './entities/director-profile.entity';
import { ModelSkill } from './entities/model-skill.entity';
import { ModelLanguage } from './entities/model-language.entity';
import { ModelPortfolio } from './entities/model-portfolio.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ModelProfile,
      DirectorProfile,
      ModelSkill,
      ModelLanguage,
      ModelPortfolio,
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule { }

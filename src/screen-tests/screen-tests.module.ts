import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreenTestsService } from './screen-tests.service';
import { ScreenTestsController } from './screen-tests.controller';
import { ScreenTest } from './entities/screen-test.entity';
import { ScreenTestSubmission } from './entities/screen-test-submission.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectRole } from '../projects/entities/project-role.entity';
import { User } from '../users/entities/user.entity';

import { CoreFeaturesModule } from '../core-features.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScreenTest, ScreenTestSubmission, Project, ProjectRole, User]),
        CoreFeaturesModule,
    ],
    controllers: [ScreenTestsController],
    providers: [ScreenTestsService],
    exports: [ScreenTestsService],
})
export class ScreenTestsModule { }

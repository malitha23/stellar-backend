import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { ProjectRole } from './entities/project-role.entity';
import { ProjectImage } from './entities/project-image.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Project, ProjectRole, ProjectImage]),
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService],
    exports: [ProjectsService],
})
export class ProjectsModule { }

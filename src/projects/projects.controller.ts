import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../users/entities/user.entity';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
        // Only Director or Admin can create?
        // For now allow any authenticated user with Role check if needed.
        // Assuming Frontend handles role check or Service.
        // Ideally Guard should check Role.
        return this.projectsService.create(req.user, createProjectDto);
    }

    @Get()
    findAll() {
        return this.projectsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateData: any) {
        return this.projectsService.update(+id, req.user, updateData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.projectsService.remove(+id, req.user);
    }
}

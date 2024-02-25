import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from './admin-auth.guard';

@Controller('api/admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {}

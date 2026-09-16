import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './module/auth/auth.module.js';
import { EmployeeModule } from './module/employee/employee.module.js';
import { UserModule } from './module/users/user.module.js';
import { LeaveRequestModule } from './module/leave-request/leave-request.module.js';
import { PayrollModule } from './module/payroll/payroll.module.js';
import { AuditModule } from './module/audit/audit.module.js';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './module/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './module/auth/guards/roles.guard.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmployeeModule,
    UserModule,
    LeaveRequestModule,
    PayrollModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

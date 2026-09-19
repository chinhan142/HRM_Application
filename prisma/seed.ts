import { PrismaClient, Role, EmployeeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Departments
  const departmentsData = [
    { name: 'Engineering', budget: 150000.0, location: 'Building A, Floor 4' },
    { name: 'Human Resources', budget: 50000.0, location: 'Building B, Floor 2' },
    { name: 'Finance & Accounting', budget: 80000.0, location: 'Building B, Floor 3' },
    { name: 'Marketing & Sales', budget: 70000.0, location: 'Building A, Floor 2' },
  ];

  for (const dept of departmentsData) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }
  console.log('✅ Departments seeded');

  // 2. Seed Job Titles
  const jobTitlesData = [
    { title: 'Software Engineer', salaryRangeMin: 1500.0, salaryRangeMax: 3000.0 },
    { title: 'Senior Software Engineer', salaryRangeMin: 3000.0, salaryRangeMax: 5000.0 },
    { title: 'Engineering Manager', salaryRangeMin: 4500.0, salaryRangeMax: 7000.0 },
    { title: 'HR Specialist', salaryRangeMin: 1200.0, salaryRangeMax: 2200.0 },
    { title: 'HR Manager', salaryRangeMin: 3000.0, salaryRangeMax: 5000.0 },
    { title: 'Accountant', salaryRangeMin: 1200.0, salaryRangeMax: 2500.0 },
    { title: 'System Administrator', salaryRangeMin: 2500.0, salaryRangeMax: 4500.0 },
  ];

  for (const job of jobTitlesData) {
    await prisma.jobTitle.upsert({
      where: { title: job.title },
      update: {},
      create: job,
    });
  }
  console.log('✅ Job Titles seeded');

  // Retrieve department & job title references
  const itDept = await prisma.department.findUnique({ where: { name: 'Engineering' } });
  const hrDept = await prisma.department.findUnique({ where: { name: 'Human Resources' } });
  const adminJob = await prisma.jobTitle.findUnique({ where: { title: 'System Administrator' } });
  const hrManagerJob = await prisma.jobTitle.findUnique({ where: { title: 'HR Manager' } });
  const engManagerJob = await prisma.jobTitle.findUnique({ where: { title: 'Engineering Manager' } });
  const devJob = await prisma.jobTitle.findUnique({ where: { title: 'Software Engineer' } });

  const defaultPassword = await bcrypt.hash('P@ssw0rd123!', 10);

  // 3. Seed Root Admin
  if (itDept && adminJob) {
    const adminUser = await prisma.employee.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@company.com',
        password: defaultPassword,
        role: Role.ADMIN,
        status: EmployeeStatus.ACTIVE,
        departmentId: itDept.id,
        jobTitleId: adminJob.id,
      },
    });
    console.log(`✅ Admin user seeded: ${adminUser.email}`);
  }

  // 4. Seed HR Manager
  let hrManagerUser: any = null;
  if (hrDept && hrManagerJob) {
    hrManagerUser = await prisma.employee.upsert({
      where: { email: 'hr.manager@company.com' },
      update: {},
      create: {
        firstName: 'Helen',
        lastName: 'Roberts',
        email: 'hr.manager@company.com',
        password: defaultPassword,
        role: Role.HR_MANAGER,
        status: EmployeeStatus.ACTIVE,
        departmentId: hrDept.id,
        jobTitleId: hrManagerJob.id,
      },
    });
    console.log(`✅ HR Manager seeded: ${hrManagerUser.email}`);
  }

  // 5. Seed Direct Manager
  let directManager: any = null;
  if (itDept && engManagerJob) {
    directManager = await prisma.employee.upsert({
      where: { email: 'manager@company.com' },
      update: {},
      create: {
        firstName: 'Michael',
        lastName: 'Scott',
        email: 'manager@company.com',
        password: defaultPassword,
        role: Role.MANAGER,
        status: EmployeeStatus.ACTIVE,
        departmentId: itDept.id,
        jobTitleId: engManagerJob.id,
      },
    });
    console.log(`✅ Manager seeded: ${directManager.email}`);
  }

  // 6. Seed Regular Employee (User) reporting to Direct Manager
  if (itDept && devJob && directManager) {
    const devUser = await prisma.employee.upsert({
      where: { email: 'employee@company.com' },
      update: {},
      create: {
        firstName: 'Jim',
        lastName: 'Halpert',
        email: 'employee@company.com',
        password: defaultPassword,
        role: Role.USER,
        status: EmployeeStatus.ACTIVE,
        departmentId: itDept.id,
        jobTitleId: devJob.id,
        managerId: directManager.id,
      },
    });
    console.log(`✅ Regular Employee seeded: ${devUser.email} (reports to managerId: ${directManager.id})`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

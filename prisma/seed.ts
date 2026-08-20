import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MedTrack database...');

  const patient = await prisma.patient.upsert({
    where: { healthId: 'MS-9042' },
    update: {
      name: 'John Doe',
      age: 58,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: {
        deleteMany: {},
        create: [
          {
            allergen: 'Penicillin',
            severity: 'HIGH',
          },
        ],
      },
      conditions: {
        deleteMany: {},
        create: [
          {
            condition: 'Hypertension',
          },
        ],
      },
      medications: {
        deleteMany: {},
        create: [
          {
            drugName: 'Warfarin',
            genericName: 'warfarin sodium',
            dosage: '5mg',
            frequency: 'Once Daily',
            startDate: '2026-01-10',
            status: 'ACTIVE',
            prescribedBy: 'Dr. Sarah Lin',
            notes: 'Anticoagulation therapy',
          },
        ],
      },
    },
    create: {
      healthId: 'MS-9042',
      name: 'John Doe',
      age: 58,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: {
        create: [
          {
            allergen: 'Penicillin',
            severity: 'HIGH',
          },
        ],
      },
      conditions: {
        create: [
          {
            condition: 'Hypertension',
          },
        ],
      },
      medications: {
        create: [
          {
            drugName: 'Warfarin',
            genericName: 'warfarin sodium',
            dosage: '5mg',
            frequency: 'Once Daily',
            startDate: '2026-01-10',
            status: 'ACTIVE',
            prescribedBy: 'Dr. Sarah Lin',
            notes: 'Anticoagulation therapy',
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded demo patient: ${patient.name} (Health ID: ${patient.healthId})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

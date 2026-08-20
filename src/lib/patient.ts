import prisma from './db';
import { PatientProfile } from '@/types';

/**
 * Reusable patient lookup supporting both Health ID (e.g. "MS-9042") and internal UUID.
 * Loads nested allergies, conditions, and medications.
 */
export async function findPatientByIdOrHealthId(identifier: string) {
  if (!identifier || typeof identifier !== 'string') {
    return null;
  }

  const trimmed = identifier.trim();
  if (!trimmed) {
    return null;
  }

  const patient = await prisma.patient.findFirst({
    where: {
      OR: [
        { healthId: trimmed },
        { id: trimmed },
      ],
    },
    include: {
      allergies: true,
      conditions: true,
      medications: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return patient;
}

/**
 * Format Prisma Patient record into the standard PatientProfile response contract.
 */
export function formatPatientProfile(patient: NonNullable<Awaited<ReturnType<typeof findPatientByIdOrHealthId>>>): PatientProfile {
  return {
    id: patient.id,
    healthId: patient.healthId,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies.map((a) => ({
      id: a.id,
      allergen: a.allergen,
      severity: a.severity as 'HIGH' | 'MODERATE' | 'LOW',
    })),
    conditions: patient.conditions.map((c) => ({
      id: c.id,
      condition: c.condition,
    })),
    medications: patient.medications.map((m) => ({
      id: m.id,
      drugName: m.drugName,
      genericName: m.genericName,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: m.startDate,
      endDate: m.endDate,
      status: m.status as 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED',
      prescribedBy: m.prescribedBy,
      notes: m.notes,
    })),
  };
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { findPatientByIdOrHealthId } from '@/lib/patient';
import { normalizeDrugName } from '@/lib/drug-database';
import { MedicationItem, PrescriptionRequest } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const identifier = resolvedParams?.id;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { error: 'Patient ID or Health ID is required in URL.' },
        { status: 400 }
      );
    }

    let body: PrescriptionRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const {
      drugName,
      genericName,
      dosage,
      frequency,
      startDate,
      endDate,
      status,
      prescribedBy,
      notes,
    } = body || {};

    if (!drugName || typeof drugName !== 'string' || !drugName.trim()) {
      return NextResponse.json(
        { error: 'Field "drugName" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!dosage || typeof dosage !== 'string' || !dosage.trim()) {
      return NextResponse.json(
        { error: 'Field "dosage" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!frequency || typeof frequency !== 'string' || !frequency.trim()) {
      return NextResponse.json(
        { error: 'Field "frequency" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!prescribedBy || typeof prescribedBy !== 'string' || !prescribedBy.trim()) {
      return NextResponse.json(
        { error: 'Field "prescribedBy" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const patient = await findPatientByIdOrHealthId(identifier);

    if (!patient) {
      return NextResponse.json(
        { error: `Patient with identifier '${identifier}' not found.` },
        { status: 404 }
      );
    }

    const resolvedStartDate =
      startDate && typeof startDate === 'string' && startDate.trim()
        ? startDate.trim()
        : new Date().toISOString().split('T')[0];

    const resolvedGenericName =
      genericName && typeof genericName === 'string' && genericName.trim()
        ? genericName.trim()
        : normalizeDrugName(drugName);

    const validStatus =
      status && ['ACTIVE', 'DISCONTINUED', 'COMPLETED'].includes(status.toUpperCase())
        ? (status.toUpperCase() as 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED')
        : 'ACTIVE';

    const newMedication = await prisma.medication.create({
      data: {
        patientId: patient.id,
        drugName: drugName.trim(),
        genericName: resolvedGenericName,
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        startDate: resolvedStartDate,
        endDate: endDate && typeof endDate === 'string' ? endDate.trim() : null,
        status: validStatus,
        prescribedBy: prescribedBy.trim(),
        notes: notes && typeof notes === 'string' ? notes.trim() : null,
      },
    });

    const medicationItem: MedicationItem = {
      id: newMedication.id,
      drugName: newMedication.drugName,
      genericName: newMedication.genericName,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      startDate: newMedication.startDate,
      endDate: newMedication.endDate,
      status: newMedication.status as 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED',
      prescribedBy: newMedication.prescribedBy,
      notes: newMedication.notes,
    };

    return NextResponse.json(
      {
        success: true,
        medication: medicationItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in prescribe API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the prescription.' },
      { status: 500 }
    );
  }
}

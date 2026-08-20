import { NextResponse } from 'next/server';
import { findPatientByIdOrHealthId, formatPatientProfile } from '@/lib/patient';
import { evaluateSafety } from '@/lib/safety-engine';
import { SafetyCheckRequest } from '@/types';

export async function POST(request: Request) {
  try {
    let body: SafetyCheckRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { patientId, newDrugName, dosage } = body || {};

    if (!patientId || typeof patientId !== 'string' || !patientId.trim()) {
      return NextResponse.json(
        { error: 'Field "patientId" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!newDrugName || typeof newDrugName !== 'string' || !newDrugName.trim()) {
      return NextResponse.json(
        { error: 'Field "newDrugName" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const patient = await findPatientByIdOrHealthId(patientId);

    if (!patient) {
      return NextResponse.json(
        { error: `Patient with identifier '${patientId}' not found.` },
        { status: 404 }
      );
    }

    const profile = formatPatientProfile(patient);
    const alert = evaluateSafety(
      {
        allergies: profile.allergies,
        conditions: profile.conditions,
        medications: profile.medications,
      },
      newDrugName,
      dosage
    );

    return NextResponse.json(alert, { status: 200 });
  } catch (error) {
    console.error('Error in safety-check API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while performing the safety evaluation.' },
      { status: 500 }
    );
  }
}

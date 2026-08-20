import { NextResponse } from 'next/server';
import { findPatientByIdOrHealthId, formatPatientProfile } from '@/lib/patient';

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const identifier = resolvedParams?.id;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { error: 'Patient ID or Health ID is required.' },
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

    const profile = formatPatientProfile(patient);
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while retrieving the patient profile.' },
      { status: 500 }
    );
  }
}

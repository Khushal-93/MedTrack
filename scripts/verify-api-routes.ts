import { GET as getPatientRoute } from '../src/app/api/patient/[id]/route';
import { POST as safetyCheckRoute } from '../src/app/api/safety-check/route';
import { POST as prescribeRoute } from '../src/app/api/patient/[id]/prescribe/route';
import prisma from '../src/lib/db';

async function runApiVerification() {
  console.log('===============================================================');
  console.log('🌐 MediShield Person 3 REST API Routes Verification');
  console.log('===============================================================\n');

  // Ensure DB seed exists
  const seedPatient = await prisma.patient.upsert({
    where: { healthId: 'MS-9042' },
    update: {},
    create: {
      healthId: 'MS-9042',
      name: 'John Doe',
      age: 58,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: {
        create: [{ allergen: 'Penicillin', severity: 'HIGH' }],
      },
      conditions: {
        create: [{ condition: 'Hypertension' }],
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
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------
  // TEST 1: GET /api/patient/MS-9042
  // -------------------------------------------------------------
  console.log('--- 1. GET /api/patient/MS-9042 ---');
  const req1 = new Request('http://localhost:3000/api/patient/MS-9042', { method: 'GET' });
  const res1 = await getPatientRoute(req1, { params: { id: 'MS-9042' } });
  const data1 = await res1.json();

  console.log(`Status: ${res1.status} (Expected: 200)`);
  console.log(`Patient Name: ${data1.name}, HealthID: ${data1.healthId}`);
  console.log(`Allergies Count: ${data1.allergies?.length}, Meds Count: ${data1.medications?.length}`);
  if (res1.status !== 200 || data1.healthId !== 'MS-9042' || data1.name !== 'John Doe') {
    throw new Error('GET /api/patient/MS-9042 failed validation.');
  }
  console.log('✅ GET /api/patient/MS-9042 PASSED\n');

  // -------------------------------------------------------------
  // TEST 2: GET /api/patient/<UUID>
  // -------------------------------------------------------------
  console.log('--- 2. GET /api/patient/<UUID> ---');
  const req2 = new Request(`http://localhost:3000/api/patient/${seedPatient.id}`, { method: 'GET' });
  const res2 = await getPatientRoute(req2, { params: { id: seedPatient.id } });
  const data2 = await res2.json();

  console.log(`Status: ${res2.status} (Expected: 200)`);
  if (res2.status !== 200 || data2.id !== seedPatient.id) {
    throw new Error('GET /api/patient/<UUID> failed validation.');
  }
  console.log('✅ GET /api/patient/<UUID> PASSED\n');

  // -------------------------------------------------------------
  // TEST 3: GET /api/patient/UNKNOWN (404)
  // -------------------------------------------------------------
  console.log('--- 3. GET /api/patient/UNKNOWN (404) ---');
  const req3 = new Request('http://localhost:3000/api/patient/UNKNOWN-999', { method: 'GET' });
  const res3 = await getPatientRoute(req3, { params: { id: 'UNKNOWN-999' } });
  console.log(`Status: ${res3.status} (Expected: 404)`);
  if (res3.status !== 404) {
    throw new Error('GET /api/patient/UNKNOWN did not return 404.');
  }
  console.log('✅ GET 404 Handling PASSED\n');

  // -------------------------------------------------------------
  // TEST 4: POST /api/safety-check (Warfarin + Aspirin -> HIGH)
  // -------------------------------------------------------------
  console.log('--- 4. POST /api/safety-check (Warfarin + Aspirin) ---');
  const req4 = new Request('http://localhost:3000/api/safety-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: 'MS-9042',
      newDrugName: 'Aspirin',
    }),
  });
  const res4 = await safetyCheckRoute(req4);
  const data4 = await res4.json();

  console.log(`Status: ${res4.status} (Expected: 200)`);
  console.log(`Risk Level: ${data4.riskLevel}, Conflict Type: ${data4.conflictType}`);
  console.log(`Reason: ${data4.reason}`);
  console.log(`Action: ${data4.clinicalAction}`);
  if (res4.status !== 200 || data4.riskLevel !== 'HIGH' || data4.conflictType !== 'DRUG_DRUG') {
    throw new Error('POST /api/safety-check Warfarin+Aspirin failed validation.');
  }
  console.log('✅ POST /api/safety-check (Aspirin) PASSED\n');

  // -------------------------------------------------------------
  // TEST 5: POST /api/safety-check (Penicillin Allergy + Amoxicillin -> HIGH)
  // -------------------------------------------------------------
  console.log('--- 5. POST /api/safety-check (Penicillin Allergy + Amoxicillin) ---');
  const req5 = new Request('http://localhost:3000/api/safety-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: 'MS-9042',
      newDrugName: 'Amoxicillin',
    }),
  });
  const res5 = await safetyCheckRoute(req5);
  const data5 = await res5.json();

  console.log(`Status: ${res5.status} (Expected: 200)`);
  console.log(`Risk Level: ${data5.riskLevel}, Conflict Type: ${data5.conflictType}`);
  if (res5.status !== 200 || data5.riskLevel !== 'HIGH' || data5.conflictType !== 'ALLERGY') {
    throw new Error('POST /api/safety-check Penicillin+Amoxicillin failed validation.');
  }
  console.log('✅ POST /api/safety-check (Amoxicillin) PASSED\n');

  // -------------------------------------------------------------
  // TEST 6: POST /api/safety-check (Safe Drug -> NONE)
  // -------------------------------------------------------------
  console.log('--- 6. POST /api/safety-check (Safe Drug -> Paracetamol) ---');
  const req6 = new Request('http://localhost:3000/api/safety-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: 'MS-9042',
      newDrugName: 'Paracetamol',
    }),
  });
  const res6 = await safetyCheckRoute(req6);
  const data6 = await res6.json();

  console.log(`Status: ${res6.status} (Expected: 200)`);
  console.log(`Risk Level: ${data6.riskLevel}, Conflict Type: ${data6.conflictType}`);
  if (res6.status !== 200 || data6.riskLevel !== 'NONE' || data6.conflictType !== 'NONE') {
    throw new Error('POST /api/safety-check Paracetamol failed validation.');
  }
  console.log('✅ POST /api/safety-check (Paracetamol) PASSED\n');

  // -------------------------------------------------------------
  // TEST 7: POST /api/safety-check Validation Error (400)
  // -------------------------------------------------------------
  console.log('--- 7. POST /api/safety-check (400 Missing Fields) ---');
  const req7 = new Request('http://localhost:3000/api/safety-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId: 'MS-9042' }), // missing newDrugName
  });
  const res7 = await safetyCheckRoute(req7);
  console.log(`Status: ${res7.status} (Expected: 400)`);
  if (res7.status !== 400) {
    throw new Error('POST /api/safety-check missing newDrugName did not return 400.');
  }
  console.log('✅ POST /api/safety-check 400 Validation PASSED\n');

  // -------------------------------------------------------------
  // TEST 8: POST /api/patient/MS-9042/prescribe (Create Medication)
  // -------------------------------------------------------------
  console.log('--- 8. POST /api/patient/MS-9042/prescribe ---');
  const req8 = new Request('http://localhost:3000/api/patient/MS-9042/prescribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      drugName: 'Atorvastatin',
      genericName: 'atorvastatin calcium',
      dosage: '20mg',
      frequency: 'Once Daily at Bedtime',
      startDate: '2026-08-20',
      prescribedBy: 'Dr. Jane Smith',
      notes: 'Cholesterol management',
    }),
  });
  const res8 = await prescribeRoute(req8, { params: { id: 'MS-9042' } });
  const data8 = await res8.json();

  console.log(`Status: ${res8.status} (Expected: 201)`);
  console.log(`Created Med: ${data8.medication?.drugName}, ID: ${data8.medication?.id}`);
  if (res8.status !== 201 || !data8.success || data8.medication?.drugName !== 'Atorvastatin') {
    throw new Error('POST /api/patient/MS-9042/prescribe failed validation.');
  }

  // Cleanup newly added medication
  if (data8.medication?.id) {
    await prisma.medication.delete({ where: { id: data8.medication.id } });
  }
  console.log('✅ POST /api/patient/MS-9042/prescribe PASSED\n');

  // -------------------------------------------------------------
  // TEST 9: POST /api/patient/MS-9042/prescribe Validation Error (400)
  // -------------------------------------------------------------
  console.log('--- 9. POST /api/patient/MS-9042/prescribe (400 Missing Dosage) ---');
  const req9 = new Request('http://localhost:3000/api/patient/MS-9042/prescribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      drugName: 'Atorvastatin',
      // missing dosage & frequency
    }),
  });
  const res9 = await prescribeRoute(req9, { params: { id: 'MS-9042' } });
  console.log(`Status: ${res9.status} (Expected: 400)`);
  if (res9.status !== 400) {
    throw new Error('POST /api/patient/MS-9042/prescribe missing fields did not return 400.');
  }
  console.log('✅ POST /api/patient/MS-9042/prescribe 400 Validation PASSED\n');

  console.log('===============================================================');
  console.log('🎉 ALL REST API ROUTES AND CONTRACTS VERIFIED 100% WORKING!');
  console.log('===============================================================\n');
}

runApiVerification()
  .catch((err) => {
    console.error('Fatal API test runner error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

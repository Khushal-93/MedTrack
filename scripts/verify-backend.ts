import { performance } from 'perf_hooks';
import prisma from '../src/lib/db';
import { evaluateSafety } from '../src/lib/safety-engine';
import { findPatientByIdOrHealthId, formatPatientProfile } from '../src/lib/patient';
import { AllergyItem, ConditionItem, MedicationItem } from '../src/types';

interface TestResult {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  durationMs: number;
}

const results: TestResult[] = [];

function assertTest(
  name: string,
  expected: string,
  actual: string,
  passed: boolean,
  durationMs: number
) {
  results.push({ name, expected, actual, passed, durationMs });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${name} | Expected: ${expected} | Actual: ${actual} (${durationMs.toFixed(3)}ms)`);
}

async function runVerification() {
  console.log('===============================================================');
  console.log('🧪 MediShield Person 3 Backend & Safety Engine Verification');
  console.log('===============================================================\n');

  // Ensure DB seed exists
  let johnDoe = await findPatientByIdOrHealthId('MS-9042');
  if (!johnDoe) {
    console.log('⚠️ Patient MS-9042 not found. Seeding demo data first...');
    const seedPatient = await prisma.patient.create({
      data: {
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
              notes: 'Anticoagulation therapy',
            },
          ],
        },
      },
      include: {
        allergies: true,
        conditions: true,
        medications: true,
      },
    });
    johnDoe = seedPatient;
  }

  const johnProfile = formatPatientProfile(johnDoe);

  // -------------------------------------------------------------
  // TEST GROUP 1: Safety Engine Core Rules & Interaction Matrix
  // -------------------------------------------------------------
  console.log('\n--- 1. Safety Engine Interaction Matrix Tests ---');

  // Test 1: Warfarin + Aspirin (Bleeding Risk)
  let t0 = performance.now();
  let alert = evaluateSafety(johnProfile, 'Aspirin');
  let t1 = performance.now();
  assertTest(
    'Rule 1: Warfarin + Aspirin',
    'HIGH (DRUG_DRUG)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'HIGH' && alert.conflictType === 'DRUG_DRUG',
    t1 - t0
  );

  // Test 2: Warfarin + Ibuprofen (GI Bleed Risk)
  t0 = performance.now();
  alert = evaluateSafety(johnProfile, 'Ibuprofen');
  t1 = performance.now();
  assertTest(
    'Rule 2: Warfarin + Ibuprofen',
    'HIGH (DRUG_DRUG)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'HIGH' && alert.conflictType === 'DRUG_DRUG',
    t1 - t0
  );

  // Test 3: Lisinopril + Potassium (Hyperkalemia)
  const lisinoprilPatient = {
    allergies: [] as AllergyItem[],
    conditions: [] as ConditionItem[],
    medications: [
      {
        id: 'm-lis',
        drugName: 'Lisinopril',
        genericName: 'lisinopril',
        dosage: '10mg',
        frequency: 'Once Daily',
        startDate: '2026-01-01',
        status: 'ACTIVE' as const,
        prescribedBy: 'Dr. Lee',
      },
    ],
  };
  t0 = performance.now();
  alert = evaluateSafety(lisinoprilPatient, 'Potassium Supplements');
  t1 = performance.now();
  assertTest(
    'Rule 3: Lisinopril + Potassium',
    'HIGH (DRUG_DRUG)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'HIGH' && alert.conflictType === 'DRUG_DRUG',
    t1 - t0
  );

  // Test 4: Simvastatin + Clarithromycin (Rhabdomyolysis)
  const simvastatinPatient = {
    allergies: [] as AllergyItem[],
    conditions: [] as ConditionItem[],
    medications: [
      {
        id: 'm-sim',
        drugName: 'Simvastatin',
        genericName: 'simvastatin',
        dosage: '40mg',
        frequency: 'Nightly',
        startDate: '2026-01-01',
        status: 'ACTIVE' as const,
        prescribedBy: 'Dr. Adams',
      },
    ],
  };
  t0 = performance.now();
  alert = evaluateSafety(simvastatinPatient, 'Clarithromycin');
  t1 = performance.now();
  assertTest(
    'Rule 4: Simvastatin + Clarithromycin',
    'HIGH (DRUG_DRUG)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'HIGH' && alert.conflictType === 'DRUG_DRUG',
    t1 - t0
  );

  // Test 5: Penicillin Allergy + Amoxicillin / Ampicillin
  t0 = performance.now();
  alert = evaluateSafety(johnProfile, 'Amoxicillin');
  t1 = performance.now();
  assertTest(
    'Rule 5a: Penicillin Allergy + Amoxicillin',
    'HIGH (ALLERGY)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'HIGH' && alert.conflictType === 'ALLERGY',
    t1 - t0
  );

  t0 = performance.now();
  alert = evaluateSafety(johnProfile, 'Ampicillin');
  t1 = performance.now();
  assertTest(
    'Rule 5b: Penicillin Allergy + Ampicillin',
    'HIGH (ALLERGY)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'HIGH' && alert.conflictType === 'ALLERGY',
    t1 - t0
  );

  // Test 6: Duplicate Active Medication (Warfarin)
  t0 = performance.now();
  alert = evaluateSafety(johnProfile, 'Warfarin 5mg');
  t1 = performance.now();
  assertTest(
    'Rule 6: Duplicate Warfarin',
    'HIGH (DUPLICATE)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'HIGH' && alert.conflictType === 'DUPLICATE',
    t1 - t0
  );

  // Test 7: Safe Drug (Paracetamol / Clopidogrel for non-interacting patient)
  t0 = performance.now();
  alert = evaluateSafety(johnProfile, 'Paracetamol');
  t1 = performance.now();
  assertTest(
    'Rule 7a: Safe Drug Paracetamol',
    'NONE (NONE)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'NONE' && alert.conflictType === 'NONE',
    t1 - t0
  );

  const cleanPatient = {
    allergies: [] as AllergyItem[],
    conditions: [] as ConditionItem[],
    medications: [] as MedicationItem[],
  };
  t0 = performance.now();
  alert = evaluateSafety(cleanPatient, 'Clopidogrel');
  t1 = performance.now();
  assertTest(
    'Rule 7b: Safe Drug Clopidogrel',
    'NONE (NONE)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'NONE' && alert.conflictType === 'NONE',
    t1 - t0
  );

  // Test 8a: Contraindication (Metformin + Renal Condition)
  const diabeticPatient = {
    allergies: [] as AllergyItem[],
    conditions: [{ id: 'c-ren', condition: 'Renal Impairment' }],
    medications: [] as MedicationItem[],
  };
  t0 = performance.now();
  alert = evaluateSafety(diabeticPatient, 'Metformin');
  t1 = performance.now();
  assertTest(
    'Rule 8a: Contraindication Metformin + Renal Condition',
    'HIGH (CONTRAINDICATION)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'HIGH' && alert.conflictType === 'CONTRAINDICATION',
    t1 - t0
  );

  // Test 8b: Contraindication Regression (Active Metformin + New Contrast Dye)
  const metforminActivePatient = {
    allergies: [] as AllergyItem[],
    conditions: [] as ConditionItem[],
    medications: [
      {
        id: 'm-met',
        drugName: 'Metformin',
        genericName: 'metformin hydrochloride',
        dosage: '500mg',
        frequency: 'Twice Daily',
        startDate: '2026-01-01',
        status: 'ACTIVE' as const,
        prescribedBy: 'Dr. Endocrine',
      },
    ],
  };
  t0 = performance.now();
  alert = evaluateSafety(metforminActivePatient, 'Contrast Dye');
  t1 = performance.now();
  assertTest(
    'Rule 8b: Contraindication Active Metformin + Contrast Dye',
    'MEDIUM (CONTRAINDICATION)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'MEDIUM' && alert.conflictType === 'CONTRAINDICATION',
    t1 - t0
  );

  // Test 8c: Contraindication Regression (Active Metformin + Iodinated Contrast)
  t0 = performance.now();
  alert = evaluateSafety(metforminActivePatient, 'Iodinated Contrast');
  t1 = performance.now();
  assertTest(
    'Rule 8c: Contraindication Active Metformin + Iodinated Contrast',
    'MEDIUM (CONTRAINDICATION)',
    `${alert.riskLevel} (${alert.conflictType})`,
    alert.riskLevel === 'MEDIUM' && alert.conflictType === 'CONTRAINDICATION',
    t1 - t0
  );

  // -------------------------------------------------------------
  // TEST GROUP 2: Latency & Performance Benchmark (<10ms target)
  // -------------------------------------------------------------
  console.log('\n--- 2. Safety Engine Performance Benchmark (1,000 Iterations) ---');
  const iterations = 1000;
  const startBench = performance.now();
  for (let i = 0; i < iterations; i++) {
    evaluateSafety(johnProfile, 'Aspirin 81mg');
  }
  const endBench = performance.now();
  const totalBenchTime = endBench - startBench;
  const avgExecutionTimeMs = totalBenchTime / iterations;
  console.log(`⚡ Total time for ${iterations} evaluations: ${totalBenchTime.toFixed(2)}ms`);
  console.log(`⚡ Average in-memory safety evaluation latency: ${(avgExecutionTimeMs * 1000).toFixed(2)} µs (${avgExecutionTimeMs.toFixed(4)} ms)`);

  assertTest(
    'Latency Target (< 10ms per evaluation)',
    '< 10ms',
    `${avgExecutionTimeMs.toFixed(4)}ms`,
    avgExecutionTimeMs < 10.0,
    avgExecutionTimeMs
  );

  // -------------------------------------------------------------
  // TEST GROUP 3: Database & Patient Lookup Tests
  // -------------------------------------------------------------
  console.log('\n--- 3. Database & Patient Lookup Tests ---');

  // Lookup by Health ID
  t0 = performance.now();
  const patientByHealthId = await findPatientByIdOrHealthId('MS-9042');
  t1 = performance.now();
  assertTest(
    'Lookup by Health ID (MS-9042)',
    'John Doe',
    patientByHealthId?.name || 'NULL',
    patientByHealthId?.name === 'John Doe',
    t1 - t0
  );

  // Lookup by UUID
  if (patientByHealthId) {
    t0 = performance.now();
    const patientByUuid = await findPatientByIdOrHealthId(patientByHealthId.id);
    t1 = performance.now();
    assertTest(
      'Lookup by internal UUID',
      'John Doe',
      patientByUuid?.name || 'NULL',
      patientByUuid?.name === 'John Doe',
      t1 - t0
    );
  }

  // Lookup non-existent
  t0 = performance.now();
  const nonExistent = await findPatientByIdOrHealthId('NON-EXISTENT-ID-9999');
  t1 = performance.now();
  assertTest(
    'Lookup non-existent ID',
    'null',
    nonExistent === null ? 'null' : 'found',
    nonExistent === null,
    t1 - t0
  );

  // -------------------------------------------------------------
  // TEST GROUP 4: Prescription Persistence Flow
  // -------------------------------------------------------------
  console.log('\n--- 4. Prescription Persistence Tests ---');
  if (patientByHealthId) {
    t0 = performance.now();
    const testPrescription = await prisma.medication.create({
      data: {
        patientId: patientByHealthId.id,
        drugName: 'Paracetamol',
        genericName: 'acetaminophen',
        dosage: '500mg',
        frequency: 'As Needed',
        startDate: '2026-08-20',
        status: 'ACTIVE',
        prescribedBy: 'Dr. Automated Tester',
        notes: 'Verification test prescription',
      },
    });
    t1 = performance.now();

    assertTest(
      'Create Prescription in Database',
      'Paracetamol',
      testPrescription.drugName,
      testPrescription.drugName === 'Paracetamol' && testPrescription.patientId === patientByHealthId.id,
      t1 - t0
    );

    // Verify retrieval in updated profile
    const updatedPatient = await findPatientByIdOrHealthId('MS-9042');
    const hasMed = updatedPatient?.medications.some((m) => m.id === testPrescription.id);
    assertTest(
      'Retrieve Newly Prescribed Med from Patient Profile',
      'true',
      String(hasMed),
      hasMed === true,
      0
    );

    // Cleanup test prescription to keep demo pristine
    await prisma.medication.delete({ where: { id: testPrescription.id } });
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  const allPassed = results.every((r) => r.passed);
  const passCount = results.filter((r) => r.passed).length;
  console.log(`📊 Test Summary: ${passCount}/${results.length} Passed`);
  if (allPassed) {
    console.log('🎉 ALL BACKEND & SAFETY ENGINE TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
  console.log('===============================================================\n');
}

runVerification()
  .catch((err) => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

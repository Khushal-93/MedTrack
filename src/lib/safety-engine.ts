import { AllergyItem, ConditionItem, MedicationItem, SafetyAlert } from '@/types';
import {
  ALLERGY_RULES,
  CONTRAINDICATION_RULES,
  DRUG_INTERACTIONS,
  normalizeDrugName,
} from './drug-database';

export interface PatientSafetyContext {
  allergies: AllergyItem[];
  conditions: ConditionItem[];
  medications: MedicationItem[];
}

/**
 * Deterministic In-Memory Medication Safety Checking Engine.
 * Evaluates in order:
 * 1. DUPLICATE CHECK
 * 2. ALLERGY CHECK
 * 3. DRUG-DRUG INTERACTION (DDI) CHECK
 * 4. CONTRAINDICATION CHECK
 * 5. DEFAULT SAFE
 */
export function evaluateSafety(
  patient: PatientSafetyContext,
  newDrugName: string,
  dosage?: string
): SafetyAlert {
  const trimmedDrug = newDrugName?.trim() || '';
  if (!trimmedDrug) {
    return {
      riskLevel: 'NONE',
      conflictType: 'NONE',
      conflictingItem: '',
      reason: '',
      clinicalAction: 'Please enter a drug name to perform safety analysis.',
    };
  }

  const canonicalNew = normalizeDrugName(trimmedDrug);
  const rawNewLower = trimmedDrug.toLowerCase();

  // Filter only ACTIVE medications
  const activeMeds = (patient.medications || []).filter(
    (m) => (m.status || 'ACTIVE').toUpperCase() === 'ACTIVE'
  );

  // -------------------------------------------------------------
  // STEP 1: DUPLICATE CHECK
  // -------------------------------------------------------------
  for (const activeMed of activeMeds) {
    const activeDrugRaw = (activeMed.drugName || '').toLowerCase();
    const activeGenericRaw = (activeMed.genericName || '').toLowerCase();
    const canonicalActive = normalizeDrugName(activeMed.drugName);
    const canonicalGeneric = normalizeDrugName(activeMed.genericName || '');

    const isDuplicate =
      canonicalNew === canonicalActive ||
      (canonicalGeneric && canonicalNew === canonicalGeneric) ||
      rawNewLower === activeDrugRaw ||
      rawNewLower === activeGenericRaw;

    if (isDuplicate) {
      return {
        riskLevel: 'HIGH',
        conflictType: 'DUPLICATE',
        conflictingItem: `${activeMed.drugName} ${activeMed.dosage} (Active)`,
        reason: `Patient is already actively taking ${activeMed.drugName} (${activeMed.dosage}). Prescribing duplicate therapy leads to accidental toxicity and severe overdose.`,
        clinicalAction: `Review patient active medication list. Avoid duplicate prescription unless intentionally replacing or titrating existing dosage.`,
      };
    }
  }

  // -------------------------------------------------------------
  // STEP 2: ALLERGY CHECK
  // -------------------------------------------------------------
  for (const allergy of patient.allergies || []) {
    const allergenLower = (allergy.allergen || '').toLowerCase().trim();

    // Check against predefined allergy cross-reactivity rules
    for (const rule of ALLERGY_RULES) {
      const isMatchingAllergen =
        allergenLower.includes(rule.allergenClass) || rule.allergenClass.includes(allergenLower);

      if (isMatchingAllergen) {
        const isMatchedDrug = rule.matchedDrugs.some(
          (drug) =>
            canonicalNew === drug ||
            rawNewLower.includes(drug) ||
            drug.includes(canonicalNew)
        );

        if (isMatchedDrug) {
          return {
            riskLevel: rule.riskLevel,
            conflictType: 'ALLERGY',
            conflictingItem: `${allergy.allergen} Allergy (${allergy.severity || 'HIGH'})`,
            reason: rule.reason,
            clinicalAction: rule.clinicalAction,
          };
        }
      }
    }

    // Direct allergen name substring comparison fallback
    if (
      allergenLower &&
      (rawNewLower.includes(allergenLower) ||
        allergenLower.includes(rawNewLower) ||
        canonicalNew === allergenLower)
    ) {
      return {
        riskLevel: 'HIGH',
        conflictType: 'ALLERGY',
        conflictingItem: `${allergy.allergen} Allergy (${allergy.severity || 'HIGH'})`,
        reason: `Patient has a documented ${allergy.severity || 'HIGH'} allergy to ${allergy.allergen}. Prescribing ${trimmedDrug} is strictly contraindicated.`,
        clinicalAction: `Do not prescribe ${trimmedDrug}. Choose an alternative medication class.`,
      };
    }
  }

  // -------------------------------------------------------------
  // STEP 3: DRUG-DRUG INTERACTION (DDI) CHECK
  // -------------------------------------------------------------
  for (const activeMed of activeMeds) {
    const canonicalActive = normalizeDrugName(activeMed.drugName);

    for (const rule of DRUG_INTERACTIONS) {
      const isMatch =
        (rule.drugA === canonicalNew && rule.drugB === canonicalActive) ||
        (rule.drugA === canonicalActive && rule.drugB === canonicalNew);

      if (isMatch) {
        return {
          riskLevel: rule.riskLevel,
          conflictType: rule.conflictType || 'DRUG_DRUG',
          conflictingItem: `${activeMed.drugName} ${activeMed.dosage} (Active)`,
          reason: rule.reason,
          clinicalAction: rule.clinicalAction,
        };
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 4: CONTRAINDICATION CHECK (Drug vs Condition)
  // -------------------------------------------------------------
  for (const cond of patient.conditions || []) {
    const condLower = (cond.condition || '').toLowerCase().trim();

    for (const rule of CONTRAINDICATION_RULES) {
      if (
        rule.drug === canonicalNew &&
        condLower.includes(rule.conditionKeyword)
      ) {
        return {
          riskLevel: rule.riskLevel,
          conflictType: 'CONTRAINDICATION',
          conflictingItem: `${cond.condition} (Condition)`,
          reason: rule.reason,
          clinicalAction: rule.clinicalAction,
        };
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 5: DEFAULT SAFE / NO CONFLICT
  // -------------------------------------------------------------
  return {
    riskLevel: 'NONE',
    conflictType: 'NONE',
    conflictingItem: '',
    reason: '',
    clinicalAction: 'No known conflicts detected. Safe to prescribe.',
  };
}

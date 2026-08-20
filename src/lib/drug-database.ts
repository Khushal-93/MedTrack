import { ConflictType, RiskLevel } from '@/types';

export interface InteractionRule {
  drugA: string; // generic or canonical name in lowercase
  drugB: string; // generic or canonical name in lowercase
  riskLevel: RiskLevel;
  conflictType: ConflictType;
  reason: string;
  clinicalAction: string;
}

export interface AllergyRule {
  allergenClass: string; // e.g. "penicillin" in lowercase
  matchedDrugs: string[]; // list of drug canonical names or prefixes
  riskLevel: RiskLevel;
  conflictType: ConflictType;
  reason: string;
  clinicalAction: string;
}

export interface ContraindicationRule {
  drug: string; // generic/canonical name in lowercase
  conditionKeyword: string; // condition keyword in lowercase (e.g. "hypertension", "renal", "asthma")
  riskLevel: RiskLevel;
  conflictType: ConflictType;
  reason: string;
  clinicalAction: string;
}

// Brand name / alias to canonical generic drug name
export const BRAND_TO_GENERIC: Record<string, string> = {
  // Anticoagulants / Antiplatelets
  coumadin: 'warfarin',
  jantoven: 'warfarin',
  warfarin: 'warfarin',
  'warfarin sodium': 'warfarin',
  aspirin: 'aspirin',
  bayer: 'aspirin',
  bufferin: 'aspirin',
  ecotrin: 'aspirin',
  'acetylsalicylic acid': 'aspirin',
  plavix: 'clopidogrel',
  clopidogrel: 'clopidogrel',

  // NSAIDs & Analgesics
  advil: 'ibuprofen',
  motrin: 'ibuprofen',
  nurofen: 'ibuprofen',
  ibuprofen: 'ibuprofen',
  aleve: 'naproxen',
  naprosyn: 'naproxen',
  naproxen: 'naproxen',
  tylenol: 'acetaminophen',
  panadol: 'acetaminophen',
  paracetamol: 'acetaminophen',
  calpol: 'acetaminophen',
  acetaminophen: 'acetaminophen',

  // Antibiotics
  amoxil: 'amoxicillin',
  augmentin: 'amoxicillin',
  amoxicillin: 'amoxicillin',
  ampicillin: 'ampicillin',
  penicillin: 'penicillin',
  'penicillin v': 'penicillin',
  'penicillin g': 'penicillin',
  piperacillin: 'piperacillin',
  biaxin: 'clarithromycin',
  clarithromycin: 'clarithromycin',
  zithromax: 'azithromycin',
  azithromycin: 'azithromycin',
  bactrim: 'sulfamethoxazole',
  septra: 'sulfamethoxazole',
  sulfamethoxazole: 'sulfamethoxazole',

  // Cardiovascular / Metabolic
  zestril: 'lisinopril',
  prinivil: 'lisinopril',
  lisinopril: 'lisinopril',
  zocor: 'simvastatin',
  simvastatin: 'simvastatin',
  lipitor: 'atorvastatin',
  atorvastatin: 'atorvastatin',
  glucophage: 'metformin',
  fortamet: 'metformin',
  metformin: 'metformin',
  prilosec: 'omeprazole',
  omeprazole: 'omeprazole',
  tenormin: 'atenolol',
  atenolol: 'atenolol',
  potassium: 'potassium',
  'potassium chloride': 'potassium',
  'potassium supplements': 'potassium',
  'contrast dye': 'contrast dye',
  'iodinated contrast': 'contrast dye',
  'iv contrast': 'contrast dye',
  'contrast': 'contrast dye',
};

// Allergy cross-reactivity mapping
export const ALLERGY_RULES: AllergyRule[] = [
  {
    allergenClass: 'penicillin',
    matchedDrugs: [
      'penicillin',
      'amoxicillin',
      'ampicillin',
      'augmentin',
      'piperacillin',
      'amoxil',
      'oxacillin',
      'nafcillin',
      'ticarcillin',
    ],
    riskLevel: 'HIGH',
    conflictType: 'ALLERGY',
    reason:
      'Patient has a documented allergy to the Penicillin class. Cross-reactivity can trigger severe hypersensitivity, angioedema, or fatal anaphylaxis.',
    clinicalAction:
      'Do not prescribe. Select a non-beta-lactam alternative such as a Macrolide (Azithromycin, Clarithromycin) or Fluoroquinolone as clinically indicated.',
  },
  {
    allergenClass: 'sulfa',
    matchedDrugs: ['sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine', 'sulfadiazine'],
    riskLevel: 'HIGH',
    conflictType: 'ALLERGY',
    reason:
      'Patient has a documented allergy to Sulfa/Sulfonamides. Risk of severe cutaneous adverse reactions (SCARs/Stevens-Johnson Syndrome).',
    clinicalAction: 'Do not prescribe. Choose an alternative antimicrobial class.',
  },
  {
    allergenClass: 'aspirin',
    matchedDrugs: ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'ketorolac'],
    riskLevel: 'HIGH',
    conflictType: 'ALLERGY',
    reason:
      'Patient has a documented allergy/hypersensitivity to Aspirin/NSAIDs. Risk of severe bronchospasm, urticaria, or anaphylactoid reaction.',
    clinicalAction: 'Avoid NSAIDs. Consider Acetaminophen (Paracetamol) for analgesia.',
  },
];

// Drug-Drug Interaction Knowledge Base
export const DRUG_INTERACTIONS: InteractionRule[] = [
  {
    drugA: 'warfarin',
    drugB: 'aspirin',
    riskLevel: 'HIGH',
    conflictType: 'DRUG_DRUG',
    reason:
      'Concomitant use of Warfarin and Aspirin dramatically increases the risk of severe GI and internal bleeding due to combined anticoagulant and antiplatelet effects.',
    clinicalAction:
      'Avoid combination unless strictly monitored for cardiac indications. Consider acetaminophen for pain.',
  },
  {
    drugA: 'warfarin',
    drugB: 'ibuprofen',
    riskLevel: 'HIGH',
    conflictType: 'DRUG_DRUG',
    reason:
      'NSAIDs inhibit platelet aggregation and cause gastric ulceration when combined with Warfarin, leading to high gastrointestinal bleeding risk.',
    clinicalAction: 'Switch to Acetaminophen (Paracetamol) for analgesia.',
  },
  {
    drugA: 'warfarin',
    drugB: 'naproxen',
    riskLevel: 'HIGH',
    conflictType: 'DRUG_DRUG',
    reason:
      'Naproxen is an NSAID that damages the gastric mucosa and impairs platelet function, compounding Warfarin anticoagulant bleeding risks.',
    clinicalAction: 'Avoid combination. Use Acetaminophen (Paracetamol) for pain.',
  },
  {
    drugA: 'lisinopril',
    drugB: 'potassium',
    riskLevel: 'HIGH',
    conflictType: 'DRUG_DRUG',
    reason:
      'ACE inhibitors reduce potassium excretion; combination with potassium supplements risks severe hyperkalemia and cardiac arrest.',
    clinicalAction: 'Monitor serum potassium levels closely or choose an alternative.',
  },
  {
    drugA: 'simvastatin',
    drugB: 'clarithromycin',
    riskLevel: 'HIGH',
    conflictType: 'DRUG_DRUG',
    reason:
      'CYP3A4 inhibition by Clarithromycin leads to increased statin levels and rhabdomyolysis (severe muscle breakdown) and renal failure.',
    clinicalAction: 'Suspend Simvastatin during antibiotic course or use non-CYP3A4 statin.',
  },
  {
    drugA: 'warfarin',
    drugB: 'clarithromycin',
    riskLevel: 'HIGH',
    conflictType: 'DRUG_DRUG',
    reason:
      'Clarithromycin inhibits CYP2C9 and CYP3A4 metabolism of Warfarin, causing elevated INR and heightened bleeding risk.',
    clinicalAction: 'Monitor INR closely and reduce Warfarin dosage, or select alternative antibiotic.',
  },
  {
    drugA: 'clopidogrel',
    drugB: 'omeprazole',
    riskLevel: 'MEDIUM',
    conflictType: 'DRUG_DRUG',
    reason:
      'Omeprazole inhibits CYP2C19, decreasing the metabolic activation and antiplatelet efficacy of Clopidogrel.',
    clinicalAction:
      'Consider switching to Pantoprazole or H2 blocker (Famotidine) which exhibit lower CYP2C19 inhibition.',
  },
  {
    drugA: 'metformin',
    drugB: 'contrast dye',
    riskLevel: 'MEDIUM',
    conflictType: 'CONTRAINDICATION',
    reason:
      'Intravenous iodinated contrast can induce acute renal failure, causing Metformin accumulation & lactic acidosis.',
    clinicalAction:
      'Discontinue Metformin 48 hours prior to contrast procedure and verify eGFR before resuming.',
  },
];

// Condition Contraindications
export const CONTRAINDICATION_RULES: ContraindicationRule[] = [
  {
    drug: 'metformin',
    conditionKeyword: 'contrast',
    riskLevel: 'MEDIUM',
    conflictType: 'CONTRAINDICATION',
    reason:
      'Intravenous iodinated contrast can induce acute renal failure, causing Metformin accumulation & lactic acidosis.',
    clinicalAction: 'Discontinue Metformin 48 hours prior to contrast procedure and verify eGFR.',
  },
  {
    drug: 'metformin',
    conditionKeyword: 'renal',
    riskLevel: 'HIGH',
    conflictType: 'CONTRAINDICATION',
    reason:
      'Metformin is cleared renally. Renal impairment increases risk of severe and potentially fatal lactic acidosis.',
    clinicalAction: 'Avoid or reduce Metformin if eGFR < 45 mL/min/1.73m2. Contraindicated if eGFR < 30.',
  },
  {
    drug: 'ibuprofen',
    conditionKeyword: 'hypertension',
    riskLevel: 'MEDIUM',
    conflictType: 'CONTRAINDICATION',
    reason:
      'NSAIDs promote renal sodium retention and vasoconstriction, counteracting antihypertensive control.',
    clinicalAction: 'Monitor blood pressure closely or switch to Acetaminophen (Paracetamol).',
  },
  {
    drug: 'aspirin',
    conditionKeyword: 'ulcer',
    riskLevel: 'HIGH',
    conflictType: 'CONTRAINDICATION',
    reason:
      'Aspirin inhibits protective gastric prostaglandins, causing recurrent ulceration and gastrointestinal hemorrhage.',
    clinicalAction: 'Avoid Aspirin or co-prescribe a proton pump inhibitor if antiplatelet is mandatory.',
  },
  {
    drug: 'atenolol',
    conditionKeyword: 'asthma',
    riskLevel: 'HIGH',
    conflictType: 'CONTRAINDICATION',
    reason: 'Beta-blockers can induce severe bronchoconstriction and exacerbate asthma.',
    clinicalAction: 'Avoid beta-blockers in patients with reactive airway disease.',
  },
];

/**
 * Normalize drug input string and resolve aliases/brand names to canonical generic name.
 */
export function normalizeDrugName(input: string): string {
  if (!input) return '';
  const cleaned = input
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract primary name tokens before dosage (e.g., "warfarin 5mg" -> "warfarin")
  const tokens = cleaned.split(' ');
  const firstWord = tokens[0];

  if (BRAND_TO_GENERIC[cleaned]) {
    return BRAND_TO_GENERIC[cleaned];
  }

  if (BRAND_TO_GENERIC[firstWord]) {
    return BRAND_TO_GENERIC[firstWord];
  }

  // Check if cleaned contains any known brand key
  for (const [brand, generic] of Object.entries(BRAND_TO_GENERIC)) {
    if (cleaned.includes(brand)) {
      return generic;
    }
  }

  return firstWord || cleaned;
}

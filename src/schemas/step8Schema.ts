import { z } from 'zod';

/**
 * Step 8 Base Object Schema: Mandatory RBI Consents & Submission Data
 */
export const step8BaseSchema = z.object({
  consentInformationAccuracy: z.boolean({
    required_error: 'Information accuracy confirmation is required',
  }).refine((val) => val === true, {
    message: 'You must confirm that all information provided is accurate and truthful',
  }),

  consentCreditBureau: z.boolean({
    required_error: 'Credit bureau inquiry authorization is required',
  }).refine((val) => val === true, {
    message: 'Explicit authorization to pull credit reports from CIBIL/Equifax is mandatory',
  }),

  consentTermsKfs: z.boolean({
    required_error: 'Key Fact Statement (KFS) acceptance is required',
  }).refine((val) => val === true, {
    message: 'You must read and accept the Key Fact Statement and loan terms',
  }),

  consentRegulatoryComm: z.boolean({
    required_error: 'Regulatory communications consent is required',
  }).refine((val) => val === true, {
    message: 'Consent to receive electronic regulatory disclosures and notices is mandatory',
  }),

  // Optional and legacy compatibility fields
  cibilScoreConsent: z.boolean().optional(),
  rbiFairPracticesConsent: z.boolean().optional(),
  privacyPolicyConsent: z.boolean().optional(),
  eSignOtpVerified: z.boolean().optional(),
  applicationReferenceNumber: z.string().optional(),
  submissionTimestamp: z.string().optional(),
});

/**
 * Step 8 Schema with Refinements
 */
export const step8Schema = step8BaseSchema;

export type Step8FormData = z.infer<typeof step8Schema>;
export default step8Schema;

import { z } from 'zod';


export const uploadedFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(5 * 1024 * 1024, 'File size exceeds maximum 5MB limit'),
  type: z.string().refine(
    (t) => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(t.toLowerCase()),
    'Allowed file types: PDF, JPG, PNG'
  ),
  previewUrl: z.string().nullable().optional(),
  originalSize: z.number().optional(),
  compressedSize: z.number().optional(),
  isCompressed: z.boolean().optional(),
  uploadedAt: z.string().optional(),
});

export interface DocumentRequirement {
  id:
    | 'docPanCard'
    | 'docAadhaarFront'
    | 'docAadhaarBack'
    | 'docSalarySlips'
    | 'docItrReturns'
    | 'docPropertyDocs'
    | 'docBusinessRegistration';
  title: string;
  description: string;
  required: boolean;
  badgeText: string;
}

/**
 * Returns dynamic document checklist based on applicant loanType, employmentType, and PAN status
 */
export function getDocumentChecklist(formData: {
  loanType?: string;
  employmentType?: string;
  isPanVerified?: boolean;
}): DocumentRequirement[] {
  const isPanVerified = Boolean(formData?.isPanVerified);
  const loanType = formData?.loanType || 'Personal';
  const employmentType = formData?.employmentType || 'Salaried';

  const list: DocumentRequirement[] = [
    {
      id: 'docPanCard',
      title: 'PAN Card Copy',
      description: isPanVerified
        ? 'PAN already verified in Step 3. Upload is optional.'
        : 'Clear photo or PDF of your original PAN card',
      required: !isPanVerified,
      badgeText: isPanVerified ? 'Optional' : 'Mandatory',
    },
    {
      id: 'docAadhaarFront',
      title: 'Aadhaar Card (Front)',
      description: 'Front side showing your photograph, full name, and Aadhaar number',
      required: true,
      badgeText: 'Mandatory',
    },
    {
      id: 'docAadhaarBack',
      title: 'Aadhaar Card (Back)',
      description: 'Back side showing your registered residential address and QR code',
      required: true,
      badgeText: 'Mandatory',
    },
  ];

  // Salaried Applicant Documents
  if (employmentType === 'Salaried' || employmentType === 'salaried') {
    list.push({
      id: 'docSalarySlips',
      title: 'Salary Slips (Last 3 Months)',
      description: 'Recent salary slips with company letterhead, net pay, and deductions',
      required: true,
      badgeText: 'Mandatory',
    });
  }

  // Self-Employed or Business Owner Documents
  if (
    employmentType === 'Self-Employed' ||
    employmentType === 'Business Owner' ||
    employmentType === 'self_employed_professional' ||
    employmentType === 'business_owner'
  ) {
    list.push({
      id: 'docItrReturns',
      title: 'ITR Returns & Computation (Last 2 Years)',
      description: 'ITR acknowledgement forms (ITR-V) with computation of income',
      required: true,
      badgeText: 'Mandatory',
    });
  }

  // Home Loan Property Documents
  if (loanType === 'Home') {
    list.push({
      id: 'docPropertyDocs',
      title: 'Property Title / Allotment Letter',
      description: 'Sale deed, allotment letter, or builder-buyer agreement for Home Loan',
      required: true,
      badgeText: 'Mandatory',
    });
  }

  // Business Loan Documents
  if (loanType === 'Business') {
    list.push({
      id: 'docBusinessRegistration',
      title: 'Business Registration & GST Returns',
      description: 'Udyam Certificate, GST Certificate, and recent GST returns (GSTR-3B)',
      required: true,
      badgeText: 'Mandatory',
    });
  }

  return list;
}

/**
 * Step 7 Base Object Schema
 */
export const step7BaseSchema = z.object({
  docPanCard: uploadedFileSchema.nullable().optional(),
  docAadhaarFront: uploadedFileSchema.nullable().optional(),
  docAadhaarBack: uploadedFileSchema.nullable().optional(),
  docSalarySlips: uploadedFileSchema.nullable().optional(),
  docItrReturns: uploadedFileSchema.nullable().optional(),
  docPropertyDocs: uploadedFileSchema.nullable().optional(),
  docBusinessRegistration: uploadedFileSchema.nullable().optional(),
  digitalSignature: z
    .string({ required_error: 'Digital signature is mandatory' })
    .min(50, 'Please draw your digital signature before continuing'),

  // Cross-step context fields
  loanType: z.string().optional(),
  employmentType: z.string().optional(),
  isPanVerified: z.boolean().optional(),
});

/**
 * Step 7 Refined Schema with dynamic document requirements and signature validation
 */
export const step7Schema = step7BaseSchema.superRefine((data, ctx) => {
  // 1. Aadhaar Front & Back are always mandatory
  if (!data.docAadhaarFront) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['docAadhaarFront'],
      message: 'Aadhaar Card (Front) upload is mandatory',
    });
  }

  if (!data.docAadhaarBack) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['docAadhaarBack'],
      message: 'Aadhaar Card (Back) upload is mandatory',
    });
  }

  // 2. PAN Card is required if not verified in Step 3
  if (!data.isPanVerified && !data.docPanCard) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['docPanCard'],
      message: 'PAN Card copy is mandatory as PAN was not verified in Step 3',
    });
  }

  // 3. Salary Slips for Salaried
  const isSalaried = data.employmentType === 'Salaried' || data.employmentType === 'salaried';
  if (isSalaried && !data.docSalarySlips) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['docSalarySlips'],
      message: 'Salary Slips (Last 3 months) are required for salaried applicants',
    });
  }

  // 4. ITR for Self-Employed and Business Owner
  const isSelfEmployed =
    data.employmentType === 'Self-Employed' ||
    data.employmentType === 'Business Owner' ||
    data.employmentType === 'self_employed_professional' ||
    data.employmentType === 'business_owner';
  if (isSelfEmployed && !data.docItrReturns) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['docItrReturns'],
      message: 'ITR acknowledgement (Last 2 years) is required for self-employed applicants',
    });
  }

  // 5. Property Documents for Home Loan
  if (data.loanType === 'Home' && !data.docPropertyDocs) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['docPropertyDocs'],
      message: 'Property documents (Title Deed / Allotment Letter) are mandatory for Home Loans',
    });
  }

  // 6. Business Registration for Business Loan
  if (data.loanType === 'Business' && !data.docBusinessRegistration) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['docBusinessRegistration'],
      message: 'Business Registration & GST returns are mandatory for Business Loans',
    });
  }

  // 7. Non-empty digital signature
  if (!data.digitalSignature || data.digitalSignature.trim().length < 50) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['digitalSignature'],
      message: 'Digital signature is required. Please sign using the canvas pad.',
    });
  }
});

export type Step7FormData = z.infer<typeof step7Schema>;
export default step7Schema;

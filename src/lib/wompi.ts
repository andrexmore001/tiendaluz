import crypto from 'crypto';

export const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_test_Q5yDA9xoKdePzhS8qn96MpSyo98UvSly';
export const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || 'prod_integrity_Z5M6u1yQ5yDA9xoKdePzhS8qn96MpSyo';

/**
 * Generates the integrity signature for Wompi transactions
 * Formula: SHA256(reference + amountInCents + currency + integritySecret)
 */
export function generateIntegritySignature(reference: string, amountInCents: number, currency: string = 'COP'): string {
    const stringToHash = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`;
    return crypto.createHash('sha256').update(stringToHash).digest('hex');
}

/**
 * Converts COP amount to cents as required by Wompi
 */
export function toCents(amount: number): number {
    return Math.round(amount * 100);
}

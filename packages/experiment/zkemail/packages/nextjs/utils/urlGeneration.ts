import { randomBytes } from 'crypto';

export function generateUniqueVerificationLink(recruiterEmail: string): string {
  // Generate a cryptographically secure random token
  const token = randomBytes(32).toString('hex');
  
  // Create a base64 encoded version of the recruiter's email
  const encodedEmail = Buffer.from(recruiterEmail).toString('base64');
  
  // Construct a unique verification link
  // In a real-world scenario, this would be validated against a backend
  return `https://yourplatform.com/verify/${token}?ref=${encodedEmail}`;
}

export function validateVerificationLink(link: string): boolean {
  // Implement additional link validation logic
  // Check token expiration, one-time use, etc.
  return true;
}
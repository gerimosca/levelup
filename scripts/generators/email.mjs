#!/usr/bin/env node

/**
 * Email System Setup
 * Run with: node scripts/generators/email.mjs
 *
 * Sets up Resend for transactional emails with base templates
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}→ ${msg}${colors.reset}`),
  title: (msg) =>
    console.log(
      `\n${colors.bright}${colors.blue}${'='.repeat(50)}\n  ${msg}\n${'='.repeat(50)}${colors.reset}\n`
    ),
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

/**
 * Get brand name from brand.ts
 */
function getBrandName() {
  const brandPath = join(rootDir, 'src/core/shared/config/brand.ts');
  const brandContent = readFileSync(brandPath, 'utf-8');

  const match = brandContent.match(/name: ['"](.+?)['"]/);
  return match ? match[1] : 'AI SaaS';
}

/**
 * Create email templates
 */
function createEmailTemplates(brandName) {
  const emailsDir = join(rootDir, 'src/core/shared/email');

  // Create directories
  if (!existsSync(emailsDir)) {
    mkdirSync(emailsDir, { recursive: true });
  }
  const componentsDir = join(emailsDir, '_components');
  if (!existsSync(componentsDir)) {
    mkdirSync(componentsDir);
  }

  // Email Layout Component
  const layoutTemplate = `import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Link } from '@react-email/components';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>${brandName}</Text>
          </Section>
          {children}
          <Section style={footer}>
            <Text style={footerText}>
              © ${new Date().getFullYear()} ${brandName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="{{unsubscribeUrl}}" style={link}>
                Unsubscribe
              </Link>
              {' | '}
              <Link href="{{preferencesUrl}}" style={link}>
                Preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e6ebf1',
};

const headerText = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0',
};

const footer = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e6ebf1',
};

const footerText = {
  fontSize: '12px',
  color: '#8898aa',
  lineHeight: '16px',
  margin: '8px 0',
};

const link = {
  color: '#556cd6',
  textDecoration: 'none',
};
`;

  // Welcome Email Template
  const welcomeTemplate = `import * as React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { EmailLayout } from './_components/email-layout';

interface WelcomeEmailProps {
  name?: string;
  loginUrl?: string;
}

export function WelcomeEmail({ name = 'there', loginUrl = 'https://example.com/login' }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to ${brandName}!">
      <Section style={section}>
        <Text style={heading}>Welcome to ${brandName}!</Text>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Thanks for signing up! We're excited to have you on board.
        </Text>
        <Text style={paragraph}>
          Get started by logging in to your account and exploring what we have to offer.
        </Text>
        <Button href={loginUrl} style={button}>
          Go to Dashboard
        </Button>
        <Text style={paragraph}>
          If you have any questions, feel free to reply to this email. We're here to help!
        </Text>
        <Text style={paragraph}>
          Best regards,
          <br />
          The ${brandName} Team
        </Text>
      </Section>
    </EmailLayout>
  );
}

const section = {
  padding: '24px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#525252',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#556cd6',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '24px 0',
};

export default WelcomeEmail;
`;

  // Reset Password Email
  const resetPasswordTemplate = `import * as React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { EmailLayout } from './_components/email-layout';

interface ResetPasswordEmailProps {
  name?: string;
  resetUrl?: string;
}

export function ResetPasswordEmail({ name = 'there', resetUrl = 'https://example.com/reset' }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Section style={section}>
        <Text style={heading}>Reset Your Password</Text>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          We received a request to reset your password. Click the button below to create a new password.
        </Text>
        <Button href={resetUrl} style={button}>
          Reset Password
        </Button>
        <Text style={paragraph}>
          This link will expire in 1 hour for security reasons.
        </Text>
        <Text style={paragraph}>
          If you didn't request a password reset, you can safely ignore this email.
        </Text>
        <Text style={paragraph}>
          Best regards,
          <br />
          The ${brandName} Team
        </Text>
      </Section>
    </EmailLayout>
  );
}

const section = {
  padding: '24px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#525252',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#556cd6',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '24px 0',
};

export default ResetPasswordEmail;
`;

  // Payment Confirmation Email
  const paymentConfirmationTemplate = `import * as React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { EmailLayout } from './_components/email-layout';

interface PaymentConfirmationEmailProps {
  name?: string;
  plan?: string;
  amount?: string;
  date?: string;
  invoiceUrl?: string;
}

export function PaymentConfirmationEmail({
  name = 'there',
  plan = 'Pro Plan',
  amount = '$99',
  date = new Date().toLocaleDateString(),
  invoiceUrl = 'https://example.com/invoice',
}: PaymentConfirmationEmailProps) {
  return (
    <EmailLayout preview="Payment confirmation">
      <Section style={section}>
        <Text style={heading}>Payment Received</Text>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Thank you for your payment! Your subscription has been confirmed.
        </Text>
        <Section style={detailsBox}>
          <Text style={detailsRow}>
            <strong>Plan:</strong> {plan}
          </Text>
          <Text style={detailsRow}>
            <strong>Amount:</strong> {amount}
          </Text>
          <Text style={detailsRow}>
            <strong>Date:</strong> {date}
          </Text>
        </Section>
        <Button href={invoiceUrl} style={button}>
          View Invoice
        </Button>
        <Text style={paragraph}>
          Your subscription is now active. Enjoy all the features!
        </Text>
        <Text style={paragraph}>
          Best regards,
          <br />
          The ${brandName} Team
        </Text>
      </Section>
    </EmailLayout>
  );
}

const section = {
  padding: '24px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#525252',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#556cd6',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '24px 0',
};

const detailsBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '5px',
  padding: '16px',
  margin: '24px 0',
};

const detailsRow = {
  fontSize: '14px',
  color: '#1a1a1a',
  margin: '8px 0',
};

export default PaymentConfirmationEmail;
`;

  // Write files
  writeFileSync(join(componentsDir, 'email-layout.tsx'), layoutTemplate);
  log.success('_components/email-layout.tsx created');

  writeFileSync(join(emailsDir, 'welcome.tsx'), welcomeTemplate);
  log.success('welcome.tsx created');

  writeFileSync(join(emailsDir, 'reset-password.tsx'), resetPasswordTemplate);
  log.success('reset-password.tsx created');

  writeFileSync(join(emailsDir, 'payment-confirmation.tsx'), paymentConfirmationTemplate);
  log.success('payment-confirmation.tsx created');
}

/**
 * Create email helper
 */
function createEmailHelper() {
  const emailDir = join(rootDir, 'src/core/shared/email');
  if (!existsSync(emailDir)) {
    mkdirSync(emailDir, { recursive: true });
  }

  const helperTemplate = `import { Resend } from 'resend';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is not set');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: (error as Error).message };
  }
}
`;

  writeFileSync(join(emailDir, 'resend.ts'), helperTemplate);
  log.success('shared/email/resend.ts created');
}

async function main() {
  log.title('Configure Transactional Email with Resend');

  const brandName = getBrandName();
  log.info(`Brand: ${colors.bright}${brandName}${colors.reset}`);
  console.log('');

  // Step 1: Install packages
  log.step('Installing packages...');
  log.info('npm install resend @react-email/components');
  console.log('');

  try {
    execSync('npm install resend @react-email/components', { cwd: rootDir, stdio: 'inherit' });
    log.success('Packages installed');
  } catch (error) {
    log.warn('Package installation failed. Install manually:');
    log.info('  npm install resend @react-email/components');
    rl.close();
    return;
  }

  // Step 2: Get API credentials
  console.log('\n');
  log.step('Resend Configuration');
  console.log('');
  log.info('You need a Resend account and API key from https://resend.com/');
  console.log('');

  const apiKey = await question('Resend API Key (re_...): ');

  if (!apiKey) {
    log.warn('No API key provided. Exiting.');
    rl.close();
    return;
  }

  const fromEmail = await question('Email "From" address (e.g., noreply@yourdomain.com): ');

  if (!fromEmail) {
    log.warn('No from email provided. Exiting.');
    rl.close();
    return;
  }

  // Step 3: Update .env.local
  console.log('\n');
  log.step('Updating .env.local...');

  const envPath = join(rootDir, '.env.local');
  let envContent = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

  if (envContent.includes('RESEND_API_KEY=')) {
    envContent = envContent.replace(/RESEND_API_KEY=.*/, `RESEND_API_KEY=${apiKey}`);
  } else {
    envContent += `\nRESEND_API_KEY=${apiKey}`;
  }

  if (envContent.includes('RESEND_FROM_EMAIL=')) {
    envContent = envContent.replace(/RESEND_FROM_EMAIL=.*/, `RESEND_FROM_EMAIL=${fromEmail}`);
  } else {
    envContent += `\nRESEND_FROM_EMAIL=${fromEmail}`;
  }

  writeFileSync(envPath, envContent);
  log.success('.env.local updated');

  // Step 4: Create email templates
  console.log('\n');
  log.step('Creating email templates...');

  createEmailTemplates(brandName);

  // Step 5: Create email helper
  console.log('\n');
  log.step('Creating email helper...');

  createEmailHelper();

  // Done
  console.log('\n');
  log.success('Email system configured successfully!');
  console.log('');
  log.info('Next steps:');
  console.log('  1. Verify your domain in Resend Dashboard (https://resend.com/domains)');
  console.log('  2. Test email sending locally');
  console.log('  3. Customize email templates in src/core/shared/email/');
  console.log('');
  log.info('Example usage:');
  console.log("  import { sendEmail } from '@/shared/email/resend';");
  console.log("  import { WelcomeEmail } from '@/emails/welcome';");
  console.log('');
  console.log('  await sendEmail({');
  console.log("    to: 'user@example.com',");
  console.log("    subject: 'Welcome!',");
  console.log("    react: <WelcomeEmail name=\"John\" />,");
  console.log('  });');
  console.log('');

  rl.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});

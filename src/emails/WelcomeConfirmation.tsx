// src/emails/WelcomeConfirmation.tsx

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
  Section,
  Hr,
  Button,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeConfirmationEmailProps {
  customerName: string;
  confirmationUrl: string;
}

export const WelcomeConfirmationEmail = ({
  customerName,
  confirmationUrl,
}: WelcomeConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Selamat datang di HiLink Adventure! Konfirmasi akun Anda</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={headerSection}>
          <Heading style={heading}>
            🏔️ <span style={greenText}>HiLink</span> Adventure
          </Heading>
          <Text style={tagline}>Platform Petualangan Outdoor Terpercaya</Text>
        </Section>

        <Hr style={hr} />

        {/* Welcome Message */}
        <Section style={welcomeSection}>
          <Heading as="h2" style={welcomeHeading}>
            Selamat Datang di Keluarga Petualang! 🎉
          </Heading>
          <Text style={paragraph}>Halo {customerName},</Text>
          <Text style={paragraph}>
            Terima kasih telah bergabung dengan <strong>HiLink Adventure</strong>! 
            Kami sangat senang Anda memilih kami sebagai partner petualangan outdoor Anda.
          </Text>
          <Text style={paragraph}>
            Untuk mengaktifkan akun Anda dan mulai menjelajahi berbagai paket open trip 
            serta sewa peralatan outdoor, silakan konfirmasi email Anda dengan mengklik 
            tombol di bawah ini:
          </Text>
        </Section>

        {/* Confirmation Button */}
        <Section style={buttonSection}>
          <Button style={confirmButton} href={confirmationUrl}>
            🔐 Konfirmasi Email Saya
          </Button>
        </Section>

        <Text style={buttonSubtext}>
          Atau copy dan paste link berikut di browser Anda:
        </Text>
        <Link style={linkStyle} href={confirmationUrl}>
          {confirmationUrl}
        </Link>

        <Hr style={hr} />

        {/* What's Next Section */}
        <Section style={featuresSection}>
          <Heading as="h3" style={featuresHeading}>
            Apa yang bisa Anda lakukan setelah konfirmasi? 🚀
          </Heading>
          
          <div style={featureItem}>
            <Text style={featureTitle}>🏔️ Jelajahi Open Trip</Text>
            <Text style={featureDescription}>
              Temukan berbagai paket petualangan outdoor dari pendakian gunung, 
              island hopping, hingga camping di destinasi eksotis.
            </Text>
          </div>

          <div style={featureItem}>
            <Text style={featureTitle}>🎒 Sewa Peralatan</Text>
            <Text style={featureDescription}>
              Akses peralatan outdoor berkualitas tinggi dengan harga terjangkau. 
              Dari carrier, tenda, hingga peralatan climbing.
            </Text>
          </div>

          <div style={featureItem}>
            <Text style={featureTitle}>📸 Galeri & Komunitas</Text>
            <Text style={featureDescription}>
              Bagikan pengalaman petualangan Anda dan bergabung dengan 
              komunitas petualang dari seluruh Indonesia.
            </Text>
          </div>

          <div style={featureItem}>
            <Text style={featureTitle}>💼 Layanan Bisnis</Text>
            <Text style={featureDescription}>
              Solusi team building dan corporate retreat outdoor yang 
              dirancang khusus untuk perusahaan Anda.
            </Text>
          </div>
        </Section>

        <Hr style={hr} />

        {/* Contact & Support */}
        <Section style={supportSection}>
          <Heading as="h3" style={supportHeading}>
            Butuh Bantuan? 💬
          </Heading>
          <Text style={paragraph}>
            Tim customer support kami siap membantu Anda 24/7:
          </Text>
          <Text style={contactInfo}>
            📧 Email: support@hilink-adventure.com
            <br />
            📱 WhatsApp: +62 812-3456-7890
            <br />
            🌐 Website: www.hilink-adventure.com
          </Text>
        </Section>

        {/* Footer */}
        <Hr style={hr} />
        <Section style={footerSection}>
          <Text style={footerText}>
            Email ini dikirim otomatis oleh sistem HiLink Adventure.
            <br />
            Jika Anda tidak merasa mendaftar, abaikan email ini.
          </Text>
          <Text style={footerText}>
            © 2025 HiLink Adventure. All rights reserved.
            <br />
            Jakarta, Indonesia
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
};

const headerSection = {
  padding: '20px 30px 0',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 10px',
};

const greenText = {
  color: '#22c55e',
};

const tagline = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0 0 20px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const welcomeSection = {
  padding: '0 30px',
};

const welcomeHeading = {
  fontSize: '24px',
  lineHeight: '1.4',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 16px',
};

const buttonSection = {
  textAlign: 'center' as const,
  padding: '20px 30px',
};

const confirmButton = {
  backgroundColor: '#22c55e',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)',
};

const buttonSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '16px 0 8px',
  padding: '0 30px',
};

const linkStyle = {
  color: '#22c55e',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  display: 'block',
  textAlign: 'center' as const,
  padding: '0 30px',
  margin: '0 0 20px',
};

const featuresSection = {
  padding: '20px 30px',
};

const featuresHeading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const featureItem = {
  marginBottom: '16px',
};

const featureTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 4px',
};

const featureDescription = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#6b7280',
  margin: '0 0 12px',
};

const supportSection = {
  padding: '20px 30px',
};

const supportHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const contactInfo = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  margin: '16px 0',
};

const footerSection = {
  padding: '20px 30px',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

export default WelcomeConfirmationEmail;

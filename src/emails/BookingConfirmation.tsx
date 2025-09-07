// src/emails/BookingConfirmation.tsx

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
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  customerName: string;
  tripTitle: string;
  bookingId: string;
  totalPrice: string;
  totalParticipants: number;
}

export const BookingConfirmationEmail = ({
  customerName,
  tripTitle,
  bookingId,
  totalPrice,
  totalParticipants,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Konfirmasi Pesanan HiLink Adventure Anda</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>
          <span style={greenText}>HiLink</span> Adventure
        </Heading>
        <Text style={paragraph}>Halo {customerName},</Text>
        <Text style={paragraph}>
          Terima kasih telah memesan petualangan Anda bersama kami! Pesanan Anda
          telah kami terima dan sedang menunggu pembayaran.
        </Text>
        <Section style={detailsContainer}>
          <Heading as="h2" style={detailsHeading}>Detail Pesanan</Heading>
          <Text style={detailsText}><strong>ID Pesanan:</strong> {bookingId}</Text>
          <Text style={detailsText}><strong>Trip:</strong> {tripTitle}</Text>
          <Text style={detailsText}><strong>Jumlah Peserta:</strong> {totalParticipants} orang</Text>
          <Text style={detailsText}><strong>Total Harga:</strong> {totalPrice}</Text>
        </Section>
        <Text style={paragraph}>
          Silakan lanjutkan ke pembayaran untuk mengamankan tempat Anda. Instruksi
          pembayaran akan kami kirimkan dalam email terpisah setelah Anda
          melakukan konfirmasi di halaman pembayaran.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          © {new Date().getFullYear()} HiLink Adventure. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '20px',
  textAlign: 'center' as const,
  color: '#1a1a1a',
};

const greenText = {
    color: '#22c55e',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 20px',
};

const detailsContainer = {
    padding: '20px',
    margin: '20px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
};

const detailsHeading = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#111827'
};

const detailsText = {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#374151',
    margin: '4px 0',
};


const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};
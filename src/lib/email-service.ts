import { Resend } from 'resend'
import { BookingConfirmationEmail } from './emails/booking-confirmation'
import { PaymentSuccessEmail } from './emails/payment-success'
import { TripReminderEmail } from './emails/trip-reminder'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailRecipient {
  email: string
  name: string
}

export interface BookingEmailData {
  booking_id: string
  order_id?: string
  customer_name: string
  customer_email: string
  trip_title: string
  trip_destination: string
  start_date: string
  end_date: string
  participants_count: number
  total_amount: number
  equipment_items?: Array<{
    name: string
    quantity: number
    price_per_day: number
  }>
}

export class EmailService {
  private static FROM_EMAIL = 'Hilink Adventure <noreply@hilink-adventure.com>'
  
  // Send booking confirmation email
  static async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    try {
      const emailHtml = BookingConfirmationEmail({
        customerName: data.customer_name,
        bookingId: data.booking_id,
        tripTitle: data.trip_title,
        tripDestination: data.trip_destination,
        startDate: data.start_date,
        endDate: data.end_date,
        participantsCount: data.participants_count,
        totalAmount: data.total_amount,
        equipmentItems: data.equipment_items || []
      })

      const { error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [data.customer_email],
        subject: `Konfirmasi Booking - ${data.trip_title}`,
        html: emailHtml,
      })

      if (error) {
        console.error('Error sending booking confirmation email:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Booking confirmation email error:', error)
      return false
    }
  }

  // Send payment success email
  static async sendPaymentSuccess(data: BookingEmailData): Promise<boolean> {
    try {
      const emailHtml = PaymentSuccessEmail({
        customerName: data.customer_name,
        bookingId: data.booking_id,
        orderId: data.order_id || '',
        tripTitle: data.trip_title,
        tripDestination: data.trip_destination,
        startDate: data.start_date,
        endDate: data.end_date,
        participantsCount: data.participants_count,
        totalAmount: data.total_amount,
        equipmentItems: data.equipment_items || []
      })

      const { error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [data.customer_email],
        subject: `Pembayaran Berhasil - ${data.trip_title}`,
        html: emailHtml,
      })

      if (error) {
        console.error('Error sending payment success email:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Payment success email error:', error)
      return false
    }
  }

  // Send trip reminder email
  static async sendTripReminder(data: BookingEmailData, daysBefore: number = 3): Promise<boolean> {
    try {
      const emailHtml = TripReminderEmail({
        customerName: data.customer_name,
        bookingId: data.booking_id,
        tripTitle: data.trip_title,
        tripDestination: data.trip_destination,
        startDate: data.start_date,
        endDate: data.end_date,
        participantsCount: data.participants_count,
        daysBefore,
        equipmentItems: data.equipment_items || []
      })

      const { error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [data.customer_email],
        subject: `Pengingat Trip - ${data.trip_title} dalam ${daysBefore} hari`,
        html: emailHtml,
      })

      if (error) {
        console.error('Error sending trip reminder email:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Trip reminder email error:', error)
      return false
    }
  }

  // Send booking cancellation email
  static async sendBookingCancellation(data: BookingEmailData, reason?: string): Promise<boolean> {
    try {
      const refundInfo = data.total_amount > 0 
        ? `<p><strong>Informasi Refund:</strong><br/>Dana sebesar ${this.formatCurrency(data.total_amount)} akan dikembalikan dalam 3-7 hari kerja.</p>`
        : ''

      const reasonText = reason 
        ? `<p><strong>Alasan Pembatalan:</strong><br/>${reason}</p>`
        : ''

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pembatalan Booking</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; margin: 0;">Hilink Adventure</h1>
                <p style="color: #666; margin: 5px 0;">Pembatalan Booking</p>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #dc2626; margin-top: 0;">Booking Dibatalkan</h2>
                <p>Halo ${data.customer_name},</p>
                <p>Booking Anda dengan ID <strong>${data.booking_id}</strong> untuk trip <strong>${data.trip_title}</strong> telah dibatalkan.</p>
                
                ${reasonText}
                ${refundInfo}

                <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px;">
                  <h3 style="margin-top: 0; color: #374151;">Detail Trip:</h3>
                  <p><strong>Destinasi:</strong> ${data.trip_destination}</p>
                  <p><strong>Tanggal:</strong> ${this.formatDate(data.start_date)} - ${this.formatDate(data.end_date)}</p>
                  <p><strong>Peserta:</strong> ${data.participants_count} orang</p>
                  <p><strong>Total Biaya:</strong> ${this.formatCurrency(data.total_amount)}</p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #666; margin: 0;">Jika Anda memiliki pertanyaan, silakan hubungi customer service kami.</p>
                <p style="color: #666; margin: 5px 0;">
                  <strong>Email:</strong> support@hilink-adventure.com<br/>
                  <strong>WhatsApp:</strong> +62 812-3456-7890
                </p>
              </div>
            </div>
          </body>
        </html>
      `

      const { error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [data.customer_email],
        subject: `Pembatalan Booking - ${data.trip_title}`,
        html: emailHtml,
      })

      if (error) {
        console.error('Error sending cancellation email:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Cancellation email error:', error)
      return false
    }
  }

  // Send admin notification for new booking
  static async sendAdminBookingNotification(data: BookingEmailData): Promise<boolean> {
    try {
      const adminEmails = ['admin@hilink-adventure.com', 'booking@hilink-adventure.com']
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Booking Alert</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; margin: 0;">New Booking Alert</h1>
                <p style="color: #666; margin: 5px 0;">Hilink Adventure Admin</p>
              </div>

              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
                <h2 style="color: #0c4a6e; margin-top: 0;">Booking Baru</h2>
                <p><strong>Booking ID:</strong> ${data.booking_id}</p>
                <p><strong>Customer:</strong> ${data.customer_name} (${data.customer_email})</p>
                <p><strong>Trip:</strong> ${data.trip_title}</p>
                <p><strong>Destinasi:</strong> ${data.trip_destination}</p>
                <p><strong>Tanggal:</strong> ${this.formatDate(data.start_date)} - ${this.formatDate(data.end_date)}</p>
                <p><strong>Peserta:</strong> ${data.participants_count} orang</p>
                <p><strong>Total:</strong> ${this.formatCurrency(data.total_amount)}</p>
                
                ${data.equipment_items && data.equipment_items.length > 0 ? `
                  <div style="margin-top: 15px;">
                    <strong>Equipment:</strong>
                    <ul>
                      ${data.equipment_items.map(item => 
                        `<li>${item.name} (${item.quantity}x - ${this.formatCurrency(item.price_per_day)}/hari)</li>`
                      ).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                <div style="margin-top: 20px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${data.booking_id}" 
                     style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Lihat Detail Booking
                  </a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `

      const { error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: adminEmails,
        subject: `New Booking: ${data.trip_title} - ${data.customer_name}`,
        html: emailHtml,
      })

      if (error) {
        console.error('Error sending admin notification email:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Admin notification email error:', error)
      return false
    }
  }

  // Utility functions
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
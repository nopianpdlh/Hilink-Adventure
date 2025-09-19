interface BookingConfirmationEmailProps {
  customerName: string
  bookingId: string
  tripTitle: string
  tripDestination: string
  startDate: string
  endDate: string
  participantsCount: number
  totalAmount: number
  equipmentItems: Array<{
    name: string
    quantity: number
    price_per_day: number
  }>
}

export function BookingConfirmationEmail({
  customerName,
  bookingId,
  tripTitle,
  tripDestination,
  startDate,
  endDate,
  participantsCount,
  totalAmount,
  equipmentItems
}: BookingConfirmationEmailProps): string {
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Konfirmasi Booking</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; text-align: center; padding: 30px 20px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🏔️ Hilink Adventure</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Konfirmasi Booking</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                ✅ Booking Berhasil Dibuat
              </div>
            </div>

            <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">Halo ${customerName}!</h2>
            
            <p style="color: #6b7280; margin-bottom: 25px; font-size: 16px;">
              Terima kasih telah melakukan booking dengan kami. Berikut adalah detail booking Anda:
            </p>

            <!-- Booking Details Card -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                📋 Detail Booking
              </h3>
              
              <div style="grid: 1fr / 1fr; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-weight: 500;">ID Booking:</span>
                  <span style="color: #1f2937; font-weight: 600;">${bookingId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-weight: 500;">Trip:</span>
                  <span style="color: #1f2937; font-weight: 600;">${tripTitle}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-weight: 500;">Destinasi:</span>
                  <span style="color: #1f2937; font-weight: 600;">${tripDestination}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-weight: 500;">Tanggal:</span>
                  <span style="color: #1f2937; font-weight: 600;">${formatDate(startDate)} - ${formatDate(endDate)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-weight: 500;">Jumlah Peserta:</span>
                  <span style="color: #1f2937; font-weight: 600;">${participantsCount} orang</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0 0 0;">
                  <span style="color: #059669; font-weight: 600; font-size: 16px;">Total Biaya:</span>
                  <span style="color: #059669; font-weight: 700; font-size: 18px;">${formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            ${equipmentItems.length > 0 ? `
            <!-- Equipment Details -->
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                🎒 Peralatan Sewa
              </h3>
              
              ${equipmentItems.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #fbbf24;">
                  <div>
                    <span style="color: #92400e; font-weight: 600;">${item.name}</span>
                    <div style="color: #b45309; font-size: 14px;">Quantity: ${item.quantity} unit</div>
                  </div>
                  <span style="color: #92400e; font-weight: 600;">${formatCurrency(item.price_per_day)}/hari</span>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <!-- Status & Next Steps -->
            <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                ⏰ Status & Langkah Selanjutnya
              </h3>
              
              <div style="color: #1e3a8a; margin-bottom: 15px;">
                <strong>Status:</strong> Menunggu Pembayaran
              </div>
              
              <div style="color: #1e3a8a; margin-bottom: 20px;">
                <strong>Langkah selanjutnya:</strong>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li>Lakukan pembayaran melalui link yang telah dikirim</li>
                  <li>Setelah pembayaran berhasil, Anda akan menerima konfirmasi</li>
                  <li>Tim kami akan menghubungi Anda untuk persiapan trip</li>
                </ol>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px;">
                <strong style="color: #92400e;">⚠️ Penting:</strong>
                <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">
                  Silakan lakukan pembayaran dalam 24 jam untuk mengkonfirmasi booking Anda. 
                  Setelah batas waktu terlampaui, booking akan otomatis dibatalkan.
                </p>
              </div>
            </div>

            <!-- Contact Information -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center;">
              <h3 style="color: #475569; margin: 0 0 15px 0; font-size: 16px;">
                💬 Ada Pertanyaan?
              </h3>
              <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
                Tim customer service kami siap membantu Anda 24/7
              </p>
              <div style="color: #475569; font-size: 14px;">
                <strong>Email:</strong> support@hilink-adventure.com<br/>
                <strong>WhatsApp:</strong> +62 812-3456-7890
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #374151; color: white; text-align: center; padding: 20px;">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">
              © 2025 Hilink Adventure. Semua hak cipta dilindungi.
            </p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.6;">
              Jl. Petualangan No. 123, Jakarta Selatan 12345
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
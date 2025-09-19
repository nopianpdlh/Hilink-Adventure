interface PaymentSuccessEmailProps {
  customerName: string
  bookingId: string
  orderId: string
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

export function PaymentSuccessEmail({
  customerName,
  bookingId,
  orderId,
  tripTitle,
  tripDestination,
  startDate,
  endDate,
  participantsCount,
  totalAmount,
  equipmentItems
}: PaymentSuccessEmailProps): string {
  
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
        <title>Pembayaran Berhasil</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f0f9ff; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; text-align: center; padding: 30px 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Pembayaran Berhasil!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Hilink Adventure</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #dcfce7; color: #166534; padding: 10px 20px; border-radius: 25px; font-size: 16px; font-weight: 600;">
                🎉 Trip Anda Sudah Terkonfirmasi!
              </div>
            </div>

            <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">Selamat ${customerName}!</h2>
            
            <p style="color: #6b7280; margin-bottom: 25px; font-size: 16px;">
              Pembayaran Anda telah berhasil diproses. Trip <strong>${tripTitle}</strong> sudah dikonfirmasi 
              dan Anda akan segera menerima informasi lebih lanjut dari tim kami.
            </p>

            <!-- Payment Confirmation -->
            <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                💳 Konfirmasi Pembayaran
              </h3>
              
              <div style="grid: 1fr / 1fr; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bae6fd;">
                  <span style="color: #0369a1; font-weight: 500;">Order ID:</span>
                  <span style="color: #0c4a6e; font-weight: 600; font-family: monospace;">${orderId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bae6fd;">
                  <span style="color: #0369a1; font-weight: 500;">Booking ID:</span>
                  <span style="color: #0c4a6e; font-weight: 600;">${bookingId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bae6fd;">
                  <span style="color: #0369a1; font-weight: 500;">Status:</span>
                  <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 15px; font-size: 14px; font-weight: 600;">LUNAS</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0 0 0;">
                  <span style="color: #0ea5e9; font-weight: 600; font-size: 16px;">Total Dibayar:</span>
                  <span style="color: #0ea5e9; font-weight: 700; font-size: 20px;">${formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <!-- Trip Details -->
            <div style="background: #fefce8; border: 2px solid #eab308; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #a16207; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                🏔️ Detail Trip Anda
              </h3>
              
              <div style="grid: 1fr / 1fr; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fde68a;">
                  <span style="color: #92400e; font-weight: 500;">Trip:</span>
                  <span style="color: #a16207; font-weight: 600;">${tripTitle}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fde68a;">
                  <span style="color: #92400e; font-weight: 500;">Destinasi:</span>
                  <span style="color: #a16207; font-weight: 600;">${tripDestination}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fde68a;">
                  <span style="color: #92400e; font-weight: 500;">Tanggal:</span>
                  <span style="color: #a16207; font-weight: 600;">${formatDate(startDate)} - ${formatDate(endDate)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #92400e; font-weight: 500;">Jumlah Peserta:</span>
                  <span style="color: #a16207; font-weight: 600;">${participantsCount} orang</span>
                </div>
              </div>
            </div>

            ${equipmentItems.length > 0 ? `
            <!-- Equipment List -->
            <div style="background: #f3e8ff; border: 2px solid #a855f7; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #7c2d92; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                🎒 Peralatan Yang Disewa
              </h3>
              
              ${equipmentItems.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #d8b4fe;">
                  <div>
                    <span style="color: #7c2d92; font-weight: 600; display: block;">${item.name}</span>
                    <span style="color: #9333ea; font-size: 14px;">Quantity: ${item.quantity} unit</span>
                  </div>
                  <span style="color: #7c2d92; font-weight: 600;">${formatCurrency(item.price_per_day)}/hari</span>
                </div>
              `).join('')}
              
              <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 15px;">
                <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
                  <strong>📍 Catatan:</strong> Peralatan akan diberikan saat meetup sebelum keberangkatan
                </p>
              </div>
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                📋 Langkah Selanjutnya
              </h3>
              
              <div style="color: #065f46;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <div style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 14px;">1</div>
                  <div>
                    <strong>Persiapan Trip (H-7)</strong><br/>
                    <span style="font-size: 14px; color: #059669;">Tim kami akan menghubungi Anda untuk briefing persiapan dan koordinasi meetup</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <div style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 14px;">2</div>
                  <div>
                    <strong>Meetup & Equipment Check</strong><br/>
                    <span style="font-size: 14px; color: #059669;">Pengambilan peralatan sewa dan final briefing sebelum keberangkatan</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start;">
                  <div style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 14px;">3</div>
                  <div>
                    <strong>Trip Day - Have Fun!</strong><br/>
                    <span style="font-size: 14px; color: #059669;">Nikmati petualangan Anda bersama tim Hilink Adventure</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Important Notes -->
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">
                ⚠️ Hal Penting yang Perlu Diperhatikan:
              </h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Simpan email ini sebagai bukti pembayaran</li>
                <li>Pastikan nomor telepon aktif untuk koordinasi</li>
                <li>Siapkan dokumen identitas (KTP/Passport)</li>
                <li>Ikuti briefing persiapan yang akan diberikan tim kami</li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center;">
              <h3 style="color: #475569; margin: 0 0 15px 0; font-size: 16px;">
                💬 Butuh Bantuan?
              </h3>
              <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
                Tim customer service kami siap membantu Anda
              </p>
              <div style="color: #475569; font-size: 14px;">
                <strong>Email:</strong> support@hilink-adventure.com<br/>
                <strong>WhatsApp:</strong> +62 812-3456-7890<br/>
                <strong>Instagram:</strong> @hilink.adventure
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #1f2937; color: white; text-align: center; padding: 25px 20px;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              Terima kasih telah mempercayai Hilink Adventure! 🙏
            </p>
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
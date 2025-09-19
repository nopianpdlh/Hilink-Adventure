interface TripReminderEmailProps {
  customerName: string
  bookingId: string
  tripTitle: string
  tripDestination: string
  startDate: string
  endDate: string
  participantsCount: number
  daysBefore: number
  equipmentItems: Array<{
    name: string
    quantity: number
    price_per_day: number
  }>
}

export function TripReminderEmail({
  customerName,
  bookingId,
  tripTitle,
  tripDestination,
  startDate,
  endDate,
  participantsCount,
  daysBefore,
  equipmentItems
}: TripReminderEmailProps): string {
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pengingat Trip</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #fef7cd; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; text-align: center; padding: 30px 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Pengingat Trip!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
              ${daysBefore} hari lagi menuju petualangan
            </p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #fef3c7; color: #92400e; padding: 12px 24px; border-radius: 25px; font-size: 18px; font-weight: 600; border: 2px solid #f59e0b;">
                🎯 Trip dalam ${daysBefore} hari!
              </div>
            </div>

            <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 22px;">Halo ${customerName}!</h2>
            
            <p style="color: #6b7280; margin-bottom: 25px; font-size: 16px;">
              Waktunya sudah dekat! Trip <strong>${tripTitle}</strong> akan dimulai dalam <strong>${daysBefore} hari</strong>. 
              Pastikan Anda sudah siap dengan semua persiapan yang diperlukan.
            </p>

            <!-- Countdown -->
            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border-radius: 15px; padding: 25px; margin-bottom: 25px; text-align: center;">
              <h3 style="margin: 0 0 10px 0; font-size: 20px;">⏳ Countdown</h3>
              <div style="font-size: 36px; font-weight: bold; margin: 10px 0;">
                ${daysBefore} HARI
              </div>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">
                Menuju petualangan tak terlupakan!
              </p>
            </div>

            <!-- Trip Details -->
            <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                📍 Detail Trip Anda
              </h3>
              
              <div style="grid: 1fr / 1fr; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bae6fd;">
                  <span style="color: #0369a1; font-weight: 500;">Booking ID:</span>
                  <span style="color: #0c4a6e; font-weight: 600;">${bookingId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bae6fd;">
                  <span style="color: #0369a1; font-weight: 500;">Trip:</span>
                  <span style="color: #0c4a6e; font-weight: 600;">${tripTitle}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bae6fd;">
                  <span style="color: #0369a1; font-weight: 500;">Destinasi:</span>
                  <span style="color: #0c4a6e; font-weight: 600;">${tripDestination}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bae6fd;">
                  <span style="color: #0369a1; font-weight: 500;">Tanggal:</span>
                  <span style="color: #0c4a6e; font-weight: 600;">${formatDate(startDate)} - ${formatDate(endDate)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #0369a1; font-weight: 500;">Peserta:</span>
                  <span style="color: #0c4a6e; font-weight: 600;">${participantsCount} orang</span>
                </div>
              </div>
            </div>

            <!-- Preparation Checklist -->
            <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                ✅ Checklist Persiapan
              </h3>
              
              <div style="color: #065f46;">
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #10b981; font-size: 16px; margin-right: 8px;">☐</span>
                  <span>Dokumen identitas (KTP/Passport) - <strong>WAJIB</strong></span>
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #10b981; font-size: 16px; margin-right: 8px;">☐</span>
                  <span>Pakaian sesuai cuaca dan aktivitas</span>
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #10b981; font-size: 16px; margin-right: 8px;">☐</span>
                  <span>Obat-obatan personal (jika ada)</span>
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #10b981; font-size: 16px; margin-right: 8px;">☐</span>
                  <span>Kamera untuk dokumentasi</span>
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #10b981; font-size: 16px; margin-right: 8px;">☐</span>
                  <span>Power bank dan charger</span>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #10b981; font-size: 16px; margin-right: 8px;">☐</span>
                  <span>Semangat petualangan! 🔥</span>
                </div>
              </div>
            </div>

            ${equipmentItems.length > 0 ? `
            <!-- Equipment Reminder -->
            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                🎒 Peralatan Sewa Anda
              </h3>
              
              <p style="color: #92400e; margin: 0 0 15px 0; font-size: 14px;">
                Berikut adalah peralatan yang telah Anda sewa dan akan diberikan saat meetup:
              </p>
              
              ${equipmentItems.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #fbbf24;">
                  <div>
                    <span style="color: #92400e; font-weight: 600; display: block;">${item.name}</span>
                    <span style="color: #b45309; font-size: 14px;">Quantity: ${item.quantity} unit</span>
                  </div>
                  <span style="color: #92400e; font-size: 14px;">✅</span>
                </div>
              `).join('')}
              
              <div style="background: #fff7ed; border-radius: 8px; padding: 15px; margin-top: 15px;">
                <p style="color: #c2410c; margin: 0; font-size: 14px; text-align: center;">
                  <strong>📌 Catatan:</strong> Peralatan akan diperiksa kondisinya saat meetup. 
                  Pastikan Anda hadir tepat waktu!
                </p>
              </div>
            </div>
            ` : ''}

            <!-- Weather & Tips -->
            <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                🌤️ Tips Persiapan
              </h3>
              
              <div style="color: #4b5563; font-size: 14px;">
                <div style="margin-bottom: 10px;">
                  <strong>🌡️ Cuaca:</strong> Cek prakiraan cuaca terkini untuk destinasi ${tripDestination}
                </div>
                <div style="margin-bottom: 10px;">
                  <strong>💪 Kondisi Fisik:</strong> Istirahat yang cukup dan jaga kondisi kesehatan
                </div>
                <div style="margin-bottom: 10px;">
                  <strong>📱 Komunikasi:</strong> Pastikan nomor telepon aktif untuk koordinasi
                </div>
                <div>
                  <strong>🎯 Mindset:</strong> Siapkan mental untuk petualangan yang menantang dan menyenangkan!
                </div>
              </div>
            </div>

            <!-- Important Reminder -->
            <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h4 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px;">
                🚨 Pengingat Penting:
              </h4>
              <ul style="color: #dc2626; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Tim kami akan menghubungi Anda H-2 untuk koordinasi meetup</li>
                <li>Jika ada perubahan jadwal mendadak, akan ada notifikasi</li>
                <li>Hubungi kami segera jika ada kendala atau pertanyaan</li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center;">
              <h3 style="color: #475569; margin: 0 0 15px 0; font-size: 16px;">
                📞 Kontak Darurat
              </h3>
              <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">
                Untuk koordinasi dan pertanyaan terkait trip
              </p>
              <div style="color: #475569; font-size: 14px; font-weight: 600;">
                <div style="margin-bottom: 8px;">
                  📧 support@hilink-adventure.com
                </div>
                <div style="margin-bottom: 8px;">
                  📱 +62 812-3456-7890 (WhatsApp)
                </div>
                <div>
                  📸 @hilink.adventure (Instagram)
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #1f2937; color: white; text-align: center; padding: 25px 20px;">
            <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
              Siap untuk petualangan yang tak terlupakan? 🏔️
            </p>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">
              © 2025 Hilink Adventure - Adventure is calling, will you answer?
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
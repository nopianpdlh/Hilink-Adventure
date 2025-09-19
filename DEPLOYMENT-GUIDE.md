# 🚀 DEPLOYMENT GUIDE - HiLink Adventure

## 📋 Pre-Deployment Requirements

### 1. **Midtrans Account Setup**
```bash
# 1. Create Midtrans Account
# Visit: https://dashboard.midtrans.com/
# Sign up for new account

# 2. Get API Keys (Sandbox for testing)
# Dashboard > Settings > Access Keys
# Copy Server Key & Client Key
```

### 2. **Resend Email Setup**
```bash
# 1. Create Resend Account  
# Visit: https://resend.com/
# Sign up for free account (1000 emails/month)

# 2. Get API Key
# Dashboard > API Keys > Create API Key
```

### 3. **Supabase Database Setup**
```bash
# Database sudah ada, tapi needs migration
# We need to run the SQL migration
```

## ⚡ **STEP-BY-STEP DEPLOYMENT**

### **STEP 1: Environment Configuration**

Update your `.env.local` file:

```env
# Existing Supabase config (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_existing_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_key

# NEW: Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY_HERE
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY_HERE
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_MERCHANT_ID=YOUR_MERCHANT_ID

# NEW: App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NEW: Email Configuration
RESEND_API_KEY=re_YOUR_RESEND_API_KEY_HERE
```

### **STEP 2: Database Migration**

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in sidebar
   - Click "New Query"

2. **Run Migration Script**
   - Copy entire contents dari `database-payment-schema.sql`
   - Paste into SQL Editor  
   - Click "Run" button
   - Should see success message

3. **Verify Tables Created**
   ```sql
   -- Run this to verify tables exist:
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('payment_transactions', 'equipment_holds', 'equipment_bookings');
   ```

### **STEP 3: Install Dependencies**

```bash
# Install new dependencies
npm install midtrans-client resend zod
```

### **STEP 4: Start Development Server**

```bash
# Start the server
npm run dev
```

## 🧪 **TESTING GUIDE**

### **Test 1: Equipment Rental Flow**

1. **Open Equipment Page**
   - Navigate ke `/` (home page)
   - Scroll to equipment rental section
   - Should see equipment list

2. **Test Equipment Hold**
   - Click "Rent" pada any equipment
   - Should create 15-minute hold
   - Equipment stock should decrease immediately

3. **Test Booking Creation**
   - Select trip dates
   - Add equipment to cart
   - Click "Confirm Booking"
   - Should redirect ke payment

### **Test 2: Payment Flow**

1. **Payment Token Generation**
   - Should see Midtrans payment popup
   - In sandbox mode, use test credit card:
     - Card Number: `4811 1111 1111 1114`
     - CVV: `123`
     - Exp: `01/25`

2. **Test Payment Success**
   - Complete payment in popup
   - Should redirect ke `/payment/status?order_id=xxx`
   - Should show success message

3. **Test Email Notifications**
   - Check email for booking confirmation
   - Should receive professional email dengan trip details

### **Test 3: Status Pages**

1. **Success Page**
   - Visit `/payment/status?order_id=ORDER_123&transaction_status=settlement`
   - Should show beautiful success page

2. **Error Page**  
   - Visit `/payment/error?order_id=ORDER_123`
   - Should show error page dengan retry options

3. **Pending Page**
   - Visit `/payment/pending?order_id=ORDER_123`
   - Should show pending page dengan auto-refresh

## 🔧 **MIDTRANS WEBHOOK SETUP**

### **1. Local Development (ngrok)**
```bash
# Install ngrok for local webhook testing
npm install -g ngrok

# Start ngrok tunnel  
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

### **2. Configure Webhook URL**
- Midtrans Dashboard > Settings > Configuration
- Set Notification URL: `https://abc123.ngrok.io/api/payment/webhook`
- Set Finish URL: `https://abc123.ngrok.io/payment/status`
- Set Error URL: `https://abc123.ngrok.io/payment/error` 
- Set Pending URL: `https://abc123.ngrok.io/payment/pending`

## 📧 **EMAIL TEMPLATE CUSTOMIZATION**

Update email templates dengan your company info:

```typescript
// src/lib/emails/booking-confirmation.ts
// Update company name, logo, contact info

const companyInfo = {
  name: "HiLink Adventure", // Your company name
  logo: "https://yourdomain.com/logo.png", // Your logo URL
  phone: "+62-XXX-XXXX-XXXX", // Your phone  
  email: "info@hilink-adventure.com", // Your email
  website: "https://hilink-adventure.com" // Your website
};
```

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **1. Payment Token Error**
```
Error: Unable to create Snap token
```
**Solution:**
- Check Midtrans API keys in `.env.local`
- Verify server key starts dengan `SB-Mid-server-`
- Check if Midtrans account is active

#### **2. Database Error** 
```
Error: relation "payment_transactions" does not exist
```
**Solution:**
- Run the migration script dalam Supabase SQL Editor
- Verify tables were created successfully
- Check Supabase connection

#### **3. Email Not Sending**
```
Error: Resend API key invalid
```
**Solution:**
- Verify Resend API key dalam `.env.local`
- Check Resend account is active
- Verify domain verification (for production)

#### **4. Webhook Not Working**
```
Webhook signature verification failed
```
**Solution:**
- Check webhook URL in Midtrans dashboard
- Verify ngrok tunnel is active (development)
- Check server key matches in webhook handler

## 🎯 **PRODUCTION DEPLOYMENT**

### **Vercel Deployment**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Complete payment integration"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect GitHub repo ke Vercel
   - Add environment variables dalam Vercel dashboard
   - Deploy application

3. **Update Webhook URLs**
   - Replace ngrok URLs dengan production domain
   - Update Midtrans configuration

### **Production Environment Variables**
```env
# Production Midtrans (after approval)
MIDTRANS_SERVER_KEY=Mid-server-YOUR_PROD_KEY
MIDTRANS_CLIENT_KEY=Mid-client-YOUR_PROD_KEY  
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## ✅ **FINAL CHECKLIST**

Before going live:

- [ ] Database migration completed
- [ ] Midtrans sandbox testing passed
- [ ] Email notifications working  
- [ ] All payment flows tested
- [ ] Webhook configured dan tested
- [ ] Environment variables set
- [ ] Error handling tested
- [ ] Mobile responsiveness verified
- [ ] Performance tested
- [ ] Security review completed

---

## 🎉 **YOU'RE READY TO LAUNCH!**

Dengan implementasi ini, HiLink Adventure now has:
- ✅ Complete payment processing
- ✅ Professional booking workflow  
- ✅ Automated inventory management
- ✅ Beautiful customer communications
- ✅ Real-time status tracking

**Time to make real money! 💰🏔️**

---

*Need help? Contact development team untuk additional support!*
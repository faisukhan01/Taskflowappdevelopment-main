# Authentication Setup Guide

This guide will help you set up Google OAuth and WhatsApp OTP authentication for your TaskFlow application.

## Prerequisites

1. A Supabase project (already configured)
2. Access to your Supabase dashboard

## 1. Google OAuth Setup

### Step 1: Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** and click **Enable**

### Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - For local development: `http://localhost:3000/auth/callback`

### Step 3: Configure Supabase with Google Credentials

1. Copy the **Client ID** and **Client Secret** from Google Cloud Console
2. In Supabase Dashboard, paste them in the Google provider settings
3. Save the configuration

## 2. WhatsApp OTP Setup

### Step 1: Enable Phone Authentication in Supabase

1. In your Supabase Dashboard, go to **Authentication** > **Settings**
2. Scroll down to **Phone Auth**
3. Enable **Enable phone confirmations**

### Step 2: Configure SMS/WhatsApp Provider

Supabase supports multiple SMS providers. For WhatsApp OTP, you have several options:

#### Option A: Twilio (Recommended)
1. Create a [Twilio account](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. In Supabase Dashboard, go to **Authentication** > **Settings** > **SMS**
4. Select **Twilio** as provider
5. Enter your Twilio credentials
6. Configure WhatsApp messaging in your Twilio console

#### Option B: MessageBird
1. Create a [MessageBird account](https://www.messagebird.com/)
2. Get your API key
3. Configure in Supabase SMS settings

#### Option C: Textlocal
1. Create a [Textlocal account](https://www.textlocal.com/)
2. Get your API key and sender
3. Configure in Supabase SMS settings

### Step 3: Test Phone Authentication

1. Make sure your phone number is in international format (+1234567890)
2. Test the OTP flow in your application
3. Check Supabase logs for any issues

## 3. Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:3000
```

## 4. Testing the Authentication

### Google OAuth Testing
1. Click "Sign in with Google" button
2. Complete Google OAuth flow
3. Should redirect to `/app/dashboard`

### WhatsApp OTP Testing
1. Click "Sign in with WhatsApp" button
2. Enter your phone number
3. Check WhatsApp for OTP code
4. Enter the 6-digit code
5. Should redirect to `/app/dashboard`

## 5. Production Deployment

### For Google OAuth:
- Update authorized redirect URIs in Google Cloud Console
- Add your production domain: `https://yourdomain.com/auth/callback`

### For WhatsApp OTP:
- Ensure your SMS provider is configured for production
- Test with real phone numbers
- Monitor SMS delivery rates

## 6. Troubleshooting

### Common Issues:

1. **Google OAuth not working:**
   - Check redirect URIs match exactly
   - Ensure Google+ API is enabled
   - Verify client ID and secret are correct

2. **WhatsApp OTP not received:**
   - Check phone number format (+country code)
   - Verify SMS provider configuration
   - Check Supabase logs for errors
   - Ensure sufficient SMS credits

3. **Redirect issues:**
   - Check environment variables
   - Verify redirect URLs in provider settings
   - Test with different browsers

### Debug Steps:
1. Check browser console for errors
2. Review Supabase Auth logs
3. Test with different phone numbers/email addresses
4. Verify all environment variables are set correctly

## 7. Security Considerations

- Always use HTTPS in production
- Keep API keys and secrets secure
- Implement rate limiting for OTP requests
- Monitor authentication logs for suspicious activity
- Use strong session management

## Support

If you encounter issues:
1. Check Supabase documentation
2. Review provider-specific documentation (Twilio, Google, etc.)
3. Check the application logs
4. Test in incognito/private browsing mode
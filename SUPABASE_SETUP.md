# Supabase Setup Guide for FurnituraHub

This guide will help you set up Supabase for authentication and comments system.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Project Name**: FurnituraHub
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait for the project to initialize (~2 minutes)

## 2. Apply Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste into the SQL editor
5. Click "Run" or press Ctrl/Cmd + Enter
6. Verify: You should see "Success. No rows returned" message

## 3. Configure Authentication Providers

### Email/Password Authentication (Already Enabled)

Email authentication is enabled by default. No additional configuration needed.

### Magic Link Authentication

1. Go to **Authentication > Providers**
2. Find "Email" provider
3. Enable "Confirm email" toggle
4. Set "Mailer templates" for magic link (optional customization)
5. Save changes

### Google OAuth

1. Go to **Authentication > Providers**
2. Find "Google" and click to expand
3. Toggle "Enable Google provider" to ON
4. You'll need Google OAuth credentials:

#### Get Google OAuth Credentials:

a. Go to [Google Cloud Console](https://console.cloud.google.com)
b. Create a new project or select existing
c. Enable "Google+ API" for your project
d. Go to "Credentials" in the sidebar
e. Click "Create Credentials" > "OAuth client ID"
f. Choose "Web application"
g. Add authorized redirect URIs:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Replace YOUR_SUPABASE_PROJECT_REF with your actual project reference)
h. Copy the **Client ID** and **Client Secret**

5. Back in Supabase, paste:
   - **Client ID** from Google
   - **Client Secret** from Google
6. Click "Save"

## 4. Get Your API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll need two values:

   - **Project URL**: `https://YOUR_PROJECT_REF.supabase.co`
   - **anon/public key**: Long string starting with "eyJ..."

4. Copy these values - you'll need them for `.env` file

## 5. Create .env File

Create a `.env` file in the root of your project (same level as `package.json`):

```env
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace:
- `YOUR_PROJECT_REF` with your actual project reference
- `your-anon-key-here` with your actual anon key

**Important**: Add `.env` to your `.gitignore` to keep keys secret!

## 6. Storage Configuration

The SQL schema already created the `avatars` bucket with proper policies.

To verify:
1. Go to **Storage** in Supabase dashboard
2. You should see an "avatars" bucket
3. It should be marked as "Public"

## 7. Set Up Your First Admin User

After you sign up your first user on the website:

1. Go to **Authentication > Users** in Supabase dashboard
2. Find your user in the list
3. Go to **Table Editor > profiles**
4. Find your profile row
5. Edit the row and set `is_admin` to `true`
6. Save

Now you have admin privileges and can access `/admin/comments` and `/admin/users` pages.

## 8. Test Your Setup

1. Start your dev server: `npm run dev`
2. Try to:
   - Register a new account
   - Login with email/password
   - Login with magic link
   - Login with Google
   - Post a comment
   - Edit your profile

## 9. Security Checklist

- ✅ RLS (Row Level Security) is enabled on all tables
- ✅ Only authenticated users can create comments
- ✅ Banned users cannot post
- ✅ Users can only edit their own content (with time limit)
- ✅ Admins have special permissions
- ✅ Avatars are stored securely with proper policies
- ✅ `.env` file is in `.gitignore`

## 10. Optional: Email Templates Customization

1. Go to **Authentication > Email Templates**
2. Customize:
   - Confirm signup
   - Invite user
   - Magic link
   - Change email address
   - Reset password

You can use HTML and variables like `{{ .ConfirmationURL }}`, `{{ .Token }}`, etc.

## 11. Useful SQL Queries for Testing

### Check all profiles:
```sql
SELECT * FROM profiles;
```

### Check all comments:
```sql
SELECT * FROM comments;
```

### Get pending comments count:
```sql
SELECT COUNT(*) FROM comments WHERE is_approved = false AND is_deleted = false;
```

### Make a user admin:
```sql
UPDATE profiles SET is_admin = true WHERE username = 'your_username';
```

### Ban a user:
```sql
UPDATE profiles SET is_banned = true WHERE username = 'spam_user';
```

## 12. Production Considerations

Before going to production:

1. **Email Service**: Configure custom SMTP in **Project Settings > Auth**
2. **Domain**: Set up custom domain in **Project Settings > Custom Domains**
3. **Rate Limiting**: Configure in **Project Settings > Auth > Rate Limits**
4. **Database Backups**: Enable automatic backups in **Settings > Database**
5. **Environment Variables**: Use production keys on your hosting platform

## Troubleshooting

### "Invalid API key" error
- Check that `.env` keys match your Supabase dashboard
- Restart dev server after changing `.env`

### "User not found" after signup
- Check if the `handle_new_user()` trigger is active
- Verify in **Database > Functions** section

### Comments not showing
- Check if `is_approved = true` in database
- Make yourself admin to see all comments

### OAuth not working
- Verify redirect URIs in Google Console match Supabase URL exactly
- Check that provider is enabled in Supabase dashboard

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)


# Supabase Setup Guide for Newsletter Builder

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `newsletter-builder`
   - Database password: (save this somewhere safe)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for setup

## 2. Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **anon public** key (safe to use in frontend)

## 3. Create Environment File

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Run the Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy the contents of `supabase/schema.sql` and paste it
4. Click "Run" to execute

This creates:
- `profiles` table (user profiles)
- `newsletters` table (newsletter data)
- `templates` table (shared templates)
- `media` table (uploaded images)
- `newsletter_history` table (versioning)
- Row Level Security (RLS) policies
- Automatic triggers

## 5. Set Up Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click "New bucket"
3. Create bucket:
   - Name: `newsletter-images`
   - Public: ✅ Yes (for public image URLs)
4. Click on the bucket → **Policies** → **New Policy**
5. Add these policies:

### For INSERT (Upload):
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'newsletter-images');
```

### For SELECT (View):
```sql
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'newsletter-images');
```

### For DELETE:
```sql
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'newsletter-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 6. Configure Authentication (Optional)

### Enable Google OAuth:
1. Go to **Authentication** → **Providers**
2. Enable Google
3. Add your Google OAuth credentials
4. Set redirect URL in Google Console

### Enable GitHub OAuth:
1. Go to **Authentication** → **Providers**
2. Enable GitHub
3. Create GitHub OAuth App
4. Add credentials

### Email Settings:
1. Go to **Authentication** → **Email Templates**
2. Customize confirmation and reset emails
3. Configure SMTP for production (Settings → Auth → SMTP Settings)

## 7. Test Your Setup

1. Start the dev server:
```bash
npm run dev
```

2. Open the app and try:
   - Sign up with email
   - Create a newsletter
   - Upload an image
   - Check Supabase dashboard for data

## Troubleshooting

### "Supabase is not configured" error
- Check that `.env` file exists and has correct values
- Restart the dev server after adding `.env`

### "Permission denied" errors
- Check RLS policies in SQL Editor
- Verify user is authenticated
- Check bucket policies for storage

### Images not uploading
- Verify storage bucket exists and is public
- Check bucket policies
- Ensure file size is under 50MB

### Auth not working
- Check email confirmation is disabled for testing (Auth → Settings)
- Verify OAuth redirect URLs match your domain

## Production Deployment

1. Add environment variables to your hosting platform (Vercel, Netlify, etc.)
2. Update OAuth redirect URLs for production domain
3. Enable email confirmation
4. Consider enabling RLS bypass for service role operations

## Database Backup

Supabase provides daily backups on paid plans. For free tier:
1. Use `pg_dump` via Supabase CLI
2. Or export data manually via SQL Editor

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Dump database
supabase db dump -f backup.sql
```



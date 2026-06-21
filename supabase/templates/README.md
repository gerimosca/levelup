# Email Templates

Custom email templates with i18n support (English/Spanish) for Supabase Auth.

## Templates Included

| File | Purpose | Dashboard Location |
|------|---------|-------------------|
| `confirmation.html` | Email verification after signup | Confirm signup |
| `magic-link.html` | Passwordless login link | Magic Link |
| `recovery.html` | Password reset | Reset Password |
| `email-change.html` | Email address change confirmation | Change Email Address |

## Setup for Production

These templates work automatically for local development (with `supabase start`), but for **production** you need to configure them manually:

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication → Email Templates**
3. For each template type, copy the HTML content from the corresponding file and paste it into the "Body" field

## Features

- **i18n Support**: Templates detect user locale from `user_metadata.locale` and show content in English or Spanish
- **Modern Design**: Gradient header, rounded corners, shadows
- **Friendly Copy**: Warm, conversational text instead of generic messages
- **Brand Colors**: Uses primary purple (#7c3aed) matching the boilerplate theme

## How i18n Works

The templates use Go template conditionals:

```html
{{ if eq .Data.locale "es" }}
  <!-- Spanish content -->
{{ else }}
  <!-- English content -->
{{ end }}
```

The locale is passed to Supabase via `user_metadata` during:
- **Signup** (`signUp` with `data.locale`)
- **Magic Link** (`signInWithOtp` with `data.locale`)

**Note**: Password reset emails don't receive new `data`, so they default to English. The user's locale is stored in their profile and could be fetched via a database function if needed.

## Customization

### Changing Brand Name
Replace `AI SaaS` with your product name in all templates.

### Changing Colors
The primary color is `#7c3aed` (purple). Search and replace to match your brand:
- Header gradient: `#7c3aed` → `#a78bfa`
- Button gradient: same
- Shadow: `rgba(124, 58, 237, ...)`

### Adding Languages
Add more conditionals for additional languages:

```html
{{ if eq .Data.locale "es" }}
  Spanish
{{ else if eq .Data.locale "fr" }}
  French
{{ else }}
  English (default)
{{ end }}
```

## Testing Locally

With Supabase CLI:

```bash
supabase start
```

The templates in this folder will be used automatically when `config.toml` references them.

## Available Template Variables

- `{{ .ConfirmationURL }}` - The action link
- `{{ .Token }}` - OTP token (if applicable)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your app URL
- `{{ .Data }}` - User metadata (including `locale`)
- `{{ now.Format "2006" }}` - Current year

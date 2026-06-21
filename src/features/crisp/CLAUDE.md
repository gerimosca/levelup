# Crisp Customer Support Feature

## Overview
Integrates Crisp.chat for customer support, allowing real-time chat with visitors and users.

## Configuration

### Environment Variables
- `NEXT_PUBLIC_CRISP_WEBSITE_ID`: Your Crisp website ID (required for Crisp to work)

### Admin Settings
Settings stored in `app_settings` table with key `crisp_settings`:
- `enabled`: Boolean - Whether Crisp is enabled globally
- `scope`: 'all' | 'authenticated' | 'unauthenticated' - Where to show Crisp
- `hideOnMobile`: Boolean - Hide chat widget on mobile devices
- `position`: 'left' | 'right' - Chat widget position
- `locale`: 'auto' | string - Language setting (auto detects from app locale)

## Components

### CrispProvider
Server component that:
- Checks if Crisp is enabled in settings
- Determines if current user should see Crisp based on scope
- Passes configuration to client component

### CrispChat
Client component that:
- Loads Crisp SDK
- Configures user data for authenticated users
- Handles visibility based on settings

### CrispSettings (Admin)
Admin panel component for configuring Crisp settings.

## Implementation Details

### User Data Sync
When a user is authenticated, we automatically sync:
- Email
- Name (if available)
- User ID (as custom data)
- Subscription status (as segment)

### Scope Logic
- `all`: Shows for everyone (home, app, authenticated, unauthenticated)
- `authenticated`: Only shows for logged-in users
- `unauthenticated`: Only shows for visitors (marketing pages)
- `subscribers_only`: Only shows for users with active paid subscriptions (includes trialing)

### Performance
- Script loads asynchronously
- Only loads when enabled and user matches scope
- Minimal impact on initial page load

## Security Considerations
- Website ID is public (safe to expose)
- User data sync only happens for authenticated users
- No sensitive data is sent to Crisp

## Testing Checklist
- [ ] Crisp loads when enabled
- [ ] Scope settings work correctly
- [ ] User data syncs for authenticated users
- [ ] Position setting changes widget location
- [ ] Mobile visibility setting works
- [ ] Disable from admin removes widget
- [ ] subscribers_only scope shows only for users with active/trial subscriptions
- [ ] subscribers_only scope hides for users without subscriptions
- [ ] subscribers_only scope hides for unauthenticated users
# North Investors Profit Wallet

## Current State
The Settings panel (SettingsPanel.tsx) is fully built with 8 sections: Account, Security, Notifications, Privacy, Blockchain & Wallet, Coinbase Integration, Appearance, and About. All sections have interactive elements (toggles, buttons, dialogs). However:
- The `gmail` prop is never passed to the Settings panel -- it shows "Not linked" even after login
- `onOpenSupportChat` is not wired to SettingsPanel, so the Contact Support button in About section doesn't work
- The `Dashboard` component doesn't have a `gmail` prop in its interface
- The main `App` component loads the user profile but discards the `gmail` field from the response

## Requested Changes (Diff)

### Add
- `gmail` state (`useState<string | null>`) to the main `App` component
- `gmail` prop to `Dashboard` component interface
- `onOpenSupportChat` prop to `Dashboard` component interface

### Modify
- Profile loading effect in `App`: also call `setUserGmail(profile.gmail)` when profile is loaded
- `handleCreateAccountSubmit` in `App`: store `gmail` in state after account creation
- `handleLogout` in `App`: reset `userGmail` to null
- `Dashboard` component: accept and forward `gmail` and `onOpenSupportChat` props to `SettingsPanel`
- `App` render: pass `gmail={userGmail ?? ""}` and `onOpenSupportChat` to `<Dashboard>`
- `SupportChat` component wiring: expose a way to open it from Dashboard

### Remove
- Nothing removed

## Implementation Plan
1. In `App.tsx`, add `const [userGmail, setUserGmail] = useState<string | null>(null)`
2. In profile load effect, set `setUserGmail(profile.gmail)` when profile exists
3. In `handleCreateAccountSubmit`, set `setUserGmail(gmail)` after success
4. In `handleLogout`, set `setUserGmail(null)`
5. Add `gmail` and `onOpenSupportChat` to `Dashboard` component props
6. Pass `gmail` and `onOpenSupportChat` from `Dashboard` to `SettingsPanel`
7. In `App` render, pass `gmail={userGmail ?? ""}` and `onOpenSupportChat` to `<Dashboard>`
8. For SupportChat, use a ref-based or state-lifting approach to let Dashboard trigger it

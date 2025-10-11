# Channel Manager - Where to Find It

## 📍 Location in Frontend

### Desktop Sidebar

The **Channel Manager** menu item is now visible in the left sidebar under the **"Management"** section:

```
┌─ Main Navigation ─────────────┐
│ 📊 Dashboard                  │
│ 👥 Guests                     │
│ 🏠 Dormitories                │
│ 🛏️  Beds                      │
│ 🏢 Properties                 │
│ 🛏️  Rooms (expandable)        │
│ 📅 Reservations (expandable)  │
└───────────────────────────────┘

┌─ MANAGEMENT ──────────────────┐
│ 🌐 Channel Manager     ← NEW! │
│ 💳 Payments                   │
│ 📄 Invoices                   │
│ 📊 Reports                    │
│ 👤 Staff                      │
│ ⚙️  Settings                  │
└───────────────────────────────┘

┌─ Bottom Navigation ───────────┐
│ ❓ Get Help                   │
│ 🔍 Search                     │
└───────────────────────────────┘
```

### Mobile Sidebar

The same menu structure appears in the mobile sidebar (hamburger menu).

---

## 🌐 Channel Manager Pages

### 1. Overview Page

**URL**: `/dashboard/aiosell`

**What You'll See:**

- 📊 Stats cards showing:
  - Connected Properties count
  - Auto Sync status
  - Connected OTAs count
- 📋 Table of all properties with hotel codes
- ✅ Sync status indicators (Healthy/Issues)
- 🔄 "Full Sync" button for each property
- 🔗 Quick links to sync logs

### 2. Sync Logs Page

**URL**: `/dashboard/aiosell/logs`

**What You'll See:**

- 🔍 Filters for:
  - Sync Type (Inventory, Rates, Booking, Restrictions)
  - Status (Success, Failed, Pending)
  - Direction (Inbound, Outbound)
- 📋 Detailed logs table with:
  - Timestamp
  - Property name
  - Sync type badge
  - Direction indicator (↙️ Inbound / ↗️ Outbound)
  - Status badge
  - "View" button for full details
- 🔄 Refresh button

---

## 🎯 How to Access

### For SUPER_ADMIN and PROPERTY_MANAGER:

1. **Login** to the dashboard
2. **Look at the left sidebar** under "MANAGEMENT" section
3. **Click "Channel Manager"** (Globe icon 🌐)
4. You're now at the Aiosell overview!

### Quick Links:

From anywhere in the app:

- Direct URL: `http://localhost:3000/dashboard/aiosell`
- Logs: `http://localhost:3000/dashboard/aiosell/logs`

---

## 🔐 Permissions Required

**To see Channel Manager menu:**

- Role: `SUPER_ADMIN` or `PROPERTY_MANAGER`
- Permission: `aiosell:view-logs`

**If you don't see it:**

- Check your user role
- Verify `aiosell:view-logs` permission is granted
- Contact your system administrator

---

## ✨ What's Available

### From Overview Page:

1. ✅ View all properties connected to Aiosell
2. ✅ See hotel codes for each property
3. ✅ Check sync health status
4. ✅ Trigger manual full sync (12 months)
5. ✅ Navigate to detailed sync logs

### From Sync Logs Page:

1. ✅ View all synchronization operations
2. ✅ Filter by type, status, direction
3. ✅ See detailed error messages
4. ✅ Inspect full API payloads
5. ✅ Monitor retry counts

---

## 🚀 Quick Actions Available

From the sidebar "Channel Manager" menu:

**Overview** (default):

- See connected properties at a glance
- Quick sync triggers
- Health monitoring

**Sync Logs** (navigate from overview):

- Detailed operation history
- Troubleshooting failed syncs
- Audit trail

---

## 💡 Pro Tips

1. **First Time Setup:**
   - Go to Properties → Add hotel code to enable Aiosell
   - Then visit Channel Manager to see it appear

2. **Monitoring:**
   - Check Channel Manager daily for sync health
   - Green checkmark = All good ✅
   - Yellow alert = Issues ⚠️

3. **Troubleshooting:**
   - If sync fails, click "View Logs"
   - Click "View" on failed log to see error details
   - Fix issue (mapping, availability, etc.)
   - Click "Full Sync" to retry

---

## 📱 Screenshot Locations

The Channel Manager appears in two places:

1. **Sidebar Menu** (Left side, Management section)
   - Between Properties and Payments
   - Globe icon 🌐
   - Label: "Channel Manager"

2. **Page Content** (Main area when clicked)
   - Large heading "Channel Manager"
   - Blue-themed cards and badges
   - Property tables with sync status

---

**Updated**: October 10, 2025  
**Version**: 2.0  
**Status**: ✅ Live and Accessible

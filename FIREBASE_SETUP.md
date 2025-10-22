# Firebase Console Setup Guide

Follow these steps to complete the Firebase configuration for fred.ai:

## Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **fred-ai-meloy**
3. Click **Authentication** in the left sidebar
4. Go to **Sign-in method** tab
5. Click on **Email/Password**
6. **Enable** the first toggle (Email/Password)
7. Click **Save**

## Step 2: Update Firestore Security Rules

1. In Firebase Console, click **Firestore Database** in the left sidebar
2. Go to the **Rules** tab
3. Replace the existing rules with the content from `firestore.rules` file
4. Click **Publish**

The rules ensure:
- ✅ Only authenticated users can access data
- ✅ Users can only modify their own profiles
- ✅ Message access restricted to conversation participants
- ✅ Profile pictures restricted by user ownership

## Step 3: Enable Firebase Storage

1. In Firebase Console, click **Storage** in the left sidebar
2. Click **Get Started**
3. Start in **production mode** (we'll add custom rules)
4. Choose a location (same as your Firestore location)
5. Click **Done**

## Step 4: Configure Storage Security Rules

1. In Storage, go to the **Rules** tab
2. Replace with the storage rules from the comment section in `firestore.rules`
3. Click **Publish**

The storage rules ensure:
- ✅ Profile pictures: max 5MB, images only, user-owned
- ✅ Project assets: max 10MB, images only, team access

## Step 5: Create Firestore Indexes (Optional but Recommended)

These indexes improve query performance:

1. Go to **Firestore Database** > **Indexes** tab
2. Add these composite indexes:

### Messages Index
- Collection: `messages`
- Fields:
  - `conversationId` (Ascending)
  - `timestamp` (Ascending)
- Query scope: Collection

### Conversations Index
- Collection: `conversations`
- Fields:
  - `participants` (Array-contains)
  - `lastMessageTime` (Descending)
- Query scope: Collection

### Users Index (for search)
- Collection: `users`
- Fields:
  - `status` (Ascending)
  - `lastUpdated` (Descending)
- Query scope: Collection

## Step 6: Test the Setup

1. Refresh your app at `http://localhost:3000`
2. Click **"Get Started"** button
3. Create a test account:
   - Email: `test@example.com`
   - Password: `test123`
   - Name: `Test User`
4. If successful, you should see the full application!

## Troubleshooting

### "auth/operation-not-allowed" Error
**Solution**: Email/Password authentication is not enabled. Complete Step 1.

### "permission-denied" Error
**Solution**: Firestore security rules are not updated. Complete Step 2.

### Cannot Upload Profile Pictures
**Solution**: Firebase Storage is not enabled or rules are incorrect. Complete Steps 3-4.

### Slow Queries
**Solution**: Create composite indexes. Complete Step 5.

## Data Structure Overview

### Collections Created by the App:

1. **users** - User profiles with extended information
2. **conversations** - Chat conversation metadata
3. **messages** - Individual chat messages
4. **notifications** - User notifications
5. **projects** - Project information (future feature)

### Storage Buckets:

1. **profile-pictures/{userId}/avatar.jpg** - User profile pictures
2. **project-assets/{projectId}/** - Project-related files

## Security Best Practices

✅ **Email/Password Auth** - More secure than anonymous auth
✅ **Server Timestamp** - Prevents clock skew attacks  
✅ **Size Limits** - Prevents storage abuse (5MB for profiles, 10MB for projects)
✅ **Content Type Validation** - Only allows images
✅ **User Ownership** - Users can only modify their own data
✅ **Participant Validation** - Messages only accessible to participants

## Next Steps After Setup

Once Firebase is configured, the app will have:
- ✅ Secure authentication with email/password
- ✅ Real-time data synchronization
- ✅ Profile picture uploads
- ✅ Secure messaging between users
- ✅ Proper access control for all data

Happy coding! 🚀


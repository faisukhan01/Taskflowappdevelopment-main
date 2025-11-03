# TaskFlow Setup Guide

## Overview
TaskFlow is a comprehensive student task management application with authentication, real-time collaboration, and analytics.

## Features
- ✅ User authentication (Email/Password and Google OAuth)
- ✅ Subject management with color coding
- ✅ Task management (assignments, quizzes, projects)
- ✅ Kanban board with drag-and-drop
- ✅ Calendar view with deadline visualization
- ✅ Analytics and progress tracking
- ✅ Responsive design

## Getting Started

### 1. Account Creation
- Visit the signup page to create your account
- Use email/password or sign in with Google

### 2. Google OAuth Setup (Optional)
If you want to enable Google sign-in, you need to configure it in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Follow the instructions at: https://supabase.com/docs/guides/auth/social-login/auth-google
5. Add your Google OAuth credentials

**Note**: Without this setup, the "Sign in with Google" button will show a "provider is not enabled" error.

### 3. Using TaskFlow

#### Creating Subjects
1. Go to the Subjects page
2. Click "Add Subject"
3. Enter subject name and choose a color tag
4. Click "Create Subject"

#### Creating Tasks
1. Click "Add Task" from any page
2. Fill in task details:
   - Title (required)
   - Description (optional)
   - Type (assignment, quiz, or project)
   - Priority (low, medium, high)
   - Subject (optional)
   - Due date (required)
3. Click "Create Task"

#### Using the Kanban Board
1. Navigate to "All Tasks" or click on a subject
2. Drag tasks between columns (To Do, In Progress, Done)
3. Click on a task to edit details
4. Use the dropdown menu to delete tasks

#### Viewing the Calendar
1. Go to the Calendar page
2. Click on any date to see tasks due that day
3. Tasks are color-coded by subject
4. Use the month navigation to browse different months

#### Analytics
1. Navigate to the Analytics page
2. View completion rates by subject
3. Track tasks completed over time
4. See overall progress statistics

### 4. Browser Notifications
Enable browser notifications to receive reminders 1 day before task deadlines:
1. Go to Settings
2. Click "Enable Browser Notifications"
3. Allow notifications when prompted

## Technical Details

### Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Server**: Hono web server (Edge Functions)
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Drag & Drop**: react-dnd

### Data Storage
All data is stored in Supabase's key-value store:
- User profiles
- Subjects with color tags
- Tasks with full metadata
- Shared board access (for collaboration)

### Security
- Row-level security via user authentication
- All API routes require valid access tokens
- User data is isolated and protected

## Important Notes

⚠️ **Prototype Environment**: Figma Make is designed for prototyping and learning purposes, not for collecting Personally Identifiable Information (PII) or securing sensitive production data. For production deployment, implement additional security measures and use a dedicated hosting environment.

## Support

For issues or questions about:
- **Supabase setup**: Visit https://supabase.com/docs
- **Google OAuth**: Follow https://supabase.com/docs/guides/auth/social-login/auth-google

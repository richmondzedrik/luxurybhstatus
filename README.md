# AFK Availability - Boss Hunting Status App

A cross-platform web application that allows users to set and view their boss hunting status in real-time.

## Features

- 🔐 **Authentication**: Secure email/password login with Supabase Auth
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates**: Live status updates using Supabase Realtime
- 🟢 **Status Management**: Toggle between "Available" and "AFK" status
- 👥 **User List**: View all users and their current status
- 🎨 **Modern UI**: Clean, minimal design with TailwindCSS

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (Database + Auth + Realtime)
- **Routing**: React Router DOM

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd afkavailability
npm install
```

### 2. Set up Supabase

1. Follow the detailed setup guide in `SUPABASE_SETUP.md`
2. Create your `.env` file:

```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Set Status**: Use the dashboard to toggle between "Available" 🟢 and "AFK" 🔴
3. **View Others**: See real-time status updates from all users
4. **Stay Updated**: Status changes are reflected instantly across all connected clients

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Login.jsx        # Authentication form
│   ├── UserList.jsx     # Real-time user list
│   └── ...
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication state
├── hooks/               # Custom React hooks
│   └── useUserStatus.js # Status management
├── lib/                 # Utilities
│   └── supabase.js      # Supabase client
└── App.jsx              # Main app component
```

## Database Schema

The app uses two main tables:
- `auth.users` - User authentication (managed by Supabase)
- `user_status` - User status tracking with real-time capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

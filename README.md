# TechNeurology - NeuroRelief

A comprehensive migraine management platform that helps users track episodes, manage medications, and generate medical reports.

## Features

- **Episode Tracking**: Log migraine episodes with detailed symptoms and triggers
- **Medication Management**: Track medications and their effectiveness
- **Medical Logging**: Comprehensive medical assessments and vital signs
- **Report Generation**: Create detailed reports for healthcare providers
- **Analytics**: Weekly insights and pattern recognition
- **User Authentication**: Secure login with Replit Auth

## Quick Start

### 1. Get the Code
Download the project files from Replit or clone from GitHub.

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables
Create a `.env` file with:
```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_random_secret_key
REPL_ID=your_app_id
REPLIT_DOMAINS=your_domain.com
```

### 4. Set Up Database
```bash
npm run db:push
```

### 5. Run Development Server
```bash
npm run dev
```

## Free Deployment Options

### Railway (Recommended)
1. Sign up at https://railway.app
2. Connect your GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

### Vercel + Neon
1. Frontend: Deploy on Vercel
2. Database: Use Neon (free PostgreSQL)
3. Set environment variables

### Netlify + Supabase
1. Frontend: Deploy on Netlify
2. Database: Use Supabase (free PostgreSQL)
3. Set environment variables

## Database Providers (Free Tiers)

- **Neon**: https://neon.tech (Free PostgreSQL)
- **Supabase**: https://supabase.com (Free PostgreSQL)
- **Railway**: https://railway.app (Free PostgreSQL)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **UI Components**: Radix UI, shadcn/ui

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data layer
│   └── replitAuth.ts     # Authentication
├── shared/               # Shared types and schemas
└── package.json         # Dependencies
```

## API Endpoints

- `POST /api/episodes` - Create migraine episode
- `GET /api/episodes` - Get user episodes
- `POST /api/medications` - Add medication
- `GET /api/medications` - Get user medications
- `POST /api/medical-logs` - Create medical log
- `GET /api/analytics/weekly` - Get weekly statistics
- `POST /api/reports/generate` - Generate medical report

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this code for your own projects!

## Support

For deployment help or questions:
- Check the `DEPLOYMENT.md` file
- Create an issue on GitHub
- Contact support

---

**TechNeurology** - Advanced migraine management for better health outcomes.
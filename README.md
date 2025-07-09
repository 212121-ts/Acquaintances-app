# Acquaintances App

A mobile-first web application for managing personal connections and networking relationships. Built with Node.js, Express, PostgreSQL, and featuring a Kindle-inspired dark mode interface.

## Features

- 📱 **Mobile-optimized interface** with Kindle-style dark mode
- 👤 **Contact management** with detailed person information
- 🏷️ **Tagging system** for organizing contacts by groups
- 🔗 **Connection tracking** to map how people are related
- 🔐 **Secure authentication** with JWT tokens
- 🎫 **License key system** for controlled access
- 📊 **Admin dashboard** for license management

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Git

### Local Development

1. **Clone the repository**
   
   ```bash
   git clone https://github.com/yourusername/acquaintances-app.git
   cd acquaintances-app
   ```
1. **Install dependencies**
   
   ```bash
   npm install
   ```
1. **Set up environment variables**
   
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```
1. **Start the development server**
   
   ```bash
   npm run dev
   ```
1. **Visit** `http://localhost:3000`

### Deploy to Render.com

1. **Push to GitHub**
   
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
1. **Create Render Services**
- Create a new **Web Service** on Render.com
- Connect your GitHub repository
- Use build command: `npm install`
- Use start command: `npm start`
1. **Add PostgreSQL Database**
- Create a new **PostgreSQL** service on Render
- Copy the connection string
1. **Set Environment Variables in Render**
   
   ```
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-32-character-secret-key
   ADMIN_PASSWORD=your-admin-password
   NODE_ENV=production
   ```
1. **Deploy** - Render will automatically build and deploy your app

## Environment Variables

|Variable        |Description                          |Example                              |
|----------------|-------------------------------------|-------------------------------------|
|`DATABASE_URL`  |PostgreSQL connection string         |`postgresql://user:pass@host:5432/db`|
|`JWT_SECRET`    |Secret key for JWT tokens (32+ chars)|`your-super-secret-key-here`         |
|`ADMIN_PASSWORD`|Password for admin access            |`secure-admin-password`              |
|`NODE_ENV`      |Environment mode                     |`production`                         |
|`PORT`          |Server port (auto-set by Render)     |`3000`                               |

## API Endpoints

### Authentication

- `POST /api/register` - Create new user account
- `POST /api/login` - User login

### Contacts

- `GET /api/contacts` - Get user’s contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Tags

- `GET /api/tags` - Get user’s tags
- `POST /api/tags` - Create new tag
- `DELETE /api/tags/:id` - Delete tag

### Admin

- `GET /api/admin/license-keys` - View license keys
- `POST /api/admin/license-keys` - Generate new keys

## Database Schema

The app uses PostgreSQL with the following main tables:

- `users` - User accounts
- `contacts` - Contact information
- `tags` - User-defined tags
- `contact_tags` - Many-to-many contact-tag relationships
- `contact_connections` - Relationships between contacts
- `license_keys` - Admin-generated access keys

## Default Credentials

**Demo License Key:** `DEMO-KEY-123`
**Admin Password:** Set via `ADMIN_PASSWORD` environment variable

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT, bcrypt
- **Security:** Helmet, CORS, rate limiting
- **Deployment:** Render.com
- **Frontend:** Vanilla HTML/CSS/JavaScript

## Contributing

1. Fork the repository
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
1. Commit your changes (`git commit -m 'Add amazing feature'`)
1. Push to the branch (`git push origin feature/amazing-feature`)
1. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

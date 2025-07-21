# Acquaintances

A powerful mobile-first web application for managing personal connections and networking relationships. Keep track of the people you meet, organize them with tags, and visualize your network connections.

![Acquaintances App](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### 👥 Contact Management
- **Add & Edit Contacts**: Store names, locations, family details, and personal notes
- **Smart Search**: Find contacts by name, location, or tags
- **Rich Profiles**: Track spouse/partner, children, and meeting context
- **Bulk Operations**: Efficient contact management tools

### 🏷️ Advanced Tagging System
- **Flexible Tags**: Create custom tags for any categorization
- **Tag Management**: Full CRUD operations on tags
- **Multi-Tag Support**: Assign multiple tags per contact
- **Tag-Based Filtering**: Filter contacts and connections by tags

### 🕸️ Network Visualization
- **Interactive Graph**: Visual network showing connections between contacts
- **Shared Tag Connections**: Automatically connects contacts with shared tags
- **Multiple Layouts**: Force-directed and circular layout options
- **Interactive Controls**:
  - Drag and drop nodes
  - Pan and zoom
  - Toggle physics simulation
  - Filter by specific tags
- **Real-time Statistics**: Track total contacts, connections, and network insights
- **Hover Details**: Rich tooltips with contact information

### 🔐 Security & Authentication
- **License Key System**: Controlled access with admin-generated keys
- **JWT Authentication**: Secure token-based authentication
- **Password Management**: 
  - User password changes
  - Admin password resets
  - Secure password hashing (bcrypt)
- **Rate Limiting**: Protection against abuse

### ⚙️ Admin Features
- **License Key Management**: Generate and track license keys
- **User Management**: View all users and account details
- **Password Recovery**: Reset passwords for users who forgot them
- **Random Password Generation**: Secure password generation tool

### 📱 User Experience
- **Mobile-First Design**: Optimized for mobile devices
- **Dark Theme**: Easy on the eyes with modern dark UI
- **Responsive Layout**: Works perfectly on all screen sizes
- **Fast Performance**: Optimized for speed and efficiency

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/acquaintances-app.git
   cd acquaintances-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/acquaintances_db
   
   # Security
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   ADMIN_PASSWORD=your-secure-admin-password
   
   # Environment
   NODE_ENV=production
   PORT=3000
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the app**
   - Open your browser to `http://localhost:3000`
   - Use admin password to generate license keys
   - Register users with generated license keys

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt, helmet, CORS, rate limiting

### Database Schema
```sql
users (id, email, password_hash, license_key, created_at)
license_keys (id, key_value, status, used_by, created_at)
contacts (id, user_id, name, location, spouse, children, notes, created_at, updated_at)
tags (id, user_id, name, created_at)
contact_tags (contact_id, tag_id) -- Many-to-many relationship
```

### API Endpoints

#### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `PUT /api/change-password` - Change user password

#### Contacts
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

#### Tags
- `GET /api/tags` - Get user's tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

#### Admin
- `GET /api/admin/license-keys` - List license keys
- `POST /api/admin/license-keys` - Generate license keys
- `GET /api/admin/users` - List all users
- `PUT /api/admin/reset-password` - Reset user password

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `ADMIN_PASSWORD` | Admin access password | Required |
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |

### Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 24-hour expiration
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS Protection**: Configured for security
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Helmet.js security headers

## 🚀 Deployment

### Render (Recommended)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

### Manual Deployment
1. **Build the application**
   ```bash
   npm install --production
   ```

2. **Set up PostgreSQL database**
   - Create database and user
   - Update `DATABASE_URL` environment variable

3. **Start the production server**
   ```bash
   NODE_ENV=production npm start
   ```

## 📊 Network Visualization Details

### How Connections Work
The network visualization creates connections between contacts based on **shared tags**:

- **Node Size**: Based on number of tags (more tags = larger node)
- **Node Color**: 
  - Blue: Regular contacts
  - Green: Highly connected (3+ tags)
- **Connection Strength**: Based on number of shared tags
- **Connection Opacity**: More shared tags = more visible connection

### Example
```
Contact A: ["work", "tech", "startup"]
Contact B: ["tech", "startup", "AI"]
Result: Connected with weight 2 (shared: "tech", "startup")
```

### Interactive Features
- **Drag Nodes**: Click and drag to reposition
- **Pan & Zoom**: Mouse wheel to zoom, drag background to pan
- **Physics Toggle**: Enable/disable automatic movement
- **Tag Filtering**: Show only connections for specific tags
- **Layouts**: Switch between force-directed and circular arrangements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
Error: connect ECONNREFUSED
```
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure database exists

**Admin Access Issues**
```bash
Error: Invalid admin password
```
- Check `ADMIN_PASSWORD` in `.env`
- Ensure environment variables are loaded

**License Key Problems**
```bash
Error: Invalid license key
```
- Generate keys through admin dashboard
- Check key status (must be 'active')
- Verify correct key format

### Performance Tips
- **Database Indexes**: PostgreSQL automatically creates indexes for primary keys and unique constraints
- **Connection Pooling**: Built-in PostgreSQL connection pooling
- **Rate Limiting**: Adjust limits in `server.js` if needed

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/acquaintances-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/acquaintances-app/discussions)
- **Email**: your-email@example.com

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Contact import/export (CSV, vCard)
- [ ] Team collaboration features
- [ ] AI-powered connection suggestions
- [ ] Integration with social platforms
- [ ] Advanced search with filters
- [ ] Contact photo support

---

**Built with ❤️ for better networking and relationship management**
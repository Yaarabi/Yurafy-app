# Yura SaaS Platform

A comprehensive Next.js 15 SaaS platform for e-commerce store management with AI-powered automation, WhatsApp integration, and multi-language support.

## 🚀 Features

### Core Features
- **Multi-Store Management**: Create and manage multiple e-commerce stores
- **Product Management**: Full CRUD operations for products with variants
- **Order Management**: Complete order tracking and management system
- **User Authentication**: Secure authentication with NextAuth.js (Credentials & Google OAuth)
- **Subscription Plans**: Multiple tiered plans with feature-based access control
- **AI Agent Integration**: Mistral AI-powered agent for automated customer support
- **WhatsApp Automation**: Integrated WhatsApp Business API for customer communication
- **Multi-language Support**: i18n support for English, French, and Arabic

### Security Features
- ✅ **Authentication & Authorization**: Secure API routes with session-based auth
- ✅ **File Upload Validation**: Type, size, and sanitization validation
- ✅ **Rate Limiting**: API rate limiting to prevent abuse
- ✅ **Environment Variable Validation**: Startup validation for required env vars
- ✅ **Input Validation**: Comprehensive input validation with Zod-like utilities
- ✅ **Database Indexes**: Optimized database queries with proper indexing
- ✅ **Structured Logging**: Proper logging system for debugging and monitoring
- ✅ **Error Handling**: Standardized error responses across all API routes

### Technical Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v4
- **AI**: Mistral AI (LangChain integration)
- **UI**: Tailwind CSS, MUI, Framer Motion
- **Payment**: PayPal integration
- **Internationalization**: next-intl

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd yura-saas
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/yura-saas

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Services
MISTRAL_API_KEY=your-mistral-api-key

# WhatsApp (Optional)
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
yura-saas/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── products/        # Product management
│   │   ├── orders/          # Order management
│   │   ├── store/           # Store management
│   │   ├── whatsapp/        # WhatsApp integration
│   │   └── ai-agent/        # AI agent endpoints
│   ├── [locale]/            # Internationalized routes
│   │   ├── dashboard/       # User dashboard
│   │   ├── admin/           # Admin panel
│   │   └── onboarding/      # Onboarding flow
│   └── layout.tsx           # Root layout
├── components/               # React components
│   ├── dashboard/           # Dashboard components
│   ├── onboarding/         # Onboarding components
│   └── store/              # Store theme components
├── lib/                      # Utility libraries
│   ├── utils/               # Utilities (errors, validation, logging)
│   ├── auth/                # Authentication logic
│   ├── agent/               # AI agent implementation
│   ├── db/                  # Database connection
│   └── config/              # Configuration files
├── models/                   # Mongoose models
├── messages/                 # i18n translation files
└── public/                   # Static assets
```

## 🔐 Security Features

### Authentication
- Session-based authentication with NextAuth.js
- JWT tokens for API authentication
- Password hashing with bcryptjs
- Email verification (implemented)
- Password reset functionality (implemented)

### API Security
- Rate limiting on all API routes
- Input validation and sanitization
- File upload validation (type, size, path traversal prevention)
- Ownership verification for resource access
- Environment variable validation on startup

### Database Security
- Password fields excluded from queries by default
- Proper indexing for performance and security
- Input sanitization before database operations

## 📊 API Documentation

### Health Check
```bash
GET /api/health
```
Returns API and database status.

### Authentication
```bash
POST /api/auth/[...nextauth]  # NextAuth endpoints
POST /api/auth/verify-email    # Request email verification
GET  /api/auth/verify-email/[token]  # Verify email
POST /api/auth/reset-password  # Password reset
```

### Products
```bash
GET    /api/products           # Get products (public)
POST   /api/products           # Create product (authenticated)
PUT    /api/products?id=xxx    # Update product (owner only)
DELETE /api/products?id=xxx    # Delete product (owner only)
```

### File Upload
```bash
POST   /api/upload             # Upload file (authenticated, validated)
PUT    /api/upload             # Update file
DELETE /api/upload             # Delete files
```

## 🧪 Testing

Testing framework setup (coming soon):
```bash
npm run test        # Run unit tests
npm run test:e2e   # Run E2E tests
npm run test:watch # Watch mode
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The application can be deployed to any Node.js hosting platform. Make sure to:
- Set all required environment variables
- Configure MongoDB connection string
- Set up proper CORS settings
- Enable HTTPS

## 🔄 Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for JWT encryption

### Optional
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `MISTRAL_API_KEY` - For AI agent features
- `WHATSAPP_VERIFY_TOKEN` - For WhatsApp webhook
- `NEXT_PUBLIC_BASE_URL` - Public base URL

## 📝 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@yura-saas.com or open an issue in the repository.

## 🗺️ Roadmap

### Completed ✅
- Core authentication and authorization
- Product and store management
- AI agent integration
- WhatsApp automation
- Security improvements
- Health check endpoint
- Email verification
- Password reset

### In Progress 🚧
- Comprehensive test coverage
- Analytics dashboard
- Order tracking system
- Plan expiration handling

### Planned 📋
- CI/CD pipeline
- Advanced analytics
- Mobile app
- Additional payment gateways
- Webhook system

## 📞 Contact

For questions or inquiries, please contact:
- Email: support@yura-saas.com
- GitHub: [Your GitHub Profile]

---

Built with ❤️ using Next.js 15 and TypeScript


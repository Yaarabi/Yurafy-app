# Yura IT SaaS - Architecture Analysis

## 📋 High-Level Overview

**Yura IT** is a comprehensive SaaS platform for Moroccan SMEs, providing AI-powered social media automation, e-commerce store management, and WhatsApp Business integration.

---

## 🏗️ Architecture Overview

### **Tech Stack**
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.1
- **Database**: MongoDB (Mongoose 8.19.0)
- **Authentication**: NextAuth.js 4.24.11 (JWT-based)
- **AI/LLM**: LangChain + Mistral AI (`mistral-large-latest`)
- **State Management**: Zustand
- **UI Components**: Material-UI, Framer Motion, React Icons
- **Internationalization**: next-intl (en, fr, ar)
- **Payment**: PayPal integration
- **WhatsApp**: WhatsApp Business API integration

---

## 🔑 Core Modules

### 1. **Authentication & Authorization**
**Files**: `lib/auth/auth.ts`, `app/api/auth/[...nextauth]/route.ts`

**Current Implementation**:
- ✅ NextAuth.js with Credentials provider
- ✅ JWT-based sessions
- ✅ MongoDB user persistence
- ❌ Missing: Google OAuth provider
- ⚠️ **Issue**: Password stored but schema doesn't mark it as required properly

**Session Flow**:
1. User logs in via credentials
2. JWT token created with user ID, role, plan
3. Session includes onboarding status check
4. Dashboard protection via client-side checks

**Areas for Improvement**:
- Add Google OAuth provider
- Implement server-side session checks in middleware
- Add refresh token mechanism (partial implementation exists in `/api/auth/refresh`)

---

###  shuffled. **AI Agent System**
**Files**: `lib/agent/agent.ts`, `app/api/ai-agent/chat/route.ts`, `lib/agent/tools/*`

**Architecture**:
- **Framework**: LangGraph (LangChain)
- **Model**: Mistral AI (`mistral-large-latest`)
- **Memory System**: MemorySaver checkpoints
- **Tools**: Order tools, product search, RAG, memory tools, template tools

**Key Features**:
- **Owner Agent**: Direct communication with business owner
- **Customer Agent**: Automated customer support via WhatsApp
- **Memory Management**: 
  - Owner checkpoints: Single checkpoint per owner
  - Customer checkpoints: Per-customer conversation threads
  - Vector storage: `models/agentVector.ts`, `models/agentMemory.ts`

**Agent Flow**:
```
User Query → Load Agent (cached) → Invoke with Tools → Return Response
```

**Memory System**:
- `agentMemory.ts`: Stores agent conversations
- `agentVector.ts`: Vector embeddings for RAG
- `lib/embedding/agentProcessor.ts`: Processes embeddings

**Strengths**:
- ✅ Agent caching for performance
- ✅ Thread-based memory per customer
- ✅ Comprehensive tool set

**Areas for Improvement**:
- Memory cleanup strategy for old conversations
- Error handling could be more granular
- Rate limiting not implemented

---

### 3. **Onboarding Flow**
**Files**: `app/[locale]/onboarding/**`, `models/plan.ts`

**Flow**:
1. **Plan Selection** (`/onboarding/plan`) - Choose subscription plan
2. **Store Info** (`/onboarding/info`) - Configure store details
3. **WhatsApp Account** (`/onboarding/info`) - Connect WhatsApp Business
4. **Checkout** (`/onboarding/checkout`) - PayPal payment
5. **Completion** - Set `onboardingCompleted: true`

**Plan System**:
- Plans stored in `Plan` model with `planKey`, `price`, `durationDays`, `status`
- User linked via `currentPlanId`
- Default "free" plan created on signup

**Issues Identified**:
- ⚠️ No clear validation for required onboarding steps
- ⚠️ Plan status checking could be improved

---

### 4. **Store & Product Management**
**Files**: `models/store.ts`, `models/products.ts`, `app/api/store/**`, `app/api/products/**`

**Store System**:
- Multi-tenant Haus system (domain-based routing: `/[locale]/[domain]`)
- Each user has one store (`Store` model)
- Store themes configurable
- Public shop pages under `/[locale]/[domain]/shop`

**Product System**:
- Products belong to users (not stores directly)
- Variants support (size, color, etc.)
- Image uploads to `/public/uploads/{userId}/`
- CSV import functionality

**Schema Issues**:
- ⚠️ Store-user relationship could be clearer
- ⚠️ Product ownership vs store association needs clarification

---

### 5. **WhatsApp Integration**
**Files**: `app/api/whatsapp/**`, `lib/whatsapp/**`, `models/whatsappAccount.ts`, `models/whatsappMessage.ts`

**Features**:
- WhatsApp Business API connection
- Automated message sending
- Template management
- Conversation tracking
- Webhook handling for incoming messages
- Automation workflows (detection rules, auto-responses)

**Architecture**:
- Account model: `whatsappAccount.ts` (stores Business API credentials)
- Message model: `whatsappMessage.ts` (conversation history)
- Templates: `models/templates.ts`
- Automation: Complex rule-based system for auto-responses

**Strengths**:
- ✅ Comprehensive WhatsApp integration
- ✅ Template system
- ✅ Conversation logging

**Areas for Improvement**:
- Webhook security verification
- Rate limiting for message sending
- Better error recovery

---

### 6. **Order Management**
**Files**: `models/orders.ts`, `app/api/orders/**`

**Features**:
- Order creation and tracking
- CSV import
- Bulk actions
- Status management
- Customer linking

**Order Flow**:
- Created from store pages or manually
- Linked to customers and products
- Status tracking (pending, processing, shipped, etc.)

---

### 7. **Customer Management**
**Files**: `models/customers` (implied), `app/api/customers/route.ts`

- Customer data extracted from orders/messages
- Filtering and search capabilities
- Linked to WhatsApp conversations

---

### 8. **Dashboard & UI**
**Files**: `components/dashboard/**`, `app/[locale]/dashboard/**`

**Structure**:
- Protected client-side layout (`ProtectedDashboardClient`)
- Sidebar navigation
- Theme system (light/dark mode)
- Analytics charts (MUI Charts)
- Responsive design

**Pages**:
- Home (analytics)
- Products
- Orders
- Customers
- WhatsApp (chats, automation, templates)
- Agent (AI chat interface)
- Conversations
- Settings
- Support

---

## 🔄 Data Flow Patterns

### **Authentication Flow**:
```
Login → NextAuth → JWT Token → Session → Dashboard Check → Onboarding Check
```

### **AI Agent Flow**:
```
Query → Load/Create Agent → Tool Execution → Memory Update → Response
```

### **WhatsApp Message Flow**:
```
Webhook → Process Message → AI Agent (if enabled) → Send Response → Log Conversation
```

### **Order Flow**:
```
Store Page → Order Form → API → Create Order → Email/WhatsApp Notification
```

---

## 🚨 Issues & Inconsistencies

### **1. Security Concerns**
- ❌ No server-side middleware authentication check
- ⚠️ Webhook verification missing
- ⚠️ Rate limiting not implemented
- ⚠️ API schemes don't consistently verify user ownership

### **2. Schema Design**
- ⚠️ User password field exists but schema validation could be stricter
- ⚠️ Store-User relationship: Direct reference vs lookup?
- ⚠️ Product ownership: User-based, but displayed in store context
- ⚠️ Plan expiration logic not enforced at database level

### **3. API Design**
- ⚠️ Inconsistent error handling
- ⚠️ Some endpoints don't check user authentication
- ⚠️ Mixed patterns: Some use FormData, others JSON
- ⚠️ No API versioning

### **4. Client/Server Separation**
- ⚠️ Dashboard protection is client-side only (could be bypassed)
- ⚠️ Some business logic in client components
- ⚠️ Mixed server/client component patterns

### **5. Memory & Performance**
- ⚠️ Agent cache never cleared (memory leak potential)
- ⚠️ Vector embeddings stored but cleanup strategy unclear
- ⚠️ No pagination for large datasets (orders, messages)

### **6. Modularity**
- ✅ Good separation of concerns (lib, models, components)
- ⚠️ Some components are too large (could be split)
- ⚠️ Shared utilities could be better organized

---

## 📈 Scalability Considerations

### **Current Limitations**:
1. **Database**: MongoDB single connection, no connection pooling config visible
2. **Cache**: In-memory agent cache (won't work in multi-instance setup)
3. **File Storage**: Local filesystem (`/public/uploads`) - not scalable
4. **Background Jobs**: No queue system (mentioned in README but not implemented)

### **Recommendations**:
1. Implement Redis for agent cache
2. Move file storage to S3/Cloudinary
3. Add BullMQ for background jobs (as mentioned in README)
4. Implement database connection pooling
5. Add API rate limiting
6. Consider read replicas for MongoDB

---

## 🔐 Security Recommendations

1. **Implement middleware authentication check**
2. **Add CSRF protection**
3. **Implement rate limiting** (API routes)
4. **Add input sanitization** (prevent injection attacks)
5. **Webhook signature verification**
6. **Session timeout handling**
7. **Password strength requirements**
8. **2FA option for admin users**

---

## 📦 Module Interaction Map

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├──→ Authentication (NextAuth)
       ├──→ Store Management
       ├──→ Products
       ├──→ Orders
       ├──→ WhatsApp Account
       ├──→ AI Agent Configuration
       └──→ Plan/Subscription

┌─────────────┐
│  WhatsApp   │
└──────┬──────┘
       │
       ├──→ Webhook → AI Agent → Response
       ├──→ Templates
       ├──→ Automation Rules
       └──→ Conversation Logs

┌─────────────┐
│  AI Agent   │
└──────┬──────┘
       │
       ├──→ Tools (Orders, Products, Memory, RAG)
       ├──→ Memory Checkpoints
       └──→ Vector Embeddings
```

---

## ✅ Strengths

1. **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind
2. **AI Integration**: Comprehensive LangChain setup
3. **Multi-language**: Proper i18n implementation
4. **WhatsApp Integration**: Full Business API support
5. **Modular Structure**: Clear separation of concerns
6. **Type Safety**: TypeScript throughout

---

## 🎯 Priority Improvements

1. **HIGH**: Add server-side authentication middleware
2. **HIGH**: Implement Google OAuth provider
3. **HIGH**: Add API authentication checks
4. **MEDIUM**: Move to Redis for caching
5. **MEDIUM**: Implement rate limiting
6. **MEDIUM**: Add background job queue
7. **LOW**: Refactor large components
8. **LOW**: Add API versioning

---

## 📝 Notes

- The project structure is well-organized
- Code quality is generally good
- Internationalization is properly implemented
- Some features mentioned in README are not yet implemented (Instagram bot, email notifications)
- Memory system is sophisticated but needs cleanup strategy


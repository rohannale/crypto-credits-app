# External API Dependencies & Third-Party Services

This document outlines all external services, APIs, and dependencies that the Crypto Credits App relies on for full functionality.

## 🌐 **Core External Dependencies**

### 1. **Blockchain Infrastructure**
- **Ethereum Sepolia Testnet**
  - Network: Sepolia (Chain ID: 0xaa36a7)
  - Used for: Processing cryptocurrency transactions
  - Dependency Level: CRITICAL
  - Fallback: None (core functionality depends on this)

### 2. **Wallet Integration**
- **MetaMask Browser Extension**
  - Purpose: User wallet management and transaction signing
  - Dependency Level: CRITICAL
  - Alternative: Any Web3-compatible wallet (WalletConnect, etc.)
  - Browser API: `window.ethereum`

### 3. **Blockchain Transaction Monitoring**
- **Webhook Service Provider** (External)
  - Purpose: Real-time transaction notifications
  - Endpoint: `/api/webhook` (expects webhook from provider like Alchemy, Infura, etc.)
  - Dependency Level: CRITICAL for automatic credit processing
  - Format: ETH_SEPOLIA network transaction events

## 💾 **Database & Storage**
- **MongoDB**
  - Purpose: User data, authentication, credit balances
  - Connection: `MONGO_URI` environment variable
  - Dependency Level: CRITICAL

## 🔐 **Authentication & Security**
- **JWT (JSON Web Tokens)**
  - Library: `jsonwebtoken` (npm package)
  - Purpose: User session management
  - Dependency Level: CRITICAL

- **bcryptjs**
  - Purpose: Password hashing
  - Dependency Level: CRITICAL

## 📡 **HTTP Client**
- **Axios**
  - Purpose: Frontend-backend API communication
  - Dependency Level: CRITICAL

## 🎨 **UI Framework & Components**
- **React & React DOM**
  - Purpose: Frontend framework
  - Dependency Level: CRITICAL

- **Tailwind CSS**
  - Purpose: UI styling
  - Dependency Level: MODERATE (could be replaced)

- **Heroicons**
  - Purpose: UI icons
  - Dependency Level: LOW (cosmetic)

## 🧪 **Development & Testing**
- **Jest & Testing Library**
  - Purpose: Unit and integration testing
  - Dependency Level: DEVELOPMENT ONLY

## 🔧 **Configuration Requirements**

### Backend Environment Variables (.env)
```bash
# CRITICAL - Required for startup
MONGO_URI=mongodb://localhost:27017/crypto-credits
JWT_SECRET=your-super-secret-jwt-key

# CRITICAL - Required for webhook processing
RECEIVING_WALLET=0xFBA15121BA790D33386bFE937EF527995e87cb1f

# Optional
NODE_ENV=development
PORT=5001
```

### Frontend Environment Variables
```bash
# API endpoint (defaults to localhost:5001)
REACT_APP_API_URL=http://localhost:5001
```

## 📋 **Setup Requirements**

### For Full Functionality:
1. **MongoDB running** (local or cloud)
2. **MetaMask installed** in browser
3. **Sepolia testnet ETH** for testing
4. **Webhook provider** configured (Alchemy, Infura, etc.)
5. **Environment variables** properly set

### For Development/Testing:
1. Node.js (18+ recommended)
2. npm or yarn
3. All above dependencies

## ⚠️ **Critical Failure Points**

### High Risk:
- MongoDB connection failure → App won't start
- Missing JWT_SECRET → Authentication fails
- No MetaMask → Users can't connect wallets
- Webhook provider down → Credits won't update automatically

### Medium Risk:
- Sepolia network issues → Transactions may fail
- Missing RECEIVING_WALLET → Webhook processing fails

### Low Risk:
- UI library updates → May require code changes
- Icon library issues → Cosmetic only

## 🔄 **Monitoring & Health Checks**

### Recommended Monitoring:
1. **MongoDB connectivity**
2. **Webhook endpoint availability** (`/api/webhook`)
3. **Sepolia network status**
4. **MetaMask compatibility**

### Health Check Endpoints:
- `GET /` → Server status
- `GET /api/auth/*` → Auth system health
- `POST /api/webhook` → Webhook processing health

## 📞 **Support Contacts**

### For Issues:
- **MongoDB**: MongoDB Atlas support
- **Sepolia Testnet**: Ethereum community
- **MetaMask**: MetaMask support
- **Webhook Provider**: Your chosen provider (Alchemy, Infura, etc.)

### Documentation:
- [Sepolia Testnet](https://sepolia.dev/)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**Last Updated:** $(date)  
**Version:** 1.0  
**Maintained By:** Rohan

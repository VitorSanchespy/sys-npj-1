# 🐛 GITHUB ISSUES - SYS-NPJ-1

## 📋 Template para criação das Issues

> **Instruções:** Copie cada issue abaixo e cole no GitHub Issues do repositório  
> **Repository:** https://github.com/VitorSanchespy/sys-npj-1/issues

---

## 🔥 ISSUES CRÍTICAS - P0

### Issue #1: [CRITICAL] JWT Secret Validation Missing
**Priority:** P0 - Critical  
**Type:** Security  
**Labels:** `security`, `backend`, `critical`

**Description:**
The application doesn't validate if JWT_SECRET environment variable exists or has minimum security requirements.

**Current Behavior:**
- App starts without JWT_SECRET validation
- Potential security vulnerability if JWT_SECRET is weak or missing

**Expected Behavior:**
- Validate JWT_SECRET exists and has minimum 32 characters
- Exit gracefully with error message if validation fails

**Steps to Reproduce:**
1. Remove JWT_SECRET from .env
2. Start the application
3. Application starts without error

**Technical Details:**
```javascript
// Add to backend/index.js at startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}
```

**Acceptance Criteria:**
- [ ] JWT_SECRET validation on startup
- [ ] Minimum 32 characters requirement
- [ ] Graceful error message
- [ ] Documentation update

---

### Issue #2: [CRITICAL] Global Error Handler Missing
**Priority:** P0 - Critical  
**Type:** Bug  
**Labels:** `backend`, `error-handling`, `critical`

**Description:**
Application lacks global error handling middleware, causing inconsistent error responses and potential crashes.

**Current Behavior:**
- Unhandled errors may crash the application
- Inconsistent error response formats
- Error details exposed in production

**Expected Behavior:**
- Global error middleware catches all unhandled errors
- Consistent error response format
- Error details hidden in production

**Implementation:**
```javascript
// Add to backend/index.js
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // Handle different error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Invalid data',
      details: err.errors
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

**Acceptance Criteria:**
- [ ] Global error middleware implemented
- [ ] Different error types handled appropriately
- [ ] Error details hidden in production
- [ ] Consistent error response format

---

### Issue #3: [CRITICAL] .gitignore Incomplete
**Priority:** P0 - Critical  
**Type:** Security  
**Labels:** `security`, `configuration`, `critical`

**Description:**
Current .gitignore is too basic and doesn't exclude important files that could contain sensitive information.

**Current State:**
```gitignore
.env
package-lock.json
node_modules
```

**Security Risks:**
- IDE files may contain sensitive information
- OS files could be committed
- Log files with sensitive data could be exposed
- Upload files could be committed

**Solution:**
Replace .gitignore with comprehensive version (see TECHNICAL_ISSUES_DETAILED.md)

**Acceptance Criteria:**
- [ ] Comprehensive .gitignore implemented
- [ ] All sensitive files excluded
- [ ] OS-specific files excluded
- [ ] IDE files excluded
- [ ] Log and upload directories properly handled

---

## ⚠️ ISSUES DE ALTA PRIORIDADE - P1

### Issue #4: [HIGH] Structured Logging System
**Priority:** P1 - High  
**Type:** Enhancement  
**Labels:** `backend`, `logging`, `monitoring`

**Description:**
Application only uses morgan for HTTP logging. Need structured logging system for better debugging and monitoring.

**Current Issues:**
- No application-level logging
- No error tracking
- Difficult to debug production issues
- No log rotation

**Proposed Solution:**
Implement Winston logger with:
- Structured JSON logging
- Multiple transport options
- Log levels (error, warn, info, debug)
- Log rotation
- Production-ready configuration

**Implementation:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

**Acceptance Criteria:**
- [ ] Winston logger implemented
- [ ] Structured JSON logging
- [ ] Multiple log levels
- [ ] File-based logging with rotation
- [ ] Integration with existing error handling
- [ ] Environment-based configuration

---

### Issue #5: [HIGH] Database Performance Optimization
**Priority:** P1 - High  
**Type:** Performance  
**Labels:** `backend`, `database`, `performance`

**Description:**
Database queries lack proper indexing and optimization, causing slow response times.

**Current Issues:**
- Missing composite indexes on frequently queried columns
- No query performance monitoring
- Suboptimal connection pooling
- Missing database query optimization

**Areas to Address:**
1. **Missing Indexes:**
   - `processos(status, criado_em)`
   - `agendamentos(data_evento, status)`
   - `usuarios(email)` (unique)
   - `arquivos(processo_id, ativo)`

2. **Connection Pool Optimization:**
   ```javascript
   pool: {
     max: 10,
     min: 0,
     acquire: 30000,
     idle: 10000
   }
   ```

3. **Query Optimization:**
   - Add query logging in development
   - Implement query timeout
   - Add connection retry logic

**Acceptance Criteria:**
- [ ] Add composite indexes for common queries
- [ ] Optimize connection pool settings
- [ ] Implement query logging in development
- [ ] Add query performance monitoring
- [ ] Document query optimization guidelines

---

### Issue #6: [HIGH] Frontend Error Boundaries
**Priority:** P1 - High  
**Type:** Bug  
**Labels:** `frontend`, `error-handling`, `ux`

**Description:**
React application lacks error boundaries, causing entire app crashes when component errors occur.

**Current Behavior:**
- Component errors crash the entire application
- No graceful error handling for users
- Poor user experience during errors

**Expected Behavior:**
- Error boundaries catch component errors
- Graceful error pages shown to users
- Error logging for debugging
- App continues functioning in unaffected areas

**Implementation Plan:**
1. Create ErrorBoundary component
2. Implement error logging
3. Add user-friendly error messages
4. Wrap critical components with error boundaries

**Acceptance Criteria:**
- [ ] ErrorBoundary component implemented
- [ ] Error logging system
- [ ] User-friendly error messages
- [ ] Critical components wrapped
- [ ] Error reporting to monitoring service

---

## 📋 ISSUES DE MÉDIA PRIORIDADE - P2

### Issue #7: [MEDIUM] Test Coverage Implementation
**Priority:** P2 - Medium  
**Type:** Quality  
**Labels:** `testing`, `backend`, `frontend`, `quality`

**Description:**
Application has minimal test coverage (only 3 basic test files), making it risky for refactoring and maintenance.

**Current State:**
- `backend/tests/api.e2e.test.js` - Basic
- `backend/tests/backend.test.js` - Incomplete
- `backend/tests/usuario.me.e2e.test.js` - Partial
- No frontend tests

**Required Coverage:**
1. **Backend Tests (Target: 80%+)**
   - Unit tests for all controllers
   - Integration tests for all API endpoints
   - Database model tests
   - Middleware tests
   - Service layer tests

2. **Frontend Tests (Target: 70%+)**
   - Component unit tests
   - Integration tests for user flows
   - API service tests
   - Utility function tests

3. **E2E Tests**
   - Critical user journeys
   - Authentication flows
   - CRUD operations

**Implementation Steps:**
1. Set up Jest configuration for backend
2. Set up Vitest for frontend
3. Create test database setup
4. Implement CI/CD integration
5. Set coverage thresholds

**Acceptance Criteria:**
- [ ] Backend test coverage >80%
- [ ] Frontend test coverage >70%
- [ ] E2E tests for critical flows
- [ ] CI/CD integration
- [ ] Coverage reporting

---

### Issue #8: [MEDIUM] API Documentation Completion
**Priority:** P2 - Medium  
**Type:** Documentation  
**Labels:** `documentation`, `backend`, `api`

**Description:**
Swagger documentation is partially implemented. Many endpoints lack proper documentation.

**Current Issues:**
- Incomplete API documentation
- Missing request/response examples
- No authentication documentation
- Inconsistent documentation format

**Requirements:**
1. **Complete Swagger Documentation:**
   - All endpoints documented
   - Request/response schemas
   - Error response documentation
   - Authentication examples

2. **API Documentation Features:**
   - Interactive API explorer
   - Code examples in multiple languages
   - Postman collection export
   - API versioning documentation

**Deliverables:**
- Complete Swagger/OpenAPI specification
- Interactive documentation UI
- Postman collection
- API usage guide
- Authentication guide

**Acceptance Criteria:**
- [ ] All endpoints documented in Swagger
- [ ] Request/response schemas defined
- [ ] Authentication flows documented
- [ ] Interactive documentation accessible
- [ ] Postman collection available

---

### Issue #9: [MEDIUM] Input Validation Standardization
**Priority:** P2 - Medium  
**Type:** Security  
**Labels:** `security`, `backend`, `validation`

**Description:**
Input validation is inconsistent across different endpoints, creating potential security vulnerabilities.

**Current Issues:**
- Inconsistent validation rules
- Missing validation for some endpoints
- No centralized validation schema
- Potential for injection attacks

**Security Risks:**
- SQL injection (though Sequelize provides some protection)
- XSS attacks
- Data integrity issues
- Invalid data in database

**Implementation Plan:**
1. **Centralized Validation Schema:**
   - Create validation schemas for all entities
   - Implement reusable validation middleware
   - Standardize error responses

2. **Enhanced Security:**
   - XSS protection
   - Input sanitization
   - File upload validation
   - Rate limiting per endpoint

**Example Implementation:**
```javascript
// Validation schemas
const processValidation = {
  create: [
    body('numero_processo')
      .matches(/^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/)
      .withMessage('Invalid process number format'),
    body('descricao')
      .isLength({ min: 10, max: 1000 })
      .escape()
      .withMessage('Description must be 10-1000 characters')
  ]
}
```

**Acceptance Criteria:**
- [ ] Centralized validation schemas
- [ ] All endpoints properly validated
- [ ] XSS protection implemented
- [ ] Input sanitization
- [ ] Consistent error responses

---

## 📈 ISSUES DE BAIXA PRIORIDADE - P3

### Issue #10: [LOW] TypeScript Migration
**Priority:** P3 - Low  
**Type:** Enhancement  
**Labels:** `frontend`, `typescript`, `refactoring`

**Description:**
Frontend is currently in JavaScript. Migrating to TypeScript would improve code quality and developer experience.

**Benefits:**
- Better IDE support
- Compile-time error detection
- Improved code documentation
- Better refactoring tools
- Enhanced team collaboration

**Migration Plan:**
1. **Phase 1:** Setup TypeScript configuration
2. **Phase 2:** Migrate utility functions
3. **Phase 3:** Migrate components gradually
4. **Phase 4:** Migrate API services
5. **Phase 5:** Add strict type checking

**Considerations:**
- Gradual migration to avoid disruption
- Team training on TypeScript
- Updated build configuration
- Type definitions for external libraries

**Acceptance Criteria:**
- [ ] TypeScript configuration setup
- [ ] Core utilities migrated
- [ ] Key components migrated
- [ ] API services typed
- [ ] Strict mode enabled

---

### Issue #11: [LOW] Progressive Web App (PWA)
**Priority:** P3 - Low  
**Type:** Enhancement  
**Labels:** `frontend`, `pwa`, `mobile`

**Description:**
Implement PWA features to improve mobile experience and enable offline functionality.

**PWA Features:**
- Service worker for caching
- Offline functionality
- Install prompt
- Push notifications
- Background sync

**Implementation Requirements:**
- Service worker registration
- Cache strategies for different content types
- Offline fallback pages
- Manifest file configuration
- Push notification setup

**Benefits:**
- Better mobile experience
- Reduced server load
- Offline access to cached data
- Native app-like experience
- Improved performance

**Acceptance Criteria:**
- [ ] Service worker implemented
- [ ] Caching strategies defined
- [ ] Offline functionality
- [ ] App manifest configured
- [ ] Install prompt working

---

### Issue #12: [LOW] Design System Implementation
**Priority:** P3 - Low  
**Type:** Enhancement  
**Labels:** `frontend`, `design`, `ui-ux`

**Description:**
Create a consistent design system with reusable components and standardized styling.

**Current Issues:**
- Inconsistent UI components
- No standardized color palette
- Inconsistent spacing and typography
- No component library

**Design System Components:**
1. **Design Tokens:**
   - Color palette
   - Typography scale
   - Spacing system
   - Border radius values
   - Shadow definitions

2. **Component Library:**
   - Button variants
   - Form components
   - Card components
   - Navigation components
   - Modal/Dialog components

3. **Documentation:**
   - Storybook implementation
   - Usage guidelines
   - Component API documentation

**Implementation Tools:**
- Storybook for component documentation
- Design tokens in CSS/JS
- Component testing
- Visual regression testing

**Acceptance Criteria:**
- [ ] Design tokens defined
- [ ] Component library created
- [ ] Storybook documentation
- [ ] Visual consistency across app
- [ ] Developer guidelines documented

---

## 🔧 ISSUES DE INFRAESTRUTURA

### Issue #13: [MEDIUM] CI/CD Pipeline Setup
**Priority:** P2 - Medium  
**Type:** DevOps  
**Labels:** `devops`, `ci-cd`, `automation`

**Description:**
Implement CI/CD pipeline for automated testing, building, and deployment.

**Current State:**
- Manual deployment process
- No automated testing on commits
- No build validation
- No deployment automation

**Pipeline Requirements:**
1. **Continuous Integration:**
   - Automated testing on pull requests
   - Code quality checks (ESLint, Prettier)
   - Security scanning
   - Build validation

2. **Continuous Deployment:**
   - Automated deployment to staging
   - Production deployment with approval
   - Rollback capability
   - Environment-specific configuration

**Tools & Technologies:**
- GitHub Actions for CI/CD
- Docker for containerization
- Environment management
- Automated database migrations

**Pipeline Stages:**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    - Run tests
    - Code quality checks
    - Security scanning
  build:
    - Build Docker images
    - Push to registry
  deploy:
    - Deploy to staging
    - Run integration tests
    - Deploy to production (manual approval)
```

**Acceptance Criteria:**
- [ ] GitHub Actions workflow configured
- [ ] Automated testing on PRs  
- [ ] Code quality gates
- [ ] Automated deployment to staging
- [ ] Production deployment with approval

---

### Issue #14: [MEDIUM] Health Monitoring System
**Priority:** P2 - Medium  
**Type:** Monitoring  
**Labels:** `monitoring`, `backend`, `devops`

**Description:**
Implement comprehensive health monitoring and alerting system.

**Current Issues:**
- No health check endpoints
- No application metrics
- No error tracking
- No performance monitoring

**Monitoring Requirements:**
1. **Health Checks:**
   - Application health endpoint
   - Database connectivity check
   - External service checks
   - Resource usage monitoring

2. **Metrics Collection:**
   - HTTP request metrics
   - Database query performance
   - Memory and CPU usage
   - Error rates and response times

3. **Alerting:**
   - Error rate thresholds
   - Performance degradation alerts
   - Service unavailability alerts
   - Resource exhaustion warnings

**Implementation:**
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

**Tools:**
- Prometheus for metrics collection
- Grafana for dashboards
- AlertManager for notifications
- Health check libraries

**Acceptance Criteria:**
- [ ] Health check endpoints implemented
- [ ] Metrics collection setup
- [ ] Dashboard created
- [ ] Alerting configured
- [ ] Documentation provided

---

## 📱 ISSUES DE MOBILE/UX

### Issue #15: [LOW] Mobile Responsiveness Optimization
**Priority:** P3 - Low  
**Type:** Enhancement  
**Labels:** `frontend`, `mobile`, `ux`

**Description:**
Optimize the application for mobile devices with improved responsive design.

**Current Issues:**
- Inconsistent mobile breakpoints
- Navigation not optimized for mobile
- Touch targets too small
- Horizontal scrolling on small screens

**Mobile Optimization Requirements:**
1. **Responsive Design:**
   - Consistent breakpoint system
   - Mobile-first approach
   - Flexible grid layouts
   - Optimized typography scaling

2. **Mobile Navigation:**
   - Collapsible sidebar menu
   - Touch-friendly navigation
   - Gesture support
   - Swipe interactions

3. **Touch Optimization:**
   - Minimum 44px touch targets
   - Accessible form controls
   - Optimized button sizes
   - Gesture-friendly interactions

**Implementation:**
```javascript
// Tailwind config optimization
module.exports = {
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px', 
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

**Testing Requirements:**
- Cross-device testing
- Touch interaction testing
- Performance on mobile networks
- Accessibility compliance

**Acceptance Criteria:**
- [ ] Mobile-first responsive design
- [ ] Optimized navigation for mobile
- [ ] Touch-friendly interactions
- [ ] Cross-device testing completed
- [ ] Performance optimization for mobile

---

# 📊 ISSUE PRIORITY MATRIX

## Immediate Action Required (P0)
- Issue #1: JWT Secret Validation
- Issue #2: Global Error Handler  
- Issue #3: .gitignore Incomplete

## Next Sprint (P1)
- Issue #4: Structured Logging
- Issue #5: Database Performance
- Issue #6: Frontend Error Boundaries

## Following Sprint (P2)  
- Issue #7: Test Coverage
- Issue #8: API Documentation
- Issue #9: Input Validation
- Issue #13: CI/CD Pipeline
- Issue #14: Health Monitoring

## Future Enhancements (P3)
- Issue #10: TypeScript Migration
- Issue #11: Progressive Web App
- Issue #12: Design System
- Issue #15: Mobile Optimization

---

# 🏷️ LABELS TO CREATE IN GITHUB

## Priority Labels
- `P0-critical` (Red)
- `P1-high` (Orange)  
- `P2-medium` (Yellow)
- `P3-low` (Green)

## Type Labels
- `bug` (Red)
- `enhancement` (Blue)
- `security` (Purple)
- `performance` (Orange)
- `documentation` (Gray)

## Component Labels
- `backend` (Blue)
- `frontend` (Green)
- `database` (Orange)
- `devops` (Purple)
- `mobile` (Pink)

## Status Labels
- `ready-for-dev` (Green)
- `in-progress` (Yellow)
- `needs-review` (Orange)
- `blocked` (Red)

---

*Created: 26/07/2025 - Total Issues: 15*  
*Estimated Development Time: 4-6 months*  
*Recommended Team Size: 2-3 developers*

# City Intelligence Layer - API Documentation

## 🎯 Overview

The City Intelligence Layer consists of **15 advanced analytics modules** that analyze complaint data to provide deep insights into city operations. All modules follow strict safety rules:

- ✅ **Read-only access** to complaint data
- ✅ **No modifications** to existing complaint logic
- ✅ **Separate collections** for intelligence data
- ✅ **Fail-safe error handling**
- ✅ **Zero frontend dependencies**

---

## 📡 API Endpoints

### Module 1: Urban Memory Vault
**Base Path:** `/api/v1/intelligence/memory`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sync` | Sync resolved complaints to memory vault |
| GET | `/area/:areaId` | Get area history |
| GET | `/department/:dept` | Get department history |
| GET | `/insights` | Get pattern insights |

**Example:**
```bash
# Sync memory
curl -X POST http://localhost:3000/api/v1/intelligence/memory/sync \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'

# Get area history
curl http://localhost:3000/api/v1/intelligence/memory/area/Downtown
```

---

### Module 2: Silent Problem Detector
**Base Path:** `/api/v1/intelligence/silent`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Detect silent zones |
| GET | `/active` | Get active silent zones |
| GET | `/history` | Get historical silent periods |
| PATCH | `/resolve/:flagId` | Resolve silent flag |

**Example:**
```bash
# Detect silent zones
curl -X POST http://localhost:3000/api/v1/intelligence/silent/analyze \
  -H "Content-Type: application/json" \
  -d '{"days": 7, "threshold": 0.5}'
```

---

### Module 3: Urban DNA Profile
**Base Path:** `/api/v1/intelligence/dna`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate/:areaId` | Generate DNA profile for area |
| GET | `/area/:areaId` | Get area DNA profile |
| GET | `/all` | Get all area profiles |
| GET | `/risk-map` | Get city-wide risk map |

**Example:**
```bash
# Generate DNA profile
curl -X POST http://localhost:3000/api/v1/intelligence/dna/generate/Downtown \
  -H "Content-Type: application/json" \
  -d '{"days": 90}'

# Get risk map
curl http://localhost:3000/api/v1/intelligence/dna/risk-map
```

---

### Module 4: Admin Cognitive Load Panel
**Base Path:** `/api/v1/intelligence/load`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/:adminId` | Calculate admin workload |
| GET | `/department/:dept` | Calculate department load |
| GET | `/alerts` | Get overload alerts |
| GET | `/history/:adminId` | Get admin load history |

**Example:**
```bash
# Get admin load
curl http://localhost:3000/api/v1/intelligence/load/admin/ADMIN_ID?days=7

# Get department load
curl http://localhost:3000/api/v1/intelligence/load/department/water?days=7
```

---

### Module 5: City Resilience Index
**Base Path:** `/api/v1/intelligence/resilience`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/area/:areaId` | Calculate area resilience |
| GET | `/city` | Get city-wide resilience |
| GET | `/trends` | Get resilience trends |

**Example:**
```bash
# Calculate area resilience
curl http://localhost:3000/api/v1/intelligence/resilience/area/Downtown?days=30

# Get city resilience
curl http://localhost:3000/api/v1/intelligence/resilience/city
```

---

### Module 6: Feedback Loop Engine
**Base Path:** `/api/v1/intelligence/feedback`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze learning patterns |
| GET | `/improvements` | Get improvement metrics |
| GET | `/department/:dept` | Get department learning |

**Example:**
```bash
# Analyze learning patterns
curl -X POST http://localhost:3000/api/v1/intelligence/feedback/analyze \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'
```

---

### Modules 7-15: Advanced Intelligence
**Base Path:** `/api/v1/intelligence/advanced`

| Module | Endpoint | Description |
|--------|----------|-------------|
| 7. Decision Score | POST `/decision/analyze` | Analyze complexity |
| 7. Decision Score | GET `/decision/metrics` | Get complexity metrics |
| 8. Time Intelligence | GET `/time/peaks` | Analyze peak hours |
| 9. Trust | POST `/trust/calculate/:areaId` | Calculate trust score |
| 9. Trust | GET `/trust/city` | Get city-wide trust |
| 10. Ethics | POST `/ethics/audit` | Perform fairness audit |
| 11. Anomaly | POST `/anomaly/detect` | Detect anomalies |
| 11. Anomaly | GET `/anomaly/active` | Get active anomalies |
| 12. Nervous System | GET `/nervous/graph` | Generate system graph |
| 13. Fatigue | POST `/fatigue/measure/:areaId` | Measure fatigue |
| 13. Fatigue | GET `/fatigue/city` | Get city fatigue |
| 14. Future Shadow | GET `/future/trends` | Project trends |
| 15. Consciousness | GET `/consciousness` | Get city health summary |

**Example:**
```bash
# Get peak hours
curl http://localhost:3000/api/v1/intelligence/advanced/time/peaks?days=30

# Get city consciousness
curl http://localhost:3000/api/v1/intelligence/advanced/consciousness?days=7

# Detect anomalies
curl -X POST http://localhost:3000/api/v1/intelligence/advanced/anomaly/detect \
  -H "Content-Type: application/json" \
  -d '{"days": 7}'
```

---

## 🎛️ Master Dashboard

**Endpoint:** `GET /api/v1/intelligence/advanced/dashboard`

Returns aggregated intelligence from all modules:

```bash
curl http://localhost:3000/api/v1/intelligence/advanced/dashboard
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-02-03T11:30:00.000Z",
  "dashboard": {
    "consciousness": {
      "summary": "City is healthy. 12.5 complaints/day. 75% resolved. 15 pending issues.",
      "health": "healthy",
      "metrics": { ... }
    },
    "trust": {
      "avgTrust": 72.5,
      "scores": [ ... ]
    },
    "fatigue": {
      "avgFatigue": 35.2,
      "criticalAreas": 2
    },
    "anomalies": {
      "count": 3,
      "anomalies": [ ... ]
    }
  }
}
```

---

## 🔒 Safety Guarantees

### Read-Only Complaint Access
All modules use `SafeQuery` utility:
```javascript
const result = await SafeQuery.getComplaints(filter);
// Uses .lean() for read-only access
// No .save(), .update(), or mutations allowed
```

### Separate Collections
Each module stores data in its own collection:
- `UrbanMemory` - Module 1
- `SilentFlag` - Module 2
- `UrbanDNA` - Module 3
- `AdminLoad` - Module 4
- `ResilienceScore` - Module 5
- `FeedbackLoop` - Module 6
- `DecisionScore` - Module 7
- `TrustScore` - Module 9
- `EthicsAudit` - Module 10
- `AnomalyLog` - Module 11
- `FatigueIndex` - Module 13

### Error Handling
All operations wrapped in try/catch:
```javascript
try {
  // Intelligence operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ success: false, error: error.message });
}
```

---

## 🚀 Quick Start

### 1. Server is Already Running
The intelligence layer is automatically loaded when your server starts:
```
🧠 Loading City Intelligence Layer...
✅ City Intelligence Layer loaded successfully
```

### 2. Test Basic Endpoints
```bash
# Get city consciousness
curl http://localhost:3000/api/v1/intelligence/advanced/consciousness

# Get master dashboard
curl http://localhost:3000/api/v1/intelligence/advanced/dashboard
```

### 3. Sync Historical Data
```bash
# Sync memory vault
curl -X POST http://localhost:3000/api/v1/intelligence/memory/sync

# Generate DNA profiles
curl -X POST http://localhost:3000/api/v1/intelligence/dna/generate/YourAreaId

# Detect anomalies
curl -X POST http://localhost:3000/api/v1/intelligence/advanced/anomaly/detect
```

---

## 📊 Module Capabilities

| Module | Key Capability | Use Case |
|--------|----------------|----------|
| 1. Urban Memory | Long-term pattern storage | Historical analysis |
| 2. Silent Problems | Detect missing complaints | Proactive monitoring |
| 3. Urban DNA | Area behavioral fingerprints | Risk assessment |
| 4. Admin Load | Workload & burnout tracking | Resource allocation |
| 5. Resilience | Recovery speed measurement | System health |
| 6. Feedback Loop | System learning tracking | Continuous improvement |
| 7. Decision Score | Complexity analysis | Process optimization |
| 8. Time Intelligence | Peak hour detection | Staffing optimization |
| 9. Trust | Citizen satisfaction | Service quality |
| 10. Ethics | Fairness auditing | Bias detection |
| 11. Anomaly | Spike detection | Early warning |
| 12. Nervous System | Flow visualization | Bottleneck identification |
| 13. Fatigue | Burnout detection | Wellness monitoring |
| 14. Future Shadow | Trend projection | Resource planning |
| 15. Consciousness | City health summary | Executive dashboard |

---

## 🎯 Best Practices

1. **Regular Syncing**: Run memory sync daily
2. **Periodic Analysis**: Analyze patterns weekly
3. **Monitor Alerts**: Check anomalies and fatigue daily
4. **Review Trends**: Check resilience and trust monthly
5. **Dashboard Review**: Use master dashboard for quick overview

---

## ⚠️ Important Notes

- All endpoints are **admin-only** (add auth middleware as needed)
- Intelligence data is **derived** from complaints, never modifies them
- Modules can run **independently** without affecting each other
- **No frontend changes** required - pure backend intelligence
- All operations are **non-blocking** and fail-safe

---

## 🔧 Troubleshooting

**Issue:** Routes not loading
```bash
# Check server logs for:
🧠 Loading City Intelligence Layer...
✅ City Intelligence Layer loaded successfully
```

**Issue:** No data returned
```bash
# Ensure complaints exist in database
# Run sync operations first
curl -X POST http://localhost:3000/api/v1/intelligence/memory/sync
```

**Issue:** Module errors
```bash
# All errors are logged with module name
# Check console for: ❌ [ModuleName] error: ...
```

---

## 📈 Performance

- **Read-only queries**: No impact on complaint operations
- **Aggregation pipelines**: Optimized with indexes
- **Caching**: Module 8 (Time Intelligence) uses optional caching
- **Background processing**: Sync operations can be scheduled

---

## 🎉 Success!

Your City Intelligence Layer is now fully operational with **15 advanced modules** providing deep insights into city operations while maintaining **complete safety** and **zero interference** with existing complaint workflows.

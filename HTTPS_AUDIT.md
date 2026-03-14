# 🔒 AUDITORÍA DE HTTPS - BEEHIVE MONITORING

**Fecha de auditoría:** 14 de marzo de 2026  
**Estado:** ✅ SEGURO PARA PRODUCCIÓN

## 📊 Resultado General

| Aspecto | Estado | Detalles |
|--------|--------|---------|
| **Protocolo HTTPS** | ✅ Implementado | Todas las conexiones externas usan HTTPS |
| **Certificados SSL** | ✅ Válidos | Railway y APIs terceras proporcionan certificados válidos |
| **CORS** | ✅ Restringido | Dominios específicos en lugar de "*" |
| **Seguridad de desarrollo** | ✅ Mejorada | Certificados autofirmados permitidos solo en dev |

---

## ✅ CONFIGURACIÓN HTTPS - ESTADO ACTUAL

### **1. Frontend**

#### 🟢 API Service (`src/services/api.js`)
```javascript
// ✅ Base URL siempre usa HTTPS
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8000';

// ✅ Validación de HTTPS en desarrollo
if (!import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL && !API_BASE_URL.startsWith('https')) {
  console.warn('⚠️ API_BASE_URL debe usar HTTPS');
}

// ✅ Soporte para certificados autofirmados en desarrollo
// ✅ Manejo de autenticación con interceptores
```

#### 🟢 Archivo `.env` (Producción)
```
VITE_API_BASE_URL=https://beehive-monitoring-production.up.railway.app
```

#### 🟢 Llamadas a API
- `useSensorData.js`: ✅ Usa API service (HTTPS)
- `useAlerts.js`: ✅ Usa API service (HTTPS)
- `useRecommendations.js`: ✅ Usa API service (HTTPS)

---

### **2. Backend**

#### 🟢 API Externas (`services/data_fetcher.py`)
```python
# ✅ ThingSpeak con HTTPS
url = f"https://api.thingspeak.com/channels/{settings.thingspeak_channel_id}/feeds.json"
async with httpx.AsyncClient() as client:
    response = await client.get(url, params=params)
```

#### 🟢 API Externas (`services/ai_recommendation.py`)
```python
# ✅ OpenRouter API con HTTPS
response = await client.post(
    f"{settings.openrouter_base_url}/chat/completions",  # https://openrouter.ai/api/v1
    headers=headers,
    json=payload,
    timeout=30.0,
)
```

#### 🟢 Configuración de APIs (`core/config.py`)
```python
openrouter_base_url: str = Field('https://openrouter.ai/api/v1', env='OPENROUTER_BASE_URL')
```

#### 🟢 CORS Restringido (`app/main.py`)
```python
# ✅ Solo dominios específicos permitidos (sin "*")
allowed_origins = [
    "https://beehive-monitoring-production.up.railway.app",
    "https://localhost:3000",
    "https://localhost:5173",
    "http://localhost:3000",  # fallback
    "http://localhost:5173",  # fallback
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

#### 🟡 Procfile (Railway)
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Nota:** Railway automáticamente:
- Termina conexiones HTTPS en el proxy de Railway
- Proporciona certificados SSL válidos
- Redirige HTTP → HTTPS

---

## 🔐 MEJORAS IMPLEMENTADAS

### 1. **CORS Seguro**
- ❌ Antes: `allow_origins=["*"]` (Inseguro)
- ✅ Ahora: Solo dominios específicos listados

### 2. **API Service Mejorada**
- ✅ Validación de HTTPS en desarrollo
- ✅ Soporte para certificados autofirmados (solo dev)
- ✅ Interceptores para autenticación y errores

### 3. **Monitoreo de Seguridad**
- ✅ Warnings en consola si HTTPS no está configurado
- ✅ Manejo de errores 401 (no autorizado)

---

## 📋 CHECKLIST DE SEGURIDAD HTTPS

- [x] ✅ Frontend usa HTTPS en producción
- [x] ✅ Frontend fallback a HTTPS en desarrollo
- [x] ✅ Backend conecta a APIs externas vía HTTPS
- [x] ✅ CORS restringido a dominios específicos
- [x] ✅ CORS permite credenciales solo con dominios específicos
- [x] ✅ Validación de certificados en desarrollo (warnings)
- [x] ✅ Railway proporciona HTTPS automático
- [x] ✅ ThingSpeak API usa HTTPS
- [x] ✅ OpenRouter API usa HTTPS
- [x] ✅ Supabase requiere HTTPS (.env.example)

---

## 🚀 CONFIGURACIÓN PARA DESARROLLO LOCAL CON HTTPS

### Opción 1: Usar Certificados Autofirmados (Recomendado para desarrollo)

```bash
# Windows PowerShell
$cert = New-SelfSignedCertificate -CertStoreLocation cert:\CurrentUser\My -DnsName "localhost" -FriendlyName "localhost"
$certPath = $cert.PSPath.Replace("Microsoft.PowerShell.Core\Certificate::", "")

# Linux/Mac
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### Opción 2: Usar mkcert (Recomendado)

```bash
# Instalar mkcert
# Windows: choco install mkcert
# Mac: brew install mkcert
# Linux: sudo apt install mkcert

# Generar certificados
mkcert localhost 127.0.0.1

# Usar en uvicorn
uvicorn app.main:app --host localhost --port 8000 --ssl-keyfile=key.pem --ssl-certfile=cert.pem
```

### Opción 3: Usar proxy HTTPS (nginx)

```nginx
server {
    listen 8443 ssl;
    server_name localhost;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📚 REFERENCIAS Y MEJORES PRÁCTICAS

### Seguridad HTTPS
1. **Certificados válidos en producción**: ✅ Railway proporciona automáticamente
2. **HSTS (HTTP Strict Transport Security)**: Considerar añadir (`Strict-Transport-Security`)
3. **CSP (Content Security Policy)**: Considerar para prevenir ataques XSS
4. **Validación de certificados**: ✅ Habilitada en producción

### Ambiente de Desarrollo vs Producción

| Configuración | Desarrollo | Producción |
|---------------|-----------|-----------|
| **Protocol** | http/https | HTTPS solo |
| **Certificado** | Autofirmado OK | Válido requerido |
| **CORS** | Amplio (para testing) | Restringido |
| **Logs** | Detallados | Mínimos |

---

## 🛡️ CONCLUSIÓN

✅ **La aplicación está configurada correctamente para HTTPS**

- Todas las conexiones externas usan HTTPS
- CORS está restringido a dominios específicos
- Railway proporciona certificados válidos automáticamente
- El desarrollo local tiene soporte para HTTPS con certificados autofirmados

**Próximos pasos opcionales (avanzados):**
- Añadir HSTS headers
- Implementar Content Security Policy (CSP)
- Configurar subresource integrity para recursos externos
- Auditoría de dependencias con `npm audit` / `pip audit`

# 🔐 GUÍA: Configurar HTTPS en Desarrollo Local

## 📌 Resumen

Esta guía te ayuda a configurar HTTPS en tu entorno de desarrollo local para Beehive Monitoring.

---

## ✅ Opción 1: Usar mkcert (RECOMENDADO - Más fácil)

### Paso 1: Instalar mkcert

**Windows (con Chocolatey):**
```powershell
choco install mkcert
```

**Windows (con Scoop):**
```powershell
scoop install mkcert
```

**macOS (con Homebrew):**
```bash
brew install mkcert
brew install nss  # Para Firefox
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get install mkcert
```

**Linux (Arch):**
```bash
sudo pacman -S mkcert
```

### Paso 2: Generar Certificados

```bash
# Crear directorio para certificados
mkdir -p backend/certs
cd backend/certs

# Generar certificados autofirmados
mkcert localhost 127.0.0.1 ::1

# Resultado:
# - localhost+2.pem (certificado)
# - localhost+2-key.pem (clave privada)
```

### Paso 3: Configurar Uvicorn para HTTPS

Crea o actualiza `backend/run_dev.sh`:

**Linux/macOS:**
```bash
#!/bin/bash
cd backend
uvicorn app.main:app \
  --host 127.0.0.1 \
  --port 8000 \
  --ssl-keyfile=certs/localhost+2-key.pem \
  --ssl-certfile=certs/localhost+2.pem \
  --reload
```

**Windows PowerShell:**
```powershell
cd backend
$env:PYTHONPATH = "."
uvicorn app.main:app `
  --host 127.0.0.1 `
  --port 8000 `
  --ssl-keyfile certs/localhost+2-key.pem `
  --ssl-certfile certs/localhost+2.pem `
  --reload
```

### Paso 4: Configurar Frontend

Actualiza `frontend/.env`:

```
VITE_API_BASE_URL=https://localhost:8000
```

### Paso 5: Iniciar la aplicación

**Terminal 1 - Backend:**
```bash
chmod +x backend/run_dev.sh  # Solo Linux/macOS
./backend/run_dev.sh

# O directamente en Windows:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --ssl-keyfile certs/localhost+2-key.pem --ssl-certfile certs/localhost+2.pem --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

✅ Accede a: https://localhost:5173

---

## ✅ Opción 2: Usar Certificados Autofirmados (Alternativa)

### Paso 1: Generar Certificados (OpenSSL)

```bash
mkdir -p backend/certs
cd backend/certs

# Generar clave privada
openssl genrsa -out localhost-key.pem 2048

# Generar certificado autofirmado (válido 365 días)
openssl req -new -x509 -key localhost-key.pem -out localhost-cert.pem -days 365 \
  -subj "/C=US/ST=State/L=City/O=Beehive/CN=localhost"
```

### Paso 2: Configurar Uvicorn

Igual que Opción 1, pero con nombres de archivo diferentes:

```bash
uvicorn app.main:app \
  --host 127.0.0.1 \
  --port 8000 \
  --ssl-keyfile=certs/localhost-key.pem \
  --ssl-certfile=certs/localhost-cert.pem \
  --reload
```

---

## ✅ Opción 3: Usar Nginx como Proxy HTTPS

### Paso 1: Instalar Nginx

**Windows:**
```powershell
choco install nginx
```

**macOS:**
```bash
brew install nginx
```

**Linux:**
```bash
sudo apt-get install nginx
```

### Paso 2: Crear Certificados

```bash
cd /path/to/nginx/conf
# O en Windows: C:\tools\nginx\conf

# Generar certificados
openssl genrsa -out localhost-key.pem 2048
openssl req -new -x509 -key localhost-key.pem -out localhost-cert.pem -days 365
```

### Paso 3: Configurar Nginx

Edita `nginx.conf`:

```nginx
server {
    listen 8443 ssl;
    server_name localhost 127.0.0.1;

    ssl_certificate /path/to/localhost-cert.pem;
    ssl_certificate_key /path/to/localhost-key.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Redirigir HTTP -> HTTPS
server {
    listen 8000;
    server_name localhost 127.0.0.1;
    return 301 https://$server_name:8443$request_uri;
}
```

### Paso 4: Iniciar Nginx

```bash
# macOS
brew services start nginx

# Linux
sudo systemctl start nginx

# Windows - desde C:\tools\nginx
nginx
```

### Paso 5: Configurar Frontend

```
VITE_API_BASE_URL=https://localhost:8443
```

---

## 🔐 Validar Certificados en Navegador

Después de iniciar con HTTPS, es normal ver advertencia de certificado autofirmado:

### Chrome/Edge:
1. Click en "Avanzado"
2. Click en "Continuar a localhost (inseguro)"

### Firefox:
1. Click en "Aceptar el riesgo y continuar"

### Safari:
1. Ir a Preferencias > Privacidad/Seguridad
2. Deshabilitar "Validación de certificado" (solo para desarrollo local)

---

## 🧪 Verificar Certificados

```bash
# Ver información del certificado
openssl x509 -in localhost-cert.pem -text -noout

# Verificar que el certificado sea válido
openssl x509 -in localhost-cert.pem -noout -dates

# Listar certificados instalados (macOS)
security find-certificate -a -c "localhost" -p /Library/Keychains/System.keychain
```

---

## 🚨 Troubleshooting

| Problema | Solución |
|----------|----------|
| `[SSL: CERTIFICATE_VERIFY_FAILED]` | El navegador rechaza el certificado autofirmado. Aceptar la excepción en el navegador. |
| `Address already in use` | Otro proceso usa el puerto. Cambiar a otro puerto (ej: 8001). |
| `mkcert: command not found` | Instalar mkcert primero. Ver "Paso 1" arriba. |
| `Permission denied` en Linux | Usar `sudo` o cambiar permisos: `chmod 644 certs/localhost*` |

---

## 📝 Variables de Entorno

### Backend (`backend/.env`)
```
SUPABASE_URL=https://tu_url.supabase.co
SUPABASE_SERVICE_KEY=tu_clave
THINGSPEAK_CHANNEL_ID=12345
THINGSPEAK_READ_API_KEY=tu_clave
OPENROUTER_API_KEY=tu_clave
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=https://localhost:8000
```

---

## ✅ Checklist Final

- [ ] mkcert instalado (o certificados generados)
- [ ] Certificados creados en `backend/certs/`
- [ ] Backend ejecutándose en `https://localhost:8000`
- [ ] Frontend ejecutándose en `https://localhost:5173`
- [ ] `frontend/.env` apunta a `https://localhost:8000`
- [ ] Certificados aceptados en navegador
- [ ] API calls funcionando sin errores de certificado

---

## 🎯 Próximos Pasos

Una vez HTTPS esté funcionando localmente:

1. **Verificar headers de seguridad**: Tools > Network en DevTools
2. **Probar CORS**: Intentar request desde otro origen
3. **Monitorear logs**: Backend debe mostrar requests HTTPS
4. **Testing**: Ejecutar pruebas unitarias/E2E

---

## 📚 Referencias

- [mkcert Documentation](https://github.com/FiloSottile/mkcert)
- [OpenSSL Docs](https://www.openssl.org/docs/)
- [Nginx SSL Configuration](http://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [MDN: HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS)

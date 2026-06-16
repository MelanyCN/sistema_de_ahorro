# AURA — Asistente Útil para el Rendimiento y Ahorro

Aplicación financiera personal para jóvenes de 20-25 años. Permite registrar ingresos y gastos, detectar gastos hormiga, establecer metas de ahorro y recibir recomendaciones basadas en reglas.

---

## Stack tecnológico

| Capa       | Tecnología                                  |
|------------|---------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, MUI, Zustand    |
| Backend    | Python 3.12, FastAPI, SQLAlchemy, Alembic   |
| Base datos | PostgreSQL 15                               |
| DevOps     | Docker, Docker Compose, Nginx               |

---

## Inicio rápido (Docker)

### Prerequisitos
- Docker Desktop instalado y corriendo
- Git

### 1. Clonar / descomprimir el proyecto
```bash
# Si clonaste desde git:
git clone <repo-url> aura
cd aura

# Si descomprimiste el zip:
cd aura
```

### 2. Levantar con Docker Compose
```bash
docker-compose up --build
```

Esto levanta automáticamente:
- PostgreSQL en `localhost:5432`
- Backend FastAPI en `localhost:8000`
- Frontend React en `localhost:5173`

### 3. Abrir la aplicación
- **App:** http://localhost:5173
- **API Swagger:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Credenciales demo
```
Email:    demo@aura.pe
Password: demo1234
```

---

## Desarrollo local (sin Docker)

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus datos de PostgreSQL

# Crear base de datos (necesitas PostgreSQL local)
psql -U postgres -c "CREATE DATABASE aura_db;"
psql -U postgres -c "CREATE USER aura_user WITH PASSWORD 'aura_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE aura_db TO aura_user;"

# Ejecutar script inicial
psql -U aura_user -d aura_db -f ../scripts/init.sql

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

---

## Variables de entorno

Crea `backend/.env` con:

```env
POSTGRES_SERVER=localhost
POSTGRES_USER=aura_user
POSTGRES_PASSWORD=aura_pass
POSTGRES_DB=aura_db
POSTGRES_PORT=5432
SECRET_KEY=cambia_esto_por_un_secret_seguro_openssl_rand_hex_32
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DEBUG=true
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

---

## Estructura del proyecto

```
aura/
├── backend/
│   ├── app/
│   │   ├── main.py              # Entrada FastAPI
│   │   ├── core/
│   │   │   ├── config.py        # Settings (pydantic-settings)
│   │   │   └── security.py      # JWT + bcrypt
│   │   ├── db/
│   │   │   ├── session.py       # Engine SQLAlchemy
│   │   │   └── base.py          # Importa modelos para Alembic
│   │   ├── models/              # Tablas ORM
│   │   ├── schemas/             # Validación Pydantic
│   │   └── api/v1/endpoints/    # Rutas REST
│   ├── alembic/                 # Migraciones
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/               # Una página por módulo
│   │   ├── components/          # Layout, Sidebar
│   │   ├── services/            # Axios + servicios API
│   │   ├── store/               # Zustand (auth)
│   │   └── types/               # Interfaces TypeScript
│   ├── package.json
│   └── Dockerfile
├── scripts/
│   └── init.sql                 # Crear tablas + datos demo
├── nginx/
│   └── nginx.conf
└── docker-compose.yml
```

---

## Módulos disponibles

| Módulo              | Descripción                                      |
|---------------------|--------------------------------------------------|
| Dashboard           | KPIs, gráficos semanales, insight automático     |
| Ingresos            | CRUD completo con tipos                          |
| Gastos              | CRUD completo con categorías y filtros           |
| Análisis            | 8 métricas calculadas + detalle por categoría    |
| Gastos Hormiga      | Detección automática de patrones repetitivos     |
| Metas de Ahorro     | CRUD con progreso, días restantes y estados      |
| Recomendaciones     | Motor de 6 reglas sin IA generativa              |
| Perfil Financiero   | Clasificación: AHORRADOR / MODERADO / EN RIESGO / GASTADOR |

---

## API endpoints principales

```
POST   /api/v1/auth/register          Registro
POST   /api/v1/auth/login             Login → JWT
GET    /api/v1/auth/me                Perfil del usuario

GET    /api/v1/ingresos/              Listar ingresos
POST   /api/v1/ingresos/              Crear ingreso
PUT    /api/v1/ingresos/{id}          Actualizar
DELETE /api/v1/ingresos/{id}          Eliminar

GET    /api/v1/gastos/                Listar gastos
POST   /api/v1/gastos/                Crear gasto
PUT    /api/v1/gastos/{id}            Actualizar
DELETE /api/v1/gastos/{id}            Eliminar

GET    /api/v1/metas/                 Listar metas
POST   /api/v1/metas/                 Crear meta
PUT    /api/v1/metas/{id}             Actualizar
DELETE /api/v1/metas/{id}             Eliminar

GET    /api/v1/analisis/              Análisis completo (mes/año)
GET    /api/v1/analisis/recomendaciones   Recomendaciones por reglas
GET    /api/v1/analisis/perfil-financiero Clasificación del usuario

GET    /api/v1/notificaciones/        Listar notificaciones
PUT    /api/v1/notificaciones/{id}/leer   Marcar como leída
```

Documentación interactiva completa en: http://localhost:8000/docs

---

## Migraciones con Alembic

```bash
cd backend

# Crear migración
alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones
alembic upgrade head

# Revertir
alembic downgrade -1
```

---

## Construir para producción

```bash
# Levanta también Nginx como proxy reverso
docker-compose --profile production up --build -d
```

La app quedará disponible en el puerto 80.

---

## Licencia

Proyecto educativo — uso libre.

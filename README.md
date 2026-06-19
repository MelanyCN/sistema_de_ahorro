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
docker-compose up --build -d
```

Esto levanta automáticamente:
- PostgreSQL en `localhost:5432`
- Backend FastAPI en `localhost:8000`
- Frontend React en `localhost:5173`

### 3. Insertar datos de prueba

El script `init.sql` crea las tablas, pero el seed de datos debe insertarse manualmente
debido a un desajuste entre los tipos enum de PostgreSQL y los que genera SQLAlchemy.
Esperar ~10 segundos a que el backend levante y luego ejecutar:

```bash
# Usuario demo (contraseña: demo1234)
docker exec aura_db psql -U aura_user -d aura_db -c "
INSERT INTO usuarios (nombre, apellido, email, edad, ingreso_mensual, password_hash)
VALUES ('Alex', 'Torres', 'demo@aura.pe', 23, 2630.00,
  '\$2b\$12\$5GQ.MJB3bGjqbDORlOhnf.8qAcserr/Uhz0zJl/rqI3v.ObEcxHJu')
ON CONFLICT (email) DO NOTHING;"

# Ingresos
docker exec aura_db psql -U aura_user -d aura_db -c "
WITH usr AS (SELECT id FROM usuarios WHERE email = 'demo@aura.pe')
INSERT INTO ingresos (usuario_id, monto, fecha, tipo, descripcion)
SELECT u.id, v.monto, v.fecha::DATE, v.tipo::tipo_ingreso, v.descripcion
FROM usr u, (VALUES
    (2200.00::numeric,'2025-06-01'::text,'Sueldo'::text,'Sueldo mensual'::text),
    (350.00::numeric, '2025-06-10','Freelance','Proyecto web'),
    (80.00::numeric,  '2025-06-14','Propina',  'Propinas acumuladas')
) AS v(monto,fecha,tipo,descripcion);"

# Gastos
docker exec aura_db psql -U aura_user -d aura_db -c "
WITH usr AS (SELECT id FROM usuarios WHERE email = 'demo@aura.pe')
INSERT INTO gastos (usuario_id, monto, fecha, categoria, descripcion, created_at)
SELECT u.id, v.monto, v.fecha::DATE, v.cat::categoriagasto, v.desc, NOW()
FROM usr u, (VALUES
    (220.00::numeric,'2025-06-04'::text,'alimentacion'::text,'Supermercado'::text),
    (180.00::numeric,'2025-06-05','compras',        'Ropa'),
    (150.00::numeric,'2025-06-13','educacion',       'Curso online'),
    (90.00::numeric, '2025-06-08','servicios',       'Luz + agua'),
    (80.00::numeric, '2025-06-02','transporte',      'Uber'),
    (60.00::numeric, '2025-06-06','salud',           'Farmacia'),
    (45.00::numeric, '2025-06-06','entretenimiento', 'Delivery'),
    (35.00::numeric, '2025-06-03','entretenimiento', 'Netflix'),
    (25.00::numeric, '2025-06-15','transporte',      'Gasolina'),
    (38.00::numeric, '2025-06-15','entretenimiento', 'Cine')
) AS v(monto,fecha,cat,desc);"

# Metas de ahorro
docker exec aura_db psql -U aura_user -d aura_db -c "
WITH usr AS (SELECT id FROM usuarios WHERE email = 'demo@aura.pe')
INSERT INTO metas (usuario_id, nombre, monto_objetivo, monto_actual, fecha_objetivo, estado, created_at)
SELECT u.id, v.nombre, v.obj::float, v.act::float, v.fecha::DATE, v.estado::estadometa, NOW()
FROM usr u, (VALUES
    ('Laptop nueva'::text,'2500.00'::text,'850.00'::text,'2025-09-01'::text,'activa'::text),
    ('Viaje a Lima',       '800.00',      '800.00',      '2025-07-15',      'completada')
) AS v(nombre,obj,act,fecha,estado);"
```

### 4. Abrir la aplicación
- **App:** http://localhost:5173
- **API Swagger:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Credenciales demo
```
Email:    demo@aura.pe
Password: demo1234
```

---

## Redespliegue

### Reinicio normal (mantener datos)
```bash
docker-compose down
docker-compose up -d
```
Los datos se preservan porque el volumen `aura_postgres_data` no se elimina.

### Rebuild (cambiaste código Python o TypeScript)
```bash
docker-compose down
docker-compose up --build -d
```

### Inicio limpio (borrar todo y empezar desde cero)
```bash
docker-compose down -v        # -v elimina también el volumen de la DB
docker-compose up --build -d
# Luego repetir el paso 3 para insertar los datos de prueba
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

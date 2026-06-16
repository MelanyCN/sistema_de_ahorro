-- ============================================================
--  AURA — Script SQL de inicialización
--  Base de datos: PostgreSQL 15+
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- búsqueda fuzzy

-- ─── TABLA: usuarios ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(100)        NOT NULL,
    apellido         VARCHAR(100)        NOT NULL,
    email            VARCHAR(255)        NOT NULL UNIQUE,
    edad             INTEGER             CHECK (edad >= 16 AND edad <= 100),
    ingreso_mensual  NUMERIC(12, 2)      NOT NULL DEFAULT 0.00,
    password_hash    VARCHAR(255)        NOT NULL,
    is_active        BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);

-- ─── TABLA: ingresos ─────────────────────────────────────────────────────────
CREATE TYPE tipo_ingreso AS ENUM (
    'Sueldo', 'Freelance', 'Propina', 'Negocio', 'Otros'
);

CREATE TABLE IF NOT EXISTS ingresos (
    id           SERIAL PRIMARY KEY,
    usuario_id   INTEGER          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    monto        NUMERIC(12, 2)   NOT NULL CHECK (monto > 0),
    fecha        DATE             NOT NULL DEFAULT CURRENT_DATE,
    tipo         tipo_ingreso     NOT NULL DEFAULT 'Sueldo',
    descripcion  VARCHAR(255),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_id  ON ingresos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha        ON ingresos (fecha);
-- CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_mes  ON ingresos (usuario_id, DATE_TRUNC('month', fecha));

-- ─── TABLA: gastos ───────────────────────────────────────────────────────────
CREATE TYPE categoria_gasto AS ENUM (
    'Alimentación', 'Transporte', 'Entretenimiento',
    'Educación', 'Salud', 'Servicios', 'Compras', 'Otros'
);

CREATE TABLE IF NOT EXISTS gastos (
    id           SERIAL PRIMARY KEY,
    usuario_id   INTEGER          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    monto        NUMERIC(12, 2)   NOT NULL CHECK (monto > 0),
    fecha        DATE             NOT NULL DEFAULT CURRENT_DATE,
    categoria    categoria_gasto  NOT NULL DEFAULT 'Otros',
    descripcion  VARCHAR(255),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gastos_usuario_id    ON gastos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha          ON gastos (fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria      ON gastos (categoria);
-- CREATE INDEX IF NOT EXISTS idx_gastos_usuario_mes    ON gastos (usuario_id, DATE_TRUNC('month', fecha));
CREATE INDEX IF NOT EXISTS idx_gastos_descripcion    ON gastos USING gin (descripcion gin_trgm_ops);

-- ─── TABLA: metas ────────────────────────────────────────────────────────────
CREATE TYPE estado_meta AS ENUM ('activa', 'completada', 'cancelada');

CREATE TABLE IF NOT EXISTS metas (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre          VARCHAR(200)     NOT NULL,
    monto_objetivo  NUMERIC(12, 2)   NOT NULL CHECK (monto_objetivo > 0),
    monto_actual    NUMERIC(12, 2)   NOT NULL DEFAULT 0.00 CHECK (monto_actual >= 0),
    fecha_objetivo  DATE,
    estado          estado_meta      NOT NULL DEFAULT 'activa',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metas_usuario_id ON metas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_metas_estado      ON metas (estado);

-- ─── TABLA: recomendaciones ──────────────────────────────────────────────────
CREATE TYPE tipo_recomendacion AS ENUM ('warn', 'info', 'success');

CREATE TABLE IF NOT EXISTS recomendaciones (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER             NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje     VARCHAR(500)        NOT NULL,
    tipo        tipo_recomendacion  NOT NULL DEFAULT 'info',
    fecha       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recs_usuario_id ON recomendaciones (usuario_id);

-- ─── TABLA: notificaciones ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificaciones (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje     VARCHAR(500) NOT NULL,
    leida       BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_usuario_id ON notificaciones (usuario_id);
CREATE INDEX IF NOT EXISTS idx_notif_leida       ON notificaciones (usuario_id, leida);

-- ─── TRIGGER: updated_at automático ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['usuarios','ingresos','gastos','metas'] LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;
            CREATE TRIGGER trg_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
        ', t, t, t, t);
    END LOOP;
END
$$;

-- ─── VISTA: resumen_mensual_usuario ──────────────────────────────────────────
CREATE OR REPLACE VIEW resumen_mensual_usuario AS
SELECT
    u.id                                        AS usuario_id,
    u.nombre || ' ' || u.apellido               AS nombre_completo,
    -- DATE_TRUNC('month', CURRENT_DATE)           AS mes_actual,
    COALESCE(SUM(i.monto), 0)                   AS total_ingresos,
    COALESCE(SUM(g.monto), 0)                   AS total_gastos,
    COALESCE(SUM(i.monto), 0) - COALESCE(SUM(g.monto), 0) AS balance,
    CASE
        WHEN COALESCE(SUM(i.monto), 0) > 0
        THEN ROUND(
            ((COALESCE(SUM(i.monto), 0) - COALESCE(SUM(g.monto), 0))
             / COALESCE(SUM(i.monto), 0)) * 100, 2)
        ELSE 0
    END AS porcentaje_ahorro
FROM usuarios u
LEFT JOIN ingresos i ON i.usuario_id = u.id
    -- AND DATE_TRUNC('month', i.fecha) = DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN gastos g ON g.usuario_id = u.id
    -- AND DATE_TRUNC('month', g.fecha) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.nombre, u.apellido;

-- ─── DATOS DE PRUEBA (seed) ──────────────────────────────────────────────────
-- Contraseña: demo1234 (bcrypt hash)
INSERT INTO usuarios (nombre, apellido, email, edad, ingreso_mensual, password_hash)
VALUES (
    'Alex', 'Torres',
    'demo@aura.pe',
    23,
    2630.00,
    '$2b$12$5GQ.MJB3bGjqbDORlOhnf.8qAcserr/Uhz0zJl/rqI3v.ObEcxHJu'
)
ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    edad = EXCLUDED.edad,
    ingreso_mensual = EXCLUDED.ingreso_mensual,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE,
    updated_at = NOW();

-- Ingresos de prueba
WITH usr AS (SELECT id FROM usuarios WHERE email = 'demo@aura.pe')
INSERT INTO ingresos (usuario_id, monto, fecha, tipo, descripcion)
SELECT u.id, v.monto, v.fecha::DATE, v.tipo::tipo_ingreso, v.descripcion
FROM usr u, (VALUES
    (2200.00, '2025-06-01', 'Sueldo',    'Sueldo mensual'),
    ( 350.00, '2025-06-10', 'Freelance', 'Proyecto web'),
    (  80.00, '2025-06-14', 'Propina',   'Propinas acumuladas')
) AS v(monto, fecha, tipo, descripcion)
ON CONFLICT DO NOTHING;

-- Gastos de prueba
WITH usr AS (SELECT id FROM usuarios WHERE email = 'demo@aura.pe')
INSERT INTO gastos (usuario_id, monto, fecha, categoria, descripcion)
SELECT u.id, v.monto, v.fecha::DATE, v.cat::categoria_gasto, v.descripcion
FROM usr u, (VALUES
    ( 45.00, '2025-06-01', 'Alimentación',    'Café con leche'),
    ( 12.00, '2025-06-01', 'Alimentación',    'Café con leche'),
    ( 80.00, '2025-06-02', 'Transporte',      'Uber'),
    ( 35.00, '2025-06-03', 'Entretenimiento', 'Netflix'),
    (220.00, '2025-06-04', 'Alimentación',    'Supermercado'),
    ( 15.00, '2025-06-04', 'Alimentación',    'Café con leche'),
    (180.00, '2025-06-05', 'Compras',         'Ropa'),
    ( 60.00, '2025-06-06', 'Salud',           'Farmacia'),
    ( 45.00, '2025-06-06', 'Entretenimiento', 'Delivery'),
    ( 12.00, '2025-06-07', 'Alimentación',    'Café con leche'),
    ( 90.00, '2025-06-08', 'Servicios',       'Luz + agua'),
    ( 55.00, '2025-06-09', 'Entretenimiento', 'Delivery'),
    ( 12.00, '2025-06-10', 'Alimentación',    'Café con leche'),
    ( 30.00, '2025-06-10', 'Transporte',      'Bus'),
    ( 45.00, '2025-06-11', 'Entretenimiento', 'Delivery'),
    ( 12.00, '2025-06-12', 'Alimentación',    'Café con leche'),
    (150.00, '2025-06-13', 'Educación',       'Curso online'),
    ( 12.00, '2025-06-14', 'Alimentación',    'Café con leche'),
    ( 25.00, '2025-06-15', 'Transporte',      'Gasolina'),
    ( 38.00, '2025-06-15', 'Entretenimiento', 'Cine')
) AS v(monto, fecha, cat, descripcion)
ON CONFLICT DO NOTHING;

-- Metas de prueba
WITH usr AS (SELECT id FROM usuarios WHERE email = 'demo@aura.pe')
INSERT INTO metas (usuario_id, nombre, monto_objetivo, monto_actual, fecha_objetivo, estado)
SELECT u.id, v.nombre, v.obj, v.act, v.fecha::DATE, v.estado::estado_meta
FROM usr u, (VALUES
    ('Laptop nueva',  2500.00,  850.00, '2025-09-01', 'activa'),
    ('Viaje a Lima',   800.00,  800.00, '2025-07-15', 'completada')
) AS v(nombre, obj, act, fecha, estado)
ON CONFLICT DO NOTHING;

-- ─── FIN DEL SCRIPT ──────────────────────────────────────────────────────────

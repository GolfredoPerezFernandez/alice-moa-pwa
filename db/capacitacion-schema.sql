-- Tabla para los cursos de capacitación
CREATE TABLE IF NOT EXISTS cursos_capacitacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    descripcion_completa TEXT,
    categoria TEXT CHECK (categoria IN ('seguridad', 'derechos', 'prevencion', 'igualdad', 'salud')),
    instructor TEXT,
    duracion TEXT,
    imagen_color TEXT DEFAULT 'bg-red-100 dark:bg-red-900/20',
    creado_por INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para los módulos de los cursos
CREATE TABLE IF NOT EXISTS modulos_curso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curso_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('video', 'document', 'quiz', 'interactive')),
    orden INTEGER NOT NULL,
    url_contenido TEXT,
    FOREIGN KEY (curso_id) REFERENCES cursos_capacitacion(id) ON DELETE CASCADE
);

-- Tabla para los recursos descargables de los cursos
CREATE TABLE IF NOT EXISTS recursos_curso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curso_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('pdf', 'excel', 'image', 'document', 'video')),
    url_recurso TEXT,
    FOREIGN KEY (curso_id) REFERENCES cursos_capacitacion(id) ON DELETE CASCADE
);

-- Tabla para el progreso de los usuarios en los cursos
CREATE TABLE IF NOT EXISTS progreso_curso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    modulo_id INTEGER NOT NULL,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos_curso(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, modulo_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON cursos_capacitacion(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_creador ON cursos_capacitacion(creado_por);
CREATE INDEX IF NOT EXISTS idx_modulos_curso ON modulos_curso(curso_id);
CREATE INDEX IF NOT EXISTS idx_recursos_curso ON recursos_curso(curso_id);
CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso_curso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progreso_modulo ON progreso_curso(modulo_id);
-- Contract Details Table
CREATE TABLE IF NOT EXISTS contract_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    community TEXT NOT NULL, -- Comunidad
    province TEXT NOT NULL, -- Provincia
    profession TEXT NOT NULL, -- Profesión
    contract_start_date DATE NOT NULL, -- Fecha de inicio del contrato
    contract_end_date DATE, -- Fecha de finalización del contrato (puede ser NULL para contratos indefinidos)
    contract_type TEXT NOT NULL, -- Tipo de contrato (Indefinido, Temporal, etc.)
    probation_period TEXT NOT NULL, -- Periodo de prueba (Sí, No)
    work_schedule_type TEXT NOT NULL, -- Tipo de jornada (Completa, Parcial, etc.)
    weekly_hours INTEGER, -- Horas semanales
    net_salary DECIMAL(10, 2), -- Salario Neto
    gross_salary DECIMAL(10, 2), -- Salario Bruto
    extra_payments TEXT, -- Pagas Extras
    sector TEXT, -- Sector / Sindicato
    contribution_group TEXT, -- Grupo de Cotización
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_contract_details_user_id ON contract_details(user_id);
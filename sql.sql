-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    notification_preferences JSONB DEFAULT '{"email": false, "push": false}'
);

-- Таблица питомцев
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(50),
    weight DECIMAL(5,2),
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица расписания кормления
CREATE TABLE feeding_schedules (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    feeding_time TIME NOT NULL,
    portion_size VARCHAR(50),
    food_type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица истории кормления
CREATE TABLE feeding_history (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    feeding_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    portion_size VARCHAR(50),
    food_type VARCHAR(100),
    notes TEXT,
    created_by INTEGER REFERENCES users(id)
);

-- Таблица для отслеживания веса
CREATE TABLE weight_history (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Таблица для медицинских записей
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    record_type VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    vet_name VARCHAR(255),
    next_appointment DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для уведомлений
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для настроек питомца
CREATE TABLE pet_settings (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    setting_key VARCHAR(50) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для активности питомца
CREATE TABLE pet_activities (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    duration INTEGER, -- в минутах
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by INTEGER REFERENCES users(id)
);

-- Таблица для дневниковых записей
CREATE TABLE pet_diary_entries (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    entry_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    mood VARCHAR(50),
    weight DECIMAL(5,2),
    food_intake VARCHAR(255),
    activity_level VARCHAR(50),
    health_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для медиафайлов
CREATE TABLE pet_media (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES pet_diary_entries(id) ON DELETE CASCADE,
    media_type VARCHAR(10), -- 'photo' или 'video'
    file_path VARCHAR(255),
    thumbnail_path VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_feeding_schedules_pet ON feeding_schedules(pet_id);
CREATE INDEX idx_feeding_history_pet ON feeding_history(pet_id);
CREATE INDEX idx_weight_history_pet ON weight_history(pet_id);
CREATE INDEX idx_medical_records_pet ON medical_records(pet_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_pet ON notifications(pet_id);
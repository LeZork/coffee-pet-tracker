require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const fs = require('fs');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;
const STATIC_IP = '192.168.0.107';

// Настройка базы данных
const pool = new Pool({
    user: process.env.DB_USER,
    host: STATIC_IP,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Middleware
app.use(cors({
    origin: ['http://185.3.172.83:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(morgan('combined')); // логирование запросов

// Middleware для проверки аутентификации
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Отсутствует токен аутентификации' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                message: 'Недействительный или просроченный токен' 
            });
        }
        req.user = user;
        next();
    });
};

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения разрешены'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Настройка multer для дневника
const storageDiary = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `uploads/pets/${req.params.petId}/diary`;
        // Создаем директорию, если она не существует
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadDiary = multer({
    storage: storageDiary,
    limits: {
        fileSize: 1000 * 1024 * 1024, // 100MB лимит
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Поддерживаются только изображения и видео'));
        }
    }
});

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Обработка ошибок multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Файл слишком большой. Максимальный размер 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Ошибка при загрузке файла'
        });
    }
    next(err);
});

// Настройка для обслуживания статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

   // Регистрация пользователя
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Пользователь с таким именем уже существует' 
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, hashedPassword, email]
        );
        res.status(201).json({ 
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ 
            success: false,
            message: 'Ошибка сервера при регистрации' 
        });
    }
});

   // Аутентификация пользователя
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Неверное имя пользователя или пароль' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Неверное имя пользователя или пароль' 
            });
        }

        const token = jwt.sign(
            { 
                id: user.rows[0].id,
                username: user.rows[0].username
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username
            }
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ 
            success: false,
            message: 'Ошибка сервера при входе в систему' 
        });
    }
});

// Добавление питомца с изображением
app.post('/api/pets', upload.single('image'), async (req, res) => {
    try {
        // Проверяем наличие обязательных полей
        const { name, birth_date, gender, species, breed, weight, owner_id } = req.body;
        
        if (!name || !birth_date || !gender || !species || !owner_id) {
            return res.status(400).json({
                success: false,
                message: 'Отсутствуют обязательные поля'
            });
        }

        // Создаем URL изображения, если оно было загружено
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        // Выполняем запрос к базе данных
        const newPet = await pool.query(
            `INSERT INTO pets (
                name, birth_date, gender, species, breed, 
                weight, owner_id, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [
                name,
                birth_date,
                gender,
                species,
                breed || null,
                weight || null,
                owner_id,
                image_url
            ]
        );

        res.json({
            success: true,
            pet: newPet.rows[0]
        });
    } catch (err) {
        console.error('Ошибка при добавлении питомца:', err);
        res.status(500).json({
            success: false,
            message: 'Ошибка при добавлении питомца: ' + err.message
        });
    }
});

   // Получение всех питомцев
   app.get('/api/pets', async (req, res) => {
       try {
           const pets = await pool.query('SELECT * FROM pets');
           res.json(pets.rows);
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });

   // Обновление питомца
app.put('/api/pets/:id', async (req, res) => {
    const { id } = req.params;
    const { name, weight, species, breed, birth_date, gender } = req.body;
    try {
        // Обновление питомца
        const updatedPet = await pool.query(
            'UPDATE pets SET name = $1, weight = $2, species = $3, breed = $4, birth_date = $5, gender = $6, last_updated = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
            [name, weight, species, breed, birth_date, gender, id]
        );

        // Добавление записи в weight_history если вес изменился
        if (weight) {
            await pool.query(
                'INSERT INTO weight_history (pet_id, weight) VALUES ($1, $2)',
                [id, weight]
            );
        }

        res.json({
            success: true,
            pet: updatedPet.rows[0]
        });
    } catch (err) {
        console.error('Ошибка при обновлении питомца:', err.message);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении питомца'
        });
    }
});

   // Удаление питомца
   app.delete('/api/pets/:id', async (req, res) => {
       const petId = req.params.id;

       try {
           // Получаем информацию о питомце из базы данных
           const pet = await pool.query('SELECT * FROM pets WHERE id = $1', [petId]);
           
           if (pet.rows.length === 0) {
               return res.status(404).json({ message: 'Питомец не найден' });
           }

           const imagePath = pet.rows[0].image; // Получаем путь к изображению

           // Удаляем питомца из базы данных
           await pool.query('DELETE FROM pets WHERE id = $1', [petId]);

           // Удаляем файл изображения, если он существует
           if (imagePath) {
               const fullPath = path.join(__dirname, imagePath); // Полный путь к изображению
               if (fs.existsSync(fullPath)) {
                   fs.unlink(fullPath, (err) => {
                       if (err) {
                           console.error('Ошибка при удалении изображения:', err);
                       } else {
                           console.log('Изображение успешно удалено:', fullPath);
                       }
                   });
               }
           }

           res.json({ message: 'Питомец успешно удален' });
       } catch (error) {
           console.error('Ошибка при удалении питомца:', error.message);
           res.status(500).json({ message: 'Ошибка при удалении питомца' });
       }
   });

   // Получение питомцев по пользователю
   app.get('/api/pets/:owner_id', async (req, res) => {
       const { owner_id } = req.params;
       try {
           const pets = await pool.query('SELECT * FROM pets WHERE owner_id = $1', [owner_id]);
           res.json(pets.rows);
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
    });

   // Получение истории питомца по ID
   app.get('/api/pets/:id/history', async (req, res) => {
       const { id } = req.params;
       try {
           const history = await pool.query('SELECT * FROM pet_history WHERE pet_id = $1 ORDER BY change_date DESC', [id]);
           res.json(history.rows);
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });
   // Обновление информации о пользователе
   app.put('/api/users/:id', async (req, res) => {
       const { id } = req.params;
       const { username, password } = req.body;
       try {
           const hashedPassword = await bcrypt.hash(password, 10);
           await pool.query(
               'UPDATE users SET username = $1, password = $2 WHERE id = $3',
               [username, hashedPassword, id]
           );
           res.json({ message: 'Профиль обновлен' });
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });

   // Получение питомца по ID
   app.get('/api/pets/:id', async (req, res) => {
       const { id } = req.params;
       console.log('Received request for pet with id:', id); // Для отладки
       try {
           const pet = await pool.query('SELECT * FROM pets WHERE id = $1', [id]);
           console.log('Query result:', pet.rows); // Для отладки
           if (pet.rows.length === 0) {
               return res.status(404).json({ message: 'Питомец не найден' });
           }
           res.json(pet.rows[0]);
       } catch (err) {
           console.error('Database query error:', err.message);
           res.status(500).send('Server error');
       }
   });

   // Получение данных текущего пользователя
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Пользователь не найден' 
            });
        }

        res.json({
            success: true,
            user: user.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).json({ 
            success: false,
            message: 'Ошибка сервера при получении данных пользователя' 
        });
    }
});

// Получение данных пользователя по ID
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT id, username, email, created_at, notification_preferences FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Преобразуем notification_preferences в объект, если они хранятся как строка
        const user = result.rows[0];
        if (typeof user.notification_preferences === 'string') {
            try {
                user.notification_preferences = JSON.parse(user.notification_preferences);
            } catch (e) {
                console.warn('Ошибка парсинга notification_preferences:', e);
                user.notification_preferences = { push: false, email: false };
            }
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении данных пользователя',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

   // Отправка уведомления
   app.post('/api/notify', async (req, res) => {
       const { email, message } = req.body;

       const mailOptions = {
           from: process.env.EMAIL_USER,
           to: email,
           subject: 'Уведомление о питомце',
           text: message
       };

       try {
           await transporter.sendMail(mailOptions);
           res.json({ message: 'Уведомление отправлено' });
       } catch (error) {
           console.error(error);
           res.status(500).send('Ошибка при отправке уведомления');
       }
   });

   // Пример задачи, которая будет выполняться каждый день в 8:00
   cron.schedule('0 8 * * *', () => {
       // Логика для отправки уведомлений о кормлении
       // Получите расписание кормления из базы данных и отправьте уведомления
       const message = 'Не забудьте покормить вашего питомца!';
       io.emit('feedingReminder', message); // Отправка уведомления всем подключенным клиентам
   });

// Получение расписания кормления питомца
app.get('/api/pets/:petId/feeding-schedule', async (req, res) => {
    const { petId } = req.params;
    try {
        const schedules = await pool.query(
            'SELECT * FROM feeding_schedules WHERE pet_id = $1 ORDER BY feeding_time',
            [petId]
        );
        res.json({
            success: true,
            schedules: schedules.rows || [] // Гарантируем, что всегда возвращается массив
        });
    } catch (error) {
        console.error('Ошибка при получении расписания:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении расписания',
            schedules: [] // Возвращаем пустой массив в случае ошибки
        });
    }
});

// Получение записей дневника
app.get('/api/pets/:petId/diary', authenticateToken, async (req, res) => {
    const { petId } = req.params;
    try {
        // Получаем записи дневника
        const entries = await pool.query(
            `SELECT d.*, 
                    json_agg(json_build_object(
                        'id', m.id,
                        'media_type', m.media_type,
                        'file_path', m.file_path,
                        'description', m.description
                    )) as media
             FROM pet_diary_entries d
             LEFT JOIN pet_media m ON d.id = m.entry_id
             WHERE d.pet_id = $1
             GROUP BY d.id
             ORDER BY d.entry_date DESC`,
            [petId]
        );

        res.json({
            success: true,
            entries: entries.rows
        });
    } catch (error) {
        console.error('Ошибка при получении записей дневника:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении записей дневника'
        });
    }
});

// Добавление новой записи в дневник
app.post('/api/pets/:petId/diary', authenticateToken, uploadDiary.array('media', 5), async (req, res) => {
    const { petId } = req.params;
    const { 
        notes, 
        mood, 
        weight, 
        foodIntake, 
        activityLevel, 
        healthNotes 
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Создаем запись в дневнике
        const entryResult = await client.query(
            `INSERT INTO pet_diary_entries 
            (pet_id, notes, mood, weight, food_intake, activity_level, health_notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [petId, notes, mood, weight, foodIntake, activityLevel, healthNotes]
        );

        const entryId = entryResult.rows[0].id;

        // Если есть файлы, сохраняем их
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const mediaType = file.mimetype.startsWith('image/') ? 'photo' : 'video';
                // Сохраняем путь как относительный URL
                const filePath = `http://185.3.172.83:5000/uploads/pets/${petId}/diary/${file.filename}`;
                await client.query(
                    `INSERT INTO pet_media 
                    (entry_id, media_type, file_path)
                    VALUES ($1, $2, $3)`,
                    [entryId, mediaType, filePath]
                );
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Запись добавлена успешно'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка при добавлении записи в дневник:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при добавлении записи в дневник'
        });
    } finally {
        client.release();
    }
});

// Удаление записи из дневника
app.delete('/api/pets/:petId/diary/:entryId', authenticateToken, async (req, res) => {
    const { petId, entryId } = req.params;

    try {
        // Получаем информацию о медиафайлах перед удалением
        const mediaFiles = await pool.query(
            'SELECT file_path FROM pet_media WHERE entry_id = $1',
            [entryId]
        );

        // Удаляем запись (каскадное удаление также удалит связанные медиафайлы из БД)
        await pool.query(
            'DELETE FROM pet_diary_entries WHERE id = $1 AND pet_id = $2',
            [entryId, petId]
        );

        // Удаляем физические файлы
        for (const file of mediaFiles.rows) {
            fs.unlink(file.file_path, (err) => {
                if (err) console.error('Ошибка при удалении файла:', err);
            });
        }

        res.json({
            success: true,
            message: 'Запись удалена успешно'
        });
    } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении записи'
        });
    }
});

// Создание HTTP сервера
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['http://185.3.172.83:3000', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Обработка WebSocket подключений
io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
    });
});

// Запуск сервера
server.listen(PORT, STATIC_IP, () => {
    console.log(`Server is running on http://${STATIC_IP}:${PORT}`);
});
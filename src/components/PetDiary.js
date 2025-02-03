import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Badge, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Calendar from 'react-calendar';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import 'react-calendar/dist/Calendar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/PetDiary.css';

// Регистрация компонентов графика
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const BASE_URL = 'http://185.3.172.83:5000';

const PetDiary = () => {
    const { id } = useParams();
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('list');
    const [modalImage, setModalImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Добавляем новые состояния
    const [sortConfig, setSortConfig] = useState({
        field: 'entry_date',
        direction: 'desc'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        mood: '',
        dateFrom: '',
        dateTo: '',
        activityLevel: ''
    });

    const [newEntry, setNewEntry] = useState({
        notes: '',
        mood: '',
        weight: '',
        foodIntake: '',
        activityLevel: '',
        healthNotes: '',
        files: []
    });

    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    // Вспомогательные функции
    const getMoodBadgeColor = (mood) => {
        switch(mood) {
            case 'happy': return 'success';
            case 'normal': return 'primary';
            case 'sad': return 'danger';
            default: return 'secondary';
        }
    };

    const getMoodEmoji = (mood) => {
        switch(mood) {
            case 'happy': return '😊';
            case 'normal': return '😐';
            case 'sad': return '😢';
            default: return '❓';
        }
    };

    const getActivityIcon = (level) => {
        switch(level) {
            case 'high': return '🏃';
            case 'normal': return '🚶';
            case 'low': return '😴';
            default: return '❓';
        }
    };

    const handleImageClick = (imagePath) => {
        setModalImage(imagePath);
    };

    // Компоненты
    const FilterPanel = () => (
        <Card className="mb-4 shadow-sm">
            <Card.Body>
                <Row>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label><i className="fas fa-smile me-2"></i>Настроение</Form.Label>
                            <Form.Select
                                value={filters.mood}
                                onChange={(e) => setFilters({...filters, mood: e.target.value})}
                                className="shadow-sm"
                            >
                                <option value="">Все</option>
                                <option value="happy">😊 Радостное</option>
                                <option value="normal">😐 Обычное</option>
                                <option value="sad">😢 Грустное</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label><i className="fas fa-running me-2"></i>Активность</Form.Label>
                            <Form.Select
                                value={filters.activityLevel}
                                onChange={(e) => setFilters({...filters, activityLevel: e.target.value})}
                                className="shadow-sm"
                            >
                                <option value="">Все</option>
                                <option value="high">🏃 Высокая</option>
                                <option value="normal">🚶 Средняя</option>
                                <option value="low">😴 Низкая</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label><i className="fas fa-calendar me-2"></i>С даты</Form.Label>
                            <Form.Control
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                                className="shadow-sm"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label><i className="fas fa-calendar me-2"></i>По дату</Form.Label>
                            <Form.Control
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                                className="shadow-sm"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Button 
                    variant="outline-secondary" 
                    className="mt-3"
                    onClick={() => setFilters({mood: '', dateFrom: '', dateTo: '', activityLevel: ''})}
                >
                    <i className="fas fa-undo me-2"></i>Сбросить фильтры
                </Button>
            </Card.Body>
        </Card>
    );

    const StatisticsPanel = () => {
        const stats = {
            totalEntries: entries.length,
            avgWeight: entries.reduce((acc, entry) => acc + Number(entry.weight || 0), 0) / (entries.length || 1),
            moodStats: {
                happy: entries.filter(e => e.mood === 'happy').length,
                normal: entries.filter(e => e.mood === 'normal').length,
                sad: entries.filter(e => e.mood === 'sad').length
            }
        };

        return (
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h5><i className="fas fa-chart-bar me-2"></i>Статистика</h5>
                    <Row>
                        <Col md={3}>
                            <div className="text-center">
                                <h6>Всего записей</h6>
                                <h3>{stats.totalEntries}</h3>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-center">
                                <h6>Средний вес</h6>
                                <h3>{stats.avgWeight.toFixed(1)} кг</h3>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="text-center">
                                <h6>Настроение</h6>
                                <div className="d-flex justify-content-around">
                                    <div>
                                        <span className="fs-4">😊</span>
                                        <div>{stats.moodStats.happy}</div>
                                    </div>
                                    <div>
                                        <span className="fs-4">😐</span>
                                        <div>{stats.moodStats.normal}</div>
                                    </div>
                                    <div>
                                        <span className="fs-4">😢</span>
                                        <div>{stats.moodStats.sad}</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    };

    const ImageModal = () => (
        <Modal show={!!modalImage} onHide={() => setModalImage(null)} size="lg">
            <Modal.Body>
                <img src={modalImage} alt="Фото питомца" className="img-fluid" />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setModalImage(null)}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );

    const WeightChart = () => {
        const weightData = entries
            .filter(entry => entry.weight)
            .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
            .slice(-10);

        const data = {
            labels: weightData.map(entry => 
                format(new Date(entry.entry_date), 'dd.MM')
            ),
            datasets: [
                {
                    label: 'Вес (кг)',
                    data: weightData.map(entry => entry.weight),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Динамика веса'
                }
            }
        };

        return (
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Line data={data} options={options} />
                </Card.Body>
            </Card>
        );
    };

    const SortPanel = () => (
        <div className="mb-3">
            <Form.Select 
                onChange={(e) => setSortConfig(JSON.parse(e.target.value))}
                className="w-auto"
            >
                <option value='{"field":"entry_date","direction":"desc"}'>По дате (сначала новые)</option>
                <option value='{"field":"entry_date","direction":"asc"}'>По дате (сначала старые)</option>
                <option value='{"field":"weight","direction":"desc"}'>По весу (по убыванию)</option>
                <option value='{"field":"weight","direction":"asc"}'>По весу (по возрастанию)</option>
                <option value='{"field":"mood","direction":"asc"}'>По настроению</option>
            </Form.Select>
        </div>
    );

    const SearchBar = () => (
        <Form.Group className="mb-3">
            <Form.Control
                type="text"
                placeholder="Поиск по записям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shadow-sm"
            />
        </Form.Group>
    );

    // Функции для работы с данными
    useEffect(() => {
        const fetchEntries = async () => {
            if (!id) {
                setError('ID питомца не найден');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `http://185.3.172.83:5000/api/pets/${id}/diary`,
                    config
                );
                setEntries(response.data.entries || []);
            } catch (error) {
                console.error('Ошибка при загрузке записей:', error);
                setError('Ошибка при загрузке записей');
                toast.error('Не удалось загрузить записи дневника');
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        Object.keys(newEntry).forEach(key => {
            if (key !== 'files') {
                formData.append(key, newEntry[key]);
            }
        });

        Array.from(newEntry.files).forEach(file => {
            formData.append('media', file);
        });

        try {
            await axios.post(
                `http://185.3.172.83:5000/api/pets/${id}/diary`,
                formData,
                {
                    ...config,
                    headers: {
                        ...config.headers,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            toast.success('Запись добавлена');
            setNewEntry({
                notes: '',
                mood: '',
                weight: '',
                foodIntake: '',
                activityLevel: '',
                healthNotes: '',
                files: []
            });
            
            const response = await axios.get(
                `http://185.3.172.83:5000/api/pets/${id}/diary`,
                config
            );
            setEntries(response.data.entries || []);
        } catch (error) {
            console.error('Ошибка при сохранении записи:', error);
            toast.error('Ошибка при сохранении записи');
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setNewEntry(prev => ({
            ...prev,
            [name]: files ? files : value
        }));
    };

    const handleDeleteEntry = async (entryId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
            try {
                await axios.delete(
                    `http://185.3.172.83:5000/api/pets/${id}/diary/${entryId}`,
                    config
                );
                toast.success('Запись удалена');
                const response = await axios.get(
                    `http://185.3.172.83:5000/api/pets/${id}/diary`,
                    config
                );
                setEntries(response.data.entries || []);
            } catch (error) {
                console.error('Ошибка при удалении записи:', error);
                toast.error('Не удалось удалить запись');
            }
        }
    };

    const getEntriesForDate = (date) => {
        return entries.filter(entry => {
            const entryDate = new Date(entry.entry_date);
            return (
                entryDate.getDate() === date.getDate() &&
                entryDate.getMonth() === date.getMonth() &&
                entryDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const tileContent = ({ date }) => {
        const hasEntries = entries.some(entry => {
            const entryDate = new Date(entry.entry_date);
            return (
                entryDate.getDate() === date.getDate() &&
                entryDate.getMonth() === date.getMonth() &&
                entryDate.getFullYear() === date.getFullYear()
            );
        });

        return hasEntries ? (
            <div className="diary-entry-dot" />
        ) : null;
    };

    const sortEntries = (entriesToSort) => {
        return [...entriesToSort].sort((a, b) => {
            if (sortConfig.field === 'entry_date') {
                return sortConfig.direction === 'desc' 
                    ? new Date(b.entry_date) - new Date(a.entry_date)
                    : new Date(a.entry_date) - new Date(b.entry_date);
            }
            if (sortConfig.field === 'weight') {
                return sortConfig.direction === 'desc' 
                    ? b.weight - a.weight
                    : a.weight - b.weight;
            }
            return 0;
        });
    };

    const filterEntries = (entriesToFilter) => {
        return entriesToFilter.filter(entry => {
            const matchesSearch = searchQuery === '' || 
                Object.values(entry).some(value => 
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                );
            
            const matchesMood = !filters.mood || entry.mood === filters.mood;
            const matchesActivity = !filters.activityLevel || 
                entry.activity_level === filters.activityLevel;
            
            const entryDate = new Date(entry.entry_date);
            const matchesDateFrom = !filters.dateFrom || 
                entryDate >= new Date(filters.dateFrom);
            const matchesDateTo = !filters.dateTo || 
                entryDate <= new Date(filters.dateTo);

            return matchesSearch && matchesMood && matchesActivity && 
                matchesDateFrom && matchesDateTo;
        });
    };

    const exportToCSV = () => {
        const csvData = entries.map(entry => ({
            'Дата': format(new Date(entry.entry_date), 'dd.MM.yyyy'),
            'Заметки': entry.notes,
            'Настроение': entry.mood,
            'Вес': entry.weight,
            'Питание': entry.food_intake,
            'Активность': entry.activity_level,
            'Здоровье': entry.health_notes
        }));

        const csvString = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `pet-diary-${format(new Date(), 'dd-MM-yyyy')}.csv`;
        link.click();
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container className="my-4">
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">Дневник питомца</h2>
                        <div>
                            <div className="btn-group me-2">
                                <Button 
                                    variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                                    className="me-2"
                                    onClick={() => setViewMode('list')}
                                >
                                    <i className="fas fa-list me-2"></i>Список
                                </Button>
                                <Button 
                                    variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'}
                                    onClick={() => setViewMode('calendar')}
                                >
                                    <i className="fas fa-calendar-alt me-2"></i>Календарь
                                </Button>
                            </div>
                            <Button 
                                variant="outline-success" 
                                onClick={exportToCSV}
                            >
                                <i className="fas fa-download me-2"></i>Экспорт
                            </Button>
                        </div>
                    </div>
    
                    <StatisticsPanel />
                    <WeightChart />
                    
                    {viewMode === 'list' && (
                        <>
                            <FilterPanel />
                            <SearchBar />
                            <SortPanel />
                        </>
                    )}

                    <Card className="mb-4 shadow-sm">
    <Card.Header className="bg-light">
        <h5 className="mb-0"><i className="fas fa-plus me-2"></i>Новая запись</h5>
    </Card.Header>
    <Card.Body>
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label><i className="fas fa-comment-alt me-2"></i>Заметки</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="notes"
                            value={newEntry.notes}
                            onChange={handleChange}
                            placeholder="Опишите день питомца"
                            className="shadow-sm"
                            rows={4}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label><i className="fas fa-smile me-2"></i>Настроение</Form.Label>
                        <Form.Select
                            name="mood"
                            value={newEntry.mood}
                            onChange={handleChange}
                            className="shadow-sm"
                        >
                            <option value="">Выберите настроение</option>
                            <option value="happy">😊 Радостное</option>
                            <option value="normal">😐 Обычное</option>
                            <option value="sad">😢 Грустное</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label><i className="fas fa-weight me-2"></i>Вес (кг)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.1"
                            name="weight"
                            value={newEntry.weight}
                            onChange={handleChange}
                            className="shadow-sm"
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label><i className="fas fa-utensils me-2"></i>Приём пищи</Form.Label>
                        <Form.Control
                            type="text"
                            name="foodIntake"
                            value={newEntry.foodIntake}
                            onChange={handleChange}
                            placeholder="Что и сколько ел"
                            className="shadow-sm"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label><i className="fas fa-running me-2"></i>Активность</Form.Label>
                        <Form.Select
                            name="activityLevel"
                            value={newEntry.activityLevel}
                            onChange={handleChange}
                            className="shadow-sm"
                        >
                            <option value="">Выберите уровень</option>
                            <option value="high">🏃 Высокая</option>
                            <option value="normal">🚶 Средняя</option>
                            <option value="low">😴 Низкая</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label><i className="fas fa-notes-medical me-2"></i>Заметки о здоровье</Form.Label>
                        <Form.Control
                            type="text"
                            name="healthNotes"
                            value={newEntry.healthNotes}
                            onChange={handleChange}
                            placeholder="Необязательно"
                            className="shadow-sm"
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label><i className="fas fa-images me-2"></i>Фото/Видео</Form.Label>
                <Form.Control
                    type="file"
                    name="files"
                    onChange={handleChange}
                    multiple
                    accept="image/*,video/*"
                    className="shadow-sm"
                />
            </Form.Group>

            <Button type="submit" variant="primary">
                <i className="fas fa-save me-2"></i>Сохранить запись
            </Button>
        </Form>
    </Card.Body>
</Card>

{viewMode === 'calendar' ? (
                    <Row>
                        <Col md={6}>
                            <Card className="mb-4 shadow-sm">
                                <Card.Body>
                                    <Calendar
                                        onChange={setSelectedDate}
                                        value={selectedDate}
                                        locale="ru-RU"
                                        tileContent={tileContent}
                                        className="border-0 shadow-sm"
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            {getEntriesForDate(selectedDate).length > 0 ? (
                                getEntriesForDate(selectedDate).map(entry => (
                                        <Card key={entry.id} className="mb-3 shadow-sm hover-effect">
                                            <Card key={entry.id} className="mb-3 shadow-sm hover-effect">
    <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
            <span>
                <i className="fas fa-calendar-day me-2"></i>
                {format(new Date(entry.entry_date), 'd MMMM yyyy', { locale: ru })}
            </span>
            <div>
                <Badge bg={getMoodBadgeColor(entry.mood)} className="me-2">
                    {getMoodEmoji(entry.mood)}
                </Badge>
                <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                >
                    <i className="fas fa-trash"></i>
                </Button>
            </div>
        </Card.Title>
        <Row>
            <Col md={8}>
                <div className="entry-details">
                    <p className="entry-notes">{entry.notes}</p>
                    <div className="entry-stats">
                        <p><i className="fas fa-weight me-2"></i><strong>Вес:</strong> {entry.weight} кг</p>
                        <p><i className="fas fa-utensils me-2"></i><strong>Питание:</strong> {entry.food_intake}</p>
                        <p><i className="fas fa-running me-2"></i><strong>Активность:</strong> {getActivityIcon(entry.activity_level)} {entry.activity_level}</p>
                    </div>
                    {entry.health_notes && (
                        <div className="health-notes mt-3">
                            <p><i className="fas fa-notes-medical me-2"></i><strong>Здоровье:</strong> {entry.health_notes}</p>
                        </div>
                    )}
                </div>
            </Col>
            <Col md={4}>
                {entry.media && entry.media.map(media => (
                    <div key={media.id} className="mb-2">
                        {media.media_type === 'photo' ? (
                            <img
                                src={`${media.file_path}`}
                                alt="Фото питомца"
                                className="img-fluid rounded shadow-sm"
                                onClick={() => handleImageClick(`${media.file_path}`)}
                                style={{ cursor: 'pointer' }}
                            />
                        ) : (
                            <video
                                controls
                                className="img-fluid rounded shadow-sm"
                            >
                                <source src={`${media.file_path}`} type="video/mp4" />
                                Ваш браузер не поддерживает видео
                            </video>
                        )}
                    </div>
                ))}
            </Col>
        </Row>
    </Card.Body>
</Card>
                                        </Card>
                                    ))
                                ) : (
                                    <Alert variant="info" className="shadow-sm">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Нет записей на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                                </Alert>
                            )}
                        </Col>
                    </Row>
                ) : (
                    <div className="entries-list">
                        {sortEntries(filterEntries(entries)).map(entry => (
                                <Card key={entry.id} className="mb-3 shadow-sm hover-effect">
                                    <Card key={entry.id} className="mb-3 shadow-sm hover-effect">
    <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
            <span>
                <i className="fas fa-calendar-day me-2"></i>
                {format(new Date(entry.entry_date), 'd MMMM yyyy', { locale: ru })}
            </span>
            <div>
                <Badge bg={getMoodBadgeColor(entry.mood)} className="me-2">
                    {getMoodEmoji(entry.mood)}
                </Badge>
                <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                >
                    <i className="fas fa-trash"></i>
                </Button>
            </div>
        </Card.Title>
        <Row>
            <Col md={8}>
                <div className="entry-details">
                    <p className="entry-notes">{entry.notes}</p>
                    <div className="entry-stats">
                        <p><i className="fas fa-weight me-2"></i><strong>Вес:</strong> {entry.weight} кг</p>
                        <p><i className="fas fa-utensils me-2"></i><strong>Питание:</strong> {entry.food_intake}</p>
                        <p><i className="fas fa-running me-2"></i><strong>Активность:</strong> {getActivityIcon(entry.activity_level)} {entry.activity_level}</p>
                    </div>
                    {entry.health_notes && (
                        <div className="health-notes mt-3">
                            <p><i className="fas fa-notes-medical me-2"></i><strong>Здоровье:</strong> {entry.health_notes}</p>
                        </div>
                    )}
                </div>
            </Col>
            <Col md={4}>
                {entry.media && entry.media.map(media => (
                    <div key={media.id} className="mb-2">
                        {media.media_type === 'photo' ? (
                            <img
                                src={media.file_path}
                                alt="Фото питомца"
                                className="img-fluid rounded shadow-sm"
                                onClick={() => handleImageClick(media.file_path)}
                                style={{ cursor: 'pointer' }}
                            />
                        ) : (
                            <video
                                controls
                                className="img-fluid rounded shadow-sm"
                            >
                                <source src={media.file_path} type="video/mp4" />
                                Ваш браузер не поддерживает видео
                            </video>
                        )}
                    </div>
                ))}
            </Col>
        </Row>
    </Card.Body>
</Card>
                                </Card>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>
            <ImageModal />
        </Container>
    );
};

export default PetDiary;
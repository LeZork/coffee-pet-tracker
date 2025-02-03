import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EditPet from './EditPet'; // Импортируем компонент редактирования
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate

const AllPets = ({ userId }) => {
    const [pets, setPets] = useState([]);
    const [sortOrder, setSortOrder] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [weightFilter, setWeightFilter] = useState('');
    const [moodFilter, setMoodFilter] = useState('');
    const [activityFilter, setActivityFilter] = useState('');
    const [feedingTimeFilter, setFeedingTimeFilter] = useState(''); // Новое состояние для фильтрации по времени кормления
    const [selectedPet, setSelectedPet] = useState(null); // Состояние для выбранного питомца

    const navigate = useNavigate(); // Инициализируем useNavigate

    const fetchPets = async () => {
        try {
            const response = await axios.get(`http://185.3.172.83:5000/api/pets/${userId}`);
            console.log('Fetched pets:', response.data); // Для отладки
            setPets(response.data);
        } catch (error) {
            console.error('Error fetching pets:', error);
        }
    };

    useEffect(() => {
        fetchPets();
    }, [userId]);

    // Сортировка питомцев
    const sortedPets = [...pets].sort((a, b) => {
        if (sortOrder === 'name') {
            return a.name.localeCompare(b.name);
        } else {
            return a.weight - b.weight;
        }
    });

    // Поиск питомцев
    const filteredPets = sortedPets.filter(pet => 
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (weightFilter ? pet.weight <= weightFilter : true) &&
        (moodFilter ? pet.mood.toLowerCase() === moodFilter.toLowerCase() : true) &&
        (activityFilter ? pet.activity.toLowerCase() === activityFilter.toLowerCase() : true) &&
        (feedingTimeFilter ? pet.feedingTime === feedingTimeFilter : true) // Фильтрация по времени кормления
    );

    const handleEdit = (pet) => {
        setSelectedPet(pet); // Устанавливаем выбранного питомца
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Вы уверены, что хотите удалить этого питомца?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://185.3.172.83:5000/api/pets/${id}`);
                fetchPets(); // Обновляем список питомцев
                toast.success('Питомец успешно удален!');
            } catch (error) {
                toast.error('Ошибка при удалении питомца. Пожалуйста, попробуйте еще раз.');
            }
        }
    };

    const handleViewDetails = (petId) => {
        console.log('Navigating to PetDetails with petId:', petId); // Для отладки
        navigate(`/pets/${petId}/diary`); // Переход на страницу деталей питомца
    };

    return (
        <Container>
            <h2 className="text-center my-4">Все питомцы</h2>
            <Form className="mb-4">
                <Row>
                    <Col md={3}>
                        <Form.Control
                            type="text"
                            placeholder="Поиск по имени"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Control
                            type="number"
                            placeholder="Максимальный вес"
                            value={weightFilter}
                            onChange={(e) => setWeightFilter(e.target.value)}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Control
                            type="text"
                            placeholder="Настроение"
                            value={moodFilter}
                            onChange={(e) => setMoodFilter(e.target.value)}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Control
                            type="text"
                            placeholder="Активность"
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Control
                            type="text"
                            placeholder="Время кормления"
                            value={feedingTimeFilter}
                            onChange={(e) => setFeedingTimeFilter(e.target.value)}
                        />
                    </Col>
                </Row>
                <Row className="my-3">
                    <Col md={3}>
                        <Form.Select onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="name">Сортировать по имени</option>
                            <option value="weight">Сортировать по весу</option>
                        </Form.Select>
                    </Col>
                </Row>
            </Form>
            <Row>
                {filteredPets.map(pet => (
                    <Col md={4} key={pet.id} className="mb-4">
                        <Card onClick={() => handleViewDetails(pet.id)} style={{ cursor: 'pointer' }}>
                            <Card.Img 
                                variant="top" 
                                src={pet.image_url ? `http://185.3.172.83:5000${pet.image_url}` : 'http://185.3.172.83:5000/uploads/placeholder-pet.jpg'}
                                alt={pet.name} 
                                style={{ height: '200px', objectFit: 'cover' }} 
                            />
                            <Card.Body>
                                <Card.Title>{pet.name}</Card.Title>
                                <Card.Text>
                                    Вес: {pet.weight} кг<br />
                                    Настроение: {pet.mood}<br />
                                    Активность: {pet.activity}<br />
                                    Время кормления: {pet.feedingTime} {/* Отображение времени кормления */}
                                </Card.Text>
                                <Button 
                                    variant="primary" 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Предотвращаем всплытие события
                                        handleEdit(pet);
                                    }}
                                >
                                    Редактировать
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(pet.id)} className="ms-2">Удалить</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            {selectedPet && ( // Если выбран питомец, отображаем компонент редактирования
                <EditPet petId={selectedPet.id} onUpdate={() => { setSelectedPet(null); fetchPets(); }} />
            )}
        </Container>
    );
};

export default AllPets;

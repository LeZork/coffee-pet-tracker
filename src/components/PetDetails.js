import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AddPet from './AddPet';
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PetDetails = () => {
    const { id } = useParams();
    console.log('petId:', id); // Для отладки
    const [pet, setPet] = useState(null);
    const [history, setHistory] = useState([]);
    const [name, setName] = useState('');
    const [weight, setWeight] = useState('');
    const [mood, setMood] = useState('');
    const [activity, setActivity] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState(null);
    const [editNotes, setEditNotes] = useState(false);
    const [filterMood, setFilterMood] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [newNote, setNewNote] = useState('');
    const [showAddPet, setShowAddPet] = useState(false);

    const fetchPetData = useCallback(async () => {
        if (!id) {
            toast.error('ID питомца не найден.');
            return;
        }
        console.log('Fetching pet data for id:', id);
        try {
            const petResponse = await axios.get(`http://185.3.172.83:5000/api/pets/${id}`);
            console.log('Fetched pet data:', petResponse.data);
            if (petResponse.data) {
                setPet(petResponse.data);
                setName(petResponse.data.name);
                setWeight(petResponse.data.weight);
                setMood(petResponse.data.mood);
                setActivity(petResponse.data.activity);
                setNotes(petResponse.data.notes || '');
            } else {
                toast.error('Питомец не найден.');
            }
        } catch (error) {
            toast.error('Не удалось загрузить данные питомца.');
        }
    }, [id]);

    const fetchHistory = useCallback(async () => {
        if (!id) {
            toast.error('ID питомца не найден.');
            return;
        }
        try {
            const historyResponse = await axios.get(`http://185.3.172.83:5000/api/pets/${id}/history`);
            setHistory(historyResponse.data);
        } catch (error) {
            toast.error('Не удалось загрузить историю питомца.');
        }
    }, [id]);

    useEffect(() => {
        fetchPetData();
        fetchHistory();
    }, [fetchPetData, fetchHistory]);

    const handleUpdatePet = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('weight', weight);
        formData.append('mood', mood);
        formData.append('activity', activity);
        formData.append('notes', notes);
        if (image) {
            formData.append('image', image);
        }

        try {
            await axios.put(`http://185.3.172.83:5000/api/pets/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Данные питомца успешно обновлены!');
            fetchPetData();
        } catch (error) {
            toast.error('Не удалось обновить данные питомца.');
        }
    };

    // Добавляем кнопку для перехода к дневнику
    const renderDiaryButton = () => (
        <Link to={`/pets/${id}/diary`} className="btn btn-primary me-2">
            Дневник питомца
        </Link>
    );

    const handleUpdateNotes = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://185.3.172.83:5000/api/pets/${id}`, { notes: notes });
            fetchPetData();
            setEditNotes(false);
            toast.success('Заметки успешно обновлены!');
        } catch (error) {
            toast.error('Не удалось обновить заметки.');
        }
    };

    // Фильтрация истории изменений
    const filteredHistory = history.filter(entry => 
        (filterMood ? entry.mood.toLowerCase() === filterMood.toLowerCase() : true) &&
        (filterDate ? entry.change_date.includes(filterDate) : true)
    );

    // Функция для добавления заметки
    const handleAddNote = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://185.3.172.83:5000/api/pets/${id}/notes`, { note: newNote });
            fetchPetData();
            setNewNote('');
            toast.success('Заметка успешно добавлена!');
        } catch (error) {
            toast.error('Не удалось добавить заметку.');
        }
    };

    return (
        <Container className="mt-4">
            {pet ? (
                <Card>
                    <Card.Body>
                        <Card.Title>{pet.name}</Card.Title>
                        {renderDiaryButton()}
                        <Card.Img variant="top" src={pet.image} alt={pet.name} className="img-fluid" />
                        <Row>
                            <Col>
                                <p>Вес: {pet.weight} кг</p>
                                <p>Настроение: {pet.mood}</p>
                                <p>Активность: {pet.activity}</p>
                            </Col>
                        </Row>
                        <Button variant="primary" onClick={() => setShowAddPet(!showAddPet)}>
                            {showAddPet ? 'Скрыть форму добавления питомца' : 'Добавить нового питомца'}
                        </Button>
                        {showAddPet && <AddPet userId={pet.owner_id} onAdd={fetchPetData} />}
                        <Form onSubmit={handleUpdatePet} className="mt-3">
                            <Form.Group controlId="formPetName">
                                <Form.Label>Имя питомца</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formPetWeight">
                                <Form.Label>Вес питомца (кг)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="formPetMood">
                                <Form.Label>Настроение питомца</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="formPetActivity">
                                <Form.Label>Активность питомца</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="formPetImage">
                                <Form.Label>Изображение питомца</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={(e) => setImage(e.target.files[0])}
                                />
                            </Form.Group>
                            <Button variant="success" type="submit">Обновить питомца</Button>
                        </Form>
                        {editNotes ? (
                            <Form onSubmit={handleUpdateNotes} className="mt-3">
                                <Form.Group controlId="formPetNotes">
                                    <Form.Label>Заметки о питомце</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">Сохранить заметки</Button>
                                <Button variant="secondary" onClick={() => setEditNotes(false)}>Отмена</Button>
                            </Form>
                        ) : (
                            <>
                                <p>Заметки: {pet.notes}</p>
                                <Button variant="info" onClick={() => setEditNotes(true)}>Редактировать заметки</Button>
                            </>
                        )}
                        <h3 className="mt-4">История изменений</h3>
                        <Form.Group controlId="filterMood">
                            <Form.Label>Фильтр по настроению</Form.Label>
                            <Form.Control
                                type="text"
                                value={filterMood}
                                onChange={(e) => setFilterMood(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="filterDate">
                            <Form.Label>Фильтр по дате</Form.Label>
                            <Form.Control
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </Form.Group>
                        <Form onSubmit={handleAddNote} className="mt-3">
                            <Form.Group controlId="newNote">
                                <Form.Label>Добавить заметку</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Введите заметку"
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">Добавить заметку</Button>
                        </Form>
                        <div className="row mt-3">
                            {filteredHistory.map(entry => (
                                <div className="col-md-4 mb-4" key={entry.id}>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>{entry.change_date}</Card.Title>
                                            <p>Вес: {entry.weight} кг</p>
                                            <p>Настроение: {entry.mood}</p>
                                            <p>Активность: {entry.activity}</p>
                                            <p>Заметки: {entry.notes}</p>
                                        </Card.Body>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            ) : (
                <p>Загрузка данных питомца...</p>
            )}
        </Container>
    );
};

export default PetDetails;

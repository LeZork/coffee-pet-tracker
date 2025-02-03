import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ErrorNotification from './ErrorNotification';

const AddPet = ({ userId, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        breed: '',
        birth_date: '',
        gender: '',
        weight: '',
        image: null,
        owner_id: userId
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const handleAddPet = async (e) => {
        e.preventDefault();
        setError('');
    
        // Проверка обязательных полей
        const requiredFields = ['name', 'species', 'birth_date', 'gender'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            setError('Пожалуйста, заполните все обязательные поля.');
            return;
        }
    
        const submitData = new FormData();
        
        // Явно добавляем каждое поле в FormData
        submitData.append('name', formData.name);
        submitData.append('species', formData.species);
        submitData.append('breed', formData.breed || '');
        submitData.append('birth_date', formData.birth_date);
        submitData.append('gender', formData.gender);
        submitData.append('weight', formData.weight || '');
        submitData.append('owner_id', userId);
        
        // Добавляем изображение только если оно есть
        if (formData.image) {
            submitData.append('image', formData.image);
        }
    
        try {
            const response = await axios.post('http://185.3.172.83:5000/api/pets', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
    
            if (response.data.success) {
                toast.success('Питомец успешно добавлен!');
                onAdd();
                navigate('/pets');
            } else {
                throw new Error(response.data.message || 'Ошибка при добавлении питомца');
            }
        } catch (error) {
            console.error('Ошибка при добавлении питомца:', error);
            setError(error.response?.data?.message || 'Ошибка при добавлении питомца. Пожалуйста, попробуйте еще раз.');
            toast.error('Ошибка при добавлении питомца');
        }
    };

    return (
        <Container className="my-4">
            <h2 className="text-center mb-4">Добавить нового питомца</h2>
            {error && <ErrorNotification message={error} onClose={() => setError('')} />}
            
            <Form onSubmit={handleAddPet}>
                <Row>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label>Имя питомца *</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label>Дата рождения *</Form.Label>
                            <Form.Control
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label>Вид *</Form.Label>
                            <Form.Select
                                name="species"
                                value={formData.species}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Выберите вид питомца</option>
                                <option value="dog">Собака</option>
                                <option value="cat">Кошка</option>
                                <option value="rabbit">Кролик</option>
                                <option value="guinea_pig">Морская свинка</option>
                                <option value="other">Другой</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label>Порода</Form.Label>
                            <Form.Control
                                type="text"
                                name="breed"
                                value={formData.breed}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label>Пол *</Form.Label>
                            <div>
                                <Form.Check
                                    type="radio"
                                    label="Мужской"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={handleInputChange}
                                    required
                                    inline
                                />
                                <Form.Check
                                    type="radio"
                                    label="Женский"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={handleInputChange}
                                    required
                                    inline
                                />
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label>Вес (кг)</Form.Label>
                            <Form.Control
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Фотография питомца</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mt-3"
                >
                    Добавить питомца
                </Button>
            </Form>
        </Container>
    );
};

export default AddPet;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button, Container } from 'react-bootstrap';
import FeedingSchedule from './FeedingSchedule';
import FeedingScheduleList from './FeedingScheduleList';

const EditPet = ({ petId, onUpdate }) => {
    const [pet, setPet] = useState(null);
    const [name, setName] = useState('');
    const [weight, setWeight] = useState('');
    const [mood, setMood] = useState('');
    const [activity, setActivity] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const fetchPetData = async () => {
        try {
            const response = await axios.get(`http://185.3.172.83:5000/api/pets/${petId}`);
            setPet(response.data);
            setName(response.data.name || '');
            setWeight(response.data.weight || '');
            setMood(response.data.mood || '');
            setActivity(response.data.activity || '');
            setNotes(response.data.notes || '');
        } catch (error) {
            console.error('Ошибка при загрузке данных питомца:', error);
            toast.error('Не удалось загрузить данные питомца.');
        }
    };

    useEffect(() => {
        fetchPetData();
    }, [petId]);

    const handleUpdatePet = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        if (name && name !== pet.name) formData.append('name', name);
        if (weight && weight !== pet.weight) formData.append('weight', weight);
        if (mood && mood !== pet.mood) formData.append('mood', mood);
        if (activity && activity !== pet.activity) formData.append('activity', activity);
        if (notes && notes !== pet.notes) formData.append('notes', notes);
        if (image) {
            formData.append('image', image);
        }

        if (formData.has('name') || formData.has('weight') || formData.has('mood') || 
            formData.has('activity') || formData.has('notes') || image) {
            try {
                await axios.put(`http://185.3.172.83:5000/api/pets/${petId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Данные питомца успешно обновлены!');
                onUpdate();
            } catch (error) {
                console.error('Ошибка при обновлении питомца:', error);
                toast.error('Не удалось обновить данные питомца.');
            }
        } else {
            toast.info('Нет изменений для обновления.');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="text-center">Редактировать питомца</h2>
            <Form onSubmit={handleUpdatePet}>
                <Form.Group controlId="formPetName">
                    <Form.Label>Имя питомца</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Введите имя питомца"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formPetWeight">
                    <Form.Label>Вес питомца (кг)</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Введите вес питомца"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formPetMood">
                    <Form.Label>Настроение питомца</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Введите настроение питомца"
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formPetActivity">
                    <Form.Label>Активность питомца</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Введите активность питомца"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formPetNotes">
                    <Form.Label>Заметки о питомце</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Введите заметки о питомце"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formPetImage">
                    <Form.Label>Изображение питомца</Form.Label>
                    <Form.Control
                        type="file"
                        onChange={handleImageChange}
                    />
                    {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />}
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Сохранить изменения
                </Button>
            </Form>
            <FeedingSchedule petId={petId} />
            <FeedingScheduleList petId={petId} />
        </Container>
    );
};

export default EditPet;

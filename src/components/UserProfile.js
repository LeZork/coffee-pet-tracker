import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationSettings from './NotificationSettings';
import PetList from './PetList';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        let isMounted = true; // Флаг для предотвращения утечек памяти

        const fetchUserData = async () => {
            if (!userId || !token) {
                if (isMounted) {
                    setLoading(false);
                    setError('ID пользователя не указан');
                }
                return;
            }

            try {
                const response = await axios.get(
                    `http://185.3.172.83:5000/api/users/${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (isMounted) {
                    if (response.data.success) {
                        setUser(response.data.user);
                    } else {
                        setError(response.data.message || 'Данные пользователя не найдены');
                        toast.error(response.data.message || 'Данные пользователя не найдены');
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Ошибка при загрузке данных пользователя:', error);
                    const errorMessage = error.response?.data?.message || 'Ошибка при загрузке данных пользователя';
                    setError(errorMessage);
                    // Показываем toast только один раз
                    toast.error(errorMessage, {
                        toastId: 'user-profile-error' // Уникальный ID для предотвращения дублирования
                    });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUserData();

        // Функция очистки для предотвращения утечек памяти
        return () => {
            isMounted = false;
        };
    }, [userId, token]); // Зависимости useEffect

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Загрузка...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="text-center mt-5">
                <Alert variant="warning">
                    Пользователь не найден
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card>
                <Card.Body>
                    <Card.Title>Профиль пользователя: {user.username}</Card.Title>
                    <Card.Text>
                        Email: {user.email}<br />
                        Дата регистрации: {new Date(user.created_at).toLocaleDateString()}
                    </Card.Text>
                    <NotificationSettings userId={userId} />
                    <h3 className="mt-4">Ваши питомцы:</h3>
                    <PetList ownerId={userId} />
                </Card.Body>
            </Card>
        </Container>
    );
};

export default UserProfile;
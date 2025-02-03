import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const FeedingScheduleList = ({ petId }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!petId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`http://185.3.172.83:5000/api/pets/${petId}/feeding-schedule`);
                
                if (response.data.success) {
                    setSchedules(response.data.schedules || []);
                } else {
                    setError('Не удалось загрузить расписание');
                }
            } catch (err) {
                console.error('Ошибка при загрузке расписания:', err);
                setError('Ошибка при загрузке расписания');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [petId]);

    if (loading) return <div>Загрузка расписания...</div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!schedules || schedules.length === 0) {
        return <Alert variant="info">Расписание кормления не найдено</Alert>;
    }

    return (
        <div className="mt-4">
            <h3>Расписание кормления</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Время</th>
                        <th>Тип корма</th>
                        <th>Количество</th>
                        <th>Примечания</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map((schedule) => (
                        <tr key={schedule.id}>
                            <td>{new Date(schedule.feeding_time).toLocaleTimeString()}</td>
                            <td>{schedule.food_type}</td>
                            <td>{schedule.amount} г</td>
                            <td>{schedule.notes || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default FeedingScheduleList;
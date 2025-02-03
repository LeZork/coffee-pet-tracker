import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FeedingSchedule = ({ petId }) => {
    const [feedingTime, setFeedingTime] = useState('');
    const [frequency, setFrequency] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://185.3.172.83:5000/api/pets/${petId}/feeding-schedule`, {
                feeding_time: feedingTime,
                frequency: frequency,
            });
            toast.success('Расписание кормления успешно добавлено!');
        } catch (error) {
            console.error('Ошибка при добавлении расписания кормления:', error);
            toast.error('Не удалось добавить расписание кормления.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Настроить расписание кормления</h3>
            <label>
                Время кормления:
                <input
                    type="time"
                    value={feedingTime}
                    onChange={(e) => setFeedingTime(e.target.value)}
                    required
                />
            </label>
            <label>
                Частота кормления:
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} required>
                    <option value="">Выберите частоту</option>
                    <option value="daily">Ежедневно</option>
                    <option value="twice_daily">Дважды в день</option>
                    <option value="weekly">Еженедельно</option>
                </select>
            </label>
            <button type="submit">Сохранить расписание</button>
        </form>
    );
};

export default FeedingSchedule; 
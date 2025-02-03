import React, { useState } from 'react';
import axios from 'axios';

const NotificationSettings = ({ userId }) => {
    const [emailNotifications, setEmailNotifications] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/users/${userId}`, { emailNotifications });
            alert('Настройки уведомлений обновлены!');
        } catch (error) {
            console.error('Ошибка при обновлении настроек:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Настройки уведомлений</h3>
            <label>
                <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                Получать уведомления по email
            </label>
            <button type="submit">Сохранить настройки</button>
        </form>
    );
};

export default NotificationSettings; 
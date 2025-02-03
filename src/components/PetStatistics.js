// src/components/PetStatistics.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PetStatistics = ({ userId }) => {
    const [stats, setStats] = useState({ totalPets: 0, averageWeight: 0 });

    const fetchStatistics = async () => {
        const response = await axios.get(`http://185.3.172.83:5000/api/pets/stats/${userId}`);
        setStats(response.data);
    };

    useEffect(() => {
        fetchStatistics();
    }, [userId, fetchStatistics]);

    return (
        <div>
            <h2>Статистика питомцев</h2>
            <p>Общее количество питомцев: {stats.totalPets}</p>
            <p>Средний вес питомцев: {stats.averageWeight} кг</p>
        </div>
    );
};

export default PetStatistics;
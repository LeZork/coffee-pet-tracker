// src/components/PetManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PetModal from './PetModal'; // Импортируем модальное окно
import { motion } from 'framer-motion';

const PetManager = ({ userId }) => {
    const [pets, setPets] = useState([]);
    const [name, setName] = useState('');
    const [weight, setWeight] = useState('');
    const [mood, setMood] = useState('');
    const [activity, setActivity] = useState('');
    const [notes, setNotes] = useState('');
    const [editingPetId, setEditingPetId] = useState(null);
    const [filter, setFilter] = useState('');
    const [image, setImage] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyFilter, setHistoryFilter] = useState('');
    const [newPetName, setNewPetName] = useState('');
    const [newPetWeight, setNewPetWeight] = useState('');
    const [newPetMood, setNewPetMood] = useState('');
    const [newPetActivity, setNewPetActivity] = useState('');
    const [newPetNotes, setNewPetNotes] = useState('');
    const [moodFilter, setMoodFilter] = useState('');
    const [activityFilter, setActivityFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    const fetchPets = async () => {
        const response = await axios.get(`http://185.3.172.83:5000/api/pets/${userId}`);
        setPets(response.data);
    };

    const fetchHistory = async (petId) => {
        const response = await axios.get(`http://185.3.172.83:5000/api/pets/${petId}/history`);
        setHistory(response.data);
    };

    useEffect(() => {
        fetchPets();
    }, [userId]);

    // Функция для открытия модального окна
    const openModal = (pet) => {
        setSelectedPet(pet);
        setIsModalOpen(true);
    };

    // Функция для обработки отправки формы
    const handleSubmit = async (petData) => {
        if (selectedPet) {
            // Обновление питомца
            await axios.put(`http://185.3.172.83:5000/api/pets/${selectedPet.id}`, petData);
        } else {
            // Добавление нового питомца
            await axios.post('http://185.3.172.83:5000/api/pets', petData);
        }
        fetchPets(); // Обновляем список питомцев
    };

    const handleEdit = (pet) => {
        setName(pet.name);
        setWeight(pet.weight);
        setMood(pet.mood);
        setActivity(pet.activity);
        setNotes(pet.notes);
        setEditingPetId(pet.id);
        fetchHistory(pet.id);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Вы уверены, что хотите удалить этого питомца?');
        if (confirmDelete) {
            await axios.delete(`http://185.3.172.83:5000/api/pets/${id}`);
            fetchPets();
        }
    };

    // Фильтрация питомцев
    const filteredPets = pets.filter(pet => 
        pet.name.toLowerCase().includes(filter.toLowerCase()) &&
        (moodFilter ? pet.mood.toLowerCase() === moodFilter.toLowerCase() : true) &&
        (activityFilter ? pet.activity.toLowerCase() === activityFilter.toLowerCase() : true)
    );

    // Фильтрация истории
    const filteredHistory = history.filter(entry => 
        entry.change_date.includes(historyFilter) || 
        entry.mood.toLowerCase().includes(historyFilter.toLowerCase())
    );

    // Функция для добавления питомца
    const handleAddPet = async (e) => {
        e.preventDefault();
        await axios.post('http://185.3.172.83:5000/api/pets', {
            name: newPetName,
            weight: newPetWeight,
            mood: newPetMood,
            activity: newPetActivity,
            notes: newPetNotes,
            owner_id: userId,
        });
        setNewPetName('');
        setNewPetWeight('');
        setNewPetMood('');
        setNewPetActivity('');
        setNewPetNotes('');
        fetchPets(); // Обновляем список питомцев
    };

    return (
        <div className="container mt-4">
            <h2>Управление питомцами</h2>
            <input
                type="text"
                placeholder="Фильтр по имени"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="form-control mb-3"
            />
            <input
                type="text"
                placeholder="Фильтр по настроению"
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                className="form-control mb-3"
            />
            <input
                type="text"
                placeholder="Фильтр по активности"
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="form-control mb-3"
            />
            <div className="row">
                {filteredPets.map((pet) => (
                    <motion.div
                        className="col-md-4 mb-4"
                        key={pet.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="card">
                            <img src={pet.image} alt={pet.name} className="card-img-top" />
                            <div className="card-body">
                                <h5 className="card-title">{pet.name}</h5>
                                <p className="card-text">Вес: {pet.weight} кг</p>
                                <p className="card-text">Настроение: {pet.mood}</p>
                                <p className="card-text">Активность: {pet.activity}</p>
                                <a href={`/pets/${pet.id}`} className="btn btn-primary">Просмотреть</a>
                                <button className="btn btn-danger" onClick={() => handleDelete(pet.id)}>Удалить</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            <button className="btn btn-primary" onClick={() => openModal(null)}>Добавить питомца</button>
            <PetModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} pet={selectedPet} />
            <h3>История изменений</h3>
            <input
                type="text"
                placeholder="Фильтр по настроению или дате"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
            />
            <ul>
                {filteredHistory.map((entry) => (
                    <li key={entry.id}>
                        {entry.change_date}: {entry.weight} кг, {entry.mood}, {entry.activity}, {entry.notes}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PetManager;
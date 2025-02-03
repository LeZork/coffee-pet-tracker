import React, { useState } from 'react';
import Modal from 'react-modal';
import { motion } from 'framer-motion';

const PetModal = ({ isOpen, onRequestClose, onSubmit, pet }) => {
    const [name, setName] = useState(pet ? pet.name : '');
    const [weight, setWeight] = useState(pet ? pet.weight : '');
    const [mood, setMood] = useState(pet ? pet.mood : '');
    const [activity, setActivity] = useState(pet ? pet.activity : '');
    const [notes, setNotes] = useState(pet ? pet.notes : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, weight, mood, activity, notes });
        onRequestClose();
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
            >
                <h2>{pet ? 'Редактировать питомца' : 'Добавить нового питомца'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Имя питомца"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Вес питомца"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Настроение питомца"
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Активность питомца"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                    />
                    <textarea
                        placeholder="Заметки о питомце"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <button type="submit">Сохранить</button>
                    <button type="button" onClick={onRequestClose}>Отмена</button>
                </form>
            </motion.div>
        </Modal>
    );
};

export default PetModal;

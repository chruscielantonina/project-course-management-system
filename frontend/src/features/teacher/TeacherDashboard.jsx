import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const TeacherDashboard = () => {
    const [topics, setTopics] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axiosInstance.get('/api/topics');
                setTopics(response.data);
            } catch (err) {
                console.error("Błąd pobierania:", err);
                setError("Nie udało się pobrać tematów. Upewnij się, że jesteś zalogowany i backend działa.");
            }
        };

        fetchTopics();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Panel Prowadzącego</h1>
            <h2>Lista Tematów Projektów</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul>
                {topics.map(topic => (
                    <li key={topic.id} style={{ marginBottom: '8px' }}>
                        <strong>{topic.name}</strong> - {topic.active ? 'Aktywny' : 'Nieaktywny'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TeacherDashboard;
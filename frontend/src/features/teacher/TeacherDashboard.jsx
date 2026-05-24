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
                setError("Nie udało się pobrać tematów. Upewnij się, że jesteś zalogowany");
            }
        };

        fetchTopics();
    }, []);

    return (
        <div style={{ color: '#2d3436', textAlign: 'left' }}>
            <h1 style={{ marginTop: 0, color: '#2d3436' }}>Panel Prowadzącego</h1>
            <p style={{ color: '#636e72', fontSize: '16px', marginBottom: '30px' }}>
                Witaj w systemie zarządzania! Poniżej znajdziesz szybki podgląd swoich tematów projektowych.
            </p>

            {error && (
                <div style={{ padding: '15px', backgroundColor: '#ffeaea', color: '#d63031', borderRadius: '5px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>
                    Ostatnie Tematy Projektów
                </h2>

                {topics.length === 0 ? (
                    <p style={{ color: '#b2bec3', fontStyle: 'italic' }}>Brak tematów w bazie danych.</p>
                ) : (
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                        {topics.map(topic => {
                            // Kuloodporne sprawdzenie nazw przychodzących z backendu
                            const isTopicActive = topic.active === true || topic.isActive === true || topic.is_active === true;
                            const topicId = topic.toid || topic.id;
                            const topicName = topic.to_name || topic.toName || topic.name;

                            return (
                                <li key={topicId} style={{
                                    padding: '15px 10px',
                                    borderBottom: '1px solid #f1f2f6',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <strong style={{ fontSize: '15px', color: '#2d3436' }}>{topicName}</strong>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: isTopicActive ? '#e3fce0' : '#f1f2f6',
                                        color: isTopicActive ? '#27ae60' : '#7f8fa6'
                                    }}>
                                        {isTopicActive ? 'AKTYWNY' : 'NIEAKTYWNY'}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const SectionsView = () => {
    const [sections, setSections] = useState([]);
    const [topics, setTopics] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [viewMode, setViewMode] = useState('lista');
    const [activeSection, setActiveSection] = useState(null);
    const [activeTab, setActiveTab] = useState('sklad');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSectionData, setNewSectionData] = useState({ topicId: '', semesterId: '', maxCapacity: 15 });
    const [selectedYear, setSelectedYear] = useState('2025/2026');
    const [selectedDate, setSelectedDate] = useState('');
    const [attendanceList, setAttendanceList] = useState([]);
    const [gradesData, setGradesData] = useState({ students: [], isEditable: false });
    const availableGrades = ["2.0", "3.0", "3.5", "4.0", "4.5", "5.0"];

    useEffect(() => {
        fetchSections();
        fetchTopics();
        fetchAvailableStudents();
    }, []);

    const fetchSections = async () => {
        try {
            const response = await axiosInstance.get('/api/teachers/me/sections');
            setSections(response.data);
        } catch (error) { console.error("Błąd pobierania sekcji:", error); }
    };

    const fetchTopics = async () => {
        try {
            const response = await axiosInstance.get('/api/topics');
            setTopics(response.data);
        } catch (error) { console.error("Błąd tematów:", error); }
    };

    const fetchAvailableStudents = async () => {
        try {
            const response = await axiosInstance.get('/api/students/available');
            setAvailableStudents(response.data);
        } catch (error) { console.error("Błąd studentów:", error); }
    };

    useEffect(() => {
        if (viewMode === 'szczegoly' && activeSection) {
            if (activeTab === 'obecnosc' && selectedDate) fetchAttendance();
            else if (activeTab === 'oceny') fetchGrades();
        }
    }, [activeTab, selectedDate, activeSection]);

    const handleCreateSection = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/teachers/me/sections', {
                topicId: newSectionData.topicId,
                semesterId: newSectionData.semesterId, // Tu wpisujesz UUID z bazy
                maxCapacity: parseInt(newSectionData.maxCapacity)
            });
            setShowCreateModal(false);
            setNewSubjectData({ topicId: '', semesterId: '', maxCapacity: 15 });
            fetchSections();
        } catch (error) { alert("Błąd tworzenia sekcji. Sprawdź czy UUID semestru jest poprawne."); }
    };

    const handleAssignStudent = async (studentId) => {
        try {
            await axiosInstance.post(`/api/teachers/me/sections/${activeSection.sectionId}/students`, {
                studentIds: [studentId]
            });
            fetchAvailableStudents();
            const res = await axiosInstance.get('/api/teachers/me/sections');
            setSections(res.data);
            setActiveSection(res.data.find(s => s.sectionId === activeSection.sectionId));
        } catch (error) { alert("Błąd przypisywania."); }
    };

    const fetchAttendance = async () => {
        try {
            const res = await axiosInstance.get(`/api/sections/${activeSection.sectionId}/attendance`, { params: { date: selectedDate } });
            setAttendanceList(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSaveAttendance = async () => {
        try {
            const payload = { date: selectedDate, attendance: attendanceList.map(s => ({ student: s.studentId, status: s.status || "ABSENT" })) };
            await axiosInstance.post(`/api/sections/${activeSection.sectionId}/attendance`, payload);
            alert('Zapisano obecność!');
        } catch (error) { alert("Błąd zapisu."); }
    };

    const fetchGrades = async () => {
        try {
            const res = await axiosInstance.get(`/api/sections/${activeSection.sectionId}/grades`);
            setGradesData(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSaveGrades = async () => {
        try {
            const payload = { grades: gradesData.students.map(s => ({ studentId: s.studentId, grade: s.grade || "" })) };
            await axiosInstance.put(`/api/sections/${activeSection.sectionId}/grades`, payload);
            alert('Zapisano oceny!');
        } catch (error) { alert("Błąd zapisu."); }
    };


    if (viewMode === 'lista') {
        return (
            <div style={{ color: '#2d3436' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Twoje Sekcje Projektowe</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{ padding: '10px 20px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Utwórz nową sekcję
                    </button>
                </div>

                <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Wyświetl dla roku:</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                        <option value="2025/2026">2025/2026 (Bieżący)</option>
                        <option value="2024/2025">2024/2025 (Archiwum)</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {sections.length > 0 ? sections.map((sec, index) => (
                        <div key={sec.sectionId} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `4px solid ${sec.status === 'CLOSED' ? '#d63031' : '#00b894'}` }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>Sekcja #{index + 1}</h3>
                            <p style={{ fontSize: '14px', color: '#636e72' }}>Zapisanych: <strong>{sec.currentOccupancy} / {sec.maxCapacity}</strong></p>
                            <button onClick={() => { setActiveSection(sec); setViewMode('szczegoly'); }} style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#f1f2f6', color: '#0984e3', border: '1px solid #0984e3', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Zarządzaj Sekcją ➔
                            </button>
                        </div>
                    )) : <p style={{ color: '#b2bec3' }}>Brak sekcji do wyświetlenia.</p>}
                </div>

                {showCreateModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', color: '#2d3436' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>Kreator nowej sekcji</h3>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#2d3436', fontWeight: 'bold' }}>✕</button>
                            </div>
                            <form onSubmit={handleCreateSection} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Temat Projektu:</label>
                                <select required value={newSectionData.topicId} onChange={(e) => setNewSectionData({...newSectionData, topicId: e.target.value})} style={{ padding: '10px' }}>
                                    <option value="">-- Wybierz temat --</option>
                                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>ID Semestru (UUID z bazy):</label>
                                <input type="text" required placeholder="Wklej UUID semestru..." value={newSectionData.semesterId} onChange={(e) => setNewSectionData({...newSectionData, semesterId: e.target.value})} style={{ padding: '10px' }} />
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Limit osób:</label>
                                <input type="number" value={newSectionData.maxCapacity} onChange={(e) => setNewSectionData({...newSectionData, maxCapacity: e.target.value})} style={{ padding: '10px' }} />
                                <button type="submit" style={{ padding: '12px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Zapisz sekcję</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ color: '#2d3436' }}>
            <button onClick={() => setViewMode('lista')} style={{ background: 'none', border: 'none', color: '#0984e3', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>⬅ Wróć do listy sekcji</button>
            <h2>Zarządzanie Sekcją #{sections.findIndex(s => s.sectionId === activeSection.sectionId) + 1}</h2>

            <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #dfe6e9', marginBottom: '20px' }}>
                {['sklad', 'obecnosc', 'oceny'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px', border: 'none', background: 'none', borderBottom: activeTab === tab ? '3px solid #0984e3' : 'none', color: activeTab === tab ? '#0984e3' : '#636e72', cursor: 'pointer', fontWeight: 'bold' }}>
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {activeTab === 'sklad' && (
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                        <h3>Zapisani ({activeSection.currentOccupancy}/{activeSection.maxCapacity})</h3>
                        {activeSection.enrolledStudents?.map(s => <div key={s.studentId} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{s.fullName}</div>)}
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                        <h3>Dostępni studenci</h3>
                        {availableStudents.map(s => (
                            <div key={s.studentId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee' }}>
                                {s.fullName} <button onClick={() => handleAssignStudent(s.studentId)} style={{ color: '#0984e3', background: 'none', border: 'none', cursor: 'pointer' }}>+ Dodaj</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'obecnosc' && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ marginBottom: '20px', padding: '10px' }} />
                    {selectedDate && (
                        <>
                            {attendanceList.map(s => (
                                <div key={s.studentId} style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                                    {s.fullName}
                                    <label><input type="radio" checked={s.status === 'PRESENT'} onChange={() => handleAttendanceChange(s.studentId, 'PRESENT')} /> Obecny</label>
                                    <label><input type="radio" checked={s.status === 'ABSENT'} onChange={() => handleAttendanceChange(s.studentId, 'ABSENT')} /> Nieobecny</label>
                                </div>
                            ))}
                            <button onClick={handleSaveAttendance} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Zapisz obecność</button>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'oceny' && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                    {gradesData.students.map(s => (
                        <div key={s.studentId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            {s.fullName}
                            <select value={s.grade || ''} onChange={(e) => {
                                const newGrades = gradesData.students.map(st => st.studentId === s.studentId ? {...st, grade: e.target.value} : st);
                                setGradesData({...gradesData, students: newGrades});
                            }} style={{ padding: '5px' }}>
                                <option value="">Brak</option>
                                {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    ))}
                    <button onClick={handleSaveGrades} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Zapisz oceny</button>
                </div>
            )}
        </div>
    );
};

export default SectionsView;
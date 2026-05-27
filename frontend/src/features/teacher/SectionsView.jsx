import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const SectionsView = () => {
    const [sections, setSections] = useState([]);
    const [topics, setTopics] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [viewMode, setViewMode] = useState('lista');
    const [activeSection, setActiveSection] = useState(null);
    const [activeTab, setActiveTab] = useState('sklad');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [selectedSemesterId, setSelectedSemesterId] = useState('ALL');
    const [newSectionData, setNewSectionData] = useState({ topicId: '', maxCapacity: 15, sectionStatus: 'REGISTERED' });
    const [editCapacity, setEditCapacity] = useState('');
    const [editTopicId, setEditTopicId] = useState('');
    const [editStatus, setEditStatus] = useState('');

    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    const [attendanceList, setAttendanceList] = useState([]);
    const [gradesData, setGradesData] = useState({ students: [], isEditable: false });
    const availableGrades = ["2.0", "3.0", "3.5", "4.0", "4.5", "5.0"];

    useEffect(() => {
        fetchSections();
        fetchTopics();
        fetchSemesters();
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

    const fetchSemesters = async () => {
        try {
            const response = await axiosInstance.get('/api/semesters');
            setSemesters(response.data);

            const currentSem = response.data.find(s => s.isCurrent === true || s.is_current === true);
            if (currentSem) {
                setSelectedSemesterId(currentSem.semID || currentSem.semId || currentSem.id);
            }
        } catch (error) {
            console.error("Błąd pobierania semestrów:", error);
        }
    };

    useEffect(() => {
        if (viewMode === 'szczegoly' && activeSection) {
            if (activeTab === 'obecnosc' && selectedDate) fetchAttendance();
            else if (activeTab === 'oceny') fetchGrades();
        }
    }, [activeTab, selectedDate, activeSection]);

    const openSectionDetails = async (section) => {
        try {
            const res = await axiosInstance.get(`/api/teachers/me/sections/${section.sectionId || section.seID || section.id}`);

            const preservedStudents = section.students || section.enrolledStudents || [];
            setActiveSection({ ...section, ...res.data, students: preservedStudents });

            setEditCapacity(res.data.maxCapacity || section.maxCapacity);
            setEditStatus(res.data.status || res.data.seState || section.status || 'REGISTERED');
            setViewMode('szczegoly');
            setActiveTab('sklad');
        } catch (error) {
            setActiveSection(section);
            setEditCapacity(section.maxCapacity);
            setEditStatus(section.status || section.seState || 'REGISTERED');
            setViewMode('szczegoly');
            setActiveTab('sklad');
        }
    };

    const handleCreateSection = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/teachers/me/sections', {
                topicId: newSectionData.topicId,
                maxCapacity: parseInt(newSectionData.maxCapacity),
                sectionStatus: newSectionData.sectionStatus
            });
            setShowCreateModal(false);
            setNewSectionData({ topicId: '', maxCapacity: 15, sectionStatus: 'REGISTERED' });
            fetchSections();
        } catch (error) {
            alert(`Błąd tworzenia sekcji!\nSerwer zwrócił: ${error.response?.data?.message || error.response?.status || "Brak szczegółów"}`);
        }
    };

    const handleUpdateSection = async () => {
        try {
            const sectionId = activeSection.sectionId || activeSection.seID || activeSection.id;
            const payload = {
                topicId: editTopicId || activeSection.topicId || activeSection.topic?.toID,
                maxCapacity: parseInt(editCapacity),
                sectionStatus: editStatus
            };
            await axiosInstance.patch(`/api/teachers/me/sections/${sectionId}`, payload);
            alert("Zmiany zapisane!");
            const res = await axiosInstance.get(`/api/teachers/me/sections/${sectionId}`);
            const preservedStudents = activeSection.students || [];
            setActiveSection({ ...activeSection, ...res.data, students: preservedStudents });
            fetchSections();
        } catch(error) { alert("Błąd edycji."); }
    };

    const handleDeleteSection = async () => {
        const sectionId = activeSection.sectionId || activeSection.seID || activeSection.id;
        if(window.confirm("Czy na pewno chcesz CAŁKOWICIE usunąć tę sekcję i wypisać z niej wszystkich studentów?")) {
            try {
                await axiosInstance.delete(`/api/teachers/me/sections/${sectionId}`);
                setViewMode('lista');
                fetchSections();
            } catch (error) { alert("Błąd usuwania."); }
        }
    };

    const fetchAttendance = async () => {
        try {
            const sectionId = activeSection.sectionId || activeSection.seID || activeSection.id;
            const res = await axiosInstance.get(`/api/sections/${sectionId}/attendance`, { params: { date: selectedDate } });

            if (!res.data || res.data.length === 0) {
                const emptyAttendance = (activeSection.students || []).map(student => ({
                    studentId: student.studentId || student.sID || student.sid || student.id || student.student,
                    fullName: student.fullName || `${student.sFirstName} ${student.sLastName}`,
                    status: null
                }));
                setAttendanceList(emptyAttendance);
            } else {
                setAttendanceList(res.data);
            }
        } catch (error) { console.error(error); }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceList(prevList =>
            prevList.map(student =>
                (student.studentId || student.sID || student.sid || student.id || student.student) === studentId
                    ? { ...student, status: status }
                    : student
            )
        );
    };

    const handleSaveAttendance = async () => {
        try {
            const sectionId = activeSection.sectionId || activeSection.seID || activeSection.id;

            const mappedAttendance = attendanceList.map(s => ({
                student: s.studentId || s.sID || s.sid || s.id || s.student,
                status: s.status || "ABSENT"
            }));

            const payload = {
                date: selectedDate,
                attendance: mappedAttendance,
                attendances: mappedAttendance
            };

            await axiosInstance.post(`/api/sections/${sectionId}/attendance`, payload);
            alert('Obecność zapisana!');
        } catch (error) {
            console.error("Szczegóły błędu z backendu:", error.response?.data);
            alert(`Błąd zapisu! Serwer odrzucił zapytanie:\n${error.response?.data?.message || error.response?.status || "Brak komunikatu. Sprawdź F12."}`);
        }
    };

    const fetchGrades = async () => {
        try {
            const sectionId = activeSection.sectionId || activeSection.seID || activeSection.id;
            const res = await axiosInstance.get(`/api/sections/${sectionId}/grades`);

            if (!res.data.students || res.data.students.length === 0) {
                const emptyGrades = (activeSection.students || []).map(student => ({
                    studentId: student.studentId || student.sID || student.sid || student.id || student.student,
                    fullName: student.fullName || `${student.sFirstName} ${student.sLastName}`,
                    grade: ''
                }));
                setGradesData({ students: emptyGrades });
            } else {
                setGradesData(res.data);
            }
        } catch (error) { console.error(error); }
    };

    const handleSaveGrades = async () => {
        try {
            const sectionId = activeSection.sectionId || activeSection.seID || activeSection.id;
            const payload = { grades: gradesData.students.map(s => ({
                    studentId: s.studentId || s.sID || s.sid || s.id || s.student,
                    grade: s.grade || ""
                })) };
            await axiosInstance.put(`/api/sections/${sectionId}/grades`, payload);
            alert('Oceny zapisane!');
        } catch (error) {
            alert(`Błąd zapisu! ${error.response?.data?.message || error.response?.status || ""}`);
        }
    };

    if (viewMode === 'lista') {
        const filteredSections = sections.filter(sec => {
            if (selectedSemesterId === 'ALL') return true;
            const secSemId = sec.semesterId || sec.semId || sec.semesterID || sec.semester?.semID || sec.semester?.id;
            return secSemId === selectedSemesterId;
        });

        return (
            <div style={{ color: '#2d3436' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Twoje Sekcje Projektowe</h2>
                    <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 20px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        + Utwórz nową sekcję
                    </button>
                </div>

                <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Wyświetl dla semestru:</label>
                    <select value={selectedSemesterId} onChange={(e) => setSelectedSemesterId(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                        <option value="ALL">Wszystkie semestry</option>
                        {semesters.map(sem => {
                            const id = sem.semID || sem.semId || sem.id;
                            const isCur = sem.isCurrent === true || sem.is_current === true;
                            return (
                                <option key={id} value={id}>
                                    {sem.semYear} {sem.semField} {isCur ? '(Bieżący)' : '(Nieaktywny)'}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredSections.length > 0 ? filteredSections.map((sec, index) => {
                        const secId = sec.sectionId || sec.seID || sec.id;
                        return (
                            <div key={secId} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `4px solid ${sec.status === 'CLOSED' ? '#d63031' : '#00b894'}` }}>
                                <h3 style={{ margin: '0 0 10px 0' }}>Sekcja {index + 1}</h3>
                                <p style={{ fontSize: '14px', color: '#636e72' }}>Zapisanych: <strong>{sec.currentOccupancy || sec.students?.length || sec.enrolledStudents?.length || 0} / {sec.maxCapacity}</strong></p>
                                <button onClick={() => openSectionDetails(sec)} style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#f1f2f6', color: '#0984e3', border: '1px solid #0984e3', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Zarządzaj Sekcją ➔
                                </button>
                            </div>
                        );
                    }) : <p style={{ color: '#b2bec3' }}>Brak sekcji do wyświetlenia w wybranym semestrze.</p>}
                </div>

                {showCreateModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', color: '#2d3436' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>Kreator nowej sekcji</h3>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#2d3436', fontWeight: 'bold' }}>✕</button>
                            </div>
                            <form onSubmit={handleCreateSection} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '-10px' }}>Wybierz Temat Projektu:</label>
                                <select required value={newSectionData.topicId} onChange={(e) => setNewSectionData({...newSectionData, topicId: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                                    <option value="">Lista tematów</option>
                                    {topics.map(t => <option key={t.toid || t.id} value={t.toid || t.id}>{t.to_name || t.toName || t.name}</option>)}
                                </select>

                                <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '-10px' }}>Początkowy status:</label>
                                <select required value={newSectionData.sectionStatus} onChange={(e) => setNewSectionData({...newSectionData, sectionStatus: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                                    <option value="REGISTERED">Otwarta (Rejestracja)</option>
                                    <option value="CLOSED">Zamknięta</option>
                                </select>

                                <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '-10px' }}>Liczba osób (limit):</label>
                                <input type="number" min="1" value={newSectionData.maxCapacity} onChange={(e) => setNewSectionData({...newSectionData, maxCapacity: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }} />

                                <button type="submit" style={{ padding: '12px', marginTop: '10px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Zapisz sekcję</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const activeSectionId = activeSection.sectionId || activeSection.seID || activeSection.id;
    const studentsList = activeSection.students || [];

    return (
        <div style={{ color: '#2d3436' }}>
            <button onClick={() => setViewMode('lista')} style={{ background: 'none', border: 'none', color: '#0984e3', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>⬅ Wróć do listy sekcji</button>
            <h2 style={{ marginTop: 0 }}>Zarządzanie Sekcją #{sections.findIndex(s => (s.sectionId || s.seID || s.id) === activeSectionId) + 1}</h2>

            <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #dfe6e9', marginBottom: '20px' }}>
                {['sklad', 'obecnosc', 'oceny', 'ustawienia'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px', border: 'none', background: 'none', borderBottom: activeTab === tab ? '3px solid #0984e3' : 'none', color: activeTab === tab ? '#0984e3' : '#636e72', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'sklad' && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
                    <h3 style={{ marginTop: 0, color: '#00b894', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>
                        Zapisani studenci ({studentsList.length}/{activeSection.maxCapacity})
                    </h3>

                    {studentsList.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            {studentsList.map(s => (
                                <div key={s.studentId || s.sID || s.sid || s.id || s.student} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', backgroundColor: '#fdfdfd', border: '1px solid #dfe6e9', borderRadius: '6px' }}>
                                    <span style={{ fontWeight: '500', fontSize: '15px' }}>👤 {s.fullName || `${s.sFirstName} ${s.sLastName}`}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#b2bec3', fontStyle: 'italic', marginTop: '15px' }}>Nikt jeszcze nie zapisał się do tej sekcji.</p>
                    )}
                </div>
            )}

            {activeTab === 'obecnosc' && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Data zajęć:</label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }} />
                    {selectedDate && (
                        <>
                            {attendanceList.map(s => {
                                // KLUCZOWA POPRAWKA: Łapiemy 'student' z JSON-a
                                const studId = s.studentId || s.sID || s.sid || s.id || s.student;
                                return (
                                    <div key={studId} style={{ display: 'flex', gap: '20px', marginBottom: '15px', alignItems: 'center', borderBottom: '1px solid #f1f2f6', paddingBottom: '10px' }}>
                                        <span style={{ minWidth: '200px', fontWeight: '500' }}>{s.fullName || `${s.sFirstName} ${s.sLastName}`}</span>
                                        <label style={{ cursor: 'pointer' }}><input type="radio" checked={s.status === 'PRESENT'} onChange={() => handleAttendanceChange(studId, 'PRESENT')} /> Obecny</label>
                                        <label style={{ cursor: 'pointer' }}><input type="radio" checked={s.status === 'ABSENT'} onChange={() => handleAttendanceChange(studId, 'ABSENT')} /> Nieobecny</label>
                                    </div>
                                );
                            })}
                            <button onClick={handleSaveAttendance} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Zapisz obecność</button>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'oceny' && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    {gradesData.students && gradesData.students.map(s => {
                        const studId = s.studentId || s.sID || s.sid || s.id || s.student;
                        return (
                            <div key={studId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f1f2f6', paddingBottom: '10px' }}>
                                <span style={{ fontWeight: '500' }}>{s.fullName || `${s.sFirstName} ${s.sLastName}`}</span>
                                <select value={s.grade || ''} onChange={(e) => {
                                    const newGrades = gradesData.students.map(st => (st.studentId || st.sID || st.sid || st.id || st.student) === studId ? {...st, grade: e.target.value} : st);
                                    setGradesData({...gradesData, students: newGrades});
                                }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                                    <option value="">Brak oceny</option>
                                    {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        );
                    })}
                    <button onClick={handleSaveGrades} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Zapisz oceny</button>
                </div>
            )}

            {activeTab === 'ustawienia' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginTop: 0, color: '#2d3436' }}>Edycja Sekcji</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Zmień status:</label>
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                                    <option value="REGISTERED">Otwarta (Rejestracja)</option>
                                    <option value="CLOSED">Zamknięta</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Nowy limit osób:</label>
                                <input type="number" min="1" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Zmień temat (opcjonalnie):</label>
                                <select value={editTopicId} onChange={(e) => setEditTopicId(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                                    <option value="">-- Pozostaw bez zmian --</option>
                                    {topics.map(t => <option key={t.toid || t.id} value={t.toid || t.id}>{t.to_name || t.toName || t.name}</option>)}
                                </select>
                            </div>

                            <button onClick={handleUpdateSection} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fdcb6e', color: '#2d3436', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Zapisz zmiany
                            </button>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #d63031', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#636e72', fontSize: '14px', marginBottom: '20px' }}>Usunięcie sekcji jest nieodwracalne. Wszyscy zapisani studenci stracą swoje przypisanie do tego projektu.</p>
                        <button onClick={handleDeleteSection} style={{ padding: '10px 20px', backgroundColor: '#d63031', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Usuń całkowicie tę sekcję
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionsView;

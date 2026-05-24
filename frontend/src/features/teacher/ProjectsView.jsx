import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const ProjectsView = () => {
    const [sections, setSections] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [topics, setTopics] = useState([]); // NOWY STAN: Lista tematów

    const [selectedSemesterId, setSelectedSemesterId] = useState('ALL');
    const [selectedSectionId, setSelectedSectionId] = useState('');

    const [activeSectionDetails, setActiveSectionDetails] = useState(null);

    useEffect(() => {
        fetchSemesters();
        fetchSections();
        fetchTopics();
    }, []);

    const fetchSemesters = async () => {
        try {
            const response = await axiosInstance.get('/api/semesters');
            setSemesters(response.data);

            const currentSem = response.data.find(s => s.isCurrent === true || s.is_current === true);
            if (currentSem) {
                const id = currentSem.semID || currentSem.semId || currentSem.id;
                setSelectedSemesterId(id);
            }
        } catch (error) {
            console.error("Błąd pobierania semestrów:", error);
        }
    };

    const fetchSections = async () => {
        try {
            const response = await axiosInstance.get('/api/teachers/me/sections');
            setSections(response.data);
        } catch (error) {
            console.error("Błąd pobierania sekcji:", error);
        }
    };

    const fetchTopics = async () => {
        try {
            const response = await axiosInstance.get('/api/topics');
            setTopics(response.data);
        } catch (error) {
            console.error("Błąd pobierania tematów:", error);
        }
    };

    useEffect(() => {
        if (selectedSectionId) {
            axiosInstance.get(`/api/teachers/me/sections/${selectedSectionId}`)
                .then(res => setActiveSectionDetails(res.data))
                .catch(err => console.error("Błąd pobierania szczegółów sekcji:", err));
        } else {
            setActiveSectionDetails(null);
        }
    }, [selectedSectionId]);

    const filteredSections = sections.filter(sec => {
        if (selectedSemesterId === 'ALL') return true;
        const secSemId = sec.semesterId || sec.semId || sec.semesterID || sec.semester?.semID || sec.semester?.id;
        if (!secSemId) return true;
        return secSemId === selectedSemesterId;
    });

    const activeSection = sections.find(s => {
        const id = s.sectionId || s.seID || s.id;
        return id === selectedSectionId;
    });

    const getTopicName = () => {
        if (!activeSectionDetails || topics.length === 0) return "Wczytywanie tematu...";

        const tId = activeSectionDetails.topicId || activeSectionDetails.toID || activeSectionDetails.id;
        const foundTopic = topics.find(t => (t.toid || t.toID || t.id) === tId);

        return foundTopic ? (foundTopic.to_name || foundTopic.toName || foundTopic.name) : "Nieznany temat";
    };

    const handleDownload = async (sectionId, fileName) => {
        try {
            const response = await axiosInstance.get(`/api/students/sections/${sectionId}/project/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const downloadName = fileName ? fileName.split('_').pop() : `projekt_sekcja.zip`;
            link.setAttribute('download', downloadName);

            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Błąd pobierania pliku:", error);
            alert("Nie udało się pobrać pliku. Upewnij się, że projekt został faktycznie wgrany na serwer.");
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '10px', color: '#2d3436' }}>Nadesłane Projekty</h2>
            <p style={{ color: '#636e72', marginBottom: '20px' }}>
                Wybierz semestr i konkretną sekcję, aby pobrać projekt wgrany przez grupę.
            </p>

            <div style={{ display: 'flex', gap: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>Semestr:</label>
                    <select
                        value={selectedSemesterId}
                        onChange={(e) => {
                            setSelectedSemesterId(e.target.value);
                            setSelectedSectionId('');
                        }}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}
                    >
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

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>Sekcja (Grupa):</label>
                    <select
                        value={selectedSectionId}
                        onChange={(e) => setSelectedSectionId(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}
                    >
                        <option value="">-- Wybierz sekcję --</option>
                        {filteredSections.map((sec, index) => {
                            const id = sec.sectionId || sec.seID || sec.id;
                            return (
                                <option key={id} value={id}>
                                    Sekcja #{index + 1} ({sec.currentOccupancy || sec.students?.length || 0} osób)
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {activeSection ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderLeft: '5px solid #00b894' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#2d3436' }}>Projekt</h3>
                                <p style={{ margin: '5px 0 0 0', color: '#0984e3', fontWeight: 'bold', fontSize: '15px' }}>
                                    Temat: {getTopicName()}
                                </p>
                            </div>

                            {activeSection.projectFileName ? (
                                <button
                                    onClick={() => handleDownload(activeSection.sectionId || activeSection.seID || activeSection.id, activeSection.projectFileName)}
                                    style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(39, 174, 96, 0.3)' }}
                                >
                                    ⬇ Pobierz archiwum .ZIP
                                </button>
                            ) : (
                                <span style={{ padding: '8px 15px', backgroundColor: '#f1f2f6', color: '#b2bec3', borderRadius: '5px', fontWeight: 'bold' }}>
                                    Brak wgranego pliku
                                </span>
                            )}
                        </div>

                        <h4 style={{ margin: '0 0 10px 0', color: '#636e72' }}>Członkowie grupy odpowiedzialni za projekt:</h4>
                        {activeSection.students && activeSection.students.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                <tr style={{ backgroundColor: '#f9f9f9', textAlign: 'left', color: '#2d3436' }}>
                                    <th style={{ padding: '12px', borderBottom: '1px solid #dfe6e9' }}>Imię i Nazwisko Studenta</th>
                                </tr>
                                </thead>
                                <tbody>
                                {activeSection.students.map(student => (
                                    <tr key={student.studentId || student.sID || student.id}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #f1f2f6', color: '#2d3436' }}>
                                            👤 {student.fullName || `${student.sFirstName} ${student.sLastName}`}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#b2bec3', fontStyle: 'italic' }}>Nikt nie jest przypisany do tej sekcji.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#b2bec3', backgroundColor: '#f5f6fa', borderRadius: '8px', border: '2px dashed #dfe6e9' }}>
                    Wybierz sekcję z menu powyżej, aby zobaczyć i pobrać jej projekt.
                </div>
            )}
        </div>
    );
};

export default ProjectsView;
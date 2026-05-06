import { useState, useEffect } from 'react';
import studentsData from './oceny.json';

const ProjectsView = () => {
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);

    const academicYears = ['2025/2026', '2024/2025'];


    const mockVersions = {
        "S001": [
            { id: 1, data: '2025-05-10 14:30', komentarz: 'Naprawiono błąd z logowaniem', plik: 'projekt_v2.zip' },
            { id: 2, data: '2025-05-01 09:15', komentarz: 'Wstępna wersja projektu', plik: 'projekt_v1.zip' }
        ],
        "S002": [
            { id: 3, data: '2025-05-08 20:00', komentarz: 'Dodano interfejs mobilny', plik: 'fiszki_final.zip' }
        ]
    };

    useEffect(() => {
        if (selectedYear && selectedSection) {
            const studentsWithActivity = studentsData.map(s => ({
                ...s,
                ostatniaAktywnosc: mockVersions[s.id] ? mockVersions[s.id][0].data : 'Brak nadesłanych wersji'
            }));
            setStudents(studentsWithActivity);
        } else {
            setStudents([]);
            setSelectedStudent(null);
        }
    }, [selectedYear, selectedSection]);

    const handleDownload = (fileName) => {
        alert(`Pobieranie pliku: ${fileName}`);
    };

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}> Realizowane Projekty i Wersje</h2>

            <div style={{ display: 'flex', gap: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>Rok Akademicki:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => { setSelectedYear(e.target.value); setSelectedSection(''); setSelectedStudent(null); }}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9', minWidth: '200px' }}
                    >
                        <option value="">-- Wybierz rok --</option>
                        {academicYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>Sekcja:</label>
                    <select
                        value={selectedSection}
                        onChange={(e) => { setSelectedSection(e.target.value); setSelectedStudent(null); }}
                        disabled={!selectedYear}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9', minWidth: '200px', backgroundColor: !selectedYear ? '#f1f2f6' : 'white' }}
                    >
                        <option value="">-- Wybierz sekcję --</option>
                        <option value="SEC_1">Grupa Projektowa 1</option>
                        <option value="SEC_2">Grupa Projektowa 2</option>
                    </select>
                </div>
            </div>

            {selectedYear && selectedSection ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                                    <th style={{ padding: '12px 8px' }}>ID</th>
                                    <th style={{ padding: '12px 8px' }}>Imię i Nazwisko</th>
                                    <th style={{ padding: '12px 8px' }}>Ostatnia aktywność</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr
                                        key={student.id}
                                        style={{
                                            borderBottom: '1px solid #dfe6e9',
                                            backgroundColor: selectedStudent?.id === student.id ? '#f1f2f6' : 'transparent',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <td style={{ padding: '12px 8px', color: '#636e72' }}>{student.id}</td>
                                        <td style={{ padding: '12px 8px', fontWeight: '500' }}>{student.imie} {student.nazwisko}</td>
                                        <td style={{ padding: '12px 8px', color: '#2d3436' }}>{student.ostatniaAktywnosc}</td>
                                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                            <button
                                                style={{ padding: '6px 12px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                                            >
                                                Szczegóły
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedStudent && (
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderLeft: '5px solid #0984e3' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>Nadesłane wersje: {selectedStudent.imie} {selectedStudent.nazwisko}</h3>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    style={{ background: 'none', border: 'none', color: '#b2bec3', cursor: 'pointer', fontSize: '20px' }}
                                >✕</button>
                            </div>

                            {mockVersions[selectedStudent.id] ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: '#636e72', fontSize: '14px', borderBottom: '1px solid #dfe6e9' }}>
                                            <th style={{ padding: '10px' }}>Data przesłania</th>
                                            <th style={{ padding: '10px' }}>Komentarz studenta</th>
                                            <th style={{ padding: '10px', textAlign: 'right' }}>Plik</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockVersions[selectedStudent.id].map(ver => (
                                            <tr key={ver.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                                <td style={{ padding: '12px 10px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{ver.data}</td>
                                                <td style={{ padding: '12px 10px', color: '#2d3436', fontStyle: 'italic' }}>"{ver.komentarz}"</td>
                                                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleDownload(ver.plik)}
                                                        style={{ padding: '8px 15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                                    >
                                                        Pobierz .zip
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#b2bec3', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                    Ten student nie nadesłał jeszcze żadnej wersji projektu.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#b2bec3', backgroundColor: '#f5f6fa', borderRadius: '8px' }}>
                    Wybierz rok akademicki i sekcję, aby zarządzać wersjami projektów.
                </div>
            )}
        </div>
    );
};

export default ProjectsView;
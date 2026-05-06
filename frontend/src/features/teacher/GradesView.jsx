import { useState, useEffect } from 'react';
import currentGradesData from './oceny.json'; // Bieżące oceny
import archivalGradesData from './oceny_archiwalne.json'; // Archiwalne oceny

const GradesView = () => {
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // Stan przechowujący aktualnie wyświetlanych studentów i ich oceny
    const [students, setStudents] = useState([]);

    // Symulacja struktury uczelnianej
    const academicYears = ['2025/2026', '2024/2025'];
    const currentAcademicYear = '2025/2026'; // Bieżący rok = edycja dozwolona

    // Dostępne oceny w systemie polskim
    const availableGrades = [2.0, 3.0, 3.5, 4.0, 4.5, 5.0];

    // Efekt przeładowujący dane w zależności od wybranego roku
    useEffect(() => {
        if (selectedYear === '2025/2026') {
            setStudents(currentGradesData);
        } else if (selectedYear === '2024/2025') {
            setStudents(archivalGradesData);
        } else {
            setStudents([]);
        }
    }, [selectedYear, selectedSection]);

    // Funkcja do aktualizacji oceny w lokalnym stanie (tylko dla bieżącego roku)
    const handleGradeChange = (studentId, newGrade) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.id === studentId ? { ...student, ocena: parseFloat(newGrade) } : student
            )
        );
    };

    const handleSave = () => {
        alert('Oceny zostały pomyślnie zaktualizowane w bazie danych!');
        console.log('Nowe oceny:', students);
    };

    // Sprawdzamy, czy użytkownik może edytować oceny
    const isEditable = selectedYear === currentAcademicYear;

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Oceny Projektowe</h2>

            {/* Panel filtrów */}
            <div style={{ display: 'flex', gap: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>Rok Akademicki:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => { setSelectedYear(e.target.value); setSelectedSection(''); }}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9', minWidth: '200px' }}
                    >
                        <option value="">-- Wybierz rok --</option>
                        {academicYears.map(year => (
                            <option key={year} value={year}>{year} {year === currentAcademicYear ? '(Bieżący)' : '(Archiwalny)'}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>Sekcja:</label>
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        disabled={!selectedYear}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9', minWidth: '200px', backgroundColor: !selectedYear ? '#f1f2f6' : 'white' }}
                    >
                        <option value="">-- Wybierz sekcję --</option>
                        {selectedYear && (
                            <>
                                <option value="SEC_1">Grupa Projektowa 1</option>
                                <option value="SEC_2">Grupa Projektowa 2</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* Tabela ocen */}
            {selectedYear && selectedSection ? (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

                    {!isEditable && (
                        <div style={{ padding: '10px 15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
                            <strong>Tryb tylko do odczytu.</strong> Przeglądasz oceny z archiwalnego roku akademickiego.
                        </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                        <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                            <th style={{ padding: '12px 8px' }}>ID Studenta</th>
                            <th style={{ padding: '12px 8px' }}>Imię i Nazwisko</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Ocena Końcowa</th>
                        </tr>
                        </thead>
                        <tbody>
                        {students.map(student => (
                            <tr key={student.id} style={{ borderBottom: '1px solid #dfe6e9' }}>
                                <td style={{ padding: '12px 8px', color: '#636e72' }}>{student.id}</td>
                                <td style={{ padding: '12px 8px', fontWeight: '500' }}>{student.imie} {student.nazwisko}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                    {isEditable ? (
                                        <select
                                            value={student.ocena || ''}
                                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #0984e3', fontWeight: 'bold', color: '#0984e3' }}
                                        >
                                            <option value="">Brak</option>
                                            {availableGrades.map(grade => (
                                                <option key={grade} value={grade}>{grade.toFixed(1)}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span style={{ fontWeight: 'bold', color: '#2d3436', fontSize: '16px' }}>
                        {student.ocena ? student.ocena.toFixed(1) : '-'}
                      </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {isEditable && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button
                                onClick={handleSave}
                                style={{ padding: '10px 30px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                            >
                                Zapisz zmiany w ocenach
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#b2bec3', backgroundColor: '#f5f6fa', borderRadius: '8px' }}>
                    Wybierz rok akademicki i sekcję, aby załadować listę studentów i ich oceny.
                </div>
            )}
        </div>
    );
};

export default GradesView;
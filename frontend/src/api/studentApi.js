import axios from './axios';

// We manually add the /api prefix to avoid changing the global axios config

export const getMySection = () => {
    return axios.get('/api/students/me/section');
};

export const getSections = () => {
    return axios.get('/api/students/sections');
};

export const getMyAttendance = () => {
    return axios.get('/api/students/me/attendance');
};

export const getMyGrades = () => {
    return axios.get('/api/students/me/grades');
};

export const signUpForSection = (sectionId) => {
    return axios.post(`/api/students/me/sections/${sectionId}`);
};

export const signOutFromSection = (sectionId) => {
    return axios.delete(`/api/students/me/sections/${sectionId}`);
};

export const changeSection = (oldSectionId, newSectionId) => {
    return axios.put('/api/students/me/sections/change', { oldSectionId, newSectionId });
};

// --- File Management ---

export const uploadProjectFile = (sectionId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post(`/api/students/me/sections/${sectionId}/project`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const downloadProjectFile = (sectionId) => {
    // We need the full response to access headers
    return axios.get(`/api/students/sections/${sectionId}/project/download`, {
        responseType: 'blob',
    });
};

export const deleteProjectFile = (sectionId) => {
    return axios.delete(`/api/students/sections/${sectionId}/project`);
};

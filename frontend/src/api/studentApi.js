import axios from './axios';

// We manually add the /api prefix to avoid changing the global axios config

export const getSections = () => {
    return axios.get('/api/students/sections');
};

export const getMyAttendance = () => {
    return axios.get('/api/students/me/attendance');
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

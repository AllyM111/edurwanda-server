import api from "./api";


// ===============================
// GET ALL EXAMS
// ===============================

export const getExams = async()=>{

    const response = await api.get("/exams");

    return response.data;

};




// ===============================
// GET SINGLE EXAM
// ===============================

export const getExamById = async(id)=>{

    const response = await api.get(`/exams/${id}`);

    return response.data;

};




// ===============================
// DELETE EXAM
// ===============================

export const deleteExam = async(id)=>{

    const response = await api.delete(`/exams/${id}`);

    return response.data;

};
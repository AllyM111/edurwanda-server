// GET SINGLE BOOK
export const getBookById = async (id) => {

    const response = await api.get(
        `/books/${id}`
    );

    return response.data;

};
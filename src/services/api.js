import axios from "axios";

const httpRequest = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

export const userApi = {
    createUser: (user) => httpRequest.post("/user/create", user),
    getAllUser: () => httpRequest.get("/user/all"),
    getUserById: (userId) => httpRequest.get(`/user/id/${userId}`),
    getUserByText: (text) => httpRequest.get(`/user/text/${text}`),
    updateUser: (user, userId) => httpRequest.put(`/user/update/${userId}`, user),
    deleteUser: (userId) => httpRequest.delete(`/user/delete/${userId}`),
}

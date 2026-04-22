import axios from 'axios'

const api = axios.create({
    baseURL: "/api/auth",
    withCredentials: true
})

export async function login({email, password}){
    const response = await api.post('/login', {email, password})

    return response.data
}

export async function register({email, username, password}) {
    const response = await api.post('/register', {email, username, password})

    return response.data
}

export async function getMe() {
    const response = await api.get('/get-user') 
    
    return response.data
}

export async function logout() {
    const response = await api.get('/logout')

    return response.data
}
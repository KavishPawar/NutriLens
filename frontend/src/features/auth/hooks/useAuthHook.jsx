import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, getMe, logout } from '../services/auth.api.js';

export const useAuthHook = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context;

    async function handleLogin({ email, password }) {
        setLoading(true)
        const data = await login({ email, password })
        setUser(data.user)
        setLoading(false)
    }

    async function handleRegister({ email, username, password }) {
        setLoading(true)
        const data = await register({ email, username, password })
        setUser(data.user)
        setLoading(false)
    }

    async function handleLogout() {
        setLoading(true)
        const data = await logout()
        setUser(null)
        setLoading(false)
    }
    
    async function handleGetMe() {
        try{ 
            setLoading(true)
            const data = await getMe()
            setUser(data.user)
        }catch(err) {
            console.log(err)
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        handleGetMe()
    }, [])

    return ({
        user, handleLogin, handleRegister, handleGetMe, handleLogout, loading
    })
    
}
import { useAuthHook } from '../auth/hooks/useAuthHook'
import { Navigate } from 'react-router'

const Protected = ({ children }) => {

    const { loading, user } = useAuthHook();
    
    if(loading) {
        return <h1>Loading...</h1>
    }

    if(!user) {
        return <Navigate to="/login" />;
    }

  return children
}

export default Protected

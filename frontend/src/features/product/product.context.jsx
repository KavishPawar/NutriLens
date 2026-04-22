import { createContext, useState } from "react";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [ product, setProduct ] = useState(null)
    const [ productHistory, setProductHistory ] = useState(null)    
    const [ loading, setLoading ] = useState(true)

    return (
        <ProductContext.Provider value={{ product, setProduct, productHistory, setProductHistory, loading, setLoading }}>
            {children}
        </ProductContext.Provider>
    )
}

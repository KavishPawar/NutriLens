import { useContext, useEffect } from "react";
import { ProductContext } from "../product.context";
import { fetchProd, prodHistory, deleteHistory } from "../services/product.api";

export const useProductHook = () => {
  const context = useContext(ProductContext);
  const { product, setProduct, productHistory, setProductHistory, loading, setLoading } = context;

  async function handleProductFetch({ barcode }) {
    setLoading(true);
    const data = await fetchProd({ barcode });
    setProduct(data.productInfo);
    setLoading(false);
  }
  async function handleProductHistory() {
    setLoading(true);
    const data = await prodHistory();
    setProductHistory([...data.products].reverse());
    setLoading(false);
  }

  async function handleDeleteHistory({ userId }) {
    setLoading(true)
    const data = await deleteHistory({ userId });
    setProductHistory(null)
    setLoading(false)
  }
  useEffect(() => {
    handleProductHistory()
  }, [])

  return ({ 
    product, productHistory, loading, handleProductFetch, handleProductHistory, handleDeleteHistory
   })
};

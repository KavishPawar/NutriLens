import { useContext, useEffect } from "react";
import { ProductContext } from "../product.context";
import {
  createProductRequest,
  deleteHistory,
  fetchProd,
  prodHistory,
} from "../services/product.api";
import { getBackendError } from "../../../shared/error.utils.js";

export const useProductHook = () => {
  const context = useContext(ProductContext);
  const {
    product,
    setProduct,
    aiResponse,
    setAiResponse,
    productHistory,
    setProductHistory,
    loading,
    setLoading,
  } = context;

  async function handleProductFetch({ barcode }) {
    setLoading(true);
    try {
      const data = await fetchProd({ barcode });
      setProduct(data.productInfo);
      setAiResponse(data.aiResponse || null);
    } catch (err) {
      throw getBackendError(err, "Unable to fetch product details.");
    } finally {
      setLoading(false);
    }
  }
  async function handleProductHistory() {
    setLoading(true);
    try {
      const data = await prodHistory();
      setProductHistory([...data.products].reverse());
    } catch (err) {
      throw getBackendError(err, "Unable to fetch product history.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteHistory({ userId }) {
    setLoading(true);
    try {
      await deleteHistory({ userId });
      setProductHistory(null);
    } catch (err) {
      throw getBackendError(err, "Unable to delete product history.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProductRequest({ productName }) {
    setLoading(true);
    try {
      return await createProductRequest({ productName });
    } catch (err) {
      throw getBackendError(err, "Unable to submit product request.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    handleProductHistory().catch(() => {});
  }, []);

  return {
    product,
    aiResponse,
    productHistory,
    loading,
    handleProductFetch,
    handleProductHistory,
    handleDeleteHistory,
    handleCreateProductRequest,
  };
};

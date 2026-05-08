import { useState, useEffect, useCallback, useContext } from "react";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllUsers,
  updateUser,
  deleteUser,
  getPendingRequests,
  approveRequest,
  dismissRequest,
  
} from "../services/admin.api.js";
import { AdminContext } from "../admin.context.jsx";

export const useAdminHook = () => {
  const context = useContext(AdminContext);

  const {
    users,
    setUsers,
    products,
    setProducts,
    requests,
    setRequests,
    loading,
    setLoading,
  } = context;

  // ── Fetch all data on mount ───────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prodResult, userResult, reqResult] = await Promise.allSettled([
        getAllProducts(),
        getAllUsers(),
        getPendingRequests(),
      ]);

      if (prodResult.status === "fulfilled") {
        setProducts(prodResult.value.products || []);
      } else {
        console.error("Products fetch failed:", prodResult.reason);
        setProducts([]);
      }

      if (userResult.status === "fulfilled") {
        setUsers(userResult.value.users || []);
      } else {
        console.error("Users fetch failed:", userResult.reason);
        setUsers([]);
      }

      if (reqResult.status === "fulfilled") {
        setRequests(reqResult.value.requests || []);
      } else {
        console.error("Requests fetch failed:", reqResult.reason);
        setRequests([]);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Product handlers ──────────────────────────────────────────────────────
  // productData can be FormData (from new Add form) or a plain object
  const handleAddProduct = async (productData) => {
    // ── DEBUG ────────────────────────────────────────────────────────────────
    console.log("[handleAddProduct] productData:", productData);
    if (productData instanceof FormData) {
      console.log("[handleAddProduct] FormData entries:", Object.fromEntries(productData.entries()));
    }
    // ─────────────────────────────────────────────────────────────────────────
    setLoading(true);
    try {
      const data = await addProduct(productData);
      setProducts((prev) => [data.product, ...prev]);
    } catch (err) {
      console.log(err?.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async ({ id, productData }) => {
    setLoading(true);
    try {
      const data = await updateProduct({ id, productData });
      setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
    } catch (err) {
      console.log(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async ({ id }) => {
    setLoading(true);
    try {
      await deleteProduct({ id });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.log(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // ── User handlers ─────────────────────────────────────────────────────────
  const handleUpdateUser = async ({ id, userData }) => {
    setLoading(true);
    try {
      console.log(userData)
      const data = await updateUser({ id, userData });
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
    } catch (err) {
      console.log(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async ({ id }) => {
    setLoading(true);
    try {
      await deleteUser({ id });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.log(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // ── Request handlers ──────────────────────────────────────────────────────
  const handleApproveRequest = async ({ id }) => {
    setLoading(true);
    try {
      const data = await approveRequest({ id });
      setRequests((prev) => prev.filter((r) => r._id !== id));
      if (data.product) setProducts((prev) => [data.product, ...prev]);
    } catch (err) {
      console.log(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleDismissRequest = async ({ id }) => {
    setLoading(true);
    try {
      await dismissRequest({ id });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.log(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    products,
    users,
    requests,
    loading,
    fetchAll,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleUpdateUser,
    handleDeleteUser,
    handleApproveRequest,
    handleDismissRequest,
  };
};

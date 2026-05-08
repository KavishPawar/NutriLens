import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import {
  login,
  register,
  getMe,
  logout,
  updateProfile,
} from "../services/auth.api.js";
import { getBackendError } from "../../../shared/error.utils.js";

export const useAuthHook = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  async function handleLogin({ email, password }) {
    setLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw getBackendError(err, "Unable to login right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister({ email, username, password, role }) {
    setLoading(true);
    try {
      const data = await register({ email, username, password, role });
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw getBackendError(err, "Unable to register right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      throw getBackendError(err, "Unable to logout right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(profileData) {
    setLoading(true);
    try {
      const data = await updateProfile(profileData);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw getBackendError(err, "Unable to update profile right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetMe() {
    try {
      setLoading(true);
      const data = await getMe();
      setUser(data.user);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleGetMe();
  }, []);

  return {
    user,
    handleLogin,
    handleRegister,
    handleGetMe,
    handleLogout,
    handleUpdateProfile,
    loading,
  };
};

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AlertTriangle,
  Home,
  RotateCcw,
  ShieldAlert,
  LogIn,
  Send,
  Loader2,
} from "lucide-react";
import "./error-page.scss";
import { useProductHook } from "../product/hooks/useProductHook";

const ErrorPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { handleCreateProductRequest, loading } = useProductHook();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [requestStatus, setRequestStatus] = useState({ type: "", message: "" });

  const status = Number(state?.status || 500);
  const message = state?.message || "Something went wrong. Please try again.";
  const normalizedMessage = String(message).toLowerCase();
  const isProductNotFound = useMemo(
    () =>
      status === 404 &&
      (normalizedMessage.includes("product not found") ||
        normalizedMessage.includes("unable to fetch product")),
    [status, normalizedMessage],
  );

  const title =
    status === 401
      ? "Authentication Required"
      : status === 403
        ? "Access Forbidden"
        : status === 404
          ? "Page Not Found"
          : "Request Failed";

  const subtitle =
    status === 401
      ? "Please sign in again to continue."
      : status === 403
        ? "You do not have permission to access this resource."
        : status === 404
          ? "The page or resource you requested could not be found."
          : "We could not complete your request at the moment.";

  const primaryAction = () => {
    if (status === 401) {
      navigate("/login");
      return;
    }
    if (status === 403) {
      navigate("/");
      return;
    }
    navigate(-1);
  };

  const primaryLabel =
    status === 401 ? "Go to Login" : status === 403 ? "Go to Home" : "Try Again";

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const name = productName.trim();
    if (!name) {
      setRequestStatus({
        type: "error",
        message: "Please enter a product name.",
      });
      return;
    }

    try {
      await handleCreateProductRequest({ productName: name });
      setProductName("");
      setRequestStatus({
        type: "success",
        message: "Request sent to admin successfully.",
      });
    } catch (err) {
      setRequestStatus({
        type: "error",
        message: err?.message || "Failed to submit request.",
      });
    }
  };

  return (
    <div className="error-page">
      <div className="error-page__card">
        <p className="error-page__status-code" aria-hidden="true">
          {status}
        </p>
        <div className="error-page__badge">
          {status === 403 ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
          <span>Error {status}</span>
        </div>

        <h1 className="error-page__title">{title}</h1>
        <p className="error-page__subtitle">{message}</p>

        <div className="error-page__actions">
          <button className="error-page__btn error-page__btn--primary" onClick={primaryAction}>
            {status === 401 ? <LogIn size={16} /> : <RotateCcw size={16} />}
            {primaryLabel}
          </button>
          <button
            className="error-page__btn error-page__btn--secondary"
            onClick={() => navigate("/")}
          >
            <Home size={16} />
            Home
          </button>
          {isProductNotFound && (
            <button
              className="error-page__btn error-page__btn--request"
              onClick={() => {
                setIsRequestOpen((prev) => !prev);
                setRequestStatus({ type: "", message: "" });
              }}
            >
              <Send size={16} />
              Request Product
            </button>
          )}
        </div>

        {isProductNotFound && (
          <div
            className={`error-page__request-panel ${isRequestOpen ? "error-page__request-panel--open" : ""}`}
          >
            <form className="error-page__request-form" onSubmit={handleRequestSubmit}>
              <input
                type="text"
                className="error-page__request-input"
                placeholder="Enter missing product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                maxLength={120}
              />
              <button
                type="submit"
                className="error-page__btn error-page__btn--request-submit"
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                Send
              </button>
            </form>
            {requestStatus.message && (
              <p
                className={`error-page__request-status ${
                  requestStatus.type === "success"
                    ? "error-page__request-status--success"
                    : "error-page__request-status--error"
                }`}
              >
                {requestStatus.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;

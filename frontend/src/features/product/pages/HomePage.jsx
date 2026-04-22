import React from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "../styles/home.scss";
import { useProductHook } from "../hooks/useProductHook";
import { useAuthHook } from "../../auth/hooks/useAuthHook";

import {
  Scan,
  Keyboard,
  ArrowRight,
  Sparkles,
  Leaf,
  ShieldPlus,
  Star,
} from "lucide-react";
import { redirect, useNavigate } from "react-router";
import { useState } from "react";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthHook();
  const [ inputBarcode, setInputBarcode ] = useState();
  const { handleProductFetch, handleProductHistory, product, productHistory } = useProductHook();
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new BrowserMultiFormatReader();
      const imageUrl = URL.createObjectURL(file);

      const result = await reader.decodeFromImageUrl(imageUrl);
      const barcode = result.getText();
      console.log(barcode);
      await processBarcode(barcode);
    } catch (err) {
      console.log("Barcode not detected. Try a clearer image." + err.message);
    }
  };

  const processBarcode = async (barcode) => {
    if (!barcode) {
      console.log("Invalid barcode");
      return;
    }

    await handleProductFetch({ barcode });
      console.log("FETCH DONE");
      navigate("/product-detail");
  };

  return (
    <div className="home-page">
      <div>
        <h2>Welcome, {user?.username}</h2>
      </div>
      <br></br>
      <div className="top-section">
        <div className="upload-container">
          <label for="inputField">
            <div className="upload-box">
              <div className="icon-wrapper">
                <Scan size={32} />
              </div>
              <h2>Upload Barcode</h2>
              <p>Drag and drop your photo here or click to browse</p>
              <label></label>
              <input
                id="inputField"
                style={{ display: "none" }}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </label>
        </div>

        <div className="actions-section">
          <div className="manual-entry-card">
            <div className="card-header">
              <Keyboard size={18} />
              <span>Manual Entry</span>
            </div>
            <div className="input-group">
              <input type="number" placeholder="Enter barcode number..." onChange={(e) => setInputBarcode(e.target.value)} value={inputBarcode}/>
              <button className="btn-icon" onClick={() => processBarcode( inputBarcode )}>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="recent-scans-card">
            <h3 className="card-title">Recent Scans</h3>
            <div className="scan-container">
              {productHistory?.length !== 0 ? (
                productHistory?.map((prod) => (
                  <div>
                    <div
                      className="scan-item"
                      key={prod.barcode}
                      onClick={() => processBarcode( prod.barcode )}
                    >
                      <div
                        className="scan-icon-mock"
                        style={{ backgroundColor: "#2a0f0f" }}
                      >
                        <span style={{ color: "#fff", fontSize: "12px" }}>
                          AG
                        </span>
                      </div>
                      <div className="scan-info">
                        <h4>{prod.name}</h4>
                        <span className="status excellent">
                          {prod.processingLevel ?? "unknown"}
                        </span>
                      </div>
                      <div className="score score-green">{prod.rating.stars}/5</div>
                    </div>
                  </div>
                ))
              ) : (
                <h3 className="recent-scan-empty-text">No Scans Yet</h3>
              )}
            </div>
            <a href="/product-history" className="btn-text">
              View All History
            </a>
          </div>
        </div>
      </div>

      <div className="hero-section">
        <div className="hero-content">
          <span className="tag">THE VITAL CURATOR</span>
          <h1 className="hero-title">
            Clarity in every <br />
            <span className="highlight">choice.</span>
          </h1>
          <p className="hero-description">
            NutriLens transforms complex nutritional labels into a transparent
            story. We believe health clarity shouldn't be a luxury—it's a
            standard. Scan to see the truth behind your food.
          </p>
        </div>
        <div className="hero-image-container">
          <img
            src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Fresh Vegetables in a crate"
            className="main-image"
          />
          <div className="vitality-score-card">
            <div className="card-header">
              <Star size={16} className="star-icon" fill="#166534" />
              <span>Vitality Score</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: "75%" }}></div>
            </div>
            <span className="grade-text">Grade A - Optimal Nutrition</span>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="feature">
          <Sparkles size={28} className="feature-icon" />
          <h3>Unfiltered Truth</h3>
          <p>
            We bypass marketing jargon to provide a clinical yet approachable
            breakdown of every ingredient.
          </p>
        </div>
        <div className="feature">
          <Leaf size={28} className="feature-icon" />
          <h3>Eco-Conscious</h3>
          <p>
            Learn about the environmental footprint of your food choices
            alongside its nutritional value.
          </p>
        </div>
        <div className="feature">
          <ShieldPlus size={28} className="feature-icon" />
          <h3>Personalized Context</h3>
          <p>
            Safety alerts customized to your unique dietary requirements and
            allergen sensitivities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Form.css";
import AuthForm from "../AuthForm";
import logo from "../ecom.png";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || "";
  const [form, setForm] = useState({ email: initialEmail, code: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setForm(f => ({ ...f, email: location.state.email }));
    }
  }, [location.state]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/ecommerce/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(data.message);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <AuthForm
      title="Verify OTP"
      avatarIcon={<img src={logo} alt="E-commerce Logo" style={{ width: 57, height: 57 }} />}
      fields={[
        {
          name: "email",
          placeholder: "Email",
          value: form.email,
          icon: "fa fa-envelope",
        },
        {
          name: "code",
          placeholder: "OTP Code",
          value: form.code,
          icon: "fa fa-key",
        },
      ]}
      onChange={handleChange}
      onSubmit={handleSubmit}
      buttonText="Verify OTP"
      message={message}
    />
  );
}
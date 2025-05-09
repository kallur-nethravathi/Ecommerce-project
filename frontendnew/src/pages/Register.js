import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Form.css";
import AuthForm from "../AuthForm";
import logo from "../ecom.png"; // Adjust the path if the logo is named differently or in another location

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/ecommerce/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(data.message + ". Please check your email for the OTP.");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: form.email } });
      }, 1500);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-100 to-blue-200">
      <AuthForm
        title="Register"
        avatarIcon={<img src={logo} alt="E-commerce Logo" style={{ width: 57, height: 57 }} />}
        fields={[
          {
            name: "name",
            placeholder: "Name",
            value: form.name,
            icon: "fa fa-user",
          },
          {
            name: "email",
            placeholder: "Email",
            value: form.email,
            icon: "fa fa-envelope",
          },
          {
            name: "password",
            type: "password",
            placeholder: "Password",
            value: form.password,
            icon: "fa fa-lock",
          },
        ]}
        onChange={handleChange}
        onSubmit={handleSubmit}
        buttonText="Register"
        message={message}
      />
    </div>
  );
}

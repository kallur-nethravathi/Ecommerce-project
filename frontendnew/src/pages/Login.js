import React, { useState } from "react";
import "../Form.css";
import AuthForm from "../AuthForm";
import logo from "../ecom.png";
import { Link } from "react-router-dom";

// Add this in your public/index.html <head> for Font Awesome icons:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/ecommerce/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <AuthForm
      title="Login"
      avatarIcon={<img src={logo} alt="E-commerce Logo" style={{ width: 57, height: 57 }} />}
      fields={[
        {
          name: "email",
          placeholder: "Email ID",
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
      buttonText="LOGIN"
      message={message}
      options={
        <>
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/forgot-password">Forgot Password?</Link>
        </>
      }
    />
  );
}
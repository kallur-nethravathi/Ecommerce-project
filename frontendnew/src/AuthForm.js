import React from "react";
import "./Form.css";

export default function AuthForm({
  title,
  fields,
  onChange,
  onSubmit,
  buttonText,
  message,
  avatarIcon,
  options,
}) {
  return (
    <div className="form-container">
      {avatarIcon && <div className="form-avatar">{avatarIcon}</div>}
      <h2>{title}</h2>
      <form onSubmit={onSubmit}>
        {fields.map((field, idx) => (
          <div className="input-group" key={field.name}>
            {field.icon && (
              <span className="input-icon">
                <i className={field.icon}></i>
              </span>
            )}
            <input
              name={field.name}
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={field.value}
              onChange={onChange}
              autoComplete={field.autoComplete || "off"}
            />
          </div>
        ))}
        {options && <div className="form-options">{options}</div>}
        <button type="submit">{buttonText}</button>
      </form>
      <div className="message">{message}</div>
    </div>
  );
} 
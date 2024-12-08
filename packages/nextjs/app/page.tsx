"use client";

import React, { useState } from "react";
import "./Home.css";
import SobreNosotros from "./SobreNosotros";

const Home: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("https://darpamailusservice.onrender.com/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("¡Correo enviado exitosamente!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("Error al enviar el correo");
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al enviar el correo");
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero">
          <video
            autoPlay
            muted
            loop
            className="video w-full object-cover rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none"
          >
            <source src="./titulos.mp4" type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      </section>
      <br />
      <br />
      {/* About Us Section */}
      <section>
        <SobreNosotros />
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="contact-title">Contáctanos</h2>
          <p className="contact-description">
            ¿Tenés alguna pregunta o necesitas más información? Completá el formulario y nos pondremos en contacto
            contigo a la brevedad.
          </p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Tu correo electrónico"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Mensaje
              </label>
              <textarea
                id="message"
                className="form-textarea"
                placeholder="Tu mensaje"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="contact-button">
              Enviar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;

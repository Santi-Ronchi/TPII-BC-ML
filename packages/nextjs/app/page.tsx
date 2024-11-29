import React from 'react';
import './Home.css';
import SobreNosotros from './SobreNosotros';

const Home: React.FC = () => {
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
      <br></br>
      <br></br>
      {/* About Us Section */}
      <section className="">
        <SobreNosotros></SobreNosotros>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="contact-title">Contáctanos</h2>
          <p className="contact-description">
            ¿Tenes alguna pregunta o necesitas más información? Completa el formulario y nos pondremos en contacto contigo a la brevedad.
          </p>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nombre completo</label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="Tu nombre"
                required
                aria-label="Nombre completo"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Correo electrónico</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Tu correo electrónico"
                required
                aria-label="Correo electrónico"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="form-label">Mensaje</label>
              <textarea
                id="message"
                className="form-textarea"
                placeholder="Tu mensaje"
                required
                aria-label="Escribe tu mensaje"
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

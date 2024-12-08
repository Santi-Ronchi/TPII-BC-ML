"use client";

import React from "react";

const SobreNosotros = () => {
  return (
    <section className="" style={{ backgroundColor: "rgba(203, 207, 211, 0.5)" }}>
      <div className="h-full p-10">
        <div className="g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
          <div className="w-full">
            <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
              <div className="g-0 lg:flex lg:flex-wrap">
                {/* <!-- Left column container--> */}
                <div className="px-4 md:px-0 lg:w-6/12">
                  <div className="md:mx-6 md:p-12">
                    <section className="flex flex-col items-center justify-center p-8 bg-gray-100">
                      <h1 className="text-5xl font-extrabold text-gray-800 tracking-wide mb-6">¿Quiénes somos?</h1>
                      <p className="text-lg leading-relaxed text-gray-700 max-w-4xl text-center">
                        En <span className="font-bold text-purple-600">Darpa</span>, transformamos la industria
                        inmobiliaria mediante la innovación tecnológica. Nuestro objetivo es ofrecer soluciones modernas
                        y eficientes para simplificar el proceso de alquiler de propiedades.
                      </p>
                      <p className="text-lg leading-relaxed text-gray-700 max-w-4xl text-center mt-4">
                        A través del uso de la tecnología blockchain, garantizamos contratos de alquiler seguros,
                        transparentes y a prueba de manipulaciones, brindando confianza tanto a propietarios como a
                        inquilinos. Además, contamos con un avanzado servicio de tasación de alquileres, que utiliza
                        datos precisos y análisis inteligentes para determinar valores justos y competitivos en el
                        mercado.
                      </p>
                      <p className="text-lg leading-relaxed text-gray-700 max-w-4xl text-center mt-4">
                        En <span className="font-bold text-purple-600">Darpa</span>, combinamos tecnología y experiencia
                        para redefinir la manera en que gestionas tus inmuebles.
                      </p>
                    </section>

                    <br></br>
                    <br></br>
                    {/* <!--Logo--> */}
                    <div className="text-center">
                      <img className="mx-auto w-48 rounded-lg" src="./logo-arpa.png" alt="logo" />
                      <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">Un hogar con tu identidad.</h4>
                    </div>
                  </div>
                </div>

                {/* <!-- Right column container with background and description--> */}

                <div className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none">
                  <video
                    autoPlay
                    muted
                    loop
                    className="w-full max-h-[800px] object-cover rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none"
                  >
                    <source src="./video1.mp4" type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm font-bold"></p>
    </section>
  );
};
export default SobreNosotros;

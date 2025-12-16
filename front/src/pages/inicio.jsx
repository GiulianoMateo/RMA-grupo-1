import React from "react";
import logoRMA from "../../logo.png";
import { MapaDeNodos } from "../components/molecules";
import { Container } from "../components/atoms";
import { Navigate } from "react-router-dom";
import { useBreadcrumbsUpdater } from "../hooks";

const Inicio = () => {
  useBreadcrumbsUpdater();
  return (
    <Container>
      <div className="normal-bg normal-text place-items-center">
        <div className="header px-11 py-3 flex">
          <img
            src={logoRMA}
            alt="Imagen 2"
            className="size-8 sm:size-12 md:size-20 animate-spin-slow"
          />
          <h1 className="ml-10 h-24 antialiased roboto-bold dark:text-slate-50 uppercase md:text-3xl md:text-5x1">
            Red de Monitoreo de la Cuenca <br />
            Inferior del Río Chubut
          </h1>
        </div>
        <div className="px-11 text-lg text-center roboto-light">
          <hr className="mb-4" />
          <p className="mb-3">
            Bienvenido a la red de monitoreo de arroyos provista por la
            Cooperativa Eléctrica de Trelew. Explore el mapa de abajo o consulta
            la{" "}
            <a
              href="list-sensor"
              className="font-semibold text-blue-950 dark:text-blue-300"
            >
              lista de nodos
            </a>
            .
          </p>
        </div>
        <div className="my-10 rounded-lg md:w-12/12 md:h-6/12 w-full h-full overflow-hidden border-1 border-slate-400 drop-shadow-xl">
          <MapaDeNodos />
        </div>
        <div className="px-11 text-lg text-center roboto-light">
          {/*<p className="mb-3">
            En el mapa se visualiza el <b>último dato</b> obtenido para cada
            nodo de la red.
          </p>
          <p className="my-3">
            Si no hubo datos hoy, estará en gris. Si los hubo, el color
            representará niveles de alerta (azul, amarillo, naranja y rojo)
          </p>*/}
          <p className="mb-3">
            <b>Clickea el nodo</b> para acceder a una vista detallada de su
            información y datos.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default Inicio;

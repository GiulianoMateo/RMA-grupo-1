import React from "react";
import { Link } from "react-router-dom";
import { Container, Header } from "../components/atoms";
import "bootstrap-icons/font/bootstrap-icons.css";
import BotonVolver from "../components/atoms/BotonVolver";

const ConfiguracionMenuPage = () => {
  return (
    <Container>
      <Header title="Menú de Configuración" />

      <div className="row">
        <Link to="/configuracion/general" className="col-md-4">
          <div className="mb-12 ">
            <div className="card shadow-sm hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white rounded-2xl">
              <div className="card-body text-center">
                <div
                  className="mb-3 text-primary"
                  style={{ fontSize: "5.3em" }}
                >
                  <i className="bi bi-gear"></i>
                </div>
                <h5 className="card-title roboto-medium items-center text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 font-semibold">
                  Configuración Global
                </h5>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/##########" className="col-md-4">
          <div className="mb-12 ">
            <div className="card shadow-sm hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white  rounded-2xl">
              <div className="card-body text-center">
              <div className="mb-3 text-primary" style={{ fontSize: "5.3em" }}>
                <i className="bi bi-radar"></i>
              </div>
                <h5 className="card-title roboto-medium items-center text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 font-semibold">
                  Gestion Nodos
                </h5>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/notificaciones" className="col-md-4">
          <div className="mb-12 ">
            <div className="card shadow-sm hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white  rounded-2xl">
              <div className="card-body text-center">
              <div className="mb-3 text-primary" style={{ fontSize: "5.3em" }}>
                <i className="bi bi-exclamation-circle"></i>
              </div>
                <h5 className="card-title roboto-medium items-center text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 font-semibold">
                  Suscripción a Alertas
                </h5>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/crear-tipo" className="col-md-4">
          <div className="mb-12 ">
            <div className="card shadow-sm hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white  rounded-2xl">
              <div className="card-body text-center">
              <div className="mb-3 text-primary" style={{ fontSize: "5.3em" }}>
                <i className="bi bi-plus-circle"></i>
              </div>
                <h5 className="card-title roboto-medium items-center text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 font-semibold">
                  Crear Tipo
                </h5>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <BotonVolver ruta="/" texto="Volver" />
    </Container>
  );
};

export default ConfiguracionMenuPage;

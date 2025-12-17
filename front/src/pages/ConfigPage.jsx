import React from "react"; 
import ConfigFormList from "../components/organisms/ConfigFormList";
import { Container, Header } from "../components/atoms";
import ConfigAlert from "../components/organisms/ConfigAlert";
import BotonVolver from "../components/atoms/BotonVolver";

const ConfigPage = () => {
  return (
    <Container>
      <Header title="Configuración Global" />

        <div className="mb-6">
          <div className="card h-100">
            <div className="card-body">
              <ConfigFormList />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="card h-100">
            <div className="card-body">
              <ConfigAlert />
            </div>
          </div>
        </div>

        <BotonVolver ruta="/configuracion" texto="Volver" />

              
    </Container>
  );
};

export default ConfigPage;

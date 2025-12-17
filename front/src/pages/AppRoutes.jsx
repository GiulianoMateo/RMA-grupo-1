import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import NavBar from "../components/NavBar";
import DatosPage from "./DatosPage";
import Inicio from "./inicio";
import LoginPage from "./LoginPage";
import NodoPage from "./NodoPage";
import ProtectedRoute from "./ProtectedRoute";
import SensorForm from "./SensorForm";
import NodoList from "./NodoList";
import Example from "./TestPage";
import BateriaPage from "./BateriaPage";
import LogoutConfirmationPage from "./LogoutConfirmationPage";
import RegisterPage from "./RegisterPage";
import ConfigPage from "./ConfigPage";
import ConfiguracionMenuPage from "./ConfiguracionMenuPage";
import CreateTipoPage from "./CreateTipoPage";
import { ConfigNotifications } from "./ConfigNotifications";
import AdminPage from "./AdminPage";
import Error403 from "./Error403";
import PageDatosArchivos from "./PageDatosArchivo";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<NavBar />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <Inicio />
            </ProtectedRoute>
          }
        />
        <Route path="403" element={<Error403 />} />
        <Route
          path="lista-nodos"
          element={
            <ProtectedRoute>
              <NodoList />
            </ProtectedRoute>
          }
        />
        <Route
          path="datos-view"
          element={
            <ProtectedRoute>
              <DatosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="datos-view/archivos"
          element={
            <ProtectedRoute>
              <PageDatosArchivos />
            </ProtectedRoute>
          }
        />
        <Route
          path="create-sensor"
          element={
            <ProtectedRoute>
              <SensorForm />
            </ProtectedRoute>
          }
        />
        <Route path="sensor/:id" element={<NodoPage />} />
        <Route path="sensor/:id/bateria-page" element={<BateriaPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="testpage" element={<Example />} />
        <Route path="/confirm-logout" element={<LogoutConfirmationPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/notificaciones"
          element={
            <ProtectedRoute>
              <ConfigNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion/general"
          element={
            <ProtectedRoute>
              <ConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute>
              <ConfiguracionMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-tipo"
          element={
            <ProtectedRoute>
              <CreateTipoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/administrador"
          element={
            <ProtectedRoute permission={"admin"}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
export default AppRoutes;

import React from "react";
import { Link } from "react-router-dom";

const BotonVolver = ({ ruta, texto = "Volver" }) => {
  return (
    <Link to={ruta} className="roboto-medium text-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-8 rounded-2xl transition-all duration-100 dark:bg-slate-800 dark:hover:bg-slate-900 dark:text-slate-200 inline-block">
      {texto}
    </Link>
  );
};

export default BotonVolver

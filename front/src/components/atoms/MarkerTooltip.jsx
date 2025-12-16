const BASE_CLASSES_FOR_MARKERS =
  " roboto-light text-black p-2 border border-gray-800 shadow-md rounded-3xl font-serif min-w-32 text-center text-center transition-all duration-300";

  import { obtenerStringTiempoDesdeUltimoDato } from "../utils/date";
  import useColorBasedOnAlert from "../../hooks/useColorBasedOnAlert";


const MarkerTooltip = ({ nodo, dataNodo }) => {

  
  const {alertColor, loadingColor} = useColorBasedOnAlert(nodo)
  if (dataNodo?.length === 0)
    return (
  <div className={`${BASE_CLASSES_FOR_MARKERS} bg-gray-400`}>
        <span className="text-xs text-nowrap text-ellipsis">
          {nodo.identificador}
        </span>
        <br />
        <i className="fa fa-exclamation-triangle mr-2" /> <span className="italic text-xs">Offline</span>
      </div>
    );
    
  const lastData = dataNodo[dataNodo.length - 1];
  const stringUltimoDato = obtenerStringTiempoDesdeUltimoDato(dataNodo);

  if(loadingColor)
    return null

return (
  <div className={`${BASE_CLASSES_FOR_MARKERS} bg-gradient-to-tr from-gray-300 to-gray-400`}>
    <span className="text-sm font-medium text-nowrap text-ellipsis">
      {nodo.identificador}
    </span>
      {/*<br />
      <i className="fa fa-tint mr-2" />{" "}
      <span className="roboto-bold text-lg">
        {lastData?.data ? (lastData?.data / 100).toFixed(1) + "m" : "--"}
      </span>
      <br />
      <span className="text-xs bold ">{stringUltimoDato}</span>
      */}
    </div>
  );
};

export default MarkerTooltip;

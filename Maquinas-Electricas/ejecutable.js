// Declaramos la funcion con la cual evaluaremos los parametros
const curvaDeImanacion = (H) => {
  const B = (2e-3*H / (1 + 1e-3*H));
  return B;
}

// Con la funcion de la curva calculamos la intensidad del campo
const intensidadAPartirDeLaCurva = (campoMagnetico) => {
  const H = campoMagnetico/((2e-3) - (1e-3*campoMagnetico));
  return H;
}

// Funcion para calcular el potencial magnetico
const calculadorDePotencial = (campoMagnetico, muCero, longitudDelEntrehierro, longitudDelMaterial) => {
  const intensidadDelCampoEnEntrehierro = campoMagnetico/muCero;
  const potencialMagneticoEnEntrehierro = intensidadDelCampoEnEntrehierro * longitudDelEntrehierro;
  const intensidadDelCampoEnMaterial = intensidadAPartirDeLaCurva(campoMagnetico);
  const potencialMagneticoEnMaterial = intensidadDelCampoEnMaterial * longitudDelMaterial;
  const potencialTotal = potencialMagneticoEnEntrehierro + potencialMagneticoEnMaterial;
  return potencialTotal;
}

// Funcion aproximadora
const aproximadorDeCampoMagnetico = (condicionDeFuerzaMagnetomotriz, muCero, longitudDelEntrehierro, longitudDelMaterial, campoPropuesto, numeroDeIntentos) => {
  // Iteramos para encontrar los limites en los que buscaremos el campo magnetico
  let limiteInferior = 0, limiteSuperior = 0;
  while (!(limiteInferior && limiteSuperior)) {
    potencialResultante = calculadorDePotencial(campoPropuesto, muCero, longitudDelEntrehierro, longitudDelMaterial);
    if (potencialResultante > condicionDeFuerzaMagnetomotriz) {
      limiteSuperior = campoPropuesto;
      campoPropuesto = campoPropuesto/2;
    } else if (potencialResultante < condicionDeFuerzaMagnetomotriz) {
      limiteInferior = campoPropuesto; 
      campoPropuesto = campoPropuesto*2;
    }
  }

  // Partimos el intervalo entre el numero de intentos deseados y obtenemos todos los valores a probar
  const paso = (limiteSuperior - limiteInferior) / (numeroDeIntentos + 1);
  const vector = Array.from({length: numeroDeIntentos}, (_, i) => limiteInferior + (i+1) * paso);

  // Mejores acercamientos
  let mejorAproximacion;
  let mejorPotencial;
  let mejorDiferencia = condicionDeFuerzaMagnetomotriz - Math.abs(calculadorDePotencial(limiteInferior, muCero, longitudDelEntrehierro, longitudDelMaterial));

  // Iteramos sobre el vector para encontrar el mejor acercamiento
  for (const intento of vector) {
    potencialResultante = calculadorDePotencial(intento, muCero, longitudDelEntrehierro, longitudDelMaterial);
    let diferencia = Math.abs((condicionDeFuerzaMagnetomotriz - potencialResultante));
    if (diferencia < mejorDiferencia) {
      mejorDiferencia = diferencia;
      mejorAproximacion = intento;
      mejorPotencial = potencialResultante;
    }
  }

  return { mejorAproximacion, mejorPotencial, mejorDiferencia };
};

// Funcion principal
(function main () {
  // Condicion a cumplir
  const condicionDeFuerzaMagnetomotriz = 500;

  // Valores conocidos
  const muCero = Math.PI * 4e-7; // Tesla * metro / Amperio
  const longitudDelEntrehierro = 1e-3; // metro
  const longitudDelMaterial = 1; // metro

  // Empezamos a proponer valores de Campo Magnetico hasta encontrar uno que cumpla con la condicion
  let campoPropuesto = 1; // Tesla

  // Establecemos un maximo en el que intentaremos encontrar este valor
  const numeroDeIntentos = 1000;

  const { mejorAproximacion, mejorPotencial, mejorDiferencia } = aproximadorDeCampoMagnetico(
    condicionDeFuerzaMagnetomotriz,
    muCero,
    longitudDelEntrehierro,
    longitudDelMaterial,
    campoPropuesto,
    numeroDeIntentos
  );
  console.log("Campo: " + mejorAproximacion.toFixed(15) + " con potencial " + mejorPotencial.toFixed(4) + " y diferencia " + mejorDiferencia.toFixed(4));
})();

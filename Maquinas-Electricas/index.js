// Con la funcion de la curva calculamos la intensidad del campo
const intensidadAPartirDeLaCurva = (campoMagnetico) => {
  // Obtenemos la formula de la curva en terminos de H
  let hFormula = document.getElementById("hFormula").value;

  // Remplazamos los valores de B en la formula por la propuesta
  hFormula = hFormula.replace(/B/g, campoMagnetico);

  return eval(hFormula);
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
function main () {
  // Valores constantes
  const muCero = Math.PI * 4e-7; // Tesla * metro / Amperio

  // Nos traemos los valores de los inputs en el HTML
  // Condicion a cumplir
  const condicionDeFuerzaMagnetomotriz = Number(document.getElementById("fem").value);
  // Valores conocidos
  const longitudDelEntrehierro = Number(document.getElementById("lentrehierro").value);
  const longitudDelMaterial = Number(document.getElementById("lmaterial").value);
  // Empezamos a proponer valores de Campo Magnetico hasta encontrar uno que cumpla con la condicion
  const campoPropuesto = Number(document.getElementById("campo").value);
  // Establecemos un maximo en el que intentaremos encontrar este valor
  const numeroDeIntentos = Number(document.getElementById("n").value);

  // Ejecutamos la funcion calculadora
  const { mejorAproximacion, mejorPotencial, mejorDiferencia } = aproximadorDeCampoMagnetico(
    condicionDeFuerzaMagnetomotriz,
    muCero,
    longitudDelEntrehierro,
    longitudDelMaterial,
    campoPropuesto,
    numeroDeIntentos
  );

  const resultado = "Campo: " + mejorAproximacion.toFixed(15) + " con potencial " + mejorPotencial.toFixed(4) + " y diferencia " + mejorDiferencia.toFixed(4);
  document.getElementById("resultado").innerHTML = resultado;
  console.log(resultado);
}

// Cuando se hace click en el boton con id "calcular" se ejecuta la funcion principal
document.getElementById("calcular").addEventListener("click", (_) => {
  main();
});

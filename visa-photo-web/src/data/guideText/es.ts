import type { GuideText } from "./index";

/**
 * Spanish gets the USCIS guide and not the others on purpose: an Indian PSK or a Chinese
 * receipt code concerns the citizens of those countries, while US immigration paperwork is
 * filed in Spanish by more people than in any language but English.
 */
const es: Record<string, GuideText> = {
  "uscis-stopped-accepting-your-photo": {
    title: "USCIS ya no acepta la foto que envías tú",
    h1: "USCIS dejó de aceptar tu fotografía",
    lead:
      "El 12 de diciembre de 2025 USCIS dejó de aceptar fotografías enviadas por el solicitante: ahora te la toman en la cita de biometría. Al Departamento de Estado no le afecta, y esa diferencia decide si necesitas preparar un archivo o no.",
    body: [
      "El aviso de política es concreto. Sólo se usan las fotografías tomadas por USCIS o por otra entidad autorizada, y una anterior sólo sirve si se tomó dentro de los últimos 36 meses. Cuatro formularios exigen una nueva sin importar cuándo te fotografiaron por última vez: I-90 para reemplazar la green card, I-485 para ajuste de estatus, N-400 para naturalización y N-600 para el certificado de ciudadanía.",
      "Es fácil equivocarse porque «green card» nombra dos caminos por dos agencias distintas. El ajuste de estatus dentro de Estados Unidos es USCIS, y ahí ya no hay nada que preparar. La visa de inmigrante que se tramita en un consulado en el extranjero es el Departamento de Estado, y esa sí te sigue pidiendo una fotografía.",
      "Todo lo del Departamento de Estado sigue igual. El DS-160 para visa de no inmigrante sigue aceptando un archivo de 600 × 600. El DS-11 para el pasaporte sigue pidiendo una impresa de 2 × 2 pulgadas. Y la lotería de visas de diversidad sigue tomando la fotografía que aporta el participante: una que no cumpla sigue descalificando la inscripción.",
      "USCIS explicó el motivo sin rodeos: la flexibilidad de la pandemia permitía reutilizar una foto hasta diez años incluso cuando el aspecto de la persona había cambiado bastante, y eso se mantuvo más tiempo del necesario.",
    ],
    takeaway:
      "Formulario de USCIS: te fotografían allí, no prepares nada. Formulario del Departamento de Estado —DS-160, DS-11, lotería DV—: prepara la fotografía como siempre.",
  },
};

export default es;

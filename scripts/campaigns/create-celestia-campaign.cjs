// scripts/campaigns/create-celestia-campaign.cjs

// Importamos las funciones y tipos necesarios desde la lógica de nuestra aplicación.
// NOTA: Usamos 'require' porque este es un script .cjs para Node.js.
const { addTemplate, exportTemplates } = require('../../src/lib/mockData/index.cjs');
const fs = require('fs');
const path = require('path');

// --- El Brief Creativo de "Celestia" ---
const CELESTIA_PROMPT = "Fotografía cinematográfica de una galería de arte minimalista y oscura en el metaverso. En el centro, un reloj de lujo 'Celestia' flota suspendido en el aire, desconstruyéndose lentamente en un remolino de engranajes y partículas de luz holográfica. Avatares elegantes observan la obra de arte, sus rostros iluminados por el brillo del reloj. El eslogan 'El Tiempo es un Lienzo' está proyectado sutilmente en el suelo. Atmósfera de exclusividad y asombro, estilo fotográfico de un museo de arte moderno, 8K, hiperrealista. --ar 16:9";

// --- El Activo Visual Simulado que "generaría" la IA ---
// En una implementación real, aquí llamaríamos a una API de IA.
// Aquí, simulamos el resultado usando una de nuestras imágenes de alta calidad existentes.
const SIMULATED_GENERATED_IMAGE = {
  id: `campaign_${Date.now()}`,
  prompt: CELESTIA_PROMPT,
  url: '/images/campaign-examples/aura_times_square.webp', // Usamos una imagen espectacular como resultado
  alt: "Una campaña de lujo para Celestia en una galería de arte del metaverso.",
  credit: "Generado por Meta Ad Studio",
  srcJpg: '/images/campaign-examples/aura_times_square.jpg',
  srcWebp: '/images/campaign-examples/aura_times_square.webp',
  srcSet: {
    webp: '/images/campaign-examples/aura_times_square.webp',
    webp2x: '/images/campaign-examples/aura_times_square-2x.webp',
    jpg: '/images/campaign-examples/aura_times_square.jpg',
    jpg2x: '/images/campaign-examples/aura_times_square-2x.jpg',
  },
};

// --- El Plan de Campaña Estratégico para el "Campaign Canvas" ---
const CAMPAIGN_PLAN = {
  campaignName: "Celestia: El Tiempo es un Lienzo",
  targetAudience: "Consumidores de lujo, entusiastas de la tecnología y coleccionistas de arte digital.",
  phases: [
    {
      name: "Fase 1: Teaser y Expectación",
      description: "Lanzamiento de imágenes en redes sociales mostrando partículas de reloj y fragmentos del eslogan.",
      assets: [SIMULATED_GENERATED_IMAGE.id],
      notes: "Copy: 'El Tiempo no se mide. Se experimenta.'",
    },
    {
      name: "Fase 2: Evento Exclusivo",
      description: "Inauguración de la 'Galería Efímera Celestia' en Decentraland Art Week. Abierta solo por 24 horas.",
      assets: [],
      notes: "Coordinar con influencers de arte digital para la premiere.",
    },
    {
      name: "Fase 3: Recompensa y Conversión",
      description: "Los asistentes al evento reciben un NFT 'Fragmento de Tiempo' que otorga acceso prioritario a la lista de compra del reloj.",
      assets: [],
      notes: "El NFT debe tener un diseño basado en los engranajes del reloj.",
    },
  ],
};

// --- La Función Principal de Orquestación ---
async function orchestrateCampaign() {
  console.log("🚀 Iniciando la orquestación de la campaña 'Celestia'...");

  // Paso 1: "Generar" el activo visual principal y guardarlo como plantilla.
  console.log("   -> Generando y guardando el activo visual principal como plantilla...");
  addTemplate(SIMULATED_GENERATED_IMAGE);
  console.log(`   ✅ Plantilla "${SIMULATED_GENERATED_IMAGE.id}" guardada con éxito.`);

  // Paso 2: Exportar todas las plantillas a un archivo para el equipo.
  // Esto simula compartir los activos con otros miembros del equipo.
  const allTemplatesJSON = exportTemplates();
  const templatesFilePath = path.join(__dirname, '../../output/all_templates.json');
  fs.mkdirSync(path.dirname(templatesFilePath), { recursive: true });
  fs.writeFileSync(templatesFilePath, allTemplatesJSON);
  console.log(`   ✅ Todas las plantillas exportadas a ${templatesFilePath}`);

  // Paso 3: Guardar el plan de campaña estratégico.
  // Esto simula el trabajo realizado en el "Campaign Canvas".
  const planFilePath = path.join(__dirname, '../../output/celestia_campaign_plan.json');
  fs.mkdirSync(path.dirname(planFilePath), { recursive: true });
  fs.writeFileSync(planFilePath, JSON.stringify(CAMPAIGN_PLAN, null, 2));
  console.log(`   ✅ Plan de campaña guardado en ${planFilePath}`);

  console.log("\n✨ Orquestación de la campaña 'Celestia' completada con éxito. ✨");
  console.log("Revisa la carpeta 'output' para ver los resultados.");
}

// Ejecutar la función.
orchestrateCampaign();

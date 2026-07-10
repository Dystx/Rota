export const ACTIVITY_REGIONS = ["porto", "lisbon", "douro", "algarve", "azores"] as const;

export type ActivityRegion = (typeof ACTIVITY_REGIONS)[number];

export type ActivityIntent = {
  region: ActivityRegion;
  timeWindow: string;
  moods: readonly string[];
  group: string;
  constraints: readonly string[];
};

export type EditorialActivity = {
  id: string;
  placeId: string;
  region: ActivityRegion;
  title: string;
  verdict: string;
  bestFor: readonly string[];
  durationMinutes: number;
  bestTime: string;
  avoidWhen: string | null;
  bookingNeed: "none" | "consider" | "essential";
  pairWith: readonly string[];
  alternativeId: string | null;
  weatherFit: readonly ("sun" | "rain" | "either")[];
  editorialStatus: "reviewed" | "draft";
  reviewedAt: string;
  evidenceUrl: string;
};

export const DEFAULT_ACTIVITY_INTENT: ActivityIntent = {
  region: "porto",
  timeWindow: "an afternoon",
  moods: ["good food"],
  group: "two adults",
  constraints: []
};

/**
 * Launch corpus researched against the linked official tourism references.
 * Verdicts are Rumia editorial judgments; the source URLs ground the facts,
 * not an endorsement, booking relationship, or paid placement.
 */
export const REVIEWED_ACTIVITY_SEED: readonly EditorialActivity[] = [
  {
    id: "porto-ribeira-slow-walk",
    placeId: "porto-ribeira",
    region: "porto",
    title: "Ribeira and Miragaia at walking pace",
    verdict: "Worth doing for a first feel of Porto, but give the hills and riverfront one unhurried block rather than your whole day.",
    bestFor: ["a walk", "good food", "first afternoon"],
    durationMinutes: 120,
    bestTime: "Late afternoon into early evening",
    avoidWhen: "You need a quiet, step-free, or fast-moving morning.",
    bookingNeed: "none",
    pairWith: ["A simple dinner away from the busiest riverfront tables"],
    alternativeId: "porto-bombarda-art-walk",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73735/amp"
  },
  {
    id: "porto-bombarda-art-walk",
    placeId: "porto-miguel-bombarda",
    region: "porto",
    title: "Miguel Bombarda for contemporary art and design",
    verdict: "Choose this when you want a Porto afternoon with texture beyond the riverfront; it is a better counterweight than adding another viewpoint.",
    bestFor: ["culture", "a walk", "a rainy afternoon"],
    durationMinutes: 90,
    bestTime: "Mid-afternoon",
    avoidWhen: "You only have time for one essential historic-core walk.",
    bookingNeed: "none",
    pairWith: ["Ribeira and Miragaia at walking pace"],
    alternativeId: "porto-ribeira-slow-walk",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73735/amp"
  },
  {
    id: "lisbon-alfama-slow-walk",
    placeId: "lisbon-alfama",
    region: "lisbon",
    title: "Alfama, slowly and on foot",
    verdict: "A strong Lisbon choice when you want atmosphere and views, provided you treat the climbs as the activity rather than a shortcut between landmarks.",
    bestFor: ["a walk", "culture", "first afternoon"],
    durationMinutes: 150,
    bestTime: "Late afternoon on a clear day",
    avoidWhen: "Steep cobbles or repeated climbs will make the day worse for your group.",
    bookingNeed: "none",
    pairWith: ["A fado evening after a rest"],
    alternativeId: "lisbon-alfama-fado-evening",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitlisboa.com/en/places/alfama"
  },
  {
    id: "lisbon-alfama-fado-evening",
    placeId: "lisbon-alfama-fado",
    region: "lisbon",
    title: "A fado evening after Alfama",
    verdict: "Best as the closing note to an Alfama day, not a compulsory Lisbon checkbox; choose a table only after you decide you want the listening time.",
    bestFor: ["culture", "good food", "an evening"],
    durationMinutes: 150,
    bestTime: "Evening after a lighter afternoon",
    avoidWhen: "You are already tired from a long hill walk or want a quick, spontaneous meal.",
    bookingNeed: "consider",
    pairWith: ["Alfama, slowly and on foot"],
    alternativeId: "lisbon-alfama-slow-walk",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitlisboa.com/en/places/alfama"
  },
  {
    id: "douro-line-pinhao",
    placeId: "douro-pinhao-station",
    region: "douro",
    title: "The Douro line to Pinhão",
    verdict: "One of the cleanest ways to understand the valley without driving it; make the train the point, not a rushed transfer between tastings.",
    bestFor: ["a scenic journey", "culture", "without a car"],
    durationMinutes: 240,
    bestTime: "A daylight journey with room to linger",
    avoidWhen: "You are trying to fit a full tasting schedule and a return transfer into the same short day.",
    bookingNeed: "consider",
    pairWith: ["A single quinta visit or a slow Pinhão lunch"],
    alternativeId: "douro-quinta-slow-day",
    weatherFit: ["sun", "rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/content/douro-valley"
  },
  {
    id: "douro-quinta-slow-day",
    placeId: "douro-quinta",
    region: "douro",
    title: "One quinta and a slow valley lunch",
    verdict: "A better Douro day is usually one thoughtful wine stop plus the landscape, rather than collecting tastings across a valley that takes time to move through.",
    bestFor: ["good food", "wine", "a full day"],
    durationMinutes: 300,
    bestTime: "Late morning through lunch",
    avoidWhen: "You are driving and plan to combine several tastings with a late transfer.",
    bookingNeed: "essential",
    pairWith: ["The Douro line to Pinhão"],
    alternativeId: "douro-line-pinhao",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/content/douro-valley"
  },
  {
    id: "algarve-via-algarviana-section",
    placeId: "algarve-via-algarviana",
    region: "algarve",
    title: "A chosen Via Algarviana section",
    verdict: "Choose a short, prepared section when you want the Algarve beyond its coast; it rewards a slower day and is not a drop-in replacement for a beach stop.",
    bestFor: ["a walk", "nature", "quiet time"],
    durationMinutes: 210,
    bestTime: "Morning outside peak heat",
    avoidWhen: "You have not checked the exact section, weather, water, and transport back.",
    bookingNeed: "none",
    pairWith: ["A low-key village lunch"],
    alternativeId: "algarve-ponta-da-piedade",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/algarve/73808"
  },
  {
    id: "algarve-ponta-da-piedade",
    placeId: "algarve-ponta-da-piedade",
    region: "algarve",
    title: "Ponta da Piedade as a short cliffside stop",
    verdict: "Use it for a concentrated coastal hour and good light, then move on; it is more satisfying as one scene in a day than as an all-afternoon queue exercise.",
    bestFor: ["a walk", "sea views", "first afternoon"],
    durationMinutes: 75,
    bestTime: "Late afternoon in stable weather",
    avoidWhen: "Wind, heat, or crowding makes the stairs and exposed coast feel like work.",
    bookingNeed: "none",
    pairWith: ["A calmer beach or an inland dinner"],
    alternativeId: "algarve-via-algarviana-section",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/pt-pt/content/ponta-da-piedade"
  },
  {
    id: "azores-sete-cidades-rim",
    placeId: "azores-sete-cidades",
    region: "azores",
    title: "Sete Cidades rim and Vista do Rei",
    verdict: "A defining São Miguel landscape when the weather is clear; treat it as a weather-dependent half-day, not a guaranteed photograph on a rigid schedule.",
    bestFor: ["nature", "a walk", "a scenic journey"],
    durationMinutes: 210,
    bestTime: "A clear morning with weather flexibility",
    avoidWhen: "Low cloud removes the view or you have no buffer to change the day.",
    bookingNeed: "none",
    pairWith: ["A simple Sete Cidades village stop"],
    alternativeId: "azores-furnas-volcanic-day",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://visitportugal.com/en/content/sao-miguel-the-green-island"
  },
  {
    id: "azores-furnas-volcanic-day",
    placeId: "azores-furnas",
    region: "azores",
    title: "Furnas: volcanic valley and thermal landscape",
    verdict: "Choose Furnas when you want a full, sensory São Miguel day with weather resilience; do not compress it into a quick stop between distant viewpoints.",
    bestFor: ["nature", "good food", "a rainy afternoon"],
    durationMinutes: 300,
    bestTime: "A full day with a flexible middle",
    avoidWhen: "You are only passing through the east of the island with no time to slow down.",
    bookingNeed: "consider",
    pairWith: ["A nearby thermal stop chosen for current conditions"],
    alternativeId: "azores-sete-cidades-rim",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitazores.com/en/explore?category=places-to-visit&island=sao-miguel"
  },
  {
    id: "porto-clerigos-climb",
    placeId: "porto-clerigos",
    region: "porto",
    title: "Clérigos Tower when the city needs a single view",
    verdict: "Take the climb when you want one clear read of Porto’s scale; do not turn it into a queue-heavy obligation if the day is already built around hills and viewpoints.",
    bestFor: ["culture", "a walk", "first afternoon"],
    durationMinutes: 60,
    bestTime: "Early or late in the day",
    avoidWhen: "You are already fatigued by steep streets or only have a short weather window.",
    bookingNeed: "consider",
    pairWith: ["Ribeira and Miragaia at walking pace"],
    alternativeId: "porto-ribeira-slow-walk",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73736"
  },
  {
    id: "porto-se-cloisters",
    placeId: "porto-se",
    region: "porto",
    title: "Porto Cathedral and its tiled cloisters",
    verdict: "Worth the pause if you want historic detail with a river view; it is a better choice for a deliberate cultural hour than for rushing through Porto’s landmarks.",
    bestFor: ["culture", "a walk", "a rainy afternoon"],
    durationMinutes: 75,
    bestTime: "Morning before the historic core fills up",
    avoidWhen: "You want a fully step-free stop or have only enough time for the riverfront.",
    bookingNeed: "consider",
    pairWith: ["Clérigos Tower when the city needs a single view"],
    alternativeId: "porto-clerigos-climb",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73736"
  },
  {
    id: "porto-palacio-da-bolsa",
    placeId: "porto-palacio-da-bolsa",
    region: "porto",
    title: "Palácio da Bolsa for an indoor Porto hour",
    verdict: "A good cultural counterweight to Porto’s streets when you want one contained interior; choose it over another viewpoint when weather or walking fatigue is the constraint.",
    bestFor: ["culture", "a rainy afternoon", "quiet time"],
    durationMinutes: 70,
    bestTime: "Midday or a wet afternoon",
    avoidWhen: "You are only passing through Ribeira and prefer the outdoors.",
    bookingNeed: "consider",
    pairWith: ["Ribeira and Miragaia at walking pace"],
    alternativeId: "porto-ribeira-slow-walk",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73736"
  },
  {
    id: "porto-casa-da-musica",
    placeId: "porto-casa-da-musica",
    region: "porto",
    title: "Casa da Música when a programme earns the evening",
    verdict: "Make this the reason for an evening only when the programme genuinely appeals; the building is a strong modern contrast, but not a substitute for the historic core on a first short visit.",
    bestFor: ["culture", "a rainy afternoon", "an evening"],
    durationMinutes: 120,
    bestTime: "An evening with a confirmed programme",
    avoidWhen: "You are trying to cover Porto’s central streets for the first time in one short afternoon.",
    bookingNeed: "essential",
    pairWith: ["Miguel Bombarda for contemporary art and design"],
    alternativeId: "porto-bombarda-art-walk",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73736"
  },
  {
    id: "lisbon-belem-slow-pair",
    placeId: "lisbon-belem",
    region: "lisbon",
    title: "Belém: one monument and one contemporary counterpoint",
    verdict: "Belém works when you choose a small pair rather than attempting every landmark; give it time for the river edge and leave the rest for another visit.",
    bestFor: ["culture", "a walk", "something with children"],
    durationMinutes: 180,
    bestTime: "A morning with room to linger by the river",
    avoidWhen: "You are trying to fold it into a rushed Alfama day.",
    bookingNeed: "consider",
    pairWith: ["MAAT and the river edge"],
    alternativeId: "lisbon-maat-river-edge",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitlisboa.com/en/regions/belem"
  },
  {
    id: "lisbon-maat-river-edge",
    placeId: "lisbon-maat",
    region: "lisbon",
    title: "MAAT and the river edge",
    verdict: "A strong choice when contemporary art and industrial architecture are more useful to you than a checklist of monuments; confirm the current programme before building the day around it.",
    bestFor: ["culture", "a rainy afternoon", "a walk"],
    durationMinutes: 120,
    bestTime: "Late morning or late afternoon",
    avoidWhen: "You do not want to check current exhibition or opening information.",
    bookingNeed: "consider",
    pairWith: ["Belém: one monument and one contemporary counterpoint"],
    alternativeId: "lisbon-belem-slow-pair",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitlisboa.com/en/places/maat-museum-of-art-architecture-and-technology"
  },
  {
    id: "lisbon-rua-augusta-arch",
    placeId: "lisbon-rua-augusta-arch",
    region: "lisbon",
    title: "Arco da Rua Augusta for one central view",
    verdict: "Choose the arch if you want a short, memorable elevation above Baixa; it is a useful punctuation mark, not an activity that needs half a day around it.",
    bestFor: ["a walk", "culture", "first afternoon"],
    durationMinutes: 45,
    bestTime: "Clear late afternoon",
    avoidWhen: "A queue or rain makes a short viewpoint stop feel disproportionately effortful.",
    bookingNeed: "consider",
    pairWith: ["Alfama, slowly and on foot"],
    alternativeId: "lisbon-alfama-slow-walk",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitlisboa.com/en/about-turismo-lisboa/p/our-venues"
  },
  {
    id: "lisbon-gulbenkian-gardens",
    placeId: "lisbon-gulbenkian",
    region: "lisbon",
    title: "Gulbenkian gardens and campus at a slower pace",
    verdict: "A thoughtful refuge when your Lisbon day needs culture without another climb; check current museum access separately and treat the gardens as the dependable reason to go.",
    bestFor: ["quiet time", "culture", "a walk"],
    durationMinutes: 90,
    bestTime: "A calm morning or a reset between city days",
    avoidWhen: "You expect a guaranteed museum visit without checking current access.",
    bookingNeed: "consider",
    pairWith: ["MAAT and the river edge"],
    alternativeId: "lisbon-maat-river-edge",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitlisboa.com/en/places/gulbenkian-museum"
  },
  {
    id: "douro-pinhao-tiles-riverbank",
    placeId: "douro-pinhao-station",
    region: "douro",
    title: "Pinhão station tiles and a riverbank pause",
    verdict: "This is worth a focused stop when you arrive by train or boat; it gives the valley’s wine story a human scale without requiring another full tasting.",
    bestFor: ["culture", "a walk", "quiet time"],
    durationMinutes: 60,
    bestTime: "Around a daylight arrival or departure",
    avoidWhen: "You need to transfer immediately and have no time to stand by the river.",
    bookingNeed: "none",
    pairWith: ["The Douro line to Pinhão"],
    alternativeId: "douro-line-pinhao",
    weatherFit: ["sun", "rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/encontre-tipo/pinhao"
  },
  {
    id: "douro-casal-de-loivos",
    placeId: "douro-casal-de-loivos",
    region: "douro",
    title: "Casal de Loivos when the valley needs one viewpoint",
    verdict: "Choose this as one unhurried look over Pinhão rather than collecting viewpoints; it earns its place when the weather is clear and your day has a car.",
    bestFor: ["a walk", "quiet time", "a scenic journey"],
    durationMinutes: 60,
    bestTime: "Clear late afternoon",
    avoidWhen: "Low cloud, tight driving time, or an itinerary already heavy with road stops.",
    bookingNeed: "none",
    pairWith: ["One quinta and a slow valley lunch"],
    alternativeId: "douro-quinta-slow-day",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/content/douro-valley"
  },
  {
    id: "douro-museu-regua",
    placeId: "douro-museum",
    region: "douro",
    title: "Museu do Douro in Peso da Régua",
    verdict: "Pick the museum when you want context for the landscape and wine work, especially on a wet or slower day; it is more useful than another tasting when you need orientation.",
    bestFor: ["culture", "a rainy afternoon", "quiet time"],
    durationMinutes: 90,
    bestTime: "Midday or wet weather",
    avoidWhen: "You are only in Régua to make a close train connection.",
    bookingNeed: "consider",
    pairWith: ["The Douro line to Pinhão"],
    alternativeId: "douro-line-pinhao",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73744"
  },
  {
    id: "douro-river-boat-regua",
    placeId: "douro-river",
    region: "douro",
    title: "A short Douro river leg from Régua",
    verdict: "Choose one river segment when water changes how you understand the terraces; avoid treating a cruise as a compulsory add-on to an already overfull train-and-tasting day.",
    bestFor: ["a scenic journey", "quiet time", "something with children"],
    durationMinutes: 120,
    bestTime: "Daylight with confirmed departure details",
    avoidWhen: "The schedule forces you to rush a connection or leave no time on land.",
    bookingNeed: "essential",
    pairWith: ["Museu do Douro in Peso da Régua"],
    alternativeId: "douro-museu-regua",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/content/douro-valley"
  },
  {
    id: "algarve-ponta-caves-boat",
    placeId: "algarve-ponta-da-piedade",
    region: "algarve",
    title: "Ponta da Piedade by boat when the sea is calm",
    verdict: "The caves make more sense from the water than as a long cliffside wait, but only when conditions and the operator’s current departure information support it.",
    bestFor: ["sea views", "something with children", "a scenic journey"],
    durationMinutes: 90,
    bestTime: "Calm morning or late afternoon sea",
    avoidWhen: "Wind, swell, or a rigid schedule makes the outing feel like a commitment rather than a pleasure.",
    bookingNeed: "essential",
    pairWith: ["Ponta da Piedade as a short cliffside stop"],
    alternativeId: "algarve-ponta-da-piedade",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/algarve/73807"
  },
  {
    id: "algarve-praia-da-marinha",
    placeId: "algarve-praia-da-marinha",
    region: "algarve",
    title: "Praia da Marinha as a short coastal walk",
    verdict: "Use this for a careful cliff-and-sea hour, not a packed beach afternoon; its value is the coastal form, which weather and crowding can easily flatten.",
    bestFor: ["a walk", "sea views", "first afternoon"],
    durationMinutes: 75,
    bestTime: "Early or late in stable weather",
    avoidWhen: "Peak heat, crowded access, or you need a fully relaxed swim day.",
    bookingNeed: "none",
    pairWith: ["A chosen Via Algarviana section"],
    alternativeId: "algarve-via-algarviana-section",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/algarve/73807"
  },
  {
    id: "algarve-ria-formosa",
    placeId: "algarve-ria-formosa",
    region: "algarve",
    title: "Ria Formosa for water, birds, and a quieter coast",
    verdict: "Choose this when you want a counterweight to the Algarve’s busiest beaches; it rewards a slower half-day rather than a rush between headline coastal stops.",
    bestFor: ["nature", "quiet time", "something with children"],
    durationMinutes: 180,
    bestTime: "A calm morning with tidal and transport checks",
    avoidWhen: "You want a spontaneous short visit without checking how you will reach and return from the water.",
    bookingNeed: "consider",
    pairWith: ["An Alvor beach interlude at a quieter hour"],
    alternativeId: "algarve-alvor-slow-beach",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/algarve/73807"
  },
  {
    id: "algarve-alvor-slow-beach",
    placeId: "algarve-alvor",
    region: "algarve",
    title: "An Alvor beach interlude at a quieter hour",
    verdict: "Choose Alvor when the day needs sea and space rather than another dramatic cliff stop; keep it simple and do not turn a beach reset into a transport-heavy checklist.",
    bestFor: ["quiet time", "something with children", "a walk"],
    durationMinutes: 120,
    bestTime: "Morning or the last stretch of daylight",
    avoidWhen: "You are looking for a guaranteed empty beach or only have a rushed hour between distant towns.",
    bookingNeed: "none",
    pairWith: ["Ria Formosa for water, birds, and a quieter coast"],
    alternativeId: "algarve-ria-formosa",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/algarve/73807"
  },
  {
    id: "azores-lagoa-do-fogo",
    placeId: "azores-lagoa-do-fogo",
    region: "azores",
    title: "Lagoa do Fogo only with a weather window",
    verdict: "A defining São Miguel landscape when visibility is on your side; hold it loosely in the day and change course rather than chasing a view through cloud.",
    bestFor: ["nature", "a walk", "a scenic journey"],
    durationMinutes: 180,
    bestTime: "A clear morning with a flexible backup",
    avoidWhen: "Forecasts or real conditions close the view and you have no time to adapt.",
    bookingNeed: "none",
    pairWith: ["Furnas: volcanic valley and thermal landscape"],
    alternativeId: "azores-furnas-volcanic-day",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitazores.com/en/prizes/2-maravilhas-naturais-de-portugal-sao-nos-acores"
  },
  {
    id: "azores-ponta-da-madrugada",
    placeId: "azores-ponta-da-madrugada",
    region: "azores",
    title: "Ponta da Madrugada and Ponta do Sossego at first light",
    verdict: "A rewarding eastern São Miguel detour when you are already giving the coast a morning; it is not a reason to drag a short city-based day across the island.",
    bestFor: ["nature", "quiet time", "a scenic journey"],
    durationMinutes: 120,
    bestTime: "Early daylight with clear conditions",
    avoidWhen: "You are relying on a rigid timetable or a quick return to Ponta Delgada.",
    bookingNeed: "none",
    pairWith: ["Furnas: volcanic valley and thermal landscape"],
    alternativeId: "azores-furnas-volcanic-day",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitazores.com/en/explore?category=places-to-visit&island=sao-miguel"
  },
  {
    id: "azores-vila-franca-islet",
    placeId: "azores-vila-franca-do-campo",
    region: "azores",
    title: "Vila Franca do Campo islet, only after access checks",
    verdict: "Choose the islet when current access and sea conditions make it viable; it is a specific nature day, not an interchangeable beach add-on.",
    bestFor: ["nature", "something with children", "a scenic journey"],
    durationMinutes: 210,
    bestTime: "A confirmed calm-weather window",
    avoidWhen: "You have not checked current access, timing, or sea conditions.",
    bookingNeed: "essential",
    pairWith: ["Furnas: volcanic valley and thermal landscape"],
    alternativeId: "azores-furnas-volcanic-day",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitazores.com/en/explore?category=places-to-visit&island=sao-miguel"
  },
  {
    id: "azores-porto-formoso-tea",
    placeId: "azores-porto-formoso-tea",
    region: "azores",
    title: "Porto Formoso tea factory as a north-coast pause",
    verdict: "A modest but worthwhile stop when you are already crossing São Miguel’s north coast; it works for texture and context, not as a destination that needs an entire detour.",
    bestFor: ["culture", "good food", "quiet time"],
    durationMinutes: 60,
    bestTime: "Mid-morning or a slow north-coast day",
    avoidWhen: "You are only there to force another stop into a weather-sensitive scenic drive.",
    bookingNeed: "none",
    pairWith: ["Lagoa do Fogo only with a weather window"],
    alternativeId: "azores-lagoa-do-fogo",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitazores.com/en/explore?category=places-to-visit&island=sao-miguel"
  }
];

type QueryValue = string | readonly string[] | undefined;
type ActivityIntentQuery = Record<string, QueryValue>;

function first(value: QueryValue): string | undefined {
  return typeof value === "string" ? value : value?.[0];
}

function values(value: QueryValue): readonly string[] {
  if (!value) return [];
  return typeof value === "string" ? [value] : value;
}

function nonEmpty(valuesToClean: readonly string[]): readonly string[] {
  return valuesToClean.map((value) => value.trim()).filter(Boolean);
}

function region(value: string | undefined): ActivityRegion {
  return ACTIVITY_REGIONS.includes(value as ActivityRegion)
    ? (value as ActivityRegion)
    : DEFAULT_ACTIVITY_INTENT.region;
}

export function parseActivityIntent(query: ActivityIntentQuery): ActivityIntent {
  const moods = nonEmpty(values(query.mood));
  const constraints = nonEmpty(values(query.constraint));

  return {
    region: region(first(query.region)),
    timeWindow: first(query.time)?.trim() || DEFAULT_ACTIVITY_INTENT.timeWindow,
    moods: moods.length > 0 ? moods : DEFAULT_ACTIVITY_INTENT.moods,
    group: first(query.group)?.trim() || DEFAULT_ACTIVITY_INTENT.group,
    constraints
  };
}

export function parseSavedActivityIds(query: ActivityIntentQuery): readonly string[] {
  return [...new Set(nonEmpty(values(query.saved)))];
}

function matchesIntent(activity: EditorialActivity, intent: ActivityIntent): boolean {
  if (activity.region !== intent.region) return false;
  if (intent.moods.length === 0) return true;

  const bestFor = new Set(activity.bestFor.map((value) => value.toLocaleLowerCase("en")));
  return intent.moods.some((mood) => bestFor.has(mood.toLocaleLowerCase("en")));
}

export function getReviewedActivities(
  activities: readonly EditorialActivity[],
  intent: ActivityIntent
): readonly EditorialActivity[] {
  return activities
    .filter(
      (activity) =>
        activity.editorialStatus === "reviewed" &&
        activity.verdict.trim().length > 0 &&
        matchesIntent(activity, intent)
    )
    .slice(0, 5);
}

export function activityExplorerUrl(intent: ActivityIntent, savedIds: readonly string[] = []): string {
  const query = new URLSearchParams({
    region: intent.region,
    time: intent.timeWindow
  });

  for (const mood of intent.moods) query.append("mood", mood);
  query.set("group", intent.group);
  for (const constraint of intent.constraints) query.append("constraint", constraint);
  for (const activityId of nonEmpty(savedIds)) query.append("saved", activityId);

  return `/explore?${query.toString()}`;
}

import type { GuideText } from "./index";

const fr: Record<string, GuideText> = {
  "uscis-stopped-accepting-your-photo": {
    title: "L'USCIS n'accepte plus la photo que vous fournissez",
    h1: "L'USCIS a cessé d'accepter votre photographie",
    lead:
      "Le 12 décembre 2025, l'USCIS a cessé d'accepter les photographies fournies par le demandeur : elle est désormais prise lors du rendez-vous biométrique. Cela ne concerne pas le Département d'État, et c'est cette distinction qui décide si vous avez un fichier à préparer.",
    body: [
      "L'avis est précis. Seules sont utilisées les photographies prises par l'USCIS ou par une autre entité habilitée, et une photo déjà collectée ne peut resservir que si elle date de moins de 36 mois. Quatre formulaires en exigent une nouvelle quelle que soit la date de la précédente : I-90 pour remplacer la carte verte, I-485 pour l'ajustement de statut, N-400 pour la naturalisation et N-600 pour le certificat de citoyenneté.",
      "L'erreur est facile parce que « carte verte » désigne deux voies passant par deux administrations. L'ajustement de statut depuis les États-Unis relève de l'USCIS, et il n'y a plus rien à préparer. Le visa d'immigrant demandé dans un consulat à l'étranger relève du Département d'État, et celui-là réclame toujours une photographie de vous.",
      "Tout ce que gère le Département d'État est inchangé. Le DS-160 pour un visa de non-immigrant accepte toujours un fichier de 600 × 600. Le DS-11 pour le passeport demande toujours un tirage de 2 × 2 pouces. Et la loterie des visas de diversité repose toujours sur la photo fournie par le participant : une photo non conforme continue de disqualifier la candidature.",
      "L'USCIS a donné sa raison sans détour : la souplesse de la période Covid permettait de réutiliser une photo jusqu'à dix ans même lorsque l'apparence avait nettement changé, et cela a duré plus longtemps que nécessaire.",
    ],
    takeaway:
      "Formulaire USCIS : on vous photographie sur place, ne préparez rien. Formulaire du Département d'État — DS-160, DS-11, loterie DV : préparez la photo comme avant.",
  },
};

export default fr;

import type { GuideText } from "./index";

const pt: Record<string, GuideText> = {
  "uscis-stopped-accepting-your-photo": {
    title: "O USCIS não aceita mais a foto enviada por você",
    h1: "O USCIS parou de aceitar a sua fotografia",
    lead:
      "Em 12 de dezembro de 2025 o USCIS deixou de aceitar fotografias enviadas pelo requerente — a foto passa a ser tirada na entrevista de biometria. Isso não vale para o Departamento de Estado, e é essa diferença que decide se você precisa preparar um arquivo.",
    body: [
      "O comunicado é específico. Só são usadas fotografias colhidas pelo USCIS ou por outra entidade autorizada, e uma anterior só serve se tiver sido tirada nos últimos 36 meses. Quatro formulários exigem uma nova, não importa quando você foi fotografado pela última vez: I-90 para substituir o green card, I-485 para ajuste de status, N-400 para naturalização e N-600 para certificado de cidadania.",
      "Errar é fácil porque \"green card\" nomeia dois caminhos por dois órgãos diferentes. O ajuste de status dentro dos Estados Unidos é USCIS, e aí não há mais nada a preparar. O visto de imigrante solicitado em um consulado no exterior é Departamento de Estado, e esse continua pedindo uma fotografia sua.",
      "Tudo o que o Departamento de Estado toca continua igual. O DS-160 do visto de não imigrante ainda aceita um arquivo de 600 × 600. O DS-11 do passaporte ainda pede uma impressa de 2 × 2 polegadas. E a loteria de vistos de diversidade continua usando a foto que o próprio inscrito envia — uma fora das regras continua desclassificando a inscrição.",
      "O USCIS deu a razão sem rodeios: a flexibilidade da pandemia permitia reaproveitar uma foto por até dez anos mesmo quando a aparência da pessoa havia mudado bastante, e isso ficou de pé por mais tempo do que precisava.",
    ],
    takeaway:
      "Formulário do USCIS: fotografam você lá, não prepare nada. Formulário do Departamento de Estado — DS-160, DS-11, loteria DV: prepare a fotografia como antes.",
  },
};

export default pt;

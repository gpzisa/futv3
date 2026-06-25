// 0. Internationalization (i18n) Setup
let currentLang = localStorage.getItem("rumo_estrelato_lang") || "pt";

function translate(key, defaultVal = "") {
    if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][key] !== undefined) {
        return translations[currentLang][key];
    }
    if (typeof translations !== 'undefined' && translations["pt"] && translations["pt"][key] !== undefined) {
        return translations["pt"][key];
    }
    return defaultVal || key;
}

function translateTerm(category, term) {
    if (typeof translatedTerms !== 'undefined' && translatedTerms[category] && translatedTerms[category][term]) {
        const mapping = translatedTerms[category][term];
        return mapping[currentLang] || mapping["pt"] || term;
    }
    return term;
}

function getTranslatedHeightValue(heightStr) {
    if (!heightStr) return "";
    if (currentLang === "en" || currentLang === "ja" || currentLang === "zh") {
        return heightStr.replace(",", ".");
    }
    return heightStr;
}

function getTranslatedAgeValue(ageStr) {
    if (!ageStr) return "";
    const match = ageStr.match(/^(\d+)\s*(anos|ano)?$/i);
    if (!match) return ageStr;
    const num = match[1];
    if (currentLang === "en") {
        return `${num} years old`;
    } else if (currentLang === "es") {
        return `${num} años`;
    } else if (currentLang === "ja") {
        return `${num}歳`;
    } else if (currentLang === "zh") {
        return `${num}岁`;
    } else {
        return `${num} anos`;
    }
}

function getTranslatedAttributeValue(attrStr) {
    if (!attrStr) return "";
    const match = attrStr.match(/^(\d+\/10)\s+-\s+(.*?)\s*\((.*?)\)$/);
    if (!match) {
        const simpleMatch = attrStr.match(/^(\d+\/10)\s+-\s+(.*?)$/);
        if (simpleMatch) {
            const score = simpleMatch[1];
            const desc = simpleMatch[2];
            const transDesc = translateTerm("attributes", desc);
            return `${score} - ${transDesc}`;
        }
        return attrStr;
    }
    const score = match[1];
    const desc = match[2];
    const rarity = match[3];
    const transDesc = translateTerm("attributes", desc);
    const transRarity = translateTerm("rarities", rarity);
    return `${score} - ${transDesc} (${transRarity})`;
}

function getTranslatedSeasonsValue(seasonsStr) {
    if (!seasonsStr) return "";
    const match = seasonsStr.match(/^(\d+)\s*(temporadas|temporada)?$/i);
    if (!match) return seasonsStr;
    const num = parseInt(match[1], 10);
    if (currentLang === "en") {
        return num === 1 ? "1 season" : `${num} seasons`;
    } else if (currentLang === "es") {
        return num === 1 ? "1 temporada" : `${num} temporadas`;
    } else if (currentLang === "ja") {
        return `${num}シーズン`;
    } else if (currentLang === "zh") {
        return `${num}个赛季`;
    } else {
        return num === 1 ? "1 temporada" : `${num} temporadas`;
    }
}

function getTranslatedClubsValue(clubsStr) {
    if (!clubsStr) return "";
    const match = clubsStr.match(/^(\d+)\s*(clubes|clube)?$/i);
    if (!match) return clubsStr;
    const num = parseInt(match[1], 10);
    if (currentLang === "en") {
        return num === 1 ? "1 club" : `${num} clubs`;
    } else if (currentLang === "es") {
        return num === 1 ? "1 club" : `${num} clubes`;
    } else if (currentLang === "ja") {
        return `${num}クラブ`;
    } else if (currentLang === "zh") {
        return `${num}家俱乐部`;
    } else {
        return num === 1 ? "1 clube" : `${num} clubes`;
    }
}

function getTranslatedValue(boxId, rawValue) {
    if (!rawValue) return "";
    switch (boxId) {
        case "box-continent":
            return translateTerm("continents", rawValue);
        case "box-country":
            return translateTerm("countries", rawValue);
        case "box-height":
            return getTranslatedHeightValue(rawValue);
        case "box-age":
            return getTranslatedAgeValue(rawValue);
        case "box-position":
            return translateTerm("positions", rawValue);
        case "box-speed":
        case "box-finishing":
        case "box-dribbling":
        case "box-passing":
        case "box-strength":
        case "box-defending":
            return getTranslatedAttributeValue(rawValue);
        case "box-seasons":
            return getTranslatedSeasonsValue(rawValue);
        case "box-clubs":
            return getTranslatedClubsValue(rawValue);
        default:
            return rawValue;
    }
}

function updateResultBoxValueOnly(boxId, rawValue) {
    const box = document.getElementById(boxId);
    if (!box || !box.classList.contains("completed")) return;
    
    const valueEl = box.querySelector(".box-value");
    if (!valueEl) return;
    
    const translatedValue = getTranslatedValue(boxId, rawValue);
    valueEl.innerText = translatedValue;
    
    // Sincronização com o painel móvel de progresso rápido
    const boxToMobileMap = {
        "box-continent": { id: "m-box-origin" },
        "box-country": { id: "m-box-origin" },
        "box-height": { id: "m-box-height" },
        "box-age": { id: "m-box-age" },
        "box-position": { id: "m-box-position" },
        "box-speed": { id: "m-box-speed" },
        "box-finishing": { id: "m-box-finishing" },
        "box-dribbling": { id: "m-box-dribbling" },
        "box-passing": { id: "m-box-passing" },
        "box-strength": { id: "m-box-strength" },
        "box-defending": { id: "m-box-defending" },
        "box-seasons": { id: "m-box-seasons" },
        "box-clubs": { id: "m-box-clubs" }
    };
    
    const mobileMap = boxToMobileMap[boxId];
    if (mobileMap) {
        const mCard = document.getElementById(mobileMap.id);
        if (mCard && mCard.classList.contains("completed")) {
            const mVal = mCard.querySelector(".m-stat-val");
            if (mVal) {
                if (boxId === "box-continent") {
                    if (!(typeof selectedCountry !== 'undefined' && selectedCountry)) {
                        mVal.innerText = translatedValue;
                    }
                } else if (boxId === "box-country") {
                    const flag = getCountryFlag(rawValue);
                    mVal.innerText = `${flag} ${translatedValue}`;
                } else if (["box-speed", "box-finishing", "box-dribbling", "box-passing", "box-strength", "box-defending"].includes(boxId)) {
                    mVal.innerText = translatedValue.split("/")[0];
                } else {
                    mVal.innerText = translatedValue;
                }
            }
        }
    }
}

function getTranslatedRetirementReasonName(reasonName) {
    const names = {
        "Dores Crônicas 🤕": {
            pt: "Dores Crônicas 🤕",
            en: "Chronic Pain 🤕",
            es: "Dolores Crónicos 🤕",
            ja: "慢性的な痛み 🤕",
            zh: "慢性伤病 🤕"
        },
        "Lesão Grave 🏥": {
            pt: "Lesão Grave 🏥",
            en: "Severe Injury 🏥",
            es: "Lesión Grave 🏥",
            ja: "深刻な怪我 🏥",
            zh: "严重伤病 🏥"
        },
        "Escolha Própria 🚶‍♂️": {
            pt: "Escolha Própria 🚶‍♂️",
            en: "Personal Choice 🚶‍♂️",
            es: "Elección Propia 🚶‍♂️",
            ja: "自発的引退 🚶‍♂️",
            zh: "个人选择 🚶‍♂️"
        },
        "Idade Avançada 👴": {
            pt: "Idade Avançada 👴",
            en: "Advanced Age 👴",
            es: "Edad Avanzada 👴",
            ja: "高齢 👴",
            zh: "高龄 👴"
        },
        "Desejo de ser Treinador 📋": {
            pt: "Desejo de ser Treinador 📋",
            en: "Desire to Coach 📋",
            es: "Deseo de ser Entrenador 📋",
            ja: "指導者の志 📋",
            zh: "转型教练的志向 📋"
        },
        "Desgaste Mental 🧠": {
            pt: "Desgaste Mental 🧠",
            en: "Mental Exhaustion 🧠",
            es: "Desgaste Mental 🧠",
            ja: "精神的疲労 🧠",
            zh: "精神疲惫 🧠"
        }
    };
    if (names[reasonName]) {
        return names[reasonName][currentLang] || names[reasonName]["pt"];
    }
    return reasonName;
}

// 1. Data Configurations
const continents = [
    {
        name: "África",
        gradient: ["#40252a", "#201012"],
        description: "O berço da humanidade. Um continente rico em história ancestral, paisagens majestosas, fauna exuberante e uma diversidade cultural vibrante.",
        color: "#fda4af"
    },
    {
        name: "América do Norte",
        gradient: ["#203248", "#0e1a26"],
        description: "Uma terra de contrastes gigantescos, abrigando metrópoles vibrantes que moldam a tecnologia global, além de desertos e tundras geladas.",
        color: "#93c5fd"
    },
    {
        name: "América do Sul",
        gradient: ["#203a28", "#0d1f14"],
        description: "O berço da biodiversidade e da Floresta Amazônica. Um lugar repleto de ritmos calorosos, paixão pelo esporte e belezas naturais sem fim.",
        color: "#86efac"
    },
    {
        name: "Ásia",
        gradient: ["#432634", "#211018"],
        description: "O maior e mais populoso continente do planeta. Um encontro espetacular de filosofias milenares, megacidades futuristas e paisagens sagradas.",
        color: "#f472b6"
    },
    {
        name: "Europa",
        gradient: ["#302248", "#170e26"],
        description: "O coração da história ocidental. Repleta de castelos medievais, museus de renome mundial, culinária sofisticada e vilas charmosas.",
        color: "#c084fc"
    },
    {
        name: "Oceania",
        gradient: ["#203d48", "#0e2128"],
        description: "Um paraíso insular composto por milhares de ilhas tropicais, praias de areia branca, a Grande Barreira de Corais e criaturas únicas no mundo.",
        color: "#7dd3fc"
    }
];

// Country birth weights (based on real annual births in millions)
const countryData = {
    "África": [
        { name: "Nigéria", weight: 7.5, desc: "o gigante africano, conhecido por sua energia vibrante, mercado de Nollywood e riqueza cultural de mais de 250 grupos étnicos" },
        { name: "Etiópia", weight: 3.5, desc: "uma das nações independentes mais antigas da Terra, com paisagens montanhosas imponentes e rica tradição de café" },
        { name: "Egito", weight: 2.2, desc: "a terra dos faraós, dona de pirâmides monumentais milenares, templos sagrados e cortada pelo histórico Rio Nilo" },
        { name: "R.D. Congo", weight: 3.2, desc: "o coração verde do continente, com a segunda maior floresta tropical do planeta e uma enorme diversidade de vida selvagem" },
        { name: "África do Sul", weight: 1.0, desc: "a nação arco-íris, dona de uma incrível diversidade cultural, praias de surfe espetaculares e reservas de safári ricas em fauna" },
        { name: "Quênia", weight: 1.4, desc: "famoso por seus safáris na savana do Masai Mara, vales do Rift deslumbrantes e atletas de corrida que dominam o cenário mundial" }
    ],
    "América do Norte": [
        { name: "Estados Unidos", weight: 3.7, desc: "uma potência globalmente influente, repleta de metrópoles icônicas, parks nacionais colossais e mistura de culturas do mundo inteiro" },
        { name: "México", weight: 1.9, desc: "lar de ruínas maias e astecas misteriosas, praias caribenhas ensolaradas e uma gastronomia celebrada internacionalmente" },
        { name: "Canadá", weight: 0.35, desc: "uma nação acolhedora e pacífica, mundialmente conhecida por suas montanhas nevadas, florestas de pinheiros e lagos azul-turquesa" },
        { name: "Guatemala", weight: 0.4, desc: "o epicentro cultural do mundo maia moderno, caracterizado por vulcões ativos impressionantes e mercados indígenas cheios de cores" },
        { name: "Cuba", weight: 0.1, desc: "uma ilha caribenha cativante e histórica, famosa por seus carros clássicos preservados, música salsa pulsante e praias tropicais" }
    ],
    "América do Sul": [
        { name: "Brasil", weight: 2.6, desc: "a maior e mais alegre nação sul-americana, famosa mundialmente pelo carnaval exuberante, Floresta Amazônica e praias belíssimas" },
        { name: "Colômbia", weight: 0.6, desc: "famosa pela produção do melhor café suave do mundo, rica biodiversidade andina e cidades modernas adornadas com arte" },
        { name: "Argentina", weight: 0.5, desc: "a terra do tango apaixonante, dos churrascos espetaculares, da imensa Patagônia gelada e de uma paixão fervorosa pelo futebol" },
        { name: "Peru", weight: 0.45, desc: "berço do Império Inca e da misteriosa cidade sagrada de Machu Picchu nas alturas dos Andes, além de culinária aclamada" },
        { name: "Venezuela", weight: 0.35, desc: "dona de belezas naturais intocadas incríveis, incluindo o Salto Ángel, a queda d'água mais alta do mundo na floresta tropical" },
        { name: "Chile", weight: 0.2, desc: "um país estreito e fascinante, estendendo-se desde as areias áridas do Deserto do Atacama até as geleiras austrais da Patagônia" }
    ],
    "Ásia": [
        { name: "Índia", weight: 23.0, desc: "uma explosão inesquecível de cores, espiritualidade profunda, festivais tradicionalistas, temperos aromáticos e o icônico Taj Mahal" },
        { name: "China", weight: 9.0, desc: "uma das civilizações contínuas mais antigas do mundo, unindo a histórica Grande Muralha a arranha-céus futuristas" },
        { name: "Indonésia", weight: 4.4, desc: "um vasto arquipélago formado por mais de 17.000 ilhas vulcânicas, florestas tropicais densas e praias exóticas de Bali" },
        { name: "Paquistão", weight: 6.2, desc: "terra de montanhas colossais da cordilheira do Himalaia e K2, rica herança de hospitalidade e vales férteis antigos" },
        { name: "Bangladesh", weight: 3.0, desc: "uma planície verdejante cortada por rios colossais, famosa pela produção de tecidos e por abrigar o tigre de bengala" },
        { name: "Japão", weight: 0.8, desc: "onde a disciplina histórica dos samurais e templos budistas milenares se integra ao neon de Tóquio, animes e alta tecnologia" },
        { name: "Filipinas", weight: 2.2, desc: "um refúgio paradisíaco de milhares de ilhas tropicais com lagoas escondidas, terraços de arroz antigos e povo acolhedor" },
        { name: "Arábia Saudita", weight: 0.8, desc: "uma nação desértica de rica história e herança islâmica sagrada, famosa por suas mesquitas grandiosas, dunas douradas e modernização futurista" }
    ],
    "Europa": [
        { name: "Rússia", weight: 1.3, desc: "o maior país do planeta em área territorial, com contribuições marcantes na literatura, arquitetura de cúpulas e exploração espacial" },
        { name: "Alemanha", weight: 0.75, desc: "potência tecnológica europeia, famosa por suas florestas densas, castelos medievais de contos de fadas e ricas tradições" },
        { name: "Reino Unido", weight: 0.7, desc: "uma ilha com história rica em realeza, castelos imponentes, paisagens campestres verdes e influência na música pop mundial" },
        { name: "França", weight: 0.7, desc: "a capital do romance, da alta moda, de cafés charmosos nas ruas de Paris, culinária fina e museus lendários como o Louvre" },
        { name: "Itália", weight: 0.4, desc: "berço do Império Romano e do Renascimento artístico, renomada por sua culinária caseira, canais de Veneza e ruínas históricas" },
        { name: "Espanha", weight: 0.35, desc: "um país ensolarado repleto de energia festiva, arquiteturas fantásticas como as de Gaudí, praias incríveis e tapas saborosas" },
        { name: "Ucrânia", weight: 0.3, desc: "uma terra de vastas planícies agrícolas douradas, rica cultura eslava, catedrais antigas de cúpulas douradas e arte folclórica" }
    ],
    "Oceania": [
        { name: "Austrália", weight: 0.3, desc: "uma ilha-continente com fauna exótica única no mundo, praias perfeitas para surfe, o grande deserto Outback e recifes de corais" },
        { name: "Papua Nova Guiné", weight: 0.25, desc: "um dos países de maior diversidade linguística do planeta, repleto de tribos isoladas e cadeias montanhosas densamente florestadas" },
        { name: "Nova Zelândia", weight: 0.06, desc: "famosa por suas paisagens vulcânicas de tirar o fôlego, fiordes glaciais majestosos, cultura tradicional Maori e aventuras extremas" },
        { name: "Fiji", weight: 0.02, desc: "um arquipélago idílico com recifes de corais coloridos exuberantes, águas cristalinas mornas e uma hospitalidade local lendária" }
    ]
};

const footballPositions = [
    { name: "Goleiro", desc: "o guardião das traves. O último bastião de defesa, responsável por defesas elásticas impressionantes e por liderar a zaga de trás" },
    { name: "Zagueiro", desc: "a rocha defensiva. Um defensor físico e tático imbatível nos combates terrestres e no jogo aéreo, protegendo a área a todo custo" },
    { name: "Lateral Esquerdo", desc: "o motor do flanco esquerdo. Veloz e disciplinado, apoia o ataque com cruzamentos precisos na área e retorna rapidamente para defender" },
    { name: "Lateral Direito", desc: "o motor do flanco direito. Domina a ala direita com arrancadas explosivas, cruzamentos na linha de fundo e combate na marcação direta" },
    { name: "Volante", desc: "o cão de guarda da intermediária. Destrói o jogo ofensivo do adversário com desarmes precisos e organiza a saída de bola da defesa" },
    { name: "Meio-Campo", desc: "o arquiteto do jogo. Controla o ritmo da partida, distribui passes curtos e longos e dita a transição precisa entre defesa e ataque" },
    { name: "Meia-Armador", desc: "o gênio criativo do time. O camisa 10 clássico que enxerga jogadas onde ninguém mais vê, com dribles curtos e passes açucarados" },
    { name: "Ponta Esquerda", desc: "o ponta insinuante. Dono de dribles velozes e cortes diagonais para dentro da área, buscando sempre a finalização ao gol adversário" },
    { name: "Ponta Direita", desc: "o ponta de velocidade. Explora o corredor direito da área com velocidade absurda, buscando infiltrações ou assistências para o centro da área" },
    { name: "Centroavante", desc: "o finalizador implacável. O camisa 9 clássico, oportunista na área, fisicamente forte e letal em qualquer bola aérea ou rebote" }
];

const proAges = [
    { name: "16 anos", desc: "um jovem prodígio absoluto, estreando no time profissional ainda adolescente e quebrando recordes históricos de precocidade" },
    { name: "17 anos", desc: "uma revelação brilhante, conquistando a titularidade no elenco de cima com técnica refinada e maturidade precoce" },
    { name: "18 anos", desc: "o momento ideal de transição, assinando o primeiro contrato profissional assim que atingiu a maioridade oficial" },
    { name: "19 anos", desc: "um talento lapidado na persistência, subindo da base após se destacar intensamente nos torneios nacionais de juniores" },
    { name: "20 anos", desc: "um jogador de evolução consistente, superando a grande concorrência da base com muito esforço e solidez técnica" },
    { name: "21 anos", desc: "um atleta pronto e muito amadurecido, completando todo o ciclo de base para estrear com grande força física e mental" }
];

// Discrete Heights
const heights = [
    { name: "1,55 m", desc: "um centro de gravidade baixíssimo e equilíbrio corporal perfeito, tornando você um verdadeiro pesadelo para os defensores devido à sua agilidade absurda em espaços confinados" },
    { name: "1,60 m", desc: "um drible curto desconcertante e velocidade de reação fantástica, permitindo que você acelere instantaneamente e escape da marcação em frações de segundo" },
    { name: "1,65 m", desc: "a agilidade clássica e fluidez de movimento típica dos armadores mais criativos, facilitando mudanças rápidas de direção sem perder o controle da bola" },
    { name: "1,70 m", desc: "a estatura de lendas clássicas do futebol, oferecendo um balanço perfeito entre agilidade, arrancada explosiva e controle preciso em velocidade sob pressão" },
    { name: "1,75 m", desc: "uma estatura extremamente equilibrada e versátil, concedendo flexibilidade tática para competir tanto na velocidade quanto no vigor físico em qualquer faixa do gramado" },
    { name: "1,80 m", desc: "um porte físico moderno de muita força e dinamismo, ideal para sustentar combates físicos sem perder a agilidade e a facilidade de condução de bola" },
    { name: "1,85 m", desc: "uma estatura imponente que combina passadas largas e elegantes com excelente vigor, ideal para cobrir grandes áreas do campo com facilidade" },
    { name: "1,90 m", desc: "uma presença física dominante com grande impulsão e força, ideal para ditar o ritmo no combate corpo a corpo e dominar o jogo aéreo na defesa ou no ataque" },
    { name: "1,95 m", desc: "uma torre colossal de alcance de passada gigantesco, oferecendo uma vantagem aérea incontestável e intimidando qualquer defensor nas jogadas de bola parada" },
    { name: "2,00 m", desc: "um verdadeiro gigante dos gramados, operando como um paredão intransponível que impõe uma superioridade física e aérea inigualável contra qualquer adversário" }
];

// Master 10-level Attribute Tiers (1 to 10)
const attributeTiers = [
    { name: "1/10 - Extremamente Ruim", weight: 4.0, rarity: "Comum", color: "#1e293b", desc: "um nível bastante instável e de iniciante, exigindo muita superação e treinos diários para aprimoramento" },
    { name: "2/10 - Muito Ruim", weight: 6.0, rarity: "Comum", color: "#273549", desc: "uma aptidão modesta em campo, necessitando de inteligência tática compensatória para suprir a deficiência técnica" },
    { name: "3/10 - Ruim", weight: 8.0, rarity: "Incomum", color: "#143d25", desc: "uma qualidade ligeiramente abaixo da média, exigindo posicionamento inteligente e esforço dobrado nos combates" },
    { name: "4/10 - Mediano", weight: 18.0, rarity: "Incomum", color: "#14404c", desc: "um rendimento estável e seguro, executando as tarefas táticas básicas com tranquilidade e sem riscos" },
    { name: "5/10 - Bom", weight: 20.0, rarity: "Mediano", color: "#142d4c", desc: "uma qualidade de destaque na liga, servindo de forma sólida nos passes e dando boa fluidez ao jogo" },
    { name: "6/10 - Muito Bom", weight: 15.0, rarity: "Raro", color: "#2d144c", desc: "um futebol técnico diferenciado, superando a maioria dos marcadores da liga com arrancadas inteligentes" },
    { name: "7/10 - Excelente", weight: 10.0, rarity: "Épico", color: "#3b0764", desc: "uma habilidade técnica brilhante e decisiva, quebrando linhas defensivas e gerando chances reais de gols" },
    { name: "8/10 - Classe Mundial", weight: 5.0, rarity: "Lendário", color: "#4c2d14", desc: "um talento cobiçado pelos maiores clubes do planeta, dominando partidas de alta pressão internacional" },
    { name: "9/10 - Lendário", weight: 3.0, rarity: "Mítico", color: "#4c141d", desc: "uma maestria mágica incomparável na história da liga, arrancando aplausos de pé até mesmo da torcida adversária" },
    { name: "10/10 - Rank GOAT", weight: 1.5, rarity: "Divino", color: "#4d1a3a", desc: "o topo absoluto da história do esporte mundial, comparável apenas às maiores lendas de todos os tempos" }
];

// Discrete Seasons played (10 to 20 seasons)
const proSeasons = [
    { name: "10 temporadas", weight: 3, desc: "uma década inteira de profissionalismo intenso, mantendo foco tático máximo em alto nível" },
    { name: "11 temporadas", weight: 4, desc: "onze anos de resiliência e regularidade, provando seu valor em diversas campanhas nacionais" },
    { name: "12 temporadas", weight: 6, desc: "uma jornada equilibrada e duradoura de doze anos com grandes memórias registradas nos gramados" },
    { name: "13 temporadas", weight: 8, desc: "treze anos de dedicação ininterrupta, superando desafios físicos com consistência exemplar" },
    { name: "14 temporadas", weight: 12, desc: "uma excelente longevidade de quatorze anos, servindo de ponto de referência nos elencos por onde passou" },
    { name: "15 temporadas", weight: 25, desc: "uma belíssima marca de quinze anos, atingindo o patamar de veterano altamente respeitado nas ligas" },
    { name: "16 temporadas", weight: 25, desc: "dezesseis anos de carreira consagrada, moldando e ensinando as novas gerações com muita liderança" },
    { name: "17 temporadas", weight: 20, desc: "dezessete anos de história nos gramados, empilhando conquistas e atravessando gerações de atletas" },
    { name: "18 temporadas", weight: 15, desc: "dezoito anos de longevidade excepcional, tornando-se um verdadeiro ícone duradouro e respeitado por todos" },
    { name: "19 temporadas", weight: 10, desc: "dezenove anos de profissionalismo exemplar, quebrando recordes de persistência e regularidade física" },
    { name: "20 temporadas", weight: 8, desc: "vinte anos de carreira lendária, um feito monumental de longevidade de elite reservado apenas aos gigantes imortais do esporte" }
];

// Career Clubs
const proClubs = [
    { name: "1 clube", desc: "lealdade total à camisa. Um lendário 'One-Club Man', dedicando toda a sua vida profissional e honra a um único escudo histórico" },
    { name: "2 clubes", desc: "uma carreira focada e estável, construindo identificação profunda em apenas duas camisas pesadas ao longo dos anos" },
    { name: "3 clubes", desc: "uma trajetória equilibrada e madura, conquistando títulos e amadurecendo através de três equipes tradicionais" },
    { name: "4 clubes", desc: "uma carreira dinâmica e rica em cenários, colecionando experiências e grandes amizades em quatro vestiários diferentes" },
    { name: "5 clubes", desc: "um jogador rodado e respeitado por onde passa, espalhando liderança tática e conquistas por cinco escudos diferentes" },
    { name: "6 clubes", desc: "um autêntico nômade dos gramados, acumulando histórias fascinantes e bagagem de vestiário por seis camisas diferentes do futebol" }
];

// Leagues
const leagues = [
    { name: "🇧🇷 Brasileirão (BRA)", color: "#143d25" },
    { name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (ING)", color: "#142d4c" },
    { name: "🇪🇸 La Liga (ESP)", color: "#4c141d" },
    { name: "🇮🇹 Serie A (ITA)", color: "#2d144c" },
    { name: "🇩🇪 Bundesliga (ALE)", color: "#4c2d14" },
    { name: "🇫🇷 Ligue 1 (FRA)", color: "#14404c" },
    { name: "🇺🇸 MLS (EUA)", color: "#144c3d" },
    { name: "🇯🇵 J1 League (JPN)", color: "#3a0c23" },
    { name: "🇦🇷 Liga Profesional (ARG)", color: "#0c303a" },
    { name: "🇲🇽 Liga MX (MEX)", color: "#132d1f" },
    { name: "🇷🇺 Premier League (RUS)", color: "#212121" },
    { name: "🇸🇦 Saudi Pro League (SAU)", color: "#0e4d26" }
];

// League Team Database
const teamDatabase = {
    "🇧🇷 Brasileirão (BRA)": [
        { name: "Flamengo", desc: "o clube de maior torcida do país, jogando no icônico Maracanã sob uma atmosfera de pressão e paixão absurdas" },
        { name: "Palmeiras", desc: "um dos times mais vencedores da era moderna, caracterizado por sua disciplina tática de ferro e consistência competitiva" },
        { name: "São Paulo", desc: "soberano com três títulos mundiais, conhecido por sua rica história internacional e base reveladora de craques" },
        { name: "Corinthians", desc: "dono de uma torcida de fiéis apaixonados de massa, caracterizado pela garra histórica e superação dentro de campo" },
        { name: "Grêmio", desc: "o imortal tricolor do sul do país, conhecido pela raça copera tradicional e por conquistas marcantes na Copa Libertadores" },
        { name: "Atlético Mineiro", desc: "o galo forte e vingador, empurrado por uma torcida incrivelmente fanática em sua moderna e barulhenta arena" },
        { name: "Fluminense", desc: "o tricolor das laranjeiras, famoso por seu futebol de toque refinado, história grandiosa e por revelar talentos de classe mundial" },
        { name: "Botafogo", desc: "a estrela solitária tradicionalíssima do Rio, marcada por lendas históricas e por ressurgir com enorme força no cenário nacional" },
        { name: "Vasco da Gama", desc: "o gigante da colina com uma bela história de luta social pioneira, empurrado por uma torcida incrivelmente leal em São Januário" },
        { name: "Cruzeiro", desc: "a prestigiada raposa de Minas Gerais, dona de uma das histórias mais copeiras e vencedoras do futebol nacional e continental" },
        { name: "Internacional", desc: "o colorado gaúcho campeão do mundo, que manda seus jogos no belíssimo Beira-Rio com enorme vibração e raça histórica" },
        { name: "Santos", desc: "o lendário peixe da Vila Belmiro, santuário do Rei Pelé e berço inesgotável de 'Meninos da Vila' que encantam o planeta" },
        { name: "Athletico Paranaense", desc: "o furacão do Paraná, amplamente conhecido por sua gestão moderna, caldeirão acústico e força extrema em copas" },
        { name: "Bahia", desc: "o esquadrão de aço, primeiro campeão nacional, empurrado por uma das torcidas mais calorosas e festivas do nordeste" },
        { name: "Fortaleza", desc: "o leão do pici, caracterizado por uma ascensão meteórica espetacular, festas de mosaicos gigantes e organização exemplar" },
        { name: "Red Bull Bragantino", desc: "o dinâmico projeto do interior paulista, focado na captação de jovens promessas e em um futebol moderno de alta intensidade" },
        { name: "Cuiabá", desc: "o dourado do Centro-Oeste, representando com muito orgulho o Pantanal na elite nacional em uma moderna arena de Copa do Mundo" },
        { name: "Vitória", desc: "o tradicional leão da barra de Salvador, famoso por sua base reveladora e pela atmosfera de caldeirão do Barradão" },
        { name: "Criciúma", desc: "o tigre de Santa Catarina, dono de uma torcida apaixonada e de uma história de títulos expressivos no sul do país" },
        { name: "Juventude", desc: "o tradicional papo da serra gaúcha, conhecido por jogos históricos sob neblina no Alfredo Jaconi e enorme espírito competitivo" }
    ],
    "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (ING)": [
        { name: "Manchester City", desc: "a máquina de futebol ultra-tático dominante da Inglaterra, famosa pelo controle de jogo espetacular e inovação coletiva" },
        { name: "Arsenal", desc: "os Gunners de Londres, conhecidos por sua rica tradição de futebol ofensivo vistoso, jovens talentos e história emblemática" },
        { name: "Liverpool", desc: "gigante de Anfield, famoso pela atmosfera mística da torcida cantando 'You'll Never Walk Alone' e pressão defensiva sufocante" },
        { name: "Manchester United", desc: "os Diabos Vermelhos de Old Trafford, um dos clubes mais tradicionais do mundo com um legado gigantesco de craques lendários" },
        { name: "Chelsea", desc: "potência de Londres multicampeã europeia, famosa por campanhas épicas de superação e elencos altamente competitivos" },
        { name: "Tottenham", desc: "os Spurs de Londres, donos de uma arena futurista espetacular e adeptos de um futebol de alta intensidade e transição rápida" },
        { name: "Aston Villa", desc: "clube histórico de Birmingham com título europeu no currículo, empurrado pelo barulhento Villa Park em noites de gala" },
        { name: "Newcastle United", desc: "os Magpies, apoiados por uma das torcidas mais fiéis do norte inglês sob a atmosfera ensurdecedora do St. James' Park" },
        { name: "West Ham United", desc: "os Hammers do leste de Londres, famosos pela tradicional canção das bolhas de sabão e por sua academia reveladora" },
        { name: "Brighton & Hove Albion", desc: "modelo de gestão inteligente na costa sul, praticando um futebol moderno de posse de bola e recrutamento genial" },
        { name: "Wolverhampton Wanderers", desc: "os Wolves, caracterizados por uma marcação agressiva, muita velocidade de contra-ataque e elenco competitivo" },
        { name: "Crystal Palace", desc: "os Eagles de Londres, conhecidos por sua torcida ultra-ativa e calorosa no clássico e intimista Selhurst Park" },
        { name: "Fulham", desc: "o clube mais antigo de Londres, mandando seus jogos no histórico Craven Cottage às margens do Rio Tâmisa" },
        { name: "Everton", desc: "os Toffees de Liverpool, um dos fundadores do futebol inglês, donos de uma rica história de garra e tradição na elite" },
        { name: "Brentford", desc: "os Bees, conhecidos por sua abordagem científica baseada em dados e estatísticas para competir em altíssimo nível na liga" },
        { name: "Nottingham Forest", desc: "bicampeão europeu histórico, empurrado pelo barulho do City Ground em noites de muita tradição e garra" },
        { name: "Bournemouth", desc: "os Cherries da costa sul, famosos por sua superação constante e futebol dinâmico sob comandos técnicos ofensivos" },
        { name: "Leicester City", desc: "os Foxes, eternizados pela maior zebra da história do esporte ao conquistarem a Premier League in 2016" },
        { name: "Ipswich Town", desc: "clube histórico do leste inglês com rica tradição europeia nos anos 80, empurrado pela fanática torcida em Portman Road" },
        { name: "Southampton", desc: "os Saints da costa sul, reconhecidos historicamente por uma das academias de base mais férteis e reveladoras da Inglaterra" }
    ],
    "🇪🇸 La Liga (ESP)": [
        { name: "Real Madrid", desc: "os reis absolutos da Europa, donos de uma dinastia incomparável de títulos continentais e da mística de contratar superestrelas galácticas" },
        { name: "Barcelona", desc: "lar do estilo 'tiki-taka' de posse de bola refinada e da lendária academia La Masia, jogando futebol como uma verdadeira obra de arte" },
        { name: "Atlético de Madrid", desc: "os colchoneros caracterizados pela garra defensiva indomável e apoio ensurdecedor de sua fiel torcida na capital espanhola" },
        { name: "Real Sociedad", desc: "clube basco tradicionalista, conhecido por praticar um futebol ofensivo de excelência e valorizar as categorias de base locais" },
        { name: "Real Betis", desc: "a vibrante equipe verde e branca de Sevilha, famosa por uma torcida apaixonante e jogos cheios de drama e emoção" },
        { name: "Sevilla", desc: "os reis absolutos da UEFA Europa League, conhecidos por crescerem de forma colossal e mística em finais de copas continentais" },
        { name: "Athletic Bilbao", desc: "o orgulho basco tradicional que utiliza estritamente jogadores de sua região, mantendo-se na elite com garra e identidade únicas" },
        { name: "Girona", desc: "a grande sensação da Catalunha, jogando um futebol moderno de posse de bola agressiva e transição veloz que surpreendeu a Europa" },
        { name: "Valencia", desc: "gigante histórico do Mestalla, dono de uma torcida exigente, tradição de títulos importantes e celeiro de grandes craques espanhóis" },
        { name: "Villarreal", desc: "o submarino amarelo, um clube exemplar de uma cidade pequena que conquistou a Europa com futebol organizado e técnico" },
        { name: "Osasuna", desc: "a aguerrida equipe de Pamplona, famosa pela atmosfera de caldeirão hostil de seu estádio El Sadar que intimida os adversários" },
        { name: "Getafe", desc: "clube de colisão tática nos arredores de Madrid, conhecido por sua defesa extremamente sólida e competitividade física intensa" },
        { name: "Celta de Vigo", desc: "os celestes da Galícia, conhecidos por praticar um futebol de transição rápida e revelar atacantes lendários para a liga" },
        { name: "Mallorca", desc: "equipe das belas Ilhas Baleares, jogando com muita disciplina defensiva e contra-ataques rápidos que surpreendem os gigantes" },
        { name: "Rayo Vallecano", desc: "o clube da classe operária de Vallecas, em Madrid, famoso pelo engajamento social de sua torcida e pressão em campo curto" },
        { name: "Las Palmas", desc: "equipe das Ilhas Canárias, tradicionalmente adepta de um futebol de toque de bola envolvente, habilidade e criatividade técnica" },
        { name: "Alavés", desc: "os babazorros do País Basco, caracterizados pela dedicação coletiva, forte jogo aéreo e muita entrega física nos duelos" },
        { name: "Leganés", desc: "equipe de superação constante da região metropolitana de Madrid, empurrada por uma torcida familiar alegre e guerreira" },
        { name: "Real Valladolid", desc: "clube histórico presidido pelo fenômeno Ronaldo, buscando consolidar seu espaço na elite com gestão moderna e futebol dinâmico" },
        { name: "Espanyol", desc: "os pericos de Barcelona, donos de uma rivalidade histórica na Catalunha e com grande tradição de garra na primeira divisão" }
    ],
    "🇮🇹 Serie A (ITA)": [
        { name: "Inter de Milão", desc: "os nerazzurri gigantes do San Siro, conhecidos pela força física implacável e esquemas táticos vencedores na Itália e na Europa" },
        { name: "Juventus", desc: "a Velha Senhora do futebol italiano, recordista absoluta de títulos nacionais com foco extremo em disciplina e mentalidade vencedora" },
        { name: "Milan", desc: "gigante rossonero heptacampeão europeu, dono de um legado histórico de zagueiros e atacantes imortais que moldaram o esporte" },
        { name: "Napoli", desc: "os campeões do sul, empurrados pela paixão febril e histórica da torcida em uma cidade que respira a alma do esporte nacional" },
        { name: "Roma", desc: "os lobos da capital italiana, jogando no histórico Estádio Olímpico com uma torcida apaixonante ligada profundamente às raízes romanas" },
        { name: "Lazio", desc: "clube tradicionalíssimo de Roma com rivalidades históricas de tirar o fôlego e enorme identidade com sua base de torcedores" },
        { name: "Atalanta", desc: "a deusa de Bérgamo, mundialmente aclamada por seu futebol ofensivo espetacular, intensidade física e categorias de base excepcionais" },
        { name: "Fiorentina", desc: "a viola de Florença, dona de uma camisa belíssima e de uma torcida apaixonada que exige um futebol elegante e técnico no Artemio Franchi" },
        { name: "Bologna", desc: "equipe histórica da Emília-Romanha, dona de sete títulos nacionais e que vive um renascimento moderno com futebol inteligente e coletivo" },
        { name: "Torino", desc: "o histórico touro de Turim, marcado por uma das histórias mais lendárias e heróicas do futebol, com torcida extremamente fiel" },
        { name: "Monza", desc: "projeto ambicioso e moderno da Lombardia, que alcançou a elite com investimentos precisos e futebol rápido e dinâmico" },
        { name: "Genoa", desc: "o clube de futebol mais antigo da Itália, mandando seus jogos no pulsante estádio Luigi Ferraris sob o apoio incondicional de sua torcida" },
        { name: "Lecce", desc: "os lobos do sul da Itália, caracterizados pela dedicação tática de seu elenco e pelo calor constante de seus torcedores na região da Apúlia" },
        { name: "Udinese", desc: "clube tradicional de Friuli, famoso por sua ampla rede de olheiros mundial e por revelar talentos internacionais na Serie A" },
        { name: "Verona", desc: "equipe histórica campeã do scudetto nos anos 80, conhecida pelo espírito guerreiro e pela atmosfera hostil criada no estádio Bentegodi" },
        { name: "Cagliari", desc: "o orgulho da ilha da Sardenha, empurrado por uma torcida que representa toda uma região de forma fervorosa e muito competitiva" },
        { name: "Empoli", desc: "fábrica de talentos da Toscana, focada inteiramente no desenvolvimento de jovens jogadores e na manutenção estável na primeira divisão" },
        { name: "Parma", desc: "gigante dos anos 90 que conquistou copas europeias, buscando reescrever sua história gloriosa na Serie A com elenco jovem e técnico" },
        { name: "Como", desc: "equipe localizada no belíssimo lago alpino, atraindo atenções globais com gestão ambiciosa e futebol técnico moderno" },
        { name: "Venezia", desc: "clube da romântica cidade dos canais, famoso mundialmente por suas camisas com design de alta moda e futebol de muita entrega" }
    ],
    "🇩🇪 Bundesliga (ALE)": [
        { name: "Bayern de Munique", desc: "a superpotência dominante da Baviera, famosa por sua mentalidade implacável e presença física assustadora no futebol europeu" },
        { name: "Borussia Dortmund", desc: "famoso pela lendária 'Muralha Amarela' de sua torcida vibrante e por projetar grandes revelações ofensivas mundiais" },
        { name: "Bayer Leverkusen", desc: "a inovadora equipe dos 'aspirinas', famosa por quebrar recordes de invencibilidade com futebol tático extremamente envolvente" },
        { name: "RB Leipzig", desc: "projeto esportivo veloz e dinâmico, focado em transições rápidas de contra-ataque e recrutamento científico de jovens talentos" },
        { name: "Eintracht Frankfurt", desc: "conhecido pela paixão monumental de sua torcida, que invade estádios por toda a Europa nas grandes campanhas de copas" },
        { name: "Stuttgart", desc: "clube tradicional de Baden-Württemberg com futebol ofensivo muito agressivo e enorme apoio de sua apaixonada região" },
        { name: "Freiburg", desc: "modelo de estabilidade tática e integração com a comunidade no sul da Alemanha, praticando futebol coletivo muito organizado" },
        { name: "Hoffenheim", desc: "clube moderno da região metropolitana de Reno-Neckar, conhecido por sua excelente infraestrutura de tecnologia esportiva" },
        { name: "Heidenheim", desc: "o conto de fadas do futebol alemão, subindo das ligas amadoras até a elite com o mesmo treinador por mais de uma década" },
        { name: "Werder Bremen", desc: "gigante do norte alemão, dono de uma torcida entusiasmada e tradicionalmente adepto de um futebol alegre e muito ofensivo" },
        { name: "Augsburg", desc: "equipe bávara de muita dedicação física e solidez defensiva, mantendo-se na elite com muita disciplina e entrega nos duelos" },
        { name: "Wolfsburg", desc: "os lobos, patrocinados pela gigante automotiva, buscando sempre competir nas zonas de classificação europeia com elenco forte" },
        { name: "Borussia Mönchengladbach", desc: "os potros históricos dos anos 70, com uma torcida apaixonada e enorme tradição de futebol ofensivo e veloz" },
        { name: "Union Berlin", desc: "o orgulho da classe operária de Berlim Oriental, famoso por seu estádio construído pelos próprios torcedores e garra defensiva" },
        { name: "Mainz 05", desc: "clube formador famoso por revelar treinadores de classe mundial e por praticar um futebol de muita pressão e intensidade" },
        { name: "Bochum", desc: "equipe de muita raça e dedicação da região do Ruhr, empurrada por um caldeirão acústico que pulsa paixão operária tradicional" },
        { name: "St. Pauli", desc: "o icônico clube de Hamburgo conhecido mundialmente por suas causas sociais, torcida rebelde e atmosfera de festival de rock no estádio" },
        { name: "Holstein Kiel", desc: "os dinâmicos representantes da costa norte alemã, estreando na elite com futebol veloz de transições rápidas" },
        { name: "Schalke 04", desc: "um dos gigantes mais tradicionais do futebol alemão, dono de uma torcida monumental e fanática no coração da região do Ruhr" },
        { name: "Hertha Berlin", desc: "a tradicional 'Velha Senhora' da capital alemã, que manda seus jogos no imponente e histórico Estádio Olímpico de Berlim" }
    ],
    "🇫🇷 Ligue 1 (FRA)": [
        { name: "Paris Saint-Germain", desc: "a potência da capital francesa, recheada de estrelas globais e dominando o cenário nacional com muito estilo no Parque dos Príncipes" },
        { name: "Olympique de Marseille", desc: "o único clube francês campeão da Champions League, empurrado pela paixão ensurdecedora no caldeirão do Velódromo" },
        { name: "Monaco", desc: "a tradicional equipe do luxuoso principado, famosa por formar superestrelas mundiais e praticar um jogo dinâmico e vistoso" },
        { name: "Lyon", desc: "dono de uma das bases formadoras mais prestigiadas da Europa e de uma dinastia de títulos nacionais no início deste século" },
        { name: "Lille", desc: "os 'Dogues', conhecidos por surpreender o país ao conquistar a liga quebrando o favoritismo financeiro de equipes maiores" },
        { name: "Lens", desc: "clube tradicional do norte francês, empurrado por uma torcida operária espetacular e famosa pelo caldeirão acústico de seu estádio" },
        { name: "Rennes", desc: "equipe da brevidade com excelente trabalho nas categorias de base e investimentos sólidos, competindo nas posições europeias" },
        { name: "Nice", desc: "os águias da Riviera Francesa, impulsionados por um projeto ambicioso para desafiar o topo do futebol francês com futebol tático" },
        { name: "Reims", desc: "histórico clube semifinalista europeu nos anos 50, que vive um renascimento moderno com jogo rápido de transições velozes" },
        { name: "Toulouse", desc: "equipe do sul da França famosa por sua gestão baseada em análise de dados estatísticos de ponta e futebol inteligente" },
        { name: "Montpellier", desc: "o time do sul campeão histórico em 2012, conhecido pela garra física extrema e por revelar ótimas atacantes para a liga" },
        { name: "Strasbourg", desc: "representante da Alsácia na fronteira, empurrado por uma torcida fanática que lota o estádio com cantos incessantes" },
        { name: "Nantes", desc: "os canários históricos do futebol francês, donos de oito títulos nacionais e conhecidos pelo estilo de jogo tradicionalmente coletivo" },
        { name: "Le Havre", desc: "o clube formador mais antigo da França, conhecido por revelar campeões mundiais em sua prestigiada academia de base" },
        { name: "Brest", desc: "a grande surpresa da Bretanha, conquistando vaga histórica na Champions League com futebol de muita união coletiva e raça" },
        { name: "Auxerre", desc: "clube histórico que revelou lendas do futebol francês, retornando à elite com foco em disciplina e organização defensiva" },
        { name: "Angers", desc: "equipe de muita raça e dedicação coletiva do Vale do Loire, buscando se consolidar na elite com futebol tático disciplinado" },
        { name: "Saint-Étienne", desc: "o clube mais vezes campeão francês ao lado do PSG, dono de uma história gloriosa e de uma das torcidas mais fanáticas do país" },
        { name: "Bordeaux", desc: "gigante tradicionalíssimo do futebol francês, dono de seis títulos nacionais e de um legado imenso de craques que marcaram época" },
        { name: "Metz", desc: "equipe tradicional da região da Lorena, conhecida por sua dedicação competitiva e por ser um celeiro fértil de jovens atletas" }
    ],
    "🇺🇸 MLS (EUA)": [
        { name: "Inter Miami", desc: "a franquia da Flórida que se tornou o centro das atenções mundiais do futebol, atraindo lendas históricas sob o sol de Miami" },
        { name: "LA Galaxy", desc: "uma das marcas mais tradicionais e vitoriosas da MLS, pioneira em trazer lendas europeias de primeira linha para Hollywood" },
        { name: "LAFC", desc: "equipe moderna e inovadora de Los Angeles com torcida fanática, jogos estilo espetáculo e futebol ofensivo dinâmico" },
        { name: "New York City FC", desc: "clube cosmopolita pertencente ao City Football Group, jogando no coração da maior e mais influente metrópole do planeta" },
        { name: "Seattle Sounders", desc: "dono de uma das maiores médias de público dos EUA e tradição de títulos importantes com apoio em massa da torcida esmeralda" },
        { name: "Orlando City", desc: "os 'Leões' da Flórida, famosos por sua comunidade vibrante de torcedores roxos e forte ligação com o futebol brasileiro" },
        { name: "Columbus Crew", desc: "um dos fundadores da liga, multicampeão conhecido por seu jogo de posse refinado e torcida apaixonada em Ohio" },
        { name: "FC Cincinnati", desc: "equipe em rápida ascensão em Ohio, dona de uma torcida enérgica e futebol ofensivo baseado em transições intensas" },
        { name: "Philadelphia Union", desc: "reconhecido por sua excelente academia de jovens e modelo sustentável de futebol focado em intensidade coletiva" },
        { name: "Nashville SC", desc: "equipe do Tennessee caracterizada por uma organização defensiva impecável e grande apoio na capital da música country" },
        { name: "Atlanta United", desc: "potência do sul que quebrou recordes de público da MLS, mandando jogos no espetacular Mercedes-Benz Stadium lotado" },
        { name: "New York Red Bulls", desc: "equipe de Nova Jersey conhecida por sua pressão alta sufocante, intensidade física e style de jogo de transição veloz" },
        { name: "Portland Timbers", desc: "famoso pela torcida ultra-vibrante de Oregon que corta um tronco de madeira real a cada gol marcado em casa" },
        { name: "Sporting Kansas City", desc: "clube tradicional do Centro-Oeste americano, jogando em um belíssimo caldeirão com futebol tático disciplinado" },
        { name: "Austin FC", desc: "equipe do Texas com uma das atmosferas de estádio mais artísticas e festivas da liga, cantando sem parar nos jogos" },
        { name: "Houston Dynamo", desc: "os laranjas do Texas, com histórico de títulos e conhecidos pelo futebol físico e muito competitivo sob altas temperaturas" },
        { name: "Real Salt Lake", desc: "equipe de Utah com excelente rendimento em casa devido à altitude e forte espírito coletivo de garra e dedicação" },
        { name: "Vancouver Whitecaps", desc: "tradicional equipe canadense da MLS na bela costa do Pacífico, jogando com muita velocidade nos contra-ataques" },
        { name: "Charlotte FC", desc: "franquia da Carolina do Norte empurrada por grandes públicos em seu estádio gigante e futebol vertical focado no ataque" },
        { name: "St. Louis City SC", desc: "equipe que estreou de forma espetacular na liga, empurrada por uma cidade com rica tradição histórica de futebol" }
    ],
    "🇯🇵 J1 League (JPN)": ["Kawasaki Frontale", "Yokohama F. Marinos", "Urawa Red Diamonds", "Vissel Kobe", "Sanfrecce Hiroshima", "Kashima Antlers", "Nagoya Grampus", "Cerezo Osaka", "Gamba Osaka", "FC Tokyo", "Consadole Sapporo", "Avispa Fukuoka", "Sagan Tosu", "Kyoto Sanga", "Shonan Bellmare", "Albirex Niigata", "Kashiwa Reysol", "Yokohama FC", "Tokyo Verdy", "Machida Zelvia"],
    "🇦🇷 Liga Profesional (ARG)": ["River Plate", "Boca Juniors", "Racing Club", "Independiente", "San Lorenzo", "Vélez Sarsfield", "Estudiantes de La Plata", "Gimnasia y Esgrima", "Newell's Old Boys", "Rosario Central", "Club Atlético Huracán", "Club Atlético Lanús", "Club Atlético Banfield", "Talleres de Córdoba", "Belgrano de Córdoba", "Defensa y Justicia", "Argentinos Juniors", "Colón de Santa Fe", "Unión de Santa Fe", "Atlético Tucumán"],
    "🇲🇽 Liga MX (MEX)": ["Club América", "Chivas Guadalajara", "Cruz Azul", "Pumas UNAM", "Tigres UANL", "CF Monterrey", "Deportivo Toluca", "CF Pachuca", "Santos Laguna", "Atlas FC", "Club León", "Club Tijuana", "Club Puebla", "Club Necaxa", "Querétaro FC", "Mazatlán FC", "Atlético San Luis", "FC Juárez", "Atlante FC", "Monarcas Morelia"],
    "🇷🇺 Premier League (RUS)": ["Zenit St. Petersburg", "Spartak Moscow", "CSKA Moscow", "Lokomotiv Moscow", "FK Krasnodar", "Dynamo Moscow", "FK Rostov", "Akhmat Grozny", "Krylya Sovetov", "FK Sochi", "Ural Yekaterinburg", "Pari NN", "FK Orenburg", "Baltika Kaliningrad", "Rubin Kazan", "Fakel Voronezh", "Torpedo Moscow", "FK Khimki", "Anzhi Makhachkala", "Alania Vladikavkaz"],
    "🇸🇦 Saudi Pro League (SAU)": [
        { name: "Al-Hilal", desc: "o clube mais vitorioso da Ásia, conhecido por sua hegemonia continental, elenco repleto de estrelas mundiais e domínio absoluto no futebol saudita" },
        { name: "Al-Nassr", desc: "uma potência global do futebol árabe, famosa por atrair grandes astros mundiais como Cristiano Ronaldo e por sua torcida fanática na capital Riad" },
        { name: "Al-Ittihad", desc: "o clube do povo de Jidá, tradicionalíssimo e detentor de títulos continentais, empurrado por uma torcida incrivelmente barulhenta e apaixonada" },
        { name: "Al-Ahli", desc: "um dos quatro gigantes fundadores do futebol saudita, conhecido por sua torcida monumental em Jidá e sua reconstrução com estrelas internacionais" },
        { name: "Al-Shabab", desc: "um clube tradicional de Riad, conhecido como 'Os Leões', famoso por sua base reveladora e por rivalizar historicamente com os gigantes da capital" },
        { name: "Al-Ettifaq", desc: "clube histórico de Dammam, pioneiro em conquistas internacionais na região do Golfo e que se modernizou com grandes técnicos e estrelas" },
        { name: "Al-Taawoun", desc: "o lobo da região de Buraidah, conhecido por sua organização tática surpreendente e campanhas de destaque nas copas nacionais" },
        { name: "Al-Fateh", desc: "o clube de Al-Hasa, famoso por sua incrível conquista histórica do título nacional em 2013, quebrando a hegemonia dos gigantes" },
        { name: "Al-Khaleej", desc: "clube tradicional de Saihat, conhecido por sua luta incansável e garra coletiva para se manter na elite nacional do futebol árabe" },
        { name: "Al-Wehda", desc: "o clube mais antigo da Arábia Saudita, sediado na cidade sagrada de Meca, com uma história riquíssima e torcida tradicional e fiel" },
        { name: "Al-Fayha", desc: "o clube de Al Majma'ah, que surpreendeu o país ao vencer a Copa do Rei em 2022, famoso por sua resiliência e força defensiva em mata-matas" },
        { name: "Al-Riyadh", desc: "um clube histórico da capital, que retornou recentemente à elite após anos de tradição nas divisões de acesso sauditas" },
        { name: "Damac", desc: "o clube de Khamis Mushait, localizado nas montanhas do sul, conhecido por sua força extrema jogando em casa sob condições de altitude" },
        { name: "Abha", desc: "outro representante das montanhas do sul, lutando sempre com determinação e raça para se consolidar entre as potências da elite" },
        { name: "Al-Hazem", desc: "clube da província de Ar Rass, caracterizado por sua resiliência histórica e espírito de superação em jogos contra gigantes" },
        { name: "Al-Tai", desc: "o clube do norte, sediado na histórica Ha'il, famoso por seu caldeirão barulhento e por ser um adversário duríssimo jogando em seus domínios" },
        { name: "Al-Okhdood", desc: "representante de Najran, no extremo sul do país, orgulhoso de sua ascensão meteórica recente para disputar a elite com gigantes" },
        { name: "Al-Qadsiah", desc: "clube tradicional de Khobar com rica história, que se reestruturou com grandes investimentos para rivalizar no topo da liga" },
        { name: "Al-Raed", desc: "o clube rival tradicional de Buraidah, que protagoniza um dos clássicos regionais mais quentes e apaixonados do país" },
        { name: "Al-Orobah", desc: "clube do extremo norte da província de Al-Jawf, conhecido por sua força coletiva nas regiões de fronteira e dedicação tática" }
    ]
};

// 2. State Machine Steps
// 0: Continent, 1: Country, 2: Height, 3: Pro Age, 4: Position
// 5: Speed, 6: Finishing, 7: Dribbling, 8: Passing, 9: Strength, 10: Defending
// 11: Seasons, 12: Clubs, 13: League, 14: Team, 15: Completed
let currentStep = 0;
let isWaitingToAdvance = false;
let nextAdvanceCallback = null;
let playerCardName = "INSIRA SEU NOME";
let hasQueuedTransition = false;

function queueTransition(callback) {
    hasQueuedTransition = true;
    spinBtn.disabled = true; // Desabilita o botão imediatamente durante o intervalo da transição
    
    // Desabilita temporariamente o botão durante a transição curta (1.2 segundos)
    // para o jogador ver o resultado do giro na roleta, e depois muda para "AVANÇAR"
    setTimeout(() => {
        isWaitingToAdvance = true;
        nextAdvanceCallback = callback;
        spinBtn.disabled = false;
        spinBtn.innerHTML = "<span>AVANÇAR</span>";
        spinBtn.classList.add("btn-advance");
        
        // Adiciona dica no texto de status para o usuário saber que deve clicar
        if (statusText.innerText && !statusText.innerText.includes("Clique em AVANÇAR")) {
            statusText.innerText += " (Clique em AVANÇAR para prosseguir)";
        }
    }, 1200);
}

let selectedContinent = null;
let selectedCountry = null;
let selectedHeight = null;
let selectedAge = null;
let selectedPosition = null;
let selectedSpeed = null;
let selectedFinishing = null;
let selectedDribbling = null;
let selectedPassing = null;
let selectedStrength = null;
let selectedDefending = null;
let selectedSeasons = null;
let selectedClubs = null;

// Career Loop State Variables
let selectedCareerLeague = null;
let selectedCareerTeam = null;
let selectedCareerYears = 0;
let wonLeague = false;
let leagueTitlesCount = 0;
let wonCup = false;
let cupTitlesCount = 0;
let wonContinental = false;
let continentalTitlesCount = 0;
let selectedContinentalTournament = null;
let wonIntercontinental = false;
let intercontinentalTitlesCount = 0;
let wonWorldClubCup = false;
let worldClubCupTitlesCount = 0;
let improvedAttributes = false;
let numImprovedAttributes = 0;
let remainingAttributeImprovements = 0;
let currentClubIndex = 0;
let currentSubStep = 0;
let remainingSeasons = 0;
let totalClubsCount = 0;
let careerHistory = [];

// Realistic Calendar, Dual Cup & Retirement Variables
let currentCalendarYear = 2026;
let globalTopTierWinningYears = [];
let intercontinentalEligibleCount = 0;
let cwcEligibleCount = 0;
let selectedRetirementReason = null;

// Step 14: International Career & Individual Awards State Variables
let convocandoSelecao = false;
let jogouCopaMundo = false;
let quantidadeCopasDisputadas = 0;
let ganhouContinentalSelecoes = false;
let titulosContinentalSelecoesCount = 0;
let ganhouCopaMundo = false;
let titulosCopaMundoCount = 0;
let ganhouBolaDeOuro = false;
let bolaDeOuroCount = 0;
let selectedCareerGoals = 0;
let selectedCareerAssists = 0;
let selectedGoalsRange = null;
let selectedAssistsRange = null;
let selectedCareerCleanSheets = 0;
let selectedCleanSheetsRange = null;

let currentAngle = 0;
let isSpinning = false;
let animationFrameId = null;
let lastTickSector = -1;

// 3. DOM Elements
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const pointer = document.querySelector(".roulette-pointer");
const statusText = document.getElementById("statusText");
const appTitle = document.getElementById("app-title");
const appSubtitle = document.getElementById("app-subtitle");
const resetJourneyBtn = document.getElementById("resetJourneyBtn");

// Result Boxes
const boxContinent = document.getElementById("box-continent");
const boxCountry = document.getElementById("box-country");
const boxHeight = document.getElementById("box-height");
const boxAge = document.getElementById("box-age");
const boxPosition = document.getElementById("box-position");
const boxSpeed = document.getElementById("box-speed");
const boxFinishing = document.getElementById("box-finishing");
const boxDribbling = document.getElementById("box-dribbling");
const boxPassing = document.getElementById("box-passing");
const boxStrength = document.getElementById("box-strength");
const boxDefending = document.getElementById("box-defending");
const boxSeasons = document.getElementById("box-seasons");
const boxClubs = document.getElementById("box-clubs");
const boxLeague = document.getElementById("box-league");
const boxTeam = document.getElementById("box-team");

// Tables
const speedTableSection = document.getElementById("speedTableSection");
const seasonsTableSection = document.getElementById("seasonsTableSection");

// Modal
const resultModal = document.getElementById("resultModal");
const summaryContinent = document.getElementById("summaryContinent");
const summaryCountry = document.getElementById("summaryCountry");
const summaryHeight = document.getElementById("summaryHeight");
const summaryAge = document.getElementById("summaryAge");
const summaryPosition = document.getElementById("summaryPosition");
const summarySpeed = document.getElementById("summarySpeed");
const summaryFinishing = document.getElementById("summaryFinishing");
const summaryDribbling = document.getElementById("summaryDribbling");
const summaryPassing = document.getElementById("summaryPassing");
const summaryStrength = document.getElementById("summaryStrength");
const summaryDefending = document.getElementById("summaryDefending");
const summarySeasons = document.getElementById("summarySeasons");
const summaryClubs = document.getElementById("summaryClubs");
const summaryLeague = document.getElementById("summaryLeague");
const summaryTeam = document.getElementById("summaryTeam");

const destinyStory = document.getElementById("destinyStory");
const closeModalBtn = document.getElementById("closeModalBtn");
const confettiCanvas = document.getElementById("confettiCanvas");

// 4. Sound System (Web Audio API)
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTickSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.035);

    filter.type = 'highpass';
    filter.frequency.value = 550;

    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
}

function playWinSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77, 1046.50];
    
    notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.07);
        
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 14;
        lfoGain.gain.value = 4;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now + index * 0.07);
        lfo.stop(now + index * 0.07 + 0.5);

        gain.gain.setValueAtTime(0.0, now + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.45);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
    });
}

// 5. Helpers
function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getTeamDescription(teamName, leagueName) {
    const city = teamName.replace(" FC", "").replace(" City", "").replace(" United", "").replace(" Real", "").replace(" Atletico", "").replace(" CSD", "").replace(" FK", "").replace(" SC", "").replace(" Club", "");
    
    // Deterministic hash based on team name to ensure description consistency
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
        hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % 5;
    
    const templates = [
        `um clube tradicionalíssimo e muito respeitado, conhecido por sua torcida calorosa e por sua rica história de raça dentro de campo.`,
        `uma equipe competitiva de grande importância nacional, caracterizada por sua forte disciplina tática e busca constante por conquistas.`,
        `um clube em ascensão meteórica nas divisões, empurrado por uma comunidade local muito apaixonada e focada em revelar jovens atletas.`,
        `um time histórico e copeiro do futebol local, que manda seus jogos em uma atmosfera de caldeirão e pressão absoluta sobre os rivais.`,
        `um dinâmico e ambicioso projeto esportivo estruturado, focado em um futebol moderno de posse de bola e transição de alta intensidade.`
    ];
    
    return templates[index];
}

// Get items based on step
function getCurrentItems() {
    if (currentStep < 13) {
        switch (currentStep) {
            case 0: return continents;
            case 1: return countryData[selectedContinent] || [];
            case 2: return heights;
            case 3: return proAges;
            case 4: return footballPositions;
            case 5: return getPositionAttributeTiers("speed");
            case 6: return getPositionAttributeTiers("finishing");
            case 7: return getPositionAttributeTiers("dribbling");
            case 8: return getPositionAttributeTiers("passing");
            case 9: return getPositionAttributeTiers("strength");
            case 10: return getPositionAttributeTiers("defending");
            case 11: return proSeasons;
            case 12: return proClubs;
            default: return [];
        }
    } else if (currentStep === 13) {
        switch (currentSubStep) {
            case 0: return getLeagueOptionsWithWeights();
            case 1: 
                const rawTeams = teamDatabase[selectedCareerLeague] || [];
                return getTeamOptionsWithWeights(rawTeams, selectedCareerLeague);
            case 2: return getCareerYearsOptions();
            case 3: return getSimNaoOptions(getLeagueWinChance());
            case 4: return getNumberOptions(selectedCareerYears);
            case 5: return getSimNaoOptions(getCupWinChance());
            case 6: return getNumberOptions(selectedCareerYears);
            case 7: return getSimNaoOptions(getContinentalWinChance());
            case 8: return getNumberOptions(selectedCareerYears);
            case 9: return getSimNaoOptions(60);
            case 10: return getAttributeImprovementCountOptions();
            case 11: return getAttributeOptions();
            case 12: return getContinentalTournamentOptions();
            case 13: return getSimNaoOptions(getIntercontinentalWinChance());
            case 14: return getNumberOptions(intercontinentalEligibleCount);
            case 15: return getSimNaoOptions(getWorldClubCupWinChance());
            case 16: return getNumberOptions(cwcEligibleCount);
            default: return [];
        }
    } else if (currentStep === 14) {
        switch (currentSubStep) {
            case 0: return getSimNaoOptions(getNationalTeamCallUpChance());
            case 1: return getSimNaoOptions(getWorldCupParticipationChance());
            case 2: return getNumberOptions(Math.max(1, Math.floor(parseInt(selectedSeasons.name.split(" ")[0]) / 4)));
            case 3: return getSimNaoOptions(getContinentalSelectionChance());
            case 4: return getNumberOptions(Math.max(1, Math.floor(parseInt(selectedSeasons.name.split(" ")[0]) / 4)));
            case 5: return getSimNaoOptions(getWorldCupWinChance());
            case 6: return getNumberOptions(quantidadeCopasDisputadas || 1);
            case 7: return getGoalsOptions();
            case 8: return getAssistsOptions();
            case 9: return getSimNaoOptions(getBallonDorChance());
            case 10: return getBallonDorCountOptions();
            case 11: return getCleanSheetsOptions();
            case 12: return getRetirementReasonOptions();
            default: return [];
        }
    }
    return [];
}

// 6. Draw the Wheel
function drawWheel() {
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const items = getCurrentItems();
    if (items.length === 0) return;

    let parentContinentObj = null;
    if (currentStep === 1 || currentStep === 3 || currentStep === 4) {
        parentContinentObj = continents.find(c => c.name === selectedContinent) || continents[2];
    }

    // Dynamic weights check
    const isDynamicWeight = (
        currentStep === 1 || 
        currentStep === 11 || 
        (currentStep >= 5 && currentStep <= 10) || 
        (currentStep === 13 && [0, 1, 3, 5, 7, 9, 10, 12, 13, 15].includes(currentSubStep)) ||
        (currentStep === 14 && [0, 1, 3, 5, 7, 8, 9, 10, 11].includes(currentSubStep))
    );
    
    let totalWeight = 0;
    if (isDynamicWeight) {
        totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    }

    let accumulatedAngle = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let sliceAngleDeg = 0;

        if (isDynamicWeight) {
            sliceAngleDeg = (item.weight / totalWeight) * 360;
        } else {
            sliceAngleDeg = 360 / items.length;
        }

        const startAngleRad = (accumulatedAngle * Math.PI) / 180;
        const endAngleRad = ((accumulatedAngle + sliceAngleDeg) * Math.PI) / 180;

        ctx.save();
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius - 8, startAngleRad, endAngleRad);
        ctx.closePath();

        // Create gradients
        const midAngleRad = startAngleRad + (endAngleRad - startAngleRad) / 2;
        const gradX = cx + Math.cos(midAngleRad) * radius;
        const gradY = cy + Math.sin(midAngleRad) * radius;
        const grad = ctx.createLinearGradient(cx, cy, gradX, gradY);

        let stopsAdded = false;

        if (currentStep === 0) {
            grad.addColorStop(0, item.gradient[0]);
            grad.addColorStop(1, item.gradient[1]);
            stopsAdded = true;
        } else if (currentStep === 1 && parentContinentObj) {
            const startColor = interpolateColor(parentContinentObj.gradient[0], parentContinentObj.gradient[1], i / items.length);
            const endColor = interpolateColor(parentContinentObj.gradient[0], parentContinentObj.gradient[1], (i + 0.6) / items.length);
            grad.addColorStop(0, startColor);
            grad.addColorStop(1, endColor);
            stopsAdded = true;
        } else if (currentStep === 2) {
            // Heights
            if (i % 2 === 0) {
                grad.addColorStop(0, "#122418");
                grad.addColorStop(1, "#0b170f");
            } else {
                grad.addColorStop(0, "#1a2a20");
                grad.addColorStop(1, "#101c14");
            }
            stopsAdded = true;
        } else if (currentStep === 3) {
            // Ages
            if (i % 2 === 0) {
                grad.addColorStop(0, "#112030");
                grad.addColorStop(1, "#0a1320");
            } else {
                grad.addColorStop(0, "#18283a");
                grad.addColorStop(1, "#101a28");
            }
            stopsAdded = true;
        } else if (currentStep === 4) {
            // Positions
            if (i % 2 === 0) {
                grad.addColorStop(0, "#1f162e");
                grad.addColorStop(1, "#130a20");
            } else {
                grad.addColorStop(0, "#2c1f15");
                grad.addColorStop(1, "#1c120a");
            }
            stopsAdded = true;
        } else if (currentStep === 5 || currentStep === 6 || currentStep === 7 || currentStep === 8 || currentStep === 9 || currentStep === 10) {
            // Attribute wheels (Rarity Colors!)
            grad.addColorStop(0, item.color);
            grad.addColorStop(1, "#020104");
            stopsAdded = true;
        } else if (currentStep === 11) {
            // Seasons (Platinum / dark slate blue theme)
            if (i % 2 === 0) {
                grad.addColorStop(0, "#222a36");
                grad.addColorStop(1, "#141a22");
            } else {
                grad.addColorStop(0, "#181e26");
                grad.addColorStop(1, "#0e1217");
            }
            stopsAdded = true;
        } else if (currentStep === 12) {
            // Clubs
            if (i % 2 === 0) {
                grad.addColorStop(0, "#2e1828");
                grad.addColorStop(1, "#1c0e18");
            } else {
                grad.addColorStop(0, "#2d1818");
                grad.addColorStop(1, "#1c0e0e");
            }
            stopsAdded = true;
        } else if (currentStep === 13) {
            if (currentSubStep === 0 || currentSubStep === 11 || currentSubStep === 12) {
                // Ligas, Atributos de Treino ou Escolha de Torneio Continental
                grad.addColorStop(0, item.color);
                grad.addColorStop(1, "#020104");
            } else if (currentSubStep === 1) {
                // Teams
                const activeLeagueObj = leagues.find(l => l.name === selectedCareerLeague) || leagues[1];
                const startColor = interpolateColor(activeLeagueObj.color, "#222a36", i / items.length);
                const endColor = interpolateColor(activeLeagueObj.color, "#020104", (i + 0.5) / items.length);
                grad.addColorStop(0, startColor);
                grad.addColorStop(1, endColor);
            } else if (currentSubStep === 2) {
                // Years
                if (i % 2 === 0) {
                    grad.addColorStop(0, "#112030");
                    grad.addColorStop(1, "#0a1320");
                } else {
                    grad.addColorStop(0, "#18283a");
                    grad.addColorStop(1, "#101a28");
                }
            } else if (currentSubStep === 3 || currentSubStep === 5 || currentSubStep === 7 || currentSubStep === 9 || currentSubStep === 13 || currentSubStep === 15) {
                // Sim/Não
                grad.addColorStop(0, item.color);
                grad.addColorStop(1, "#020104");
            } else if (currentSubStep === 4 || currentSubStep === 6 || currentSubStep === 8 || currentSubStep === 10 || currentSubStep === 14 || currentSubStep === 16) {
                // Numbers
                if (i % 2 === 0) {
                    grad.addColorStop(0, "#2e1828");
                    grad.addColorStop(1, "#1c0e18");
                } else {
                    grad.addColorStop(0, "#2d1818");
                    grad.addColorStop(1, "#1c0e0e");
                }
            }
            stopsAdded = true;
        } else if (currentStep === 14) {
            if ([0, 1, 3, 5, 9, 12].includes(currentSubStep)) {
                // Sim/Não ou Aposentadoria
                grad.addColorStop(0, item.color);
                grad.addColorStop(1, "#020104");
                stopsAdded = true;
            } else if ([2, 4, 6, 10].includes(currentSubStep)) {
                // Numbers
                if (i % 2 === 0) {
                    grad.addColorStop(0, "#2e1828");
                    grad.addColorStop(1, "#1c0e18");
                } else {
                    grad.addColorStop(0, "#2d1818");
                    grad.addColorStop(1, "#1c0e0e");
                }
                stopsAdded = true;
            } else if (currentSubStep === 7) {
                // Goals
                if (i % 2 === 0) {
                    grad.addColorStop(0, "#122418");
                    grad.addColorStop(1, "#0b170f");
                } else {
                    grad.addColorStop(0, "#112030");
                    grad.addColorStop(1, "#0a1320");
                }
                stopsAdded = true;
            } else if (currentSubStep === 8) {
                // Assists
                if (i % 2 === 0) {
                    grad.addColorStop(0, "#2e1828");
                    grad.addColorStop(1, "#1c0e0e");
                } else {
                    grad.addColorStop(0, "#1f162e");
                    grad.addColorStop(1, "#130a20");
                }
                stopsAdded = true;
            } else if (currentSubStep === 11) {
                // Clean Sheets (Goalkeeper defensive emerald/teal theme)
                if (i % 2 === 0) {
                    grad.addColorStop(0, "#113c34");
                    grad.addColorStop(1, "#0a241f");
                } else {
                    grad.addColorStop(0, "#1a4e44");
                    grad.addColorStop(1, "#10322c");
                }
                stopsAdded = true;
            }
        }

        if (!stopsAdded) {
            // Elegant fallback gradient so the wheel never goes black
            if (i % 2 === 0) {
                grad.addColorStop(0, "#222a36");
                grad.addColorStop(1, "#141a22");
            } else {
                grad.addColorStop(0, "#1a202c");
                grad.addColorStop(1, "#0f131a");
            }
        }

        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = "rgba(8, 5, 18, 0.45)";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        // Draw Text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(midAngleRad);

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        let nameToDraw = item.name;
        
        // Tradução dinâmica das fatias no Canvas da Roleta
        if (currentStep === 0) {
            nameToDraw = translateTerm("continents", item.name);
        } else if (currentStep === 1) {
            nameToDraw = translateTerm("countries", item.name);
        } else if (currentStep === 4) {
            nameToDraw = translateTerm("positions", item.name);
        } else if (currentStep >= 5 && currentStep <= 10) {
            const parts = item.name.split(" - ");
            if (parts.length === 2) {
                nameToDraw = parts[0] + " - " + translateTerm("attributes", parts[1]);
            }
        } else if (currentStep === 11) {
            const tempMatch = item.name.match(/^(\d+)\s+(Temporadas|Temporada)\s+\((.*?)\)$/);
            if (tempMatch) {
                const num = tempMatch[1];
                const keyClass = tempMatch[3];
                const translatedClass = translateTerm("retirementReasons", keyClass) || keyClass;
                let wordSeasons = "Seasons";
                if (currentLang === "pt" || currentLang === "es") wordSeasons = num === "1" ? "Temporada" : "Temporadas";
                else if (currentLang === "ja") wordSeasons = "シーズン";
                else if (currentLang === "zh") wordSeasons = "赛季";
                nameToDraw = currentLang === "ja" ? `${num}${wordSeasons} (${translatedClass})` : `${num} ${wordSeasons} (${translatedClass})`;
            }
        } else if (currentStep === 12) {
            const clubMatch = item.name.match(/^(\d+)\s+(Clubes|Clube)$/);
            if (clubMatch) {
                const num = clubMatch[1];
                let wordClubs = "Clubs";
                if (currentLang === "pt") wordClubs = num === "1" ? "Clube" : "Clubes";
                else if (currentLang === "es") wordClubs = num === "1" ? "Club" : "Clubes";
                else if (currentLang === "ja") wordClubs = "クラブ";
                else if (currentLang === "zh") wordClubs = "家俱乐部";
                nameToDraw = currentLang === "zh" ? `${num}${wordClubs}` : `${num} ${wordClubs}`;
            }
        } else if (currentStep === 13) {
            if (currentSubStep === 2) {
                const yearMatch = item.name.match(/^(\d+)\s+(anos|ano)$/);
                if (yearMatch) {
                    const num = yearMatch[1];
                    let wordYears = "years";
                    if (currentLang === "pt") wordYears = num === "1" ? "ano" : "anos";
                    else if (currentLang === "es") wordYears = num === "1" ? "año" : "años";
                    else if (currentLang === "ja") wordYears = "年間";
                    else if (currentLang === "zh") wordYears = "年";
                    nameToDraw = currentLang === "ja" || currentLang === "zh" ? `${num}${wordYears}` : `${num} ${wordYears}`;
                }
            } else if ([3, 5, 7, 9, 13, 15].includes(currentSubStep) || (currentStep === 14 && [0, 1, 3, 5, 9].includes(currentSubStep))) {
                if (item.name === "Sim") {
                    nameToDraw = currentLang === 'en' ? 'Yes' : currentLang === 'es' ? 'Sí' : currentLang === 'ja' ? 'はい' : currentLang === 'zh' ? '是' : 'Sim';
                } else if (item.name === "Não") {
                    nameToDraw = currentLang === 'en' ? 'No' : currentLang === 'es' ? 'No' : currentLang === 'ja' ? 'いいえ' : currentLang === 'zh' ? '否' : 'Não';
                }
            } else if (currentSubStep === 11) {
                if (item.name === "Velocidade") nameToDraw = currentLang === 'en' ? 'Speed' : currentLang === 'es' ? 'Velocidad' : currentLang === 'ja' ? 'スピード' : currentLang === 'zh' ? '速度' : 'Velocidade';
                else if (item.name === "Finalização") nameToDraw = currentLang === 'en' ? 'Finishing' : currentLang === 'es' ? 'Finalización' : currentLang === 'ja' ? '決定力' : currentLang === 'zh' ? '射门' : 'Finalização';
                else if (item.name === "Drible") nameToDraw = currentLang === 'en' ? 'Dribbling' : currentLang === 'es' ? 'Regate' : currentLang === 'ja' ? 'ドリブル' : currentLang === 'zh' ? '盘带' : 'Drible';
                else if (item.name === "Passe") nameToDraw = currentLang === 'en' ? 'Passing' : currentLang === 'es' ? 'Pase' : currentLang === 'ja' ? 'パス' : currentLang === 'zh' ? '传球' : 'Passe';
                else if (item.name === "Força") nameToDraw = currentLang === 'en' ? 'Strength' : currentLang === 'es' ? 'Fuerza' : currentLang === 'ja' ? 'フィジカル' : currentLang === 'zh' ? '力量' : 'Força';
                else if (item.name === "Defesa") nameToDraw = currentLang === 'en' ? 'Defense' : currentLang === 'es' ? 'Defensa' : currentLang === 'ja' ? 'ディフェンス' : currentLang === 'zh' ? '防守' : 'Defesa';
            }
        } else if (currentStep === 14) {
            if (currentSubStep === 12) {
                nameToDraw = translateTerm("retirementReasons", item.name);
            }
        }

        // Dynamic text size
        let fontSize = 17;
        if (nameToDraw.length > 15) {
            fontSize = 11;
        } else if (nameToDraw.length > 11) {
            fontSize = 13;
        }
        
        if (sliceAngleDeg < 14) {
            fontSize = Math.min(fontSize, 9);
        } else if (sliceAngleDeg < 22) {
            fontSize = Math.min(fontSize, 11);
        }

        ctx.font = `600 ${fontSize}px 'Outfit', sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        // Remove emojis, glifos regionais (letras de bandeira do Windows) e tags para evitar falhas de renderização no Canvas
        const cleanText = nameToDraw.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]{2}|[\u{E0020}-\u{E007F}]/gu, '').trim();

        let displayText = cleanText;
        if (isDynamicWeight && sliceAngleDeg > 18) {
            const percentage = Math.round((item.weight / totalWeight) * 100);
            displayText = `${cleanText} (${percentage}%)`;
        }

        ctx.fillText(displayText, radius - 35, 0);

        ctx.restore();

        accumulatedAngle += sliceAngleDeg;
    }

    // 1. Draw Premium Outer Metallic Silver/Platinum Frame
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 6, 0, 2 * Math.PI);
    const outerSilverGrad = ctx.createLinearGradient(0, 0, width, height);
    outerSilverGrad.addColorStop(0, "#cbd5e1");
    outerSilverGrad.addColorStop(0.25, "#ffffff");
    outerSilverGrad.addColorStop(0.5, "#94a3b8");
    outerSilverGrad.addColorStop(0.75, "#e2e8f0");
    outerSilverGrad.addColorStop(1, "#475569");
    ctx.strokeStyle = outerSilverGrad;
    ctx.lineWidth = 12;
    ctx.stroke();

    // Fine inner border
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 13, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Draw Premium Center Metallic Hub
    // Outer Silver Rim of the Hub
    ctx.beginPath();
    ctx.arc(cx, cy, 54, 0, 2 * Math.PI);
    const hubSilverGrad = ctx.createLinearGradient(cx - 45, cy - 45, cx + 45, cy + 45);
    hubSilverGrad.addColorStop(0, "#cbd5e1");
    hubSilverGrad.addColorStop(0.3, "#ffffff");
    hubSilverGrad.addColorStop(0.5, "#94a3b8");
    hubSilverGrad.addColorStop(0.8, "#e2e8f0");
    hubSilverGrad.addColorStop(1, "#475569");
    ctx.fillStyle = hubSilverGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowColor = "transparent"; // Reset shadow

    // Inner Dark Core of the Hub
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, 2 * Math.PI);
    ctx.fillStyle = "#0c0c0c";
    ctx.fill();

    // Shiny Hub Inner Ring
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Silver Star Icon (⭐)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
    ctx.shadowBlur = 10;
    ctx.font = "20px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⭐", 0, 0);
    ctx.restore();
}

// 7. Dynamic Winner & Tick Tracking
function getSectorAtAngle(angleDeg) {
    const items = getCurrentItems();
    if (!items || items.length === 0) return 0;
    
    const targetAngle = ((270 - angleDeg) + 360) % 360;
    const isDynamicWeight = (
        currentStep === 1 || 
        currentStep === 11 || 
        (currentStep >= 5 && currentStep <= 10) || 
        (currentStep === 13 && [0, 1, 3, 5, 7, 9, 10, 13, 15].includes(currentSubStep)) ||
        (currentStep === 14 && [0, 1, 3, 5, 7, 8, 9, 10, 11].includes(currentSubStep))
    );

    if (isDynamicWeight) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let accumulatedAngle = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const sliceAngle = (item.weight / totalWeight) * 360;
            if (targetAngle >= accumulatedAngle && targetAngle < accumulatedAngle + sliceAngle) {
                return i;
            }
            accumulatedAngle += sliceAngle;
        }
        return items.length - 1;
    } else {
        const sliceAngle = 360 / items.length;
        return Math.floor(targetAngle / sliceAngle) % items.length;
    }
}

function trackSpinTicks() {
    if (!isSpinning) return;
    
    const style = window.getComputedStyle(canvas);
    const matrix = style.transform || style.webkitTransform;
    
    if (matrix && matrix !== 'none') {
        const values = matrix.split('(')[1].split(')')[0].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        
        let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        if (angle < 0) angle += 360;

        const activeSector = getSectorAtAngle(angle);
        
        if (activeSector !== lastTickSector) {
            playTickSound();
            lastTickSector = activeSector;
        }
    }
    
    animationFrameId = requestAnimationFrame(trackSpinTicks);
}

// 8. Spin
function spinWheel() {
    if (isSpinning) return;

    initAudio();

    isSpinning = true;
    spinBtn.disabled = true;
    resetJourneyBtn.disabled = true;
    pointer.classList.add("wobble");

    const items = getCurrentItems();
    const numSectors = items.length;

    const isDynamicWeight = (
        currentStep === 1 || 
        currentStep === 11 || 
        (currentStep >= 5 && currentStep <= 10) || 
        (currentStep === 13 && [0, 1, 3, 5, 7, 9, 10, 13, 15].includes(currentSubStep)) ||
        (currentStep === 14 && [0, 1, 3, 5, 7, 8, 9, 10, 11].includes(currentSubStep))
    );

    const extraRotations = 5 + Math.floor(Math.random() * 4);
    
    let targetIndex = 0;
    if (isDynamicWeight) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let randomValue = Math.random() * totalWeight;
        for (let i = 0; i < items.length; i++) {
            randomValue -= items[i].weight;
            if (randomValue <= 0) {
                targetIndex = i;
                break;
            }
        }
    } else {
        targetIndex = Math.floor(Math.random() * numSectors);
    }

    let targetSectorAngle = 0;
    if (isDynamicWeight) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let accumulatedAngle = 0;
        for (let i = 0; i < targetIndex; i++) {
            accumulatedAngle += (items[i].weight / totalWeight) * 360;
        }
        const targetWidth = (items[targetIndex].weight / totalWeight) * 360;
        targetSectorAngle = accumulatedAngle + (targetWidth / 2);
    } else {
        const sectorAngle = 360 / numSectors;
        targetSectorAngle = (targetIndex * sectorAngle) + (sectorAngle / 2);
    }

    const sliceAngleWidth = isDynamicWeight
        ? (items[targetIndex].weight / items.reduce((sum, item) => sum + item.weight, 0)) * 360 
        : 360 / numSectors;
    const randomOffset = (Math.random() - 0.5) * (sliceAngleWidth * 0.5);
    const finalTargetAngle = targetSectorAngle + randomOffset;

    const targetSpinAngle = (extraRotations * 360) + (270 - finalTargetAngle);
    currentAngle = targetSpinAngle;

    canvas.style.transition = "transform 1s cubic-bezier(0.15, 0.85, 0.35, 1)";
    canvas.style.transform = `rotate(${currentAngle}deg)`;

    lastTickSector = -1;
    trackSpinTicks();

    setTimeout(() => {
        isSpinning = false;
        pointer.classList.remove("wobble");
        cancelAnimationFrame(animationFrameId);
        
        const positiveNormalizedAngle = ((270 - (currentAngle % 360)) + 360) % 360;
        let winnerIndex = 0;

        if (isDynamicWeight) {
            const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
            let accumulatedAngle = 0;
            for (let i = 0; i < items.length; i++) {
                const sliceAngle = (items[i].weight / totalWeight) * 360;
                if (positiveNormalizedAngle >= accumulatedAngle && positiveNormalizedAngle < accumulatedAngle + sliceAngle) {
                    winnerIndex = i;
                    break;
                }
                accumulatedAngle += sliceAngle;
            }
        } else {
            const sliceAngle = 360 / items.length;
            winnerIndex = Math.floor(positiveNormalizedAngle / sliceAngle) % items.length;
        }

        handleStepResult(items[winnerIndex]);
    }, 1000);
}

// 9. Process Step Result
function handleStepResult(winner) {
    playWinSound();

    if (currentStep === 0) {
        selectedContinent = winner.name;
        updateResultBox("box-continent", selectedContinent, winner.gradient);
        statusText.innerText = `Você nasceu na ${selectedContinent}!`;
        resetJourneyBtn.disabled = false;
        queueTransition(() => { transitionToStep(1); });

    } else if (currentStep === 1) {
        selectedCountry = winner;
        const continentObj = continents.find(c => c.name === selectedContinent);
        updateResultBox("box-country", selectedCountry.name, continentObj.gradient);
        statusText.innerText = `Nascido no país: ${selectedCountry.name}!`;
        queueTransition(() => { transitionToStep(2); });

    } else if (currentStep === 2) {
        selectedHeight = winner;
        updateResultBox("box-height", selectedHeight.name, ["#1a4d2d", "#cbd5e1"]);
        statusText.innerText = `Altura física: ${selectedHeight.name}!`;
        queueTransition(() => { transitionToStep(3); });

    } else if (currentStep === 3) {
        selectedAge = winner;
        updateResultBox("box-age", selectedAge.name, ["#1a2d4d", "#cbd5e1"]);
        statusText.innerText = `Idade de profissionalização: ${selectedAge.name}!`;
        queueTransition(() => { transitionToStep(4); });

    } else if (currentStep === 4) {
        selectedPosition = winner;
        updateResultBox("box-position", selectedPosition.name, ["#4d2d1a", "#cbd5e1"]);
        statusText.innerText = `Posição decidida: ${selectedPosition.name}!`;
        
        // Se for Goleiro, atualiza dinamicamente os rótulos na interface e no modal
        const isGoleiro = selectedPosition.name === "Goleiro";
        const speedLabel = document.querySelector("#box-speed .box-label");
        const finishingLabel = document.querySelector("#box-finishing .box-label");
        const dribblingLabel = document.querySelector("#box-dribbling .box-label");
        if (speedLabel) speedLabel.innerText = isGoleiro ? "Tempo de Reação" : "Velocidade";
        if (finishingLabel) finishingLabel.innerText = isGoleiro ? "Impulsão" : "Finalização";
        if (dribblingLabel) dribblingLabel.innerText = isGoleiro ? "Elasticidade" : "Drible";
        
        const modalSpeedLabel = document.querySelector("#summarySpeed")?.previousElementSibling;
        const modalFinishingLabel = document.querySelector("#summaryFinishing")?.previousElementSibling;
        const modalDribblingLabel = document.querySelector("#summaryDribbling")?.previousElementSibling;
        if (modalSpeedLabel) modalSpeedLabel.innerText = isGoleiro ? "Tempo de Reação" : "Velocidade";
        if (modalFinishingLabel) modalFinishingLabel.innerText = isGoleiro ? "Impulsão" : "Finalização";
        if (modalDribblingLabel) modalDribblingLabel.innerText = isGoleiro ? "Elasticidade" : "Drible";
        
        queueTransition(() => { transitionToStep(5); });

    } else if (currentStep === 5) {
        // Speed (1/10 to 10/10)
        selectedSpeed = winner;
        updateResultBox("box-speed", `${selectedSpeed.name} (${selectedSpeed.rarity})`, [selectedSpeed.color, "#090618"]);
        const isGoleiro = selectedPosition && selectedPosition.name === "Goleiro";
        statusText.innerText = `${isGoleiro ? "Tempo de reação definido" : "Velocidade definida"}: ${selectedSpeed.name}!`;
        highlightRarityRow(winner);
        queueTransition(() => { transitionToStep(6); });

    } else if (currentStep === 6) {
        // Finishing
        selectedFinishing = winner;
        updateResultBox("box-finishing", `${selectedFinishing.name} (${selectedFinishing.rarity})`, [selectedFinishing.color, "#090618"]);
        const isGoleiro = selectedPosition && selectedPosition.name === "Goleiro";
        statusText.innerText = `${isGoleiro ? "Impulsão definida" : "Finalização definida"}: ${selectedFinishing.name}!`;
        highlightRarityRow(winner);
        queueTransition(() => { transitionToStep(7); });

    } else if (currentStep === 7) {
        // Dribbling
        selectedDribbling = winner;
        updateResultBox("box-dribbling", `${selectedDribbling.name} (${selectedDribbling.rarity})`, [selectedDribbling.color, "#090618"]);
        const isGoleiro = selectedPosition && selectedPosition.name === "Goleiro";
        statusText.innerText = `${isGoleiro ? "Elasticidade definida" : "Drible definido"}: ${selectedDribbling.name}!`;
        highlightRarityRow(winner);
        queueTransition(() => { transitionToStep(8); });

    } else if (currentStep === 8) {
        // Passing
        selectedPassing = winner;
        updateResultBox("box-passing", `${selectedPassing.name} (${selectedPassing.rarity})`, [selectedPassing.color, "#090618"]);
        statusText.innerText = `Passe definido: ${selectedPassing.name}!`;
        highlightRarityRow(winner);
        queueTransition(() => { transitionToStep(9); });

    } else if (currentStep === 9) {
        // Strength
        selectedStrength = winner;
        updateResultBox("box-strength", `${selectedStrength.name} (${selectedStrength.rarity})`, [selectedStrength.color, "#090618"]);
        statusText.innerText = `Força física definida: ${selectedStrength.name}!`;
        highlightRarityRow(winner);
        queueTransition(() => { transitionToStep(10); });

    } else if (currentStep === 10) {
        // Defending
        selectedDefending = winner;
        updateResultBox("box-defending", `${selectedDefending.name} (${selectedDefending.rarity})`, [selectedDefending.color, "#090618"]);
        statusText.innerText = `Defesa definida: ${selectedDefending.name}!`;
        highlightRarityRow(winner);
        
        queueTransition(() => {
            speedTableSection.classList.add("hidden");
            updateTableVisibility();
            transitionToStep(11); // Transition to Seasons!
        });

    } else if (currentStep === 11) {
        // Seasons played
        selectedSeasons = winner;
        updateResultBox("box-seasons", selectedSeasons.name, ["#222a36", "#cbd5e1"]);
        statusText.innerText = `Carreira: jogou ${selectedSeasons.name}!`;
        
        // Highlight season row
        const index = proSeasons.indexOf(selectedSeasons);
        document.querySelectorAll("#seasonsTableSection tbody tr").forEach(tr => tr.classList.remove("active-row"));
        const activeRow = document.getElementById(`row-season-${index}`);
        if (activeRow) activeRow.classList.add("active-row");

        queueTransition(() => {
            seasonsTableSection.classList.add("hidden");
            updateTableVisibility();
            transitionToStep(12); // Transition to Clubs!
        });

    } else if (currentStep === 12) {
        selectedClubs = winner;
        updateResultBox("box-clubs", selectedClubs.name, ["#2d1a4d", "#cbd5e1"]);
        statusText.innerText = `Carreira: jogou em ${selectedClubs.name}!`;
        queueTransition(() => { transitionToStep(13); });

    } else if (currentStep === 13) {
        handleCareerSubStepResult(winner);
    } else if (currentStep === 14) {
        handleInternationalSubStepResult(winner);
    }
}

function updateResultBox(boxId, value, gradientColors) {
    const box = document.getElementById(boxId);
    box.classList.remove("active-step");
    box.classList.add("completed");
    
    const placeholder = box.querySelector(".box-placeholder");
    const valueEl = box.querySelector(".box-value");
    
    placeholder.classList.add("hidden");
    valueEl.classList.remove("hidden");
    
    const translatedValue = getTranslatedValue(boxId, value);
    valueEl.innerText = translatedValue;

    box.style.borderColor = gradientColors[0];
    box.style.boxShadow = `0 0 12px rgba(${hexToRgb(gradientColors[0])}, 0.1), inset 0 0 8px rgba(${hexToRgb(gradientColors[0])}, 0.04)`;
    
    const glow = box.querySelector(".box-glow");
    if (glow) {
        glow.style.background = `radial-gradient(circle at 100% 50%, rgba(${hexToRgb(gradientColors[0])}, 0.08) 0%, transparent 65%)`;
        glow.style.opacity = 1;
    }

    // Sincronização com o painel móvel de progresso rápido
    const boxToMobileMap = {
        "box-continent": { id: "m-box-origin" },
        "box-country": { id: "m-box-origin" },
        "box-height": { id: "m-box-height" },
        "box-age": { id: "m-box-age" },
        "box-position": { id: "m-box-position" },
        "box-speed": { id: "m-box-speed" },
        "box-finishing": { id: "m-box-finishing" },
        "box-dribbling": { id: "m-box-dribbling" },
        "box-passing": { id: "m-box-passing" },
        "box-strength": { id: "m-box-strength" },
        "box-defending": { id: "m-box-defending" },
        "box-seasons": { id: "m-box-seasons" },
        "box-clubs": { id: "m-box-clubs" }
    };

    const mobileMap = boxToMobileMap[boxId];
    if (mobileMap) {
        const mCard = document.getElementById(mobileMap.id);
        if (mCard) {
            mCard.classList.add("completed");
            const mVal = mCard.querySelector(".m-stat-val");
            
            if (boxId === "box-continent") {
                mVal.innerText = translatedValue;
            } else if (boxId === "box-country") {
                const flag = getCountryFlag(value);
                mVal.innerText = `${flag} ${translatedValue}`;
            } else if (["box-speed", "box-finishing", "box-dribbling", "box-passing", "box-strength", "box-defending"].includes(boxId)) {
                mVal.innerText = translatedValue.split("/")[0];
            } else {
                mVal.innerText = translatedValue;
            }
            
            if (gradientColors && gradientColors[0]) {
                mCard.style.borderColor = gradientColors[0];
                mCard.style.color = "#ffffff";
            }
        }
    }
}

function highlightRarityRow(winner) {
    const index = attributeTiers.findIndex(t => t.name === winner.name);
    document.querySelectorAll(".speed-rarity-table tbody tr").forEach(tr => tr.classList.remove("active-row"));
    const activeRow = document.getElementById(`row-speed-${index}`);
    if (activeRow) activeRow.classList.add("active-row");
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.startsWith('#') ? hex.slice(1) : hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}

function resetResultBoxes() {
    const boxes = [
        { id: "box-continent", placeholder: "Pendente" },
        { id: "box-country", placeholder: "Aguardando..." },
        { id: "box-height", placeholder: "Aguardando..." },
        { id: "box-age", placeholder: "Aguardando..." },
        { id: "box-position", placeholder: "Aguardando..." },
        { id: "box-speed", placeholder: "Aguardando..." },
        { id: "box-finishing", placeholder: "Aguardando..." },
        { id: "box-dribbling", placeholder: "Aguardando..." },
        { id: "box-passing", placeholder: "Aguardando..." },
        { id: "box-strength", placeholder: "Aguardando..." },
        { id: "box-defending", placeholder: "Aguardando..." },
        { id: "box-seasons", placeholder: "Aguardando..." },
        { id: "box-clubs", placeholder: "Aguardando..." },
        { id: "box-league", placeholder: "Aguardando..." },
        { id: "box-team", placeholder: "Aguardando..." }
    ];

    boxes.forEach(item => {
        const box = document.getElementById(item.id);
        if (box) {
            box.className = "result-box";
            box.style = "";
            
            const placeholder = box.querySelector(".box-placeholder");
            const valueEl = box.querySelector(".box-value");
            const glow = box.querySelector(".box-glow");
            
            placeholder.classList.remove("hidden");
            placeholder.innerText = item.placeholder;
            valueEl.classList.add("hidden");
            valueEl.innerText = "-";
            
            if (glow) {
                glow.style = "";
            }
        }
    });

    // Limpar os cartões móveis de progresso
    const mobileBoxIds = [
        "m-box-origin", "m-box-height", "m-box-age", "m-box-position",
        "m-box-speed", "m-box-finishing", "m-box-dribbling", "m-box-passing",
        "m-box-strength", "m-box-defending", "m-box-seasons", "m-box-clubs"
    ];
    mobileBoxIds.forEach(id => {
        const mCard = document.getElementById(id);
        if (mCard) {
            mCard.className = "quick-stat-card";
            mCard.style = "";
            const mVal = mCard.querySelector(".m-stat-val");
            if (mVal) mVal.innerText = "-";
        }
    });
}

// 10. Step Transitions
function transitionToStep(step) {
    currentStep = step;
    
    // Sincronizar cartão ativo e centralizar rolagem no mobile
    syncMobileQuickStatsActive();
    
    // Automatic Tab Switching based on active phase
    if (step >= 5 && step <= 10) {
        switchTab("tab-references");
    } else if (step === 11) {
        switchTab("tab-references");
    } else if (step >= 12 && step <= 14) {
        switchTab("tab-timeline");
    } else if (step === 15) {
        switchTab("tab-stats");
    } else if (step < 5) {
        switchTab("tab-stats");
    }
    
    if (currentStep === 14) {
        currentSubStep = 0;
        startCareerSubStep();
        return;
    }
    
    if (currentStep === 15) {
        appTitle.innerText = "Carreira Concluída";
        appSubtitle.innerText = "Parabéns! Sua jornada lendária pelos gramados foi eternizada nos livros de história.";
        statusText.innerText = "Clique em 'VER BIO' para reler sua biografia ou use a barra lateral.";
        spinBtn.innerHTML = "<span>VER BIO</span>";
        spinBtn.disabled = false;
        resetJourneyBtn.disabled = false;
        
        // Finalizar cartões móveis com status concluído
        const mSeasons = document.getElementById("m-box-seasons");
        if (mSeasons) mSeasons.querySelector(".m-stat-val").innerText = "Concluída";
        const mClubs = document.getElementById("m-box-clubs");
        if (mClubs) mClubs.querySelector(".m-stat-val").innerText = "Concluído";
        return;
    }
    
    const visualAngle = currentAngle % 360;
    canvas.style.transition = "none";
    canvas.style.transform = `rotate(${visualAngle}deg)`;
    currentAngle = visualAngle;
    
    document.querySelectorAll(".result-box").forEach(box => box.classList.remove("active-step"));

    // Set up step parameters
    if (currentStep === 1) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 2: Descubra o seu país de origem na ${selectedContinent}! (Chances baseadas na demografia real)`;
        statusText.innerText = "Aguardando giro do país natal...";
        activateBox("box-country");
    } else if (currentStep === 2) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 3: Qual é a sua altura corporal como atleta profissional?`;
        statusText.innerText = "Aguardando giro da altura...";
        activateBox("box-height");
    } else if (currentStep === 3) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 4: Com qual idade você subiu das categorias de base para estrear no profissional?`;
        statusText.innerText = "Aguardando giro da idade de profissionalização...";
        activateBox("box-age");
    } else if (currentStep === 4) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 5: Qual será a sua posição de atuação nos gramados?`;
        statusText.innerText = "Aguardando giro da posição...";
        activateBox("box-position");
    } else if (currentStep === 5) {
        appTitle.innerText = "Carreira";
        const isGoleiro = selectedPosition && selectedPosition.name === "Goleiro";
        appSubtitle.innerText = `Etapa 6: Defina o seu atributo de ${isGoleiro ? "Tempo de Reação" : "Velocidade"}! (Rank de 1 a 10)`;
        statusText.innerText = `Aguardando giro d${isGoleiro ? "o tempo de reação" : "a velocidade"}...`;
        activateBox("box-speed");
        speedTableSection.classList.remove("hidden");
        updateTableVisibility();
    } else if (currentStep === 6) {
        appTitle.innerText = "Carreira";
        const isGoleiro = selectedPosition && selectedPosition.name === "Goleiro";
        appSubtitle.innerText = isGoleiro 
            ? `Etapa 7: Defina o seu nível de Impulsão! (Rank de 1 a 10)`
            : `Etapa 7: Defina o seu nível de Finalização no ataque! (Rank de 1 a 10)`;
        statusText.innerText = `Aguardando giro d${isGoleiro ? "a impulsão" : "a finalização"}...`;
        activateBox("box-finishing");
    } else if (currentStep === 7) {
        appTitle.innerText = "Carreira";
        const isGoleiro = selectedPosition && selectedPosition.name === "Goleiro";
        appSubtitle.innerText = isGoleiro
            ? `Etapa 8: Gire a roleta e defina o seu nível de Elasticidade! (Rank de 1 a 10)`
            : `Etapa 8: Gire a roleta e defina o seu nível de Drible! (Rank de 1 a 10)`;
        statusText.innerText = `Aguardando ${isGoleiro ? "elasticidade" : "drible"}...`;
        activateBox("box-dribbling");
    } else if (currentStep === 8) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 9: Gire a roleta e defina o seu nível de Passe! (Rank de 1 a 10)`;
        statusText.innerText = "Aguardando passe...";
        activateBox("box-passing");
    } else if (currentStep === 9) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 10: Gire a roleta e defina a sua Força Física! (Rank de 1 a 10)`;
        statusText.innerText = "Aguardando força física...";
        activateBox("box-strength");
    } else if (currentStep === 10) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 11: Defina o seu nível de Combate e Desarme na Defesa! (Rank de 1 a 10)`;
        statusText.innerText = "Aguardando defesa...";
        activateBox("box-defending");
    } else if (currentStep === 11) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 12: Jogou quantas temporadas na sua carreira profissional de futebol? (De 10 a 20 temporadas)`;
        statusText.innerText = "Aguardando sorteio de quantas temporadas jogou...";
        activateBox("box-seasons");
        seasonsTableSection.classList.remove("hidden"); // Show seasons ranking table!
        updateTableVisibility();
    } else if (currentStep === 12) {
        appTitle.innerText = "Carreira";
        appSubtitle.innerText = `Etapa 13: Em quantos clubes diferentes você jogará ao longo da sua carreira profissional?`;
        statusText.innerText = "Aguardando quantidade de clubes...";
        activateBox("box-clubs");
    } else if (currentStep === 13) {
        // Initialize Career Loop
        currentClubIndex = 0;
        currentSubStep = 0;
        remainingSeasons = parseInt(selectedSeasons.name.split(" ")[0]);
        totalClubsCount = parseInt(selectedClubs.name.split(" ")[0]);
        careerHistory = [];
        
        const timelineContainer = document.getElementById("timelineContainer");
        if (timelineContainer) {
            timelineContainer.innerHTML = '<div class="timeline-placeholder">Aguardando início da carreira...</div>';
        }
        
        startCareerSubStep();
        return; // Skip drawWheel inside transitionToStep
    }

    drawWheel();
    
    spinBtn.disabled = false;
    resetJourneyBtn.disabled = false;
}

// Sincronizar cartão ativo e centralizar rolagem horizontal no mobile
function syncMobileQuickStatsActive() {
    const stepToMobileCardId = {
        0: "m-box-origin",
        1: "m-box-origin",
        2: "m-box-height",
        3: "m-box-age",
        4: "m-box-position",
        5: "m-box-speed",
        6: "m-box-finishing",
        7: "m-box-dribbling",
        8: "m-box-passing",
        9: "m-box-strength",
        10: "m-box-defending",
        11: "m-box-seasons",
        12: "m-box-clubs",
        13: "m-box-clubs",
        14: "m-box-origin" // Na fase internacional, destaca o país/origem
    };

    // Remove active-step de todos os cartões móveis
    document.querySelectorAll(".quick-stat-card").forEach(c => c.classList.remove("active-step"));

    const activeCardId = stepToMobileCardId[currentStep];
    if (activeCardId) {
        const card = document.getElementById(activeCardId);
        if (card) {
            card.classList.add("active-step");
            
            // Centraliza o cartão ativo na barra de rolagem móvel
            const track = document.querySelector(".mobile-quick-stats-track");
            if (track) {
                const trackWidth = track.clientWidth;
                const cardLeft = card.offsetLeft;
                const cardWidth = card.clientWidth;
                track.scrollTo({
                    left: cardLeft - (trackWidth / 2) + (cardWidth / 2),
                    behavior: 'smooth'
                });
            }
        }
    }
}

function activateBox(boxId) {
    const box = document.getElementById(boxId);
    box.classList.add("active-step");
    box.querySelector(".box-placeholder").innerText = "Pendente";
}

// ==========================================
// FIFA ULTIMATE TEAM PLAYER CARD GENERATOR
// ==========================================

function getCountryFlag(countryName) {
    const flags = {
        "Nigéria": "🇳🇬", "Etiópia": "🇪🇹", "Egito": "🇪🇬", "R.D. Congo": "🇨🇩", "África do Sul": "🇿🇦", "Quênia": "🇰🇪",
        "Estados Unidos": "🇺🇸", "México": "🇲🇽", "Canadá": "🇨🇦", "Guatemala": "🇬🇹", "Cuba": "🇨🇺",
        "Brasil": "🇧🇷", "Colômbia": "🇨🇴", "Argentina": "🇦🇷", "Peru": "🇵🇪", "Venezuela": "🇻🇪", "Chile": "🇨🇱",
        "Índia": "🇮🇳", "China": "🇨🇳", "Indonésia": "🇮🇩", "Paquistão": "🇵🇰", "Bangladesh": "🇧🇩", "Japão": "🇯🇵", "Filipinas": "🇵🇭",
        "Rússia": "🇷🇺", "Alemanha": "🇩🇪", "Reino Unido": "🇬🇧", "França": "🇫🇷", "Itália": "🇮🇹", "Espanha": "🇪🇸", "Ucrânia": "🇺🇦",
        "Austrália": "🇦🇺", "Papua Nova Guiné": "🇵🇬", "Nova Zelândia": "🇳🇿", "Fiji": "🇫🇯"
    };
    return flags[countryName] || "🏳️";
}

function getClubCrestEmoji(teamName) {
    const crests = {
        "Flamengo": "🔴⚫", "Palmeiras": "🟢⚪", "São Paulo": "🔴⚪🖤", "Corinthians": "🖤⚪",
        "Grêmio": "🩵⚪🖤", "Atlético Mineiro": "🖤⚪", "Fluminense": "🔴💚", "Botafogo": "🖤⚪⭐",
        "Vasco da Gama": "🖤⚪💢", "Cruzeiro": "🔵🦊", "Internacional": "🔴⚪", "Santos": "⚪🖤🐋",
        "Athletico Paranaense": "🔴⚫🌪️", "Bahia": "🔵🔴⚪", "Fortaleza": "🔵🔴⚪", "Red Bull Bragantino": "🔴⚪🐂",
        "Vitória": "🔴⚫🦁", "Criciúma": "💛🖤🐯", "Juventude": "🟢⚪🍀", "Cuiabá": "🔰🐟",
        
        "Manchester City": "🩵⛵", "Arsenal": "🔴🔫", "Liverpool": "🔴🦁", "Manchester United": "🔴😈",
        "Chelsea": "🔵🦁", "Tottenham": "⚪🐓", "Aston Villa": "🦁🟪", "Newcastle United": "🖤⚪🦅",
        "West Ham United": "⚒️🟪", "Brighton & Hove Albion": "🔵⚪🕊️", "Wolverhampton Wanderers": "🐺💛",
        "Crystal Palace": "🦅🔵", "Fulham": "⚪🖤🛡️", "Everton": "🔵🛡️", "Brentford": "🐝🔴",
        "Nottingham Forest": "🌳🔴", "Bournemouth": "🍒🍒", "Leicester City": "🦊🦊", "Southampton": "🔴😇",
        
        "Real Madrid": "⚪👑", "Barcelona": "🔵🔴🏰", "Atlético de Madrid": "🔴⚪🛡️", "Real Sociedad": "🔵⚪👑",
        "Real Betis": "🟢⚪🌴", "Sevilla": "🔴⚪🛡️", "Athletic Bilbao": "🔴⚪🦁", "Girona": "🔴⚪🔴",
        "Valencia": "🦇🦇", "Villarreal": "💛💛🚢", "Osasuna": "🔴🐃", "Getafe": "🔵🔵",
        
        "Inter de Milão": "🔵⚫🐍", "Juventus": "🖤⚪🦓", "Milan": "🔴⚫😈", "Napoli": "🔵🔵🦧",
        "Roma": "🟨🔴🐺", "Lazio": "🩵🦅", "Atalanta": "🔵⚫👩", "Fiorentina": "💜⚜️",
        
        "Bayern de Munique": "🔴🔵🛡️", "Borussia Dortmund": "💛🖤🐝", "Bayer Leverkusen": "🔴🖤🦁",
        "RB Leipzig": "🔴⚪🐂", "Eintracht Frankfurt": "🦅🔴", "Stuttgart": "🔴⚪⚔️",
        
        "Paris Saint-Germain": "🔵🗼🔴", "Olympique de Marseille": "🩵⚪⭐", "Monaco": "🔴⚪👑",
        "Lyon": "🦁🦁", "Lille": "🐕🔴", "Lens": "🔴🟡⚒️",
        
        "Inter Miami": "🩷🦩", "LA Galaxy": "⚪🌌", "LAFC": "🖤💛👑", "New York City FC": "🩵🗽",
        "Seattle Sounders": "🟢🟢🌊", "Orlando City": "💜🦁", "Columbus Crew": "💛🖤🛡️"
    };
    return crests[teamName] || "⚽";
}

function getPlayerOVR() {
    const speed = parseInt(selectedSpeed.name.split("/")[0]) || 5;
    const finishing = parseInt(selectedFinishing.name.split("/")[0]) || 5;
    const dribbling = parseInt(selectedDribbling.name.split("/")[0]) || 5;
    const passing = parseInt(selectedPassing.name.split("/")[0]) || 5;
    const strength = parseInt(selectedStrength.name.split("/")[0]) || 5;
    const defending = parseInt(selectedDefending.name.split("/")[0]) || 5;
    
    const mapStat = (val) => Math.round(35 + val * 6.4);
    
    const stats = [
        mapStat(speed),
        mapStat(finishing),
        mapStat(dribbling),
        mapStat(passing),
        mapStat(strength),
        mapStat(defending)
    ];
    
    const avg = stats.reduce((sum, s) => sum + s, 0) / 6;
    return Math.max(45, Math.min(99, Math.round(avg)));
}

function getFUTStats() {
    const isGL = selectedPosition && selectedPosition.name === "Goleiro";
    const sSpeed = parseInt(selectedSpeed.name.split("/")[0]) || 5;
    const sFinishing = parseInt(selectedFinishing.name.split("/")[0]) || 5;
    const sDribbling = parseInt(selectedDribbling.name.split("/")[0]) || 5;
    const sPassing = parseInt(selectedPassing.name.split("/")[0]) || 5;
    const sStrength = parseInt(selectedStrength.name.split("/")[0]) || 5;
    const sDefending = parseInt(selectedDefending.name.split("/")[0]) || 5;
    
    const mapStat = (val) => Math.round(35 + val * 6.4);
    
    if (isGL) {
        const labelsGL = {
            pt: ["ELS", "IMP", "PAS", "REA", "DEF", "FOR"],
            en: ["DIV", "HAN", "KIC", "REF", "SPD", "POS"],
            es: ["EST", "MAN", "SAC", "REF", "VEL", "POS"],
            ja: ["DIV", "HAN", "KIC", "REF", "SPD", "POS"],
            zh: ["鱼跃", "手控", "开球", "反应", "速度", "防守"]
        };
        const langLabels = labelsGL[currentLang] || labelsGL["pt"];
        return [
            { val: mapStat(sDribbling), lbl: langLabels[0] },
            { val: mapStat(sFinishing), lbl: langLabels[1] },
            { val: mapStat(sPassing), lbl: langLabels[2] },
            { val: mapStat(sSpeed), lbl: langLabels[3] },
            { val: mapStat(sDefending), lbl: langLabels[4] },
            { val: mapStat(sStrength), lbl: langLabels[5] }
        ];
    } else {
        return [
            { val: mapStat(sSpeed), lbl: translate("futPAC") },      // Ritmo/Velocidade
            { val: mapStat(sFinishing), lbl: translate("futSHO") },  // Finalização
            { val: mapStat(sPassing), lbl: translate("futPAS") },    // Passe
            { val: mapStat(sDribbling), lbl: translate("futDRI") },  // Drible
            { val: mapStat(sDefending), lbl: translate("futDEF") },  // Defesa
            { val: mapStat(sStrength), lbl: translate("futPHY") }    // Físico/Força
        ];
    }
}

function getFUTAvatarEmoji() {
    if (ganhouBolaDeOuro) return "👑";
    if (selectedPosition) {
        const pos = selectedPosition.name;
        if (pos === "Goleiro") return "🧤";
        if (["Zagueiro", "Lateral Esquerdo", "Lateral Direito"].includes(pos)) return "🛡️";
        if (["Volante", "Meio-Campo", "Meia-Armador"].includes(pos)) return "🪄";
        if (["Ponta Esquerda", "Ponta Direita", "Centroavante"].includes(pos)) return "🔥";
    }
    return "🏃‍♂️";
}

// Generates structured HTML for the trophies gallery grouped by club/selection
function generateModalTrophiesHtml() {
    let html = '<div class="modal-trophies-list">';
    
    // Termos de troféus traduzidos
    const tLeague = currentLang === 'pt' ? 'Liga Nacional' : currentLang === 'en' ? 'National League' : currentLang === 'es' ? 'Liga Nacional' : currentLang === 'ja' ? '国内リーグ' : '国内顶级联赛';
    const tInter = currentLang === 'pt' ? 'Copa Intercontinental' : currentLang === 'en' ? 'Intercontinental Cup' : currentLang === 'es' ? 'Copa Intercontinental' : currentLang === 'ja' ? 'インターコンチネンタルカップ' : '丰田杯/洲际杯';
    const tWorld = currentLang === 'pt' ? 'Mundial de Clubes da FIFA' : currentLang === 'en' ? 'FIFA Club World Cup' : currentLang === 'es' ? 'Mundial de Clubes de la FIFA' : currentLang === 'ja' ? 'FIFAクラブワールドカップ' : '国际足联世俱杯';
    const tNone = currentLang === 'pt' ? 'Sem títulos oficiais conquistados' : currentLang === 'en' ? 'No official titles won' : currentLang === 'es' ? 'Sin títulos oficiales ganados' : currentLang === 'ja' ? '公式タイトル獲得なし' : '未赢得任何官方冠军';
    const tWc = currentLang === 'pt' ? 'Copa do Mundo da FIFA' : currentLang === 'en' ? 'FIFA World Cup' : currentLang === 'es' ? 'Copa Mundial de la FIFA' : currentLang === 'ja' ? 'FIFAワールドカップ' : '国际足联世界杯';
    const tSelNone = currentLang === 'pt' ? 'Convocado para a seleção (Sem títulos conquistados)' : currentLang === 'en' ? 'Called up to national team (No titles won)' : currentLang === 'es' ? 'Convocado a la selección (Sin títulos ganados)' : currentLang === 'ja' ? '代表招集 (タイトル獲得なし)' : '入选国家队 (未获得冠军)';
    const tBdor = currentLang === 'pt' ? 'Bola de Ouro (Melhor do Mundo)' : currentLang === 'en' ? 'Ballon d\'Or (World Player of the Year)' : currentLang === 'es' ? 'Balón de Oro (Mejor del Mundo)' : currentLang === 'ja' ? 'バロンドール (世界最優秀選手)' : '金球奖 (世界最佳球员)';

    // 1. Clubes
    careerHistory.forEach((rec, idx) => {
        let trophiesList = [];
        const cupName = getDomesticCupName(rec.league);
        const contName = rec.continentalTournament || getContinentalTournamentName(rec.league);
        
        // Tradução do nome do torneio de clubes
        let tCupName = cupName;
        if (currentLang === "en") tCupName = cupName.replace("Copa do ", "").replace("Copa de ", "") + " Cup";
        else if (currentLang === "ja") tCupName = cupName === "Copa do Brasil" ? "ブラジルカップ" : "カップ戦";
        else if (currentLang === "zh") tCupName = cupName === "Copa do Brasil" ? "巴西杯" : "国内杯赛";
        
        let tContName = translateContinentalTournamentName(contName, currentLang);
        
        if (rec.wonLeague && rec.leagueTitles > 0) {
            trophiesList.push(`<li><span class="trophy-icon">🏆</span> <strong>${rec.leagueTitles}x</strong> ${tLeague}</li>`);
        }
        if (rec.wonCup && rec.cupTitles > 0) {
            trophiesList.push(`<li><span class="trophy-icon">🏆</span> <strong>${rec.cupTitles}x</strong> ${tCupName}</li>`);
        }
        if (rec.wonContinental && rec.continentalTitles > 0) {
            trophiesList.push(`<li><span class="trophy-icon">🏆</span> <strong>${rec.continentalTitles}x</strong> ${tContName}</li>`);
        }
        if (rec.wonIntercontinental && rec.intercontinentalTitles > 0) {
            trophiesList.push(`<li><span class="trophy-icon">🌐</span> <strong>${rec.intercontinentalTitles}x</strong> ${tInter}</li>`);
        }
        if (rec.wonWorldClubCup && rec.worldClubCupTitles > 0) {
            trophiesList.push(`<li><span class="trophy-icon">👑</span> <strong>${rec.worldClubCupTitles}x</strong> ${tWorld}</li>`);
        }
        
        if (trophiesList.length === 0) {
            trophiesList.push(`<li><span class="trophy-icon" style="opacity: 0.45;">⚪</span> ${tNone}</li>`);
        }
        
        const activeLeagueObj = leagues.find(l => l.name === rec.league) || leagues[1];
        html += `
            <div class="modal-trophy-card">
                <div class="modal-trophy-card-header">
                    <span class="modal-trophy-club" style="color: ${activeLeagueObj.color}">${getClubCrestEmoji(rec.team.name)} ${rec.team.name}</span>
                    <span class="modal-trophy-duration">${rec.years} ${rec.years === 1 ? (currentLang === 'ja' || currentLang === 'zh' ? '年' : currentLang === 'en' ? 'year' : 'ano') : (currentLang === 'ja' || currentLang === 'zh' ? '年' : currentLang === 'en' ? 'years' : 'anos')}</span>
                </div>
                <div style="font-size: 0.68rem; color: var(--color-text-secondary); margin-bottom: 5px; text-align: left; padding-left: 0.4rem;">${translateTerm("continents", rec.league) || rec.league}</div>
                <ul class="modal-trophy-ul">
                    ${trophiesList.join("")}
                </ul>
            </div>
        `;
    });
    
    // 2. Seleção
    if (convocandoSelecao) {
        let selectionTrophies = [];
        const contNameSel = getContinentalSelectionTournamentName();
        const tContSelName = translateContinentalTournamentName(contNameSel, currentLang);
        
        if (ganhouContinentalSelecoes && titulosContinentalSelecoesCount > 0) {
            selectionTrophies.push(`<li><span class="trophy-icon">🏆</span> <strong>${titulosContinentalSelecoesCount}x</strong> ${tContSelName}</li>`);
        }
        if (ganhouCopaMundo && titulosCopaMundoCount > 0) {
            selectionTrophies.push(`<li><span class="trophy-icon">🏆</span> <strong>${titulosCopaMundoCount}x</strong> ${tWc}</li>`);
        }
        
        if (selectionTrophies.length === 0) {
            selectionTrophies.push(`<li><span class="trophy-icon" style="opacity: 0.45;">⚪</span> ${tSelNone}</li>`);
        }
        
        const selectionTitle = currentLang === 'pt' ? `Seleção de ${selectedCountry.name}` : currentLang === 'en' ? `${translateTerm("countries", selectedCountry.name)} National Team` : currentLang === 'es' ? `Selección de ${translateTerm("countries", selectedCountry.name)}` : currentLang === 'ja' ? `${translateTerm("countries", selectedCountry.name)}代表` : `${translateTerm("countries", selectedCountry.name)}国家队`;
        const durationText = currentLang === 'pt' ? 'Internacional' : currentLang === 'en' ? 'International' : currentLang === 'es' ? 'Internacional' : currentLang === 'ja' ? '代表キャリア' : '国家队生涯';

        html += `
            <div class="modal-trophy-card selection-card">
                <div class="modal-trophy-card-header">
                    <span class="modal-trophy-club" style="color: #60a5fa">🇺🇳 ${currentLang === 'pt' ? `Seleção de ${selectedCountry.name}` : currentLang === 'en' ? `${translateTerm("countries", selectedCountry.name)} National Team` : currentLang === 'es' ? `Selección de ${translateTerm("countries", selectedCountry.name)}` : currentLang === 'ja' ? `${translateTerm("countries", selectedCountry.name)}代表` : `${translateTerm("countries", selectedCountry.name)}国家队`} ${getCountryFlag(selectedCountry.name)}</span>
                    <span class="modal-trophy-duration">${durationText}</span>
                </div>
                <ul class="modal-trophy-ul">
                    ${selectionTrophies.join("")}
                </ul>
            </div>
        `;
    }
    
    // 3. Prêmios Individuais
    if (ganhouBolaDeOuro && bolaDeOuroCount > 0) {
        const indTitle = currentLang === 'pt' ? 'Prêmios Individuais' : currentLang === 'en' ? 'Individual Awards' : currentLang === 'es' ? 'Premios Individuales' : currentLang === 'ja' ? '個人賞' : '个人荣誉';
        const indDuration = currentLang === 'pt' ? 'Consagração' : currentLang === 'en' ? 'Consecration' : currentLang === 'es' ? 'Consagración' : currentLang === 'ja' ? '栄誉' : '殿堂荣誉';
        html += `
            <div class="modal-trophy-card individual-card">
                <div class="modal-trophy-card-header">
                    <span class="modal-trophy-club" style="color: #fbbf24">⭐ ${indTitle}</span>
                    <span class="modal-trophy-duration">${indDuration}</span>
                </div>
                <ul class="modal-trophy-ul">
                    <li><span class="trophy-icon">⭐</span> <strong>${bolaDeOuroCount}x</strong> ${tBdor}</li>
                </ul>
            </div>
        `;
    }
    
    // Se o histórico de carreira estiver totalmente vazio
    if (careerHistory.length === 0 && !convocandoSelecao && (!ganhouBolaDeOuro || bolaDeOuroCount === 0)) {
        html += `
            <div class="timeline-placeholder" style="padding: 3rem 1rem;">
                😔 ${currentLang === 'pt' ? 'Nenhuma informação de carreira disponível.' : currentLang === 'en' ? 'No career information available.' : currentLang === 'es' ? 'Ninguna información de carrera disponible.' : currentLang === 'ja' ? 'キャリア情報がありません。' : '暂无职业生涯信息。'}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// 11. Final Journey Revelations
function showFinalJourney() {
    // Render trophies list
    const trophiesGallery = document.getElementById("modalTrophiesGallery");
    if (trophiesGallery) {
        trophiesGallery.innerHTML = generateModalTrophiesHtml();
    }

    summaryContinent.innerText = translateTerm("continents", selectedContinent);
    summaryCountry.innerText = translateTerm("countries", selectedCountry.name);
    summaryHeight.innerText = getTranslatedHeightValue(selectedHeight.name);
    summaryAge.innerText = getTranslatedAgeValue(selectedAge.name);
    summaryPosition.innerText = translateTerm("positions", selectedPosition.name);
    
    // Função local para formatar e traduzir atributos do summary grid
    const formatAttr = (attrObj) => {
        const parts = attrObj.name.split(" - ");
        return parts[0] + " - " + translateTerm("attributes", parts[1]);
    };
    summarySpeed.innerText = formatAttr(selectedSpeed);
    summaryFinishing.innerText = formatAttr(selectedFinishing);
    summaryDribbling.innerText = formatAttr(selectedDribbling);
    summaryPassing.innerText = formatAttr(selectedPassing);
    summaryStrength.innerText = formatAttr(selectedStrength);
    summaryDefending.innerText = formatAttr(selectedDefending);
    summarySeasons.innerText = getTranslatedSeasonsValue(selectedSeasons.name);
    summaryClubs.innerText = getTranslatedClubsValue(selectedClubs.name);

    // Fetch and populate the 5 new summary items
    const summarySelection = document.getElementById("summarySelection");
    const summaryWorldCup = document.getElementById("summaryWorldCup");
    const summaryContinentalSelection = document.getElementById("summaryContinentalSelection");
    const summaryStats = document.getElementById("summaryStats");
    const summaryBallonDor = document.getElementById("summaryBallonDor");

    if (summarySelection) {
        summarySelection.innerText = convocandoSelecao 
            ? (currentLang === 'pt' ? "Convocado 🌟" : currentLang === 'en' ? "Called Up 🌟" : currentLang === 'es' ? "Convocado 🌟" : currentLang === 'ja' ? "招集 🌟" : "获得入选 🌟") 
            : (currentLang === 'pt' ? "Não convocado ❌" : currentLang === 'en' ? "Not Called ❌" : currentLang === 'es' ? "No convocado ❌" : currentLang === 'ja' ? "招集なし ❌" : "未获得入选 ❌");
        summarySelection.style.color = convocandoSelecao ? "#86efac" : "#fca5a5";
    }

    if (summaryWorldCup) {
        if (convocandoSelecao && jogouCopaMundo) {
            const labelCopas = currentLang === 'ja' ? '大会' : currentLang === 'zh' ? '届' : 'Copa(s)';
            summaryWorldCup.innerText = `${ganhouCopaMundo ? `${titulosCopaMundoCount}x 🏆` : "0x 🏆"} / ${quantidadeCopasDisputadas} ${labelCopas}`;
            summaryWorldCup.style.color = ganhouCopaMundo ? "#fef08a" : "#cbd5e1";
        } else {
            summaryWorldCup.innerText = currentLang === 'pt' ? "Não disputou ❌" : currentLang === 'en' ? "Didn't play ❌" : currentLang === 'es' ? "No disputó ❌" : currentLang === 'ja' ? "出場なし ❌" : "未参赛 ❌";
            summaryWorldCup.style.color = "#cbd5e1";
        }
    }

    if (summaryContinentalSelection) {
        const contName = getContinentalSelectionTournamentName();
        if (convocandoSelecao) {
            summaryContinentalSelection.innerText = `${ganhouContinentalSelecoes ? `${titulosContinentalSelecoesCount}x 🏆` : "0x 🏆"} ${contName.split(" ")[0]}`;
            summaryContinentalSelection.style.color = ganhouContinentalSelecoes ? "#fef08a" : "#cbd5e1";
        } else {
            summaryContinentalSelection.innerText = currentLang === 'pt' ? "Não disputou ❌" : currentLang === 'en' ? "Didn't play ❌" : currentLang === 'es' ? "No disputó ❌" : currentLang === 'ja' ? "出場なし ❌" : "未参赛 ❌";
            summaryContinentalSelection.style.color = "#cbd5e1";
        }
    }

    if (summaryStats) {
        const statsLabelG = currentLang === 'ja' ? '得点' : currentLang === 'zh' ? '进球' : 'G';
        const statsLabelA = currentLang === 'ja' ? 'アシスト' : currentLang === 'zh' ? '助攻' : 'A';
        if (selectedPosition && selectedPosition.name === "Goleiro") {
            summaryStats.innerText = `${selectedCareerGoals} ${statsLabelG} / ${selectedCareerAssists} ${statsLabelA} / ${selectedCareerCleanSheets} CS`;
        } else {
            summaryStats.innerText = `${selectedCareerGoals} ${statsLabelG} / ${selectedCareerAssists} ${statsLabelA}`;
        }
        summaryStats.style.color = "#cbd5e1";
    }

    if (summaryBallonDor) {
        summaryBallonDor.innerText = ganhouBolaDeOuro ? `${bolaDeOuroCount}x 🏆` : "0x 🏆";
        summaryBallonDor.style.color = ganhouBolaDeOuro ? "#fef08a" : "#cbd5e1";
    }

    let careerJourneyText = "";
    let totalLeaguesWon = 0;
    let totalCupsWon = 0;
    let totalContinentalsWon = 0;
    let totalIntercontinentalsWon = 0;
    let totalWorldClubCupsWon = 0;

    const template = bioTemplates[currentLang] || bioTemplates["pt"];

    careerHistory.forEach((rec, idx) => {
        const clubNum = idx + 1;
        const cupName = getDomesticCupName(rec.league);
        const contName = rec.continentalTournament || getContinentalTournamentName(rec.league);
        
        let trophies = [];
        
        let translatedCupName = cupName;
        if (currentLang === "en") {
            translatedCupName = cupName.replace("Copa do ", "").replace("Copa de ", "") + " Cup";
        } else if (currentLang === "ja") {
            translatedCupName = cupName === "Copa do Brasil" ? "ブラジルカップ" : "カップ戦";
        } else if (currentLang === "zh") {
            translatedCupName = cupName === "Copa do Brasil" ? "巴西杯" : "国内杯赛";
        }
        
        let translatedContName = translateContinentalTournamentName(contName, currentLang);

        if (rec.wonLeague) {
            const term = currentLang === "pt" ? `${rec.leagueTitles}x Campeão da Liga` 
                        : currentLang === "en" ? `${rec.leagueTitles}x League Champion`
                        : currentLang === "es" ? `${rec.leagueTitles}x Campeón de Liga`
                        : currentLang === "ja" ? `リーグ優勝 ${rec.leagueTitles}回`
                        : `联赛冠军 ${rec.leagueTitles}次`;
            trophies.push(`<strong class="hl-gold">${term}</strong>`);
            totalLeaguesWon += rec.leagueTitles;
        }
        if (rec.wonCup) {
            const term = currentLang === "pt" ? `${rec.cupTitles}x Campeão da ${cupName}` 
                        : currentLang === "en" ? `${rec.cupTitles}x ${translatedCupName} Champion`
                        : currentLang === "es" ? `${rec.cupTitles}x Campeón de la ${cupName}`
                        : currentLang === "ja" ? `${translatedCupName}優勝 ${rec.cupTitles}回`
                        : `${translatedCupName}冠军 ${rec.cupTitles}次`;
            trophies.push(`<strong class="hl-gold">${term}</strong>`);
            totalCupsWon += rec.cupTitles;
        }
        if (rec.wonContinental) {
            const term = currentLang === "pt" ? `${rec.continentalTitles}x Campeão da ${contName}` 
                        : currentLang === "en" ? `${rec.continentalTitles}x ${translatedContName} Champion`
                        : currentLang === "es" ? `${rec.continentalTitles}x Campeón de la ${contName}`
                        : currentLang === "ja" ? `${translatedContName}優勝 ${rec.continentalTitles}回`
                        : `${translatedContName}冠军 ${rec.continentalTitles}次`;
            trophies.push(`<strong class="hl-gold">${term}</strong>`);
            totalContinentalsWon += rec.continentalTitles;
        }
        if (rec.wonIntercontinental) {
            const term = currentLang === "pt" ? `${rec.intercontinentalTitles}x Campeão da Copa Intercontinental` 
                        : currentLang === "en" ? `${rec.intercontinentalTitles}x Intercontinental Cup Champion`
                        : currentLang === "es" ? `${rec.intercontinentalTitles}x Campeón de la Copa Intercontinental`
                        : currentLang === "ja" ? `インターコンチネンタルカップ優勝 ${rec.intercontinentalTitles}回`
                        : `丰田杯/洲际杯冠军 ${rec.intercontinentalTitles}次`;
            trophies.push(`<strong class="hl-gold">${term}</strong>`);
            totalIntercontinentalsWon += rec.intercontinentalTitles;
        }
        if (rec.wonWorldClubCup) {
            const term = currentLang === "pt" ? `${rec.worldClubCupTitles}x Campeão do Mundial de Clubes da FIFA` 
                        : currentLang === "en" ? `${rec.worldClubCupTitles}x FIFA Club World Cup Champion`
                        : currentLang === "es" ? `${rec.worldClubCupTitles}x Campeón del Mundial de Clubes de la FIFA`
                        : currentLang === "ja" ? `FIFAクラブワールドカップ優勝 ${rec.worldClubCupTitles}回`
                        : `世俱杯冠军 ${rec.worldClubCupTitles}次`;
            trophies.push(`<strong class="hl-gold">${term}</strong>`);
            totalWorldClubCupsWon += rec.worldClubCupTitles;
        }
        
        let listStr = trophies.join(", ");
        let trophyStr = trophies.length > 0 
            ? template.trophyWonList.replace("{list}", listStr)
            : template.noTrophiesText;
            
        let evolutionStr = rec.improvedAttributes 
            ? template.evolvedText.replace("{num}", rec.numImproved).replace("{attrText}", rec.numImproved === 1 ? template.attrSingular : template.attrPlural)
            : template.noEvolutionText;
            
        let yearsText = rec.years === 1 ? template.yearsSingular : template.yearsPlural;
        
        let itemHtml = template.clubJourneyItem
            .replace("{clubNum}", clubNum)
            .replace("{teamName}", rec.team.name)
            .replace("{leagueName}", translateTerm("continents", rec.league) || rec.league.replace(/\s*\(.*?\)/, ""))
            .replace("{years}", rec.years)
            .replace("{yearsText}", yearsText)
            .replace("{trophyStr}", trophyStr)
            .replace("{evolutionStr}", evolutionStr);
            
        careerJourneyText += itemHtml;
    });

    const finalTeamObj = careerHistory[careerHistory.length - 1];
    
    // Club narrative
    let clubStory = template.clubStoryStart
        .replace("{continent}", translateTerm("continents", selectedContinent))
        .replace("{country}", translateTerm("countries", selectedCountry.name))
        .replace("{countryDesc}", getTranslatedCountryDesc(selectedCountry.name, currentLang))
        .replace("{height}", getTranslatedHeightValue(selectedHeight.name))
        .replace("{heightDesc}", getTranslatedHeightDesc(selectedHeight.desc, currentLang))
        .replace("{age}", getTranslatedAgeValue(selectedAge.name))
        .replace("{ageDesc}", getTranslatedAgeDesc(selectedAge.desc, currentLang))
        .replace("{position}", translateTerm("positions", selectedPosition.name))
        .replace("{positionDesc}", getTranslatedPositionDesc(selectedPosition.name, currentLang))
        .replace("{seasons}", getTranslatedSeasonsValue(selectedSeasons.name))
        .replace("{clubs}", getTranslatedClubsValue(selectedClubs.name))
        + careerJourneyText + "<br><br>";
        
    // International narrative
    let internationalStory = "";
    if (convocandoSelecao) {
        internationalStory += template.intCallUp.replace("{country}", translateTerm("countries", selectedCountry.name));
        
        if (jogouCopaMundo) {
            let edText = quantidadeCopasDisputadas === 1 ? template.editionSingular : template.editionPlural;
            internationalStory += template.wcPlayed.replace("{wcEditions}", quantidadeCopasDisputadas).replace("{editionText}", edText);
            
            if (ganhouCopaMundo) {
                let timesText = titulosCopaMundoCount === 1 ? template.timesSingular : template.timesPlural;
                internationalStory += template.wcWon.replace("{wcCount}", titulosCopaMundoCount).replace("{timesText}", timesText);
            } else {
                internationalStory += template.wcNotWon;
            }
        } else {
            internationalStory += template.wcNotPlayed;
        }
        
        const contName = getContinentalSelectionTournamentName();
        const translatedContName = translateContinentalTournamentName(contName, currentLang);
        
        if (ganhouContinentalSelecoes) {
            let timesText = titulosContinentalSelecoesCount === 1 ? template.timesSingular : template.timesPlural;
            internationalStory += template.contWon.replace("{contName}", translatedContName).replace("{contCount}", titulosContinentalSelecoesCount).replace("{timesText}", timesText);
        } else {
            internationalStory += template.contNotWon.replace("{contName}", translatedContName);
        }
    } else {
        internationalStory += template.intNoCallUp.replace("{country}", translateTerm("countries", selectedCountry.name));
    }
    internationalStory += "<br><br>";
    
    // Goals & Assists narrative
    let statsStory = "";
    if (selectedPosition && selectedPosition.name === "Goleiro") {
        statsStory = template.statsGoleiro
            .replace("{goals}", selectedCareerGoals)
            .replace("{assists}", selectedCareerAssists)
            .replace("{cleanSheets}", selectedCareerCleanSheets);
    } else {
        statsStory = template.statsLinePlayer
            .replace("{goals}", selectedCareerGoals)
            .replace("{assists}", selectedCareerAssists);
    }
    
    // Ballon d'Or and Individual Climax
    let awardsStory = "";
    if (ganhouBolaDeOuro) {
        const timesText = bolaDeOuroCount === 1 ? template.timesSingular : template.timesPlural;
        awardsStory = template.ballonDorWon
            .replace("{bCount}", bolaDeOuroCount)
            .replace("{timesText}", timesText);
    } else {
        awardsStory = template.ballonDorNotWon;
    }
    
    const isGoleiro = selectedPosition && selectedPosition.name === "Goleiro";
    const speedAttrName = getTranslatedAttributeName(isGoleiro ? "Tempo de Reação" : "Velocidade", isGoleiro, currentLang);
    const finishingAttrName = getTranslatedAttributeName(isGoleiro ? "Impulsão" : "Finalização", isGoleiro, currentLang);
    const dribblingAttrName = getTranslatedAttributeName(isGoleiro ? "Elasticidade" : "Drible", isGoleiro, currentLang);
 
    let retirementText = "";
    if (selectedRetirementReason) {
        const transReasonName = getTranslatedRetirementReasonName(selectedRetirementReason.name);
        const transReasonDesc = getTranslatedRetirementDesc(selectedRetirementReason.name, selectedRetirementReason.desc, currentLang);
        retirementText = template.retirementText
            .replace("{reasonName}", transReasonName)
            .replace("{reasonDesc}", transReasonDesc);
    }

    let epilogueStory = template.epilogueText
        .replace("{finalTeam}", finalTeamObj.team.name)
        .replace("{leagues}", totalLeaguesWon)
        .replace("{cups}", totalCupsWon)
        .replace("{continentals}", totalContinentalsWon)
        .replace("{intercontinentals}", totalIntercontinentalsWon)
        .replace("{worldClubCups}", totalWorldClubCupsWon)
        .replace("{speedName}", speedAttrName)
        .replace("{speedVal}", selectedSpeed.name.split(" ")[0])
        .replace("{finishingName}", finishingAttrName)
        .replace("{finishingVal}", selectedFinishing.name.split(" ")[0])
        .replace("{dribblingName}", dribblingAttrName)
        .replace("{dribblingVal}", selectedDribbling.name.split(" ")[0])
        .replace("{passingVal}", selectedPassing.name.split(" ")[0])
        .replace("{strengthVal}", selectedStrength.name.split(" ")[0])
        .replace("{defendingVal}", selectedDefending.name.split(" ")[0]);

    const story = `${clubStory}${internationalStory}${statsStory}${awardsStory}${retirementText}${epilogueStory}`;
    
    destinyStory.innerHTML = story;

    // FUT Card Generation
    const cardContainer = document.getElementById("fifaCardContainer");
    if (cardContainer) {
        const ovr = getPlayerOVR();
        const flag = getCountryFlag(selectedCountry.name);
        
        // Final Club details
        const lastClubName = finalTeamObj ? finalTeamObj.team.name : "";
        const clubCrest = getClubCrestEmoji(lastClubName);
        
        // Position Abbreviation
        const posKeyMap = {
            "Goleiro": "posGL", "Zagueiro": "posZAG", "Lateral Esquerdo": "posLE", "Lateral Direito": "posLD",
            "Volante": "posVOL", "Meio-Campo": "posMC", "Meia-Armador": "posMEI", "Ponta Esquerda": "posPE",
            "Ponta Direita": "posPD", "Centroavante": "posATA"
        };
        const posKey = posKeyMap[selectedPosition.name] || "posCRA";
        const posAbbr = translate(posKey, "CRA");
        
        // Card Rarity Class
        let rarityClass = "card-bronze";
        const avgAttrVal = getPlayerAverageAttribute();
        if (ganhouBolaDeOuro || avgAttrVal >= 9.0) {
            rarityClass = "card-icon";
        } else if (ovr >= 80) {
            rarityClass = "card-gold";
        } else if (ovr >= 60) {
            rarityClass = "card-silver";
        }
        
        // Stats
        const futStats = getFUTStats();
        
        // Trophies Badges inside the card
        let totalClubTrophies = totalLeaguesWon + totalCupsWon + totalContinentalsWon + totalIntercontinentalsWon + totalWorldClubCupsWon;
        let badgesHtml = "";
        
        const titleWc = currentLang === 'pt' ? 'Copa do Mundo' : currentLang === 'en' ? 'World Cup' : currentLang === 'es' ? 'Copa del Mundo' : currentLang === 'ja' ? 'ワールドカップ' : '世界杯';
        const titleBdor = currentLang === 'pt' ? 'Bola de Ouro' : currentLang === 'en' ? 'Ballon d\'Or' : currentLang === 'es' ? 'Balón de Oro' : currentLang === 'ja' ? 'バロンドール' : '金球奖';
        const titleClubTr = currentLang === 'pt' ? 'Títulos por Clubes' : currentLang === 'en' ? 'Club Trophies' : currentLang === 'es' ? 'Títulos de Clubes' : currentLang === 'ja' ? 'クラブタイトル数' : '俱乐部冠军数';

        if (ganhouCopaMundo && titulosCopaMundoCount > 0) {
            badgesHtml += `<div class="fut-card-trophy-badge" title="${titleWc}">🏆 <span>${titulosCopaMundoCount}</span></div>`;
        }
        if (ganhouBolaDeOuro && bolaDeOuroCount > 0) {
            badgesHtml += `<div class="fut-card-trophy-badge" title="${titleBdor}">⭐ <span>${bolaDeOuroCount}</span></div>`;
        }
        if (totalClubTrophies > 0) {
            badgesHtml += `<div class="fut-card-trophy-badge" title="${titleClubTr}">👑 <span>${totalClubTrophies}</span></div>`;
        }
        
        const avatarEmoji = getFUTAvatarEmoji();
        const placeholderName = currentLang === 'pt' ? 'SEU NOME' : currentLang === 'en' ? 'YOUR NAME' : currentLang === 'es' ? 'TU NOMBRE' : currentLang === 'ja' ? 'あなたの名前' : '你的名字';
        const insiraName = currentLang === 'pt' ? 'INSIRA SEU NOME' : currentLang === 'en' ? 'ENTER YOUR NAME' : currentLang === 'es' ? 'INGRESA TU NOMBRE' : currentLang === 'ja' ? '名前を入力してください' : '输入你的名字';

        let displayCardName = playerCardName;
        if (displayCardName === "INSIRA SEU NOME") {
            displayCardName = placeholderName;
        }
        
        cardContainer.innerHTML = `
            <div class="fut-card-container ${rarityClass}">
                <div class="fut-card">
                    <!-- Top details: OVR, Position, Flag, Club Crest -->
                    <div class="fut-card-header">
                        <div class="fut-card-badge-col">
                            <span class="fut-card-ovr">${ovr}</span>
                            <span class="fut-card-pos">${posAbbr}</span>
                            <span class="fut-card-flag" title="${selectedCountry.name}">${flag}</span>
                            <span class="fut-card-crest" title="${lastClubName}">${clubCrest}</span>
                        </div>
                        <div class="fut-card-avatar-wrapper">
                            <div class="fut-card-avatar-bg"></div>
                            <span class="fut-card-avatar-emoji">${avatarEmoji}</span>
                        </div>
                    </div>
                    
                    <!-- Player Name (Editable Input) -->
                    <input type="text" class="fut-card-name-input" id="futCardNameInput" value="${displayCardName}" placeholder="${placeholderName}" maxlength="14" autocomplete="off" spellcheck="false" />
                    
                    <!-- 6 Stats Columns -->
                    <div class="fut-card-stats">
                        <div class="fut-card-stats-col">
                            <div class="fut-card-stat-item">
                                <span class="fut-card-stat-val">${futStats[0].val}</span>
                                <span class="fut-card-stat-lbl">${futStats[0].lbl}</span>
                            </div>
                            <div class="fut-card-stat-item">
                                <span class="fut-card-stat-val">${futStats[1].val}</span>
                                <span class="fut-card-stat-lbl">${futStats[1].lbl}</span>
                            </div>
                            <div class="fut-card-stat-item">
                                <span class="fut-card-stat-val">${futStats[2].val}</span>
                                <span class="fut-card-stat-lbl">${futStats[2].lbl}</span>
                            </div>
                        </div>
                        
                        <div class="fut-card-stats-divider"></div>
                        
                        <div class="fut-card-stats-col">
                            <div class="fut-card-stat-item">
                                <span class="fut-card-stat-val">${futStats[3].val}</span>
                                <span class="fut-card-stat-lbl">${futStats[3].lbl}</span>
                            </div>
                            <div class="fut-card-stat-item">
                                <span class="fut-card-stat-val">${futStats[4].val}</span>
                                <span class="fut-card-stat-lbl">${futStats[4].lbl}</span>
                            </div>
                            <div class="fut-card-stat-item">
                                <span class="fut-card-stat-val">${futStats[5].val}</span>
                                <span class="fut-card-stat-lbl">${futStats[5].lbl}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Trophies Badges -->
                    <div class="fut-card-trophies">
                        ${badgesHtml || `<div class="fut-card-trophy-badge" title="${titleClubTr}">⚽ <span>0</span></div>`}
                    </div>
                </div>
            </div>
        `;
        
        // Listen to edits on the player card name input
        const nameInput = document.getElementById("futCardNameInput");
        if (nameInput) {
            nameInput.addEventListener("input", (e) => {
                playerCardName = e.target.value.toUpperCase();
            });
            nameInput.addEventListener("focus", (e) => {
                if (e.target.value === placeholderName || e.target.value === "INSIRA SEU NOME" || e.target.value === insiraName) {
                    e.target.value = "";
                }
            });
            nameInput.addEventListener("blur", (e) => {
                if (e.target.value.trim() === "") {
                    e.target.value = placeholderName;
                    playerCardName = "INSIRA SEU NOME";
                }
            });
        }
    }
 
    resultModal.classList.remove("hidden");
    startConfetti();
}

function resetWholeJourney() {
    resultModal.classList.add("hidden");
    stopConfetti();
    
    isWaitingToAdvance = false;
    nextAdvanceCallback = null;
    playerCardName = "INSIRA SEU NOME";
    
    currentStep = 0;
    selectedContinent = null;
    selectedCountry = null;
    selectedHeight = null;
    selectedAge = null;
    selectedPosition = null;
    selectedSpeed = null;
    selectedFinishing = null;
    selectedDribbling = null;
    selectedPassing = null;
    selectedStrength = null;
    selectedDefending = null;
    selectedSeasons = null;
    selectedClubs = null;

    // Reset Career Loop State Variables
    selectedCareerLeague = null;
    selectedCareerTeam = null;
    selectedCareerYears = 0;
    wonLeague = false;
    leagueTitlesCount = 0;
    wonCup = false;
    cupTitlesCount = 0;
    wonContinental = false;
    continentalTitlesCount = 0;
    selectedContinentalTournament = null;
    wonIntercontinental = false;
    intercontinentalTitlesCount = 0;
    wonWorldClubCup = false;
    worldClubCupTitlesCount = 0;
    improvedAttributes = false;
    numImprovedAttributes = 0;
    remainingAttributeImprovements = 0;
    currentClubIndex = 0;
    currentSubStep = 0;
    remainingSeasons = 0;
    totalClubsCount = 0;
    careerHistory = [];

    // Reset Realistic Calendar, Dual Cup & Retirement Variables
    currentCalendarYear = 2026;
    globalTopTierWinningYears = [];
    intercontinentalEligibleCount = 0;
    cwcEligibleCount = 0;
    selectedRetirementReason = null;

    // Reset Step 14 variables
    convocandoSelecao = false;
    jogouCopaMundo = false;
    quantidadeCopasDisputadas = 0;
    ganhouContinentalSelecoes = false;
    titulosContinentalSelecoesCount = 0;
    ganhouCopaMundo = false;
    titulosCopaMundoCount = 0;
    ganhouBolaDeOuro = false;
    bolaDeOuroCount = 0;
    selectedCareerGoals = 0;
    selectedCareerAssists = 0;
    selectedGoalsRange = null;
    selectedAssistsRange = null;
    selectedCareerCleanSheets = 0;
    selectedCleanSheetsRange = null;
    
    resetResultBoxes();
    
    // Clear Timeline Container
    const timelineContainer = document.getElementById("timelineContainer");
    if (timelineContainer) {
        timelineContainer.innerHTML = '<div class="timeline-placeholder">Aguardando início da carreira...</div>';
    }
    
    speedTableSection.classList.add("hidden");
    seasonsTableSection.classList.add("hidden");
    updateTableVisibility();
    document.querySelectorAll(".speed-rarity-table tbody tr").forEach(tr => tr.classList.remove("active-row"));
    
    document.getElementById("box-continent").classList.add("active-step");
    
    appTitle.innerText = "Carreira";
    appSubtitle.innerText = "Etapa 1: Gire a roleta para descobrir em qual continente você irá nascer!";
    statusText.innerText = "Aguardando giro do continente...";
    
    canvas.style.transition = "none";
    canvas.style.transform = "rotate(0deg)";
    currentAngle = 0;
    
    drawWheel();
    
    spinBtn.innerHTML = "<span>GIRAR</span>";
    spinBtn.disabled = false;
    resetJourneyBtn.disabled = true;
}

// ==========================================
// 11.5. CAREER LOOP IMPLEMENTATION
// ==========================================

// 1. Team Strength Classifier (1 to 5 stars)
function getTeamStrength(teamName) {
    const stars5 = ["Flamengo", "Palmeiras", "Manchester City", "Real Madrid", "Bayern de Munique", "Paris Saint-Germain", "Inter Miami", "Al-Hilal", "Al-Nassr"];
    const stars4 = ["São Paulo", "Atlético Mineiro", "Arsenal", "Liverpool", "Manchester United", "Barcelona", "Atlético de Madrid", "Inter de Milão", "Juventus", "Milan", "Borussia Dortmund", "Bayer Leverkusen", "Monaco", "Lyon", "LA Galaxy", "LAFC", "Al-Ittihad", "Al-Ahli", "Al-Shabab"];
    const stars3 = ["Fluminense", "Cruzeiro", "Grêmio", "Tottenham", "Chelsea", "Newcastle United", "Aston Villa", "Sevilla", "Real Sociedad", "Athletic Bilbao", "Roma", "Lazio", "Atalanta", "RB Leipzig", "Eintracht Frankfurt", "Stuttgart", "Lille", "Lens", "Columbus Crew", "Seattle Sounders", "Al-Ettifaq", "Al-Taawoun", "Al-Fateh", "Al-Qadsiah"];
    const stars2 = ["Botafogo", "Vasco da Gama", "Santos", "Athletico Paranaense", "Red Bull Bragantino", "Bahia", "Fortaleza", "West Ham United", "Brighton & Hove Albion", "Everton", "Valencia", "Villarreal", "Real Betis", "Napoli", "Fiorentina", "Bologna", "Torino", "Genoa", "Wolfsburg", "Freiburg", "Werder Bremen", "Nice", "Rennes", "Reims", "Orlando City", "Atlanta United", "New York City FC", "Al-Khaleej", "Al-Wehda", "Al-Fayha", "Damac", "Al-Raed", "Al-Tai"];

    if (stars5.includes(teamName)) return 5;
    if (stars4.includes(teamName)) return 4;
    if (stars3.includes(teamName)) return 3;
    if (stars2.includes(teamName)) return 2;
    return 1;
}

// 2. Dynamic Tournament Names & League Option Weighting
function getHomeLeague() {
    if (!selectedCountry) return null;
    const country = selectedCountry.name;
    
    // Direct domestic mappings
    if (country === "Brasil") return "🇧🇷 Brasileirão (BRA)";
    if (country === "Reino Unido" || country === "Inglaterra") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (ING)";
    if (country === "Espanha") return "🇪🇸 La Liga (ESP)";
    if (country === "Itália") return "🇮🇹 Serie A (ITA)";
    if (country === "Alemanha") return "🇩🇪 Bundesliga (ALE)";
    if (country === "França") return "🇫🇷 Ligue 1 (FRA)";
    if (country === "Estados Unidos") return "🇺🇸 MLS (EUA)";
    if (country === "México") return "🇲🇽 Liga MX (MEX)";
    if (country === "Argentina") return "🇦🇷 Liga Profesional (ARG)";
    if (country === "Japão") return "🇯🇵 J1 League (JPN)";
    if (country === "Rússia") return "🇷🇺 Premier League (RUS)";
    if (country === "Arábia Saudita") return "🇸🇦 Saudi Pro League (SAU)";
    
    // Regional/Traditional gateway mapping for countries whose domestic leagues were removed
    // North America -> MLS
    if (country === "Canadá") return "🇺🇸 MLS (EUA)";
    
    // Central America -> Liga MX (Mexico)
    if (["Guatemala", "Cuba"].includes(country)) return "🇲🇽 Liga MX (MEX)";
    
    // South America -> Liga Profesional (Argentina)
    if (["Colômbia", "Peru", "Venezuela", "Chile"].includes(country)) return "🇦🇷 Liga Profesional (ARG)";
    
    // Africa -> Ligue 1 (FRA) (Traditional gateway for African players to Europe)
    if (["Nigéria", "Etiópia", "Egito", "R.D. Congo", "África do Sul", "Quênia"].includes(country)) return "🇫🇷 Ligue 1 (FRA)";
    
    // Asia & Oceania -> J1 League (JPN) (Top AFC league)
    if (["Índia", "China", "Indonésia", "Paquistão", "Bangladesh", "Filipinas", "Austrália", "Papua Nova Guiné", "Nova Zelândia", "Fiji"].includes(country)) return "🇯🇵 J1 League (JPN)";
    
    // Eastern Europe -> Russian Premier League
    if (country === "Ucrânia") return "🇷🇺 Premier League (RUS)";
    
    return "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (ING)";
}

function getLeagueOptionsWithWeights() {
    const homeLeague = getHomeLeague();
    const sumAttr = getPlayerAverageAttribute() * 6;
    
    return leagues.map(league => {
        const isEliteLeague = [
            "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (ING)",
            "🇪🇸 La Liga (ESP)",
            "🇮🇹 Serie A (ITA)",
            "🇩🇪 Bundesliga (ALE)",
            "🇫🇷 Ligue 1 (FRA)",
            "🇧🇷 Brasileirão (BRA)"
        ].includes(league.name);
        
        let weight = isEliteLeague ? 25 : 10; // Base: elite leagues are favored
        
        // Apply attribute-based reputation multipliers
        if (sumAttr >= 48) {
            // World Class player: elite leagues are highly likely
            weight = isEliteLeague ? 60 : 5;
        } else if (sumAttr >= 36) {
            // Very Good player: elite leagues are favored
            weight = isEliteLeague ? 40 : 8;
        } else if (sumAttr <= 24) {
            // Poor player: non-elite leagues are much more likely
            weight = isEliteLeague ? 6 : 15;
        }
        
        // On the very first contract spin, if there is a home league, give it a massive boost!
        if (currentClubIndex === 0 && homeLeague && league.name === homeLeague) {
            weight = 250; // Ensure home league dominates the wheel on debut
        }
        
        return { ...league, weight: weight };
    });
}

function getTeamOptionsWithWeights(rawTeams, leagueName) {
    const sumAttr = getPlayerAverageAttribute() * 6;
    
    return rawTeams.map(team => {
        let teamObj = team;
        if (typeof team === 'string') {
            teamObj = { name: team, desc: getTeamDescription(team, leagueName) };
        }
        
        const strength = getTeamStrength(teamObj.name);
        let weight = 10; // Base weight
        
        if (sumAttr >= 48) {
            // World Class player: giants covet you
            if (strength === 5) weight = 45;
            else if (strength === 4) weight = 30;
            else if (strength === 3) weight = 15;
            else if (strength === 2) weight = 5;
            else weight = 2;
        } else if (sumAttr >= 36) {
            // Very Good player: high interest from top clubs
            if (strength === 5) weight = 30;
            else if (strength === 4) weight = 25;
            else if (strength === 3) weight = 18;
            else if (strength === 2) weight = 8;
            else weight = 4;
        } else if (sumAttr <= 24) {
            // Poor player: giants ignore you, must start in lower-tier clubs
            if (strength === 5) weight = 1;
            else if (strength === 4) weight = 3;
            else if (strength === 3) weight = 8;
            else if (strength === 2) weight = 20;
            else weight = 25;
        } else {
            // Mediano/Bom player: balanced scouting
            if (strength === 5) weight = 10;
            else if (strength === 4) weight = 12;
            else if (strength === 3) weight = 15;
            else if (strength === 2) weight = 12;
            else weight = 10;
        }
        
        return { ...teamObj, weight: weight };
    });
}

function getDomesticCupName(leagueName) {
    if (leagueName.includes("Brasileirão")) return "Copa do Brasil";
    if (leagueName.includes("Premier League")) return "FA Cup";
    if (leagueName.includes("La Liga")) return "Copa del Rey";
    if (leagueName.includes("Serie A")) return "Coppa Italia";
    if (leagueName.includes("Bundesliga")) return "DFB-Pokal";
    if (leagueName.includes("Ligue 1")) return "Coupe de France";
    if (leagueName.includes("MLS")) return "US Open Cup";
    if (leagueName.includes("Liga Profesional")) return "Copa Argentina";
    if (leagueName.includes("Liga MX")) return "Copa MX";
    if (leagueName.includes("J1 League")) return "Copa do Imperador";
    if (leagueName.includes("Liga Dimayor")) return "Copa Colombia";
    if (leagueName.includes("Saudi Pro League")) return "Copa do Rei";
    
    // Country codes mapping for generic names
    const countryMatch = leagueName.match(/\((.*?)\)/);
    if (countryMatch) {
        const code = countryMatch[1];
        if (code === "NGA") return "Copa da Nigéria";
        if (code === "RSA") return "Nedbank Cup";
        if (code === "CAN") return "Campeonato Canadense";
        if (code === "RUS") return "Copa da Rússia";
        if (code === "UKR") return "Copa da Ucrânia";
        if (code === "AUS") return "Australia Cup";
    }
    
    return "Copa Nacional";
}

function getContinentalTournamentName(leagueName) {
    const countryMatch = leagueName.match(/\((.*?)\)/);
    if (!countryMatch) return "Torneio Continental";
    const code = countryMatch[1];
    
    // South America (CONMEBOL)
    if (["BRA", "ARG", "COL", "PER", "VEN", "CHI"].includes(code)) {
        return "Copa Libertadores";
    }
    // Europe (UEFA)
    if (["ING", "ESP", "ITA", "ALE", "FRA", "RUS", "UKR"].includes(code)) {
        return "UEFA Champions League";
    }
    // North America (CONCACAF)
    if (["EUA", "MEX", "CAN", "GUA", "CUB"].includes(code)) {
        return "Concacaf Champions Cup";
    }
    // Africa (CAF)
    if (["NGA", "ETH", "EGY", "COD", "RSA", "KEN"].includes(code)) {
        return "CAF Champions League";
    }
    // Asia/Australia (AFC)
    if (["IND", "CHN", "IDN", "PAK", "BGD", "JPN", "PHI", "AUS"].includes(code)) {
        return "AFC Champions League";
    }
    // Oceania (OFC)
    if (["PNG", "NZL", "FJI"].includes(code)) {
        return "OFC Champions League";
    }
    
    return "Torneio Continental";
}

function getContinentalTournamentOptions() {
    if (!selectedCareerLeague || !selectedCareerTeam) return [];
    
    const countryMatch = selectedCareerLeague.match(/\((.*?)\)/);
    const code = countryMatch ? countryMatch[1] : "Generic";
    
    const averageAttr = getPlayerAverageAttribute();
    const clubStrength = getTeamStrength(selectedCareerTeam.name);
    const score = averageAttr + (clubStrength * 1.5);
    
    let options = [];
    
    // Europe (UEFA)
    if (["ING", "ESP", "ITA", "ALE", "FRA", "RUS", "UKR"].includes(code)) {
        let wChampions = 10;
        let wEuropa = 40;
        let wConference = 50;
        
        if (score >= 13) {
            wChampions = 65;
            wEuropa = 25;
            wConference = 10;
        } else if (score >= 9) {
            wChampions = 30;
            wEuropa = 50;
            wConference = 20;
        }
        
        options = [
            { name: "UEFA Champions League", color: "#1e3a8a", weight: wChampions },
            { name: "UEFA Europa League", color: "#b45309", weight: wEuropa },
            { name: "UEFA Conference League", color: "#0f766e", weight: wConference }
        ];
    }
    // South America (CONMEBOL)
    else if (["BRA", "ARG", "COL", "PER", "VEN", "CHI"].includes(code)) {
        let wLibertadores = 20;
        let wSula = 80;
        
        if (score >= 11) {
            wLibertadores = 75;
            wSula = 25;
        } else if (score >= 8) {
            wLibertadores = 45;
            wSula = 55;
        }
        
        options = [
            { name: "Copa Libertadores", color: "#1e3a8a", weight: wLibertadores },
            { name: "Copa Sul-Americana", color: "#d97706", weight: wSula }
        ];
    }
    // North America (CONCACAF)
    else if (["EUA", "MEX", "CAN", "GUA", "CUB"].includes(code)) {
        let wChampionsCup = 30;
        let wLeaguesCup = 70;
        
        if (score >= 10) {
            wChampionsCup = 75;
            wLeaguesCup = 25;
        }
        
        options = [
            { name: "Concacaf Champions Cup", color: "#1e3a8a", weight: wChampionsCup },
            { name: "Leagues Cup", color: "#0f766e", weight: wLeaguesCup }
        ];
    }
    // Asia (AFC)
    else if (["IND", "CHN", "IDN", "PAK", "BGD", "JPN", "PHI", "AUS", "SAU"].includes(code)) {
        let wAfcChampions = 30;
        let wAfcCup = 70;
        
        if (score >= 10) {
            wAfcChampions = 75;
            wAfcCup = 25;
        }
        
        options = [
            { name: "AFC Champions League", color: "#1e3a8a", weight: wAfcChampions },
            { name: "AFC Cup", color: "#b45309", weight: wAfcCup }
        ];
    }
    // Fallback/Oceania/Africa
    else {
        let mainTourney = "Torneio Continental";
        let secTourney = "Taça Continental Secundária";
        
        if (["NGA", "ETH", "EGY", "COD", "RSA", "KEN"].includes(code)) {
            mainTourney = "CAF Champions League";
            secTourney = "CAF Confederations Cup";
        } else if (["PNG", "NZL", "FJI"].includes(code)) {
            mainTourney = "OFC Champions League";
            secTourney = "OFC Presidents Cup";
        }
        
        let wMain = 30;
        let wSec = 70;
        if (score >= 10) {
            wMain = 75;
            wSec = 25;
        }
        
        options = [
            { name: mainTourney, color: "#1e3a8a", weight: wMain },
            { name: secTourney, color: "#0f766e", weight: wSec }
        ];
    }
    
    return options;
}

// 3. Ordinal Number Helper
function getOrdinalNumber(num) {
    const ordinals = ["primeiro", "segundo", "terceiro", "quarto", "quinto", "sexto"];
    return ordinals[num - 1] || `${num}º`;
}

// 4. Calculate Player Average Attribute Level
function getPlayerAverageAttribute() {
    const speed = parseInt(selectedSpeed.name.split("/")[0]) || 5;
    const finishing = parseInt(selectedFinishing.name.split("/")[0]) || 5;
    const dribbling = parseInt(selectedDribbling.name.split("/")[0]) || 5;
    const passing = parseInt(selectedPassing.name.split("/")[0]) || 5;
    const strength = parseInt(selectedStrength.name.split("/")[0]) || 5;
    const defending = parseInt(selectedDefending.name.split("/")[0]) || 5;
    
    return (speed + finishing + dribbling + passing + strength + defending) / 6;
}

// 4.5. Position-Based Attribute Weight Adjuster
function getPositionAttributeTiers(attributeKey) {
    if (!selectedPosition) return attributeTiers;
    const position = selectedPosition.name;
    
    let isKey = false;
    switch (attributeKey) {
        case "speed":
            isKey = ["Ponta Esquerda", "Ponta Direita", "Lateral Esquerdo", "Lateral Direito"].includes(position);
            break;
        case "finishing":
            isKey = ["Centroavante", "Ponta Esquerda", "Ponta Direita"].includes(position);
            break;
        case "dribbling":
            isKey = ["Ponta Esquerda", "Ponta Direita", "Meia-Armador"].includes(position);
            break;
        case "passing":
            isKey = ["Meio-Campo", "Meia-Armador", "Volante", "Lateral Esquerdo", "Lateral Direito"].includes(position);
            break;
        case "strength":
            isKey = ["Centroavante", "Zagueiro", "Volante", "Goleiro"].includes(position);
            break;
        case "defending":
            isKey = ["Zagueiro", "Volante", "Goleiro", "Lateral Esquerdo", "Lateral Direito"].includes(position);
            break;
    }
    
    if (!isKey) return attributeTiers;
    
    // Dynamically increase weights for higher tiers (6/10 to 10/10)
    // and reduce weights for lower tiers (1/10 to 3/10) to make high tier results much more likely
    return attributeTiers.map((tier, index) => {
        let newWeight = tier.weight;
        if (index >= 5) {
            newWeight = tier.weight * 2.5; // 2.5x chance for excellent tiers
        } else if (index < 3) {
            newWeight = tier.weight * 0.4; // 0.4x chance for bad tiers
        }
        return { ...tier, weight: newWeight };
    });
}

// 5. Dynamic Trophy Win Chances
// 5. Dynamic Trophy Win Chances (Influenced by Team Strength, Player Attributes, and Longevity)
function getContractYearsBonus() {
    if (!selectedCareerYears) return 0;
    const years = selectedCareerYears;
    if (years <= 1) return 0;
    if (years === 2) return 5;
    if (years === 3) return 10;
    if (years === 4) return 16;
    if (years === 5) return 22;
    return 30; // 6+ years
}

function getLeagueWinChance() {
    if (!selectedCareerTeam) return 10;
    const strength = getTeamStrength(selectedCareerTeam.name);
    let baseChance = 4;
    switch (strength) {
        case 5: baseChance = 42; break;
        case 4: baseChance = 26; break;
        case 3: baseChance = 14; break;
        case 2: baseChance = 8; break;
        default: baseChance = 3; break;
    }
    const avgSkill = getPlayerAverageAttribute();
    const attrBonus = (avgSkill - 1) * 2.5; // Up to +22.5% for GOAT attributes
    const longevityBonus = getContractYearsBonus(); // Up to +30% for spending 6 years
    return Math.min(95, Math.round(baseChance + attrBonus + longevityBonus));
}

function getCupWinChance() {
    if (!selectedCareerTeam) return 10;
    const strength = getTeamStrength(selectedCareerTeam.name);
    let baseChance = 5;
    switch (strength) {
        case 5: baseChance = 38; break;
        case 4: baseChance = 25; break;
        case 3: baseChance = 15; break;
        case 2: baseChance = 8; break;
        default: baseChance = 4; break;
    }
    const avgSkill = getPlayerAverageAttribute();
    const attrBonus = (avgSkill - 1) * 2.5; // Up to +22.5%
    const longevityBonus = getContractYearsBonus(); // Up to +30%
    return Math.min(95, Math.round(baseChance + attrBonus + longevityBonus));
}

function getContinentalWinChance() {
    if (!selectedCareerTeam) return 5;
    const strength = getTeamStrength(selectedCareerTeam.name);
    let baseChance = 1;
    switch (strength) {
        case 5: baseChance = 24; break;
        case 4: baseChance = 14; break;
        case 3: baseChance = 8; break;
        case 2: baseChance = 3; break;
        default: baseChance = 1; break;
    }
    const avgSkill = getPlayerAverageAttribute();
    const attrBonus = (avgSkill - 1) * 2.2; // Up to +19.8%
    const longevityBonus = getContractYearsBonus(); // Up to +30%
    return Math.min(92, Math.round(baseChance + attrBonus + longevityBonus));
}

function getIntercontinentalWinChance() {
    if (!selectedCareerTeam || !selectedContinentalTournament) return 0;
    
    const strength = getTeamStrength(selectedCareerTeam.name);
    let baseChance = 10;
    
    const isEuropean = selectedCareerLeague && (
        selectedCareerLeague.includes("ING") || 
        selectedCareerLeague.includes("ESP") || 
        selectedCareerLeague.includes("ITA") || 
        selectedCareerLeague.includes("ALE") || 
        selectedCareerLeague.includes("FRA") || 
        selectedCareerLeague.includes("RUS")
    );
    
    const isSouthAmerican = selectedCareerLeague && (
        selectedCareerLeague.includes("BRA") || 
        selectedCareerLeague.includes("ARG")
    );
    
    if (isEuropean) {
        switch (strength) {
            case 5: baseChance = 85; break;
            case 4: baseChance = 75; break;
            case 3: baseChance = 65; break;
            default: baseChance = 55; break;
        }
    } else if (isSouthAmerican) {
        switch (strength) {
            case 5: baseChance = 45; break;
            case 4: baseChance = 35; break;
            case 3: baseChance = 25; break;
            default: baseChance = 15; break;
        }
    } else {
        // Outros continentes (Ásia, África, América do Norte, Oceania)
        switch (strength) {
            case 5: baseChance = 15; break;
            case 4: baseChance = 10; break;
            default: baseChance = 5; break;
        }
    }
    
    const avgSkill = getPlayerAverageAttribute();
    const attrBonus = (avgSkill - 1) * 2;
    
    return Math.min(95, Math.round(baseChance + attrBonus));
}

function getWorldClubCupWinChance() {
    if (!selectedCareerTeam || !selectedContinentalTournament) return 0;
    
    const strength = getTeamStrength(selectedCareerTeam.name);
    let baseChance = 5;
    
    const isEuropean = selectedCareerLeague && (
        selectedCareerLeague.includes("ING") || 
        selectedCareerLeague.includes("ESP") || 
        selectedCareerLeague.includes("ITA") || 
        selectedCareerLeague.includes("ALE") || 
        selectedCareerLeague.includes("FRA") || 
        selectedCareerLeague.includes("RUS")
    );
    
    const isSouthAmerican = selectedCareerLeague && (
        selectedCareerLeague.includes("BRA") || 
        selectedCareerLeague.includes("ARG")
    );
    
    if (isEuropean) {
        switch (strength) {
            case 5: baseChance = 65; break;
            case 4: baseChance = 50; break;
            case 3: baseChance = 35; break;
            default: baseChance = 25; break;
        }
    } else if (isSouthAmerican) {
        switch (strength) {
            case 5: baseChance = 25; break;
            case 4: baseChance = 18; break;
            case 3: baseChance = 12; break;
            default: baseChance = 8; break;
        }
    } else {
        switch (strength) {
            case 5: baseChance = 8; break;
            case 4: baseChance = 5; break;
            default: baseChance = 2; break;
        }
    }
    
    const avgSkill = getPlayerAverageAttribute();
    const attrBonus = (avgSkill - 1) * 1.5;
    
    return Math.min(90, Math.round(baseChance + attrBonus));
}

function getContinentalWinningYears(startYear, contractYears, titlesCount) {
    const years = [];
    for (let i = 0; i < contractYears; i++) {
        years.push(startYear + i);
    }
    if (titlesCount >= contractYears) {
        return years;
    }
    const winningYears = [];
    const tempYears = [...years];
    for (let i = 0; i < titlesCount; i++) {
        const index = Math.floor(Math.random() * tempYears.length);
        winningYears.push(tempYears.splice(index, 1)[0]);
    }
    return winningYears.sort((a, b) => a - b);
}

// 6. Roulette Option Generators
function getCareerYearsOptions() {
    const remainingClubs = totalClubsCount - currentClubIndex;
    const maxYears = remainingSeasons - remainingClubs + 1;
    
    const options = [];
    for (let y = 1; y <= maxYears; y++) {
        options.push({
            name: `${y} ${y === 1 ? 'ano' : 'anos'}`,
            value: y,
            weight: 1
        });
    }
    return options;
}

function getSimNaoOptions(yesWeight) {
    return [
        { name: "Sim", weight: yesWeight, color: "#143d25", value: true },
        { name: "Não", weight: 100 - yesWeight, color: "#4c141d", value: false }
    ];
}

function getNumberOptions(max) {
    // 1. Obter a força do clube ou seleção atual
    let teamStrength = 3; // Valor padrão intermediário (3 estrelas)
    
    if (currentStep === 13) {
        if (selectedCareerTeam) {
            teamStrength = getTeamStrength(selectedCareerTeam.name);
        }
    } else if (currentStep === 14) {
        if (selectedCountry) {
            teamStrength = getNationalTeamStrength(selectedCountry.name);
        }
    }
    
    // 2. Obter a média dos atributos do jogador (escala de 1 a 10)
    const avgAttr = getPlayerAverageAttribute();
    
    // 3. Normalizar os fatores entre 0.0 e 1.0
    const normAttr = (avgAttr - 1) / 9; // Atributos do jogador (0.0 a 1.0)
    const normStrength = (teamStrength - 1) / 4; // Força da equipe (0.0 a 1.0)
    
    // 4. Calcular o fator de poder (peso: 60% força da equipe, 40% atributos do jogador)
    const powerFactor = (normAttr * 0.4) + (normStrength * 0.6);
    
    // 5. Mapear o fator de poder em um decaimento (decaimento base vai de 1.3 para potência máxima a 2.4 para potência mínima)
    const decayBase = 2.4 - (1.1 * powerFactor);
    
    const options = [];
    for (let i = 1; i <= max; i++) {
        // O peso diminui exponencialmente conforme a quantidade de títulos aumenta
        const weight = Math.round(100 / Math.pow(decayBase, i - 1));
        options.push({
            name: `${i} ${i === 1 ? 'vez' : 'vezes'}`,
            value: i,
            weight: Math.max(1, weight) // Garante peso mínimo de 1
        });
    }
    return options;
}

function getRetirementReasonOptions() {
    return [
        { name: "Dores Crônicas 🤕", desc: "dores crônicas incessantes nos joelhos e articulações, tornando o sacrifício físico diário insuportável", color: "#4c141d" },
        { name: "Lesão Grave 🏥", desc: "uma grave lesão de ligamento na pré-temporada, acelerando a decisão de pendurar as chuteiras", color: "#4c2d14" },
        { name: "Escolha Própria 🚶‍♂️", desc: "escolha própria de sair por cima, querendo aproveitar o tempo livre com a família enquanto ainda está no auge físico", color: "#143d25" },
        { name: "Idade Avançada 👴", desc: "idade avançada refletindo no ritmo físico, preferindo dar espaço para os jovens talentos brilharem", color: "#142d4c" },
        { name: "Desejo de ser Treinador 📋", desc: "o desejo ardente de iniciar imediatamente os estudos para se tornar treinador de futebol", color: "#2d144c" },
        { name: "Desgaste Mental 🧠", desc: "desgaste mental acumulado com a rotina pesada de viagens, hotéis e pressões insustentáveis da torcida", color: "#14404c" }
    ];
}

function getAttributeImprovementCountOptions() {
    return [
        { name: "1 atributo", value: 1, weight: 35 },
        { name: "2 atributos", value: 2, weight: 25 },
        { name: "3 atributos", value: 3, weight: 15 },
        { name: "4 atributos", value: 4, weight: 12 },
        { name: "5 atributos", value: 5, weight: 8 },
        { name: "6 atributos", value: 6, weight: 5 }
    ];
}

function getAttributeOptions() {
    const isGoleiro = selectedPosition && selectedPosition.name === "Goleiro";
    return [
        { name: isGoleiro ? "Tempo de Reação" : "Velocidade", color: "#4d1a3a", key: "speed" },
        { name: isGoleiro ? "Impulsão" : "Finalização", color: "#4d1a1a", key: "finishing" },
        { name: isGoleiro ? "Elasticidade" : "Drible", color: "#2d1a4d", key: "dribbling" },
        { name: "Passe", color: "#1a2d4d", key: "passing" },
        { name: "Força", color: "#4d2d1a", key: "strength" },
        { name: "Defesa", color: "#1a4d2d", key: "defending" }
    ];
}

// 7. Start Career Sub-Step
function startCareerSubStep() {
    spinBtn.disabled = false;
    resetJourneyBtn.disabled = false;

    // Atualiza os cartões móveis de progresso em tempo real durante a carreira
    if (currentStep === 13) {
        const mSeasons = document.getElementById("m-box-seasons");
        if (mSeasons) {
            const mVal = mSeasons.querySelector(".m-stat-val");
            mVal.innerText = `${remainingSeasons} rest.`;
            mSeasons.classList.add("completed");
        }
        const mClubs = document.getElementById("m-box-clubs");
        if (mClubs) {
            const mVal = mClubs.querySelector(".m-stat-val");
            mVal.innerText = `Clube ${Math.min(totalClubsCount, currentClubIndex + 1)}/${totalClubsCount}`;
            mClubs.classList.add("completed");
        }
    }

    if (currentStep === 13) {
        const clubNum = currentClubIndex + 1;
        const ordinal = getOrdinalNumber(clubNum);

        switch (currentSubStep) {
            case 0:
                appTitle.innerText = `Carreira - ${clubNum}º Clube`;
                appSubtitle.innerText = `Em qual campeonato você jogará pelo seu ${ordinal} clube?`;
                statusText.innerText = "Aguardando sorteio do campeonato...";
                break;
            case 1:
                appTitle.innerText = `Carreira - ${clubNum}º Clube`;
                appSubtitle.innerText = `Qual time você defenderá no ${selectedCareerLeague}?`;
                statusText.innerText = `Aguardando sorteio do time no ${selectedCareerLeague}...`;
                break;
            case 2:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Quantos anos você permanecerá jogando pelo ${selectedCareerTeam.name}?`;
                statusText.innerText = "Aguardando sorteio do tempo de contrato...";
                break;
            case 3:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Você conquistou o título do campeonato nacional (${selectedCareerLeague.replace(/\s*\(.*?\)/, "")})?`;
                statusText.innerText = "Aguardando sorteio do título da liga...";
                break;
            case 4:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Quantas vezes você foi campeão da liga nacional pelo ${selectedCareerTeam.name}?`;
                statusText.innerText = "Aguardando sorteio da quantidade de títulos da liga...";
                break;
            case 5:
                const cupName = getDomesticCupName(selectedCareerLeague);
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Você venceu a copa nacional (${cupName}) pelo ${selectedCareerTeam.name}?`;
                statusText.innerText = `Aguardando sorteio da ${cupName}...`;
                break;
            case 6:
                const cupName2 = getDomesticCupName(selectedCareerLeague);
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Quantas vezes você ergueu a taça da ${cupName2}?`;
                statusText.innerText = `Aguardando sorteio da quantidade de taças da ${cupName2}...`;
                break;
            case 7:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Você conquistou algum título internacional defendendo o ${selectedCareerTeam.name}?`;
                statusText.innerText = "Aguardando sorteio de título internacional...";
                break;
            case 12:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Qual título internacional você ergueu pelo ${selectedCareerTeam.name}?`;
                statusText.innerText = "Aguardando sorteio do torneio internacional...";
                break;
            case 8:
                const tourneyName = selectedContinentalTournament ? selectedContinentalTournament.name : "Torneio Continental";
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Quantas vezes você ergueu a taça da ${tourneyName}?`;
                statusText.innerText = `Aguardando sorteio da quantidade de títulos da ${tourneyName}...`;
                break;
            case 13:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Você conquistou a Copa Intercontinental pelo ${selectedCareerTeam.name}? (Torneio Anual)`;
                statusText.innerText = "Aguardando sorteio da Copa Intercontinental...";
                break;
            case 14:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Quantas vezes você conquistou a Copa Intercontinental pelo ${selectedCareerTeam.name}?`;
                statusText.innerText = "Aguardando quantidade de títulos da Copa Intercontinental...";
                break;
            case 15:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Você conquistou o Mundial de Clubes da FIFA pelo ${selectedCareerTeam.name}? (Torneio Quadrienal)`;
                statusText.innerText = "Aguardando sorteio do Mundial de Clubes da FIFA...";
                break;
            case 16:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Quantas vezes você conquistou o Mundial de Clubes da FIFA pelo ${selectedCareerTeam.name}?`;
                statusText.innerText = "Aguardando quantidade de títulos do Mundial de Clubes da FIFA...";
                break;
            case 9:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Sua qualidade técnica ou física evoluiu enquanto defendia o ${selectedCareerTeam.name}?`;
                statusText.innerText = "Aguardando sorteio de evolução de atributos...";
                break;
            case 10:
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Quantos atributos você conseguiu aprimorar em seus treinos no ${selectedCareerTeam.name}?`;
                statusText.innerText = "Aguardando sorteio da quantidade de atributos...";
                break;
            case 11:
                const remainingUpgradeText = remainingAttributeImprovements > 1 ? ` (Faltam ${remainingAttributeImprovements})` : "";
                appTitle.innerText = `Carreira - ${selectedCareerTeam.name}`;
                appSubtitle.innerText = `Gire para descobrir qual atributo você aprimorou!${remainingUpgradeText}`;
                statusText.innerText = "Aguardando sorteio do atributo melhorado...";
                break;
        }
    } else if (currentStep === 14) {
        const countryName = selectedCountry.name;
        const contName = getContinentalSelectionTournamentName();

        switch (currentSubStep) {
            case 0:
                appTitle.innerText = "Seleção Nacional";
                appSubtitle.innerText = `Você foi convocado para defender a seleção de ${countryName}?`;
                statusText.innerText = "Aguardando sorteio de convocação...";
                break;
            case 1:
                appTitle.innerText = "Copa do Mundo";
                appSubtitle.innerText = `Você foi convocado para disputar a Copa do Mundo por ${countryName}?`;
                statusText.innerText = "Aguardando sorteio de ida para a Copa...";
                break;
            case 2:
                appTitle.innerText = "Copa do Mundo";
                appSubtitle.innerText = `Para quantas Copas do Mundo você foi convocado ao longo de sua carreira?`;
                statusText.innerText = "Aguardando sorteio da quantidade de Copas...";
                break;
            case 3:
                appTitle.innerText = `Seleção - ${contName}`;
                appSubtitle.innerText = `Você conquistou o título da ${contName} pela seleção de ${countryName}?`;
                statusText.innerText = `Aguardando sorteio do título da ${contName}...`;
                break;
            case 4:
                appTitle.innerText = `Seleção - ${contName}`;
                appSubtitle.innerText = `Quantas vezes você foi campeão da ${contName} com a sua seleção?`;
                statusText.innerText = `Aguardando sorteio da quantidade de taças da ${contName}...`;
                break;
            case 5:
                appTitle.innerText = "Copa do Mundo";
                appSubtitle.innerText = `Você conquistou o título máximo de campeão da Copa do Mundo por ${countryName}?`;
                statusText.innerText = "Aguardando sorteio do título mundial...";
                break;
            case 6:
                appTitle.innerText = "Copa do Mundo";
                appSubtitle.innerText = `Quantas vezes você ergueu a taça de campeão do mundo?`;
                statusText.innerText = "Aguardando sorteio de quantos mundiais ganhou...";
                break;
            case 7:
                appTitle.innerText = "Estatísticas - Gols";
                appSubtitle.innerText = "Gire para ver a faixa de gols que você marcou em toda a sua carreira profissional!";
                statusText.innerText = "Aguardando sorteio de gols...";
                break;
            case 8:
                appTitle.innerText = "Estatísticas - Assistências";
                appSubtitle.innerText = "Gire para ver a faixa de assistências que você distribuiu na sua carreira!";
                statusText.innerText = "Aguardando sorteio de assistências...";
                break;
            case 9:
                appTitle.innerText = "Premiações Individuais";
                appSubtitle.innerText = "Você foi eleito o melhor jogador do mundo e ganhou a Bola de Ouro?";
                statusText.innerText = "Aguardando sorteio da Bola de Ouro...";
                break;
            case 10:
                appTitle.innerText = "Bolas de Ouro";
                appSubtitle.innerText = "Quantas vezes você conquistou o prêmio da Bola de Ouro na sua carreira?";
                statusText.innerText = "Aguardando sorteio da quantidade de Bolas de Ouro...";
                break;
            case 11:
                appTitle.innerText = "Estatísticas - Clean Sheets";
                appSubtitle.innerText = "Gire para ver a faixa de jogos sem sofrer gols (Clean Sheets) na sua carreira!";
                statusText.innerText = "Aguardando sorteio de Clean Sheets...";
                break;
            case 12:
                appTitle.innerText = "Aposentadoria";
                appSubtitle.innerText = "Qual será o motivo de você pendurar as chuteiras e encerrar sua carreira lendária?";
                statusText.innerText = "Aguardando sorteio do motivo da aposentadoria...";
                break;
        }
    }

    drawWheel();
}

// 8. Handle Career Sub-Step Result
function handleCareerSubStepResult(winner) {
    playWinSound();

    switch (currentSubStep) {
        case 0:
            selectedCareerLeague = winner.name;
            statusText.innerText = `Campeonato sorteado: ${selectedCareerLeague}!`;
            queueTransition(() => { currentSubStep = 1; startCareerSubStep(); });
            break;
            
        case 1:
            selectedCareerTeam = winner;
            const remainingClubs = totalClubsCount - currentClubIndex;
            if (remainingClubs === 1) {
                selectedCareerYears = remainingSeasons;
                statusText.innerText = `Time sorteado: ${selectedCareerTeam.name}! (Contrato definido automaticamente: ${remainingSeasons} ${remainingSeasons === 1 ? 'ano' : 'anos'} para encerrar a carreira)`;
                queueTransition(() => { currentSubStep = 3; startCareerSubStep(); });
            } else {
                statusText.innerText = `Time sorteado: ${selectedCareerTeam.name}!`;
                queueTransition(() => { currentSubStep = 2; startCareerSubStep(); });
            }
            break;
            
        case 2:
            selectedCareerYears = winner.value;
            statusText.innerText = `Tempo de contrato: ${selectedCareerYears} ${selectedCareerYears === 1 ? 'ano' : 'anos'}!`;
            queueTransition(() => { currentSubStep = 3; startCareerSubStep(); });
            break;
            
        case 3:
            wonLeague = winner.value;
            statusText.innerText = wonLeague ? "Você conquistou o título da liga nacional!" : "Você não foi campeão da liga.";
            if (wonLeague) {
                queueTransition(() => { currentSubStep = 4; startCareerSubStep(); });
            } else {
                leagueTitlesCount = 0;
                queueTransition(() => { currentSubStep = 5; startCareerSubStep(); });
            }
            break;
            
        case 4:
            leagueTitlesCount = winner.value;
            statusText.innerText = `Conquistou a liga nacional ${leagueTitlesCount} ${leagueTitlesCount === 1 ? 'vez' : 'vezes'}!`;
            queueTransition(() => { currentSubStep = 5; startCareerSubStep(); });
            break;
            
        case 5:
            wonCup = winner.value;
            const cupName = getDomesticCupName(selectedCareerLeague);
            statusText.innerText = wonCup ? `Você conquistou a ${cupName}!` : `Você não venceu a ${cupName}.`;
            if (wonCup) {
                queueTransition(() => { currentSubStep = 6; startCareerSubStep(); });
            } else {
                cupTitlesCount = 0;
                queueTransition(() => { currentSubStep = 7; startCareerSubStep(); });
            }
            break;
            
        case 6:
            cupTitlesCount = winner.value;
            const cupName2 = getDomesticCupName(selectedCareerLeague);
            statusText.innerText = `Conquistou a ${cupName2} ${cupTitlesCount} ${cupTitlesCount === 1 ? 'vez' : 'vezes'}!`;
            queueTransition(() => { currentSubStep = 7; startCareerSubStep(); });
            break;
            
        case 7:
            wonContinental = winner.value;
            statusText.innerText = wonContinental ? "Você conquistou um título internacional!" : "Não conquistou título internacional.";
            if (wonContinental) {
                queueTransition(() => { currentSubStep = 12; startCareerSubStep(); });
            } else {
                continentalTitlesCount = 0;
                selectedContinentalTournament = null;
                queueTransition(() => { currentSubStep = 9; startCareerSubStep(); });
            }
            break;
            
        case 12:
            selectedContinentalTournament = winner;
            statusText.innerText = `Título internacional conquistado: ${selectedContinentalTournament.name}!`;
            queueTransition(() => { currentSubStep = 8; startCareerSubStep(); });
            break;
            
        case 8:
            continentalTitlesCount = winner.value;
            const tourneyNameDecided = selectedContinentalTournament ? selectedContinentalTournament.name : "Torneio Continental";
            statusText.innerText = `Ergueu a taça da ${tourneyNameDecided} ${continentalTitlesCount} ${continentalTitlesCount === 1 ? 'vez' : 'vezes'}!`;
            
            // Determine if it is top-tier (primeira tabela)
            const topTierTournaments = [
                "UEFA Champions League", 
                "Copa Libertadores", 
                "Concacaf Champions Cup", 
                "AFC Champions League", 
                "CAF Champions League",
                "OFC Champions League"
            ];
            const isTopTier = selectedContinentalTournament && topTierTournaments.includes(selectedContinentalTournament.name);
            
            if (!isTopTier) {
                // Lower-tier: skip world cups completely
                wonIntercontinental = false;
                intercontinentalTitlesCount = 0;
                wonWorldClubCup = false;
                worldClubCupTitlesCount = 0;
                queueTransition(() => { currentSubStep = 9; startCareerSubStep(); });
            } else {
                // Top-tier: eligible for Intercontinental and CWC!
                intercontinentalEligibleCount = continentalTitlesCount;
                
                // Distribute titles over contract years to determine exact winning years
                const winningYears = getContinentalWinningYears(currentCalendarYear, selectedCareerYears, continentalTitlesCount);
                winningYears.forEach(y => {
                    if (!globalTopTierWinningYears.includes(y)) {
                        globalTopTierWinningYears.push(y);
                    }
                });
                
                // Get contract years
                const contractYears = [];
                for (let i = 0; i < selectedCareerYears; i++) {
                    contractYears.push(currentCalendarYear + i);
                }
                
                // CWC years in contract
                const cwcYearsInContract = contractYears.filter(y => (y - 2025) % 4 === 0);
                
                // Calculate how many CWCs the player qualifies for
                let eligibleCWCs = 0;
                cwcYearsInContract.forEach(m => {
                    const hasQualified = globalTopTierWinningYears.some(w => w <= m && w >= m - 3);
                    if (hasQualified) {
                        eligibleCWCs++;
                    }
                });
                
                cwcEligibleCount = eligibleCWCs;
                
                queueTransition(() => { currentSubStep = 13; startCareerSubStep(); });
            }
            break;
            
        case 13:
            wonIntercontinental = winner.value;
            statusText.innerText = wonIntercontinental ? "Você conquistou a Copa Intercontinental!" : "Não conquistou a Copa Intercontinental.";
            if (wonIntercontinental) {
                queueTransition(() => { currentSubStep = 14; startCareerSubStep(); });
            } else {
                intercontinentalTitlesCount = 0;
                if (cwcEligibleCount > 0) {
                    queueTransition(() => { currentSubStep = 15; startCareerSubStep(); });
                } else {
                    wonWorldClubCup = false;
                    worldClubCupTitlesCount = 0;
                    queueTransition(() => { currentSubStep = 9; startCareerSubStep(); });
                }
            }
            break;
            
        case 14:
            intercontinentalTitlesCount = winner.value;
            statusText.innerText = `Campeão da Copa Intercontinental ${intercontinentalTitlesCount} ${intercontinentalTitlesCount === 1 ? 'vez' : 'vezes'}!`;
            if (cwcEligibleCount > 0) {
                queueTransition(() => { currentSubStep = 15; startCareerSubStep(); });
            } else {
                wonWorldClubCup = false;
                worldClubCupTitlesCount = 0;
                queueTransition(() => { currentSubStep = 9; startCareerSubStep(); });
            }
            break;

        case 15:
            wonWorldClubCup = winner.value;
            statusText.innerText = wonWorldClubCup ? "Você conquistou o Mundial de Clubes da FIFA!" : "Não conquistou o Mundial de Clubes da FIFA.";
            if (wonWorldClubCup) {
                queueTransition(() => { currentSubStep = 16; startCareerSubStep(); });
            } else {
                worldClubCupTitlesCount = 0;
                queueTransition(() => { currentSubStep = 9; startCareerSubStep(); });
            }
            break;
            
        case 16:
            worldClubCupTitlesCount = winner.value;
            statusText.innerText = `Campeão do Mundial de Clubes da FIFA ${worldClubCupTitlesCount} ${worldClubCupTitlesCount === 1 ? 'vez' : 'vezes'}!`;
            queueTransition(() => { currentSubStep = 9; startCareerSubStep(); });
            break;
            
        case 9:
            improvedAttributes = winner.value;
            statusText.innerText = improvedAttributes ? "Seus treinos renderam evolução!" : "Nenhuma evolução de atributo neste clube.";
            if (improvedAttributes) {
                queueTransition(() => { currentSubStep = 10; startCareerSubStep(); });
            } else {
                numImprovedAttributes = 0;
                remainingAttributeImprovements = 0;
                queueTransition(() => { finishCurrentClubDraft(); });
            }
            break;
            
        case 10:
            numImprovedAttributes = winner.value;
            remainingAttributeImprovements = numImprovedAttributes;
            statusText.innerText = `Você evoluirá em ${numImprovedAttributes} ${numImprovedAttributes === 1 ? 'atributo' : 'atributos'}!`;
            queueTransition(() => { currentSubStep = 11; startCareerSubStep(); });
            break;
            
        case 11:
            if (isAttributeAtMax(winner.key)) {
                if (areAllAttributesAtMax()) {
                    statusText.innerText = `Todos os atributos já estão no máximo!`;
                    remainingAttributeImprovements = 0;
                    queueTransition(() => { finishCurrentClubDraft(); });
                } else {
                    statusText.innerText = `${winner.name} já está no nível máximo! Sorteando outro atributo...`;
                    setTimeout(() => { spinWheel(); }, 2000);
                }
            } else {
                const upgradeMsg = upgradePlayerAttribute(winner.key);
                remainingAttributeImprovements--;
                statusText.innerText = `Evolução: ${upgradeMsg}! Nível subiu!`;
                
                if (remainingAttributeImprovements > 0) {
                    queueTransition(() => { startCareerSubStep(); });
                } else {
                    queueTransition(() => { finishCurrentClubDraft(); });
                }
            }
            break;
    }
}

// ==========================================
// 11.6. INTERNATIONAL CAREER & STATS IMPLEMENTATION
// ==========================================

// 1. National Team Strength Classifier
function getNationalTeamStrength(countryName) {
    const elite = ["Brasil", "Argentina", "França", "Alemanha", "Espanha", "Itália", "Reino Unido"];
    const competitive = ["Nigéria", "Egito", "México", "Estados Unidos", "Colômbia", "Uruguai", "Croácia", "Portugal", "Holanda", "Bélgica", "Japão", "Ucrânia"];
    if (elite.includes(countryName)) return 5;
    if (competitive.includes(countryName)) return 3;
    return 1;
}

// 2. Dynamic Selection Tournament Name
function getContinentalSelectionTournamentName() {
    const continent = selectedContinent;
    switch (continent) {
        case "América do Sul": return "Copa América";
        case "Europa": return "Eurocopa";
        case "América do Norte": return "Copa Ouro";
        case "África": return "Copa das Nações Africanas";
        case "Ásia": return "Copa da Ásia";
        case "Oceania": return "Copa das Nações da OFC";
        default: return "Copa Glacial das Estações";
    }
}

// 3. Dynamic Chances
function getNationalTeamCallUpChance() {
    const avgAttr = getPlayerAverageAttribute();
    return Math.max(1, Math.min(95, Math.round((avgAttr - 1) * 10)));
}

function getWorldCupParticipationChance() {
    const countryName = selectedCountry.name;
    const strength = getNationalTeamStrength(countryName);
    let baseChance = 15;
    if (strength === 5) baseChance = 85;
    else if (strength === 3) baseChance = 50;
    
    const avgAttr = getPlayerAverageAttribute();
    const bonus = (avgAttr - 1) * 2.5; // Up to +22.5%
    return Math.max(5, Math.min(98, Math.round(baseChance + bonus)));
}

function getContinentalSelectionChance() {
    const countryName = selectedCountry.name;
    const strength = getNationalTeamStrength(countryName);
    let baseChance = 10;
    if (strength === 5) baseChance = 40;
    else if (strength === 3) baseChance = 25;
    
    const avgAttr = getPlayerAverageAttribute();
    const bonus = (avgAttr - 1) * 3; // Up to +27%
    return Math.max(5, Math.min(95, Math.round(baseChance + bonus)));
}

function getWorldCupWinChance() {
    const countryName = selectedCountry.name;
    const strength = getNationalTeamStrength(countryName);
    let baseChance = 1;
    if (strength === 5) baseChance = 20;
    else if (strength === 3) baseChance = 8;
    
    const avgAttr = getPlayerAverageAttribute();
    const bonus = (avgAttr - 1) * 2; // Up to +18%
    return Math.max(1, Math.min(90, Math.round(baseChance + bonus)));
}

function getBallonDorChance() {
    const avgAttr = getPlayerAverageAttribute();
    if (avgAttr >= 9.0) return 75;
    if (avgAttr >= 7.0) return 40;
    if (avgAttr >= 5.0) return 15;
    return 1;
}

// 4. Goals and Assists Bracket Generators
function getGoalsOptions() {
    const position = selectedPosition.name;
    let baseGoalsPerYear = 1.2;
    
    if (position === "Centroavante") baseGoalsPerYear = 28;
    else if (position === "Ponta Esquerda" || position === "Ponta Direita") baseGoalsPerYear = 18;
    else if (position === "Meia-Armador") baseGoalsPerYear = 10;
    else if (position === "Meio-Campo") baseGoalsPerYear = 7;
    else if (position === "Lateral Esquerdo" || position === "Lateral Direito") baseGoalsPerYear = 3;
    else if (position === "Volante") baseGoalsPerYear = 2.5;
    else if (position === "Zagueiro") baseGoalsPerYear = 1.2;
    else if (position === "Goleiro") baseGoalsPerYear = 0.05;
    
    const finishingLevel = parseInt(selectedFinishing.name.split("/")[0]) || 5;
    const finishingMultiplier = 0.2 + (finishingLevel / 10) * 1.5;
    
    const seasons = parseInt(selectedSeasons.name.split(" ")[0]) || 15;
    const expectedGoals = baseGoalsPerYear * finishingMultiplier * seasons;
    
    if (position === "Goleiro") {
        return [
            { name: "0 gols", min: 0, max: 0, weight: 85 },
            { name: "1 gol (Histórico!)", min: 1, max: 1, weight: 12 },
            { name: "2 gols", min: 2, max: 2, weight: 2 },
            { name: "3 gols", min: 3, max: 3, weight: 0.8 },
            { name: "4 gols", min: 4, max: 4, weight: 0.15 },
            { name: "5+ gols (Mito!)", min: 5, max: 8, weight: 0.05 }
        ];
    }
    
    const b1 = Math.max(0, Math.round(expectedGoals * 0.45));
    const b2 = Math.round(expectedGoals * 0.75);
    const b3 = Math.round(expectedGoals * 0.95);
    const b4 = Math.round(expectedGoals * 1.15);
    const b5 = Math.round(expectedGoals * 1.4);
    const b6 = Math.round(expectedGoals * 1.65);
    const b7 = Math.round(expectedGoals * 2.0);
    
    return [
        { name: `${b1} a ${b2} gols`, min: b1, max: b2, weight: 15 },
        { name: `${b2 + 1} a ${b3} gols`, min: b2 + 1, max: b3, weight: 25 },
        { name: `${b3 + 1} a ${b4} gols`, min: b3 + 1, max: b4, weight: 35 },
        { name: `${b4 + 1} a ${b5} gols`, min: b4 + 1, max: b5, weight: 18 },
        { name: `${b5 + 1} a ${b6} gols`, min: b5 + 1, max: b6, weight: 6 },
        { name: `Mais de ${b6} gols!`, min: b6 + 1, max: b7, weight: 1 }
    ];
}

function getAssistsOptions() {
    const position = selectedPosition.name;
    let baseAssistsPerYear = 0.8;
    
    if (position === "Meia-Armador") baseAssistsPerYear = 20;
    else if (position === "Meio-Campo") baseAssistsPerYear = 12;
    else if (position === "Ponta Esquerda" || position === "Ponta Direita") baseAssistsPerYear = 14;
    else if (position === "Lateral Esquerdo" || position === "Lateral Direito") baseAssistsPerYear = 8;
    else if (position === "Volante") baseAssistsPerYear = 5;
    else if (position === "Centroavante") baseAssistsPerYear = 4;
    else if (position === "Zagueiro") baseAssistsPerYear = 0.8;
    else if (position === "Goleiro") baseAssistsPerYear = 0.08;
    
    const passingLevel = parseInt(selectedPassing.name.split("/")[0]) || 5;
    const passingMultiplier = 0.2 + (passingLevel / 10) * 1.5;
    
    const seasons = parseInt(selectedSeasons.name.split(" ")[0]) || 15;
    const expectedAssists = baseAssistsPerYear * passingMultiplier * seasons;
    
    if (position === "Goleiro") {
        return [
            { name: "0 assistências", min: 0, max: 0, weight: 90 },
            { name: "1 assistência (Histórica!)", min: 1, max: 1, weight: 8 },
            { name: "2 assistências", min: 2, max: 2, weight: 1.5 },
            { name: "3 assistências", min: 3, max: 3, weight: 0.4 },
            { name: "4 assistências", min: 4, max: 4, weight: 0.08 },
            { name: "5+ assistências", min: 5, max: 6, weight: 0.02 }
        ];
    }
    
    const b1 = Math.max(0, Math.round(expectedAssists * 0.45));
    const b2 = Math.round(expectedAssists * 0.75);
    const b3 = Math.round(expectedAssists * 0.95);
    const b4 = Math.round(expectedAssists * 1.15);
    const b5 = Math.round(expectedAssists * 1.4);
    const b6 = Math.round(expectedAssists * 1.65);
    const b7 = Math.round(expectedAssists * 2.0);
    
    return [
        { name: `${b1} a ${b2} assists`, min: b1, max: b2, weight: 15 },
        { name: `${b2 + 1} a ${b3} assists`, min: b2 + 1, max: b3, weight: 25 },
        { name: `${b3 + 1} a ${b4} assists`, min: b3 + 1, max: b4, weight: 35 },
        { name: `${b4 + 1} a ${b5} assists`, min: b4 + 1, max: b5, weight: 18 },
        { name: `${b5 + 1} a ${b6} assists`, min: b5 + 1, max: b6, weight: 6 },
        { name: `Mais de ${b6} assists!`, min: b6 + 1, max: b7, weight: 1 }
    ];
}

function getCleanSheetsOptions() {
    const defendingLevel = parseInt(selectedDefending.name.split("/")[0]) || 5;
    const defendingMultiplier = 0.4 + (defendingLevel / 10) * 1.6;
    const seasons = parseInt(selectedSeasons.name.split(" ")[0]) || 15;
    const expectedCleanSheets = 9.5 * defendingMultiplier * seasons;
    
    const b1 = Math.max(0, Math.round(expectedCleanSheets * 0.45));
    const b2 = Math.round(expectedCleanSheets * 0.75);
    const b3 = Math.round(expectedCleanSheets * 0.95);
    const b4 = Math.round(expectedCleanSheets * 1.15);
    const b5 = Math.round(expectedCleanSheets * 1.4);
    const b6 = Math.round(expectedCleanSheets * 1.65);
    const b7 = Math.round(expectedCleanSheets * 2.0);
    
    return [
        { name: `${b1} a ${b2} clean sheets`, min: b1, max: b2, weight: 15 },
        { name: `${b2 + 1} a ${b3} clean sheets`, min: b2 + 1, max: b3, weight: 25 },
        { name: `${b3 + 1} a ${b4} clean sheets`, min: b3 + 1, max: b4, weight: 35 },
        { name: `${b4 + 1} a ${b5} clean sheets`, min: b4 + 1, max: b5, weight: 18 },
        { name: `${b5 + 1} a ${b6} clean sheets`, min: b5 + 1, max: b6, weight: 6 },
        { name: `Mais de ${b6} clean sheets!`, min: b6 + 1, max: b7, weight: 1 }
    ];
}

// 5. Ballon d'Or Count Weighted Generator
function getBallonDorCountOptions() {
    const seasons = parseInt(selectedSeasons.name.split(" ")[0]) || 15;
    const avgAttr = getPlayerAverageAttribute();
    const target = Math.max(1, Math.min(seasons, Math.round((avgAttr / 10) * seasons * 0.5)));
    
    const options = [];
    for (let k = 1; k <= seasons; k++) {
        const distance = Math.abs(k - target);
        const weight = Math.max(1, Math.round(100 * Math.pow(0.5, distance)));
        options.push({
            name: `${k} ${k === 1 ? 'Bola de Ouro' : 'Bolas de Ouro'}`,
            value: k,
            weight: weight
        });
    }
    return options;
}

// 6. Handle International Sub-Step Result
function handleInternationalSubStepResult(winner) {
    playWinSound();

    switch (currentSubStep) {
        case 0: // Convocado? Sim/Não
            convocandoSelecao = winner.value;
            statusText.innerText = convocandoSelecao 
                ? `Convocado para a seleção de ${selectedCountry.name}!` 
                : `Não obteve convocações para a seleção de ${selectedCountry.name}.`;
            if (convocandoSelecao) {
                queueTransition(() => { currentSubStep = 1; startCareerSubStep(); });
            } else {
                // If not called up, skip to goals/assists (Sub-step 7)!
                queueTransition(() => { currentSubStep = 7; startCareerSubStep(); });
            }
            break;
            
        case 1: // Fui para a Copa? Sim/Não
            jogouCopaMundo = winner.value;
            statusText.innerText = jogouCopaMundo 
                ? "Classificado para disputar a Copa do Mundo!" 
                : "Não conseguiu classificação para a Copa do Mundo.";
            if (jogouCopaMundo) {
                queueTransition(() => { currentSubStep = 2; startCareerSubStep(); });
            } else {
                queueTransition(() => { currentSubStep = 3; startCareerSubStep(); });
            }
            break;
            
        case 2: // Quantas Copas?
            quantidadeCopasDisputadas = winner.value;
            statusText.innerText = `Disputou a Copa do Mundo em ${quantidadeCopasDisputadas} ${quantidadeCopasDisputadas === 1 ? 'edição' : 'edições'}!`;
            queueTransition(() => { currentSubStep = 3; startCareerSubStep(); });
            break;
            
        case 3: // Ganhou Continental? Sim/Não
            ganhouContinentalSelecoes = winner.value;
            const contName = getContinentalSelectionTournamentName();
            statusText.innerText = ganhouContinentalSelecoes 
                ? `Campeão da ${contName} pela sua seleção!` 
                : `Não conquistou o título da ${contName}.`;
            if (ganhouContinentalSelecoes) {
                queueTransition(() => { currentSubStep = 4; startCareerSubStep(); });
            } else {
                titulosContinentalSelecoesCount = 0;
                if (jogouCopaMundo) {
                    queueTransition(() => { currentSubStep = 5; startCareerSubStep(); });
                } else {
                    queueTransition(() => { currentSubStep = 7; startCareerSubStep(); });
                }
            }
            break;
            
        case 4: // Quantos Continentais?
            titulosContinentalSelecoesCount = winner.value;
            const contName2 = getContinentalSelectionTournamentName();
            statusText.innerText = `Conquistou a ${contName2} ${titulosContinentalSelecoesCount} ${titulosContinentalSelecoesCount === 1 ? 'vez' : 'vezes'}!`;
            if (jogouCopaMundo) {
                queueTransition(() => { currentSubStep = 5; startCareerSubStep(); });
            } else {
                queueTransition(() => { currentSubStep = 7; startCareerSubStep(); });
            }
            break;
            
        case 5: // Ganhou Copa do Mundo? Sim/Não
            ganhouCopaMundo = winner.value;
            statusText.innerText = ganhouCopaMundo 
                ? "Glória Eterna! Campeão da Copa do Mundo!" 
                : "Não conseguiu vencer a Copa do Mundo.";
            if (ganhouCopaMundo) {
                queueTransition(() => { currentSubStep = 6; startCareerSubStep(); });
            } else {
                titulosCopaMundoCount = 0;
                queueTransition(() => { currentSubStep = 7; startCareerSubStep(); });
            }
            break;
            
        case 6: // Quantas Copas do Mundo ganhou?
            titulosCopaMundoCount = winner.value;
            statusText.innerText = `Campeão do Mundo ${titulosCopaMundoCount} ${titulosCopaMundoCount === 1 ? 'vez' : 'vezes'}!`;
            queueTransition(() => { currentSubStep = 7; startCareerSubStep(); });
            break;
            
        case 7: // Gols na Carreira
            selectedGoalsRange = winner;
            selectedCareerGoals = Math.floor(Math.random() * (winner.max - winner.min + 1)) + winner.min;
            statusText.innerText = `Estatística: Marcou ${selectedCareerGoals} gols na carreira!`;
            queueTransition(() => { currentSubStep = 8; startCareerSubStep(); });
            break;
            
        case 8: // Assistências na Carreira
            selectedAssistsRange = winner;
            selectedCareerAssists = Math.floor(Math.random() * (winner.max - winner.min + 1)) + winner.min;
            statusText.innerText = `Estatística: Distribuiu ${selectedCareerAssists} assistências!`;
            if (selectedPosition && selectedPosition.name === "Goleiro") {
                queueTransition(() => { currentSubStep = 11; startCareerSubStep(); });
            } else {
                queueTransition(() => { currentSubStep = 9; startCareerSubStep(); });
            }
            break;
            
        case 11: // Clean Sheets na Carreira
            selectedCleanSheetsRange = winner;
            selectedCareerCleanSheets = Math.floor(Math.random() * (winner.max - winner.min + 1)) + winner.min;
            statusText.innerText = `Estatística: Ficou ${selectedCareerCleanSheets} jogos sem sofrer gols (Clean Sheets)!`;
            queueTransition(() => { currentSubStep = 9; startCareerSubStep(); });
            break;
            
        case 9: // Bola de Ouro? Sim/Não
            ganhouBolaDeOuro = winner.value;
            statusText.innerText = ganhouBolaDeOuro 
                ? "Consagração Máxima! Vencedor da Bola de Ouro!" 
                : "Não obteve o prêmio de melhor do mundo na carreira.";
            if (ganhouBolaDeOuro) {
                queueTransition(() => { currentSubStep = 10; startCareerSubStep(); });
            } else {
                bolaDeOuroCount = 0;
                queueTransition(() => { currentSubStep = 12; startCareerSubStep(); });
            }
            break;
            
        case 10: // Quantas Bolas de Ouro?
            bolaDeOuroCount = winner.value;
            statusText.innerText = `Consagrado com ${bolaDeOuroCount} ${bolaDeOuroCount === 1 ? 'Bola de Ouro' : 'Bolas de Ouro'}!`;
            queueTransition(() => { currentSubStep = 12; startCareerSubStep(); });
            break;
            
        case 12: // Motivo da Aposentadoria
            selectedRetirementReason = winner;
            statusText.innerText = `Aposentadoria definida: ${selectedRetirementReason.name}!`;
            queueTransition(() => { finishStep14(); });
            break;
    }
}

function finishStep14() {
    statusText.innerText = "História internacional finalizada! Gerando biografia final...";
    transitionToStep(15);
    showFinalJourney();
}

function isAttributeAtMax(attributeKey) {
    let currentAttrObj = null;
    switch (attributeKey) {
        case "speed": currentAttrObj = selectedSpeed; break;
        case "finishing": currentAttrObj = selectedFinishing; break;
        case "dribbling": currentAttrObj = selectedDribbling; break;
        case "passing": currentAttrObj = selectedPassing; break;
        case "strength": currentAttrObj = selectedStrength; break;
        case "defending": currentAttrObj = selectedDefending; break;
    }
    if (!currentAttrObj) return false;
    const index = attributeTiers.findIndex(t => t.name === currentAttrObj.name);
    return index >= attributeTiers.length - 1;
}

function areAllAttributesAtMax() {
    return isAttributeAtMax("speed") &&
           isAttributeAtMax("finishing") &&
           isAttributeAtMax("dribbling") &&
           isAttributeAtMax("passing") &&
           isAttributeAtMax("strength") &&
           isAttributeAtMax("defending");
}

// 9. Upgrade Player Attribute
function upgradePlayerAttribute(attributeKey) {
    let currentAttrObj = null;
    let boxId = "";
    
    switch (attributeKey) {
        case "speed":
            currentAttrObj = selectedSpeed;
            boxId = "box-speed";
            break;
        case "finishing":
            currentAttrObj = selectedFinishing;
            boxId = "box-finishing";
            break;
        case "dribbling":
            currentAttrObj = selectedDribbling;
            boxId = "box-dribbling";
            break;
        case "passing":
            currentAttrObj = selectedPassing;
            boxId = "box-passing";
            break;
        case "strength":
            currentAttrObj = selectedStrength;
            boxId = "box-strength";
            break;
        case "defending":
            currentAttrObj = selectedDefending;
            boxId = "box-defending";
            break;
    }
    
    if (currentAttrObj) {
        const currentIndex = attributeTiers.findIndex(t => t.name === currentAttrObj.name);
        console.log("DEBUG EVOLUÇÃO:", {
            atributo: attributeKey,
            objetoAtual: currentAttrObj,
            nomeAtual: currentAttrObj ? currentAttrObj.name : null,
            indexEncontrado: currentIndex,
            listaTiers: attributeTiers.map(t => t.name)
        });
        const nextIndex = Math.min(attributeTiers.length - 1, currentIndex + 1);
        const nextAttrObj = attributeTiers[nextIndex];
        
        switch (attributeKey) {
            case "speed": selectedSpeed = nextAttrObj; break;
            case "finishing": selectedFinishing = nextAttrObj; break;
            case "dribbling": selectedDribbling = nextAttrObj; break;
            case "passing": selectedPassing = nextAttrObj; break;
            case "strength": selectedStrength = nextAttrObj; break;
            case "defending": selectedDefending = nextAttrObj; break;
        }
        
        // Atualiza a caixa de atributos na tela
        updateResultBox(boxId, `${nextAttrObj.name} (${nextAttrObj.rarity})`, [nextAttrObj.color, "#090618"]);
        triggerUpgradePulse(boxId);
        
        // Extrai apenas os números dos níveis (ex: "5/10 - Bom" vira "5")
        const currentLevel = currentAttrObj.name.split("/")[0];
        const nextLevel = nextAttrObj.name.split("/")[0];
        
        const attrNamesPt = {
            speed: "Velocidade",
            finishing: "Finalização",
            dribbling: "Drible",
            passing: "Passe",
            strength: "Força",
            defending: "Defesa"
        };
        const attrName = attrNamesPt[attributeKey] || attributeKey;
        const upgradeMsg = `${attrName} ${currentLevel} ➔ ${nextLevel}`;
        
        // Dispara o Toast de evolução premium na tela com a cor de raridade correspondente
        showUpgradeToast(upgradeMsg, nextAttrObj.color);
        
        return upgradeMsg;
    }
    return "";
}

// Premium Floating Evolution Notification Toast
function showUpgradeToast(message, color) {
    const existingToast = document.querySelector(".evolution-toast");
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement("div");
    toast.className = "evolution-toast";
    toast.innerHTML = `
        <div class="toast-icon">⚡</div>
        <div class="toast-content">
            <div class="toast-title">Atributo Melhorou</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    // Aplica a cor de raridade dinamicamente na borda e no brilho (glow) do toast
    toast.style.borderColor = color;
    toast.style.boxShadow = `0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px ${color}50`;
    
    document.body.appendChild(toast);
    
    // Inicia a saída suave do toast após 3 segundos
    setTimeout(() => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}


function triggerUpgradePulse(boxId) {
    const box = document.getElementById(boxId);
    if (box) {
        box.classList.remove("pulse-highlight");
        void box.offsetWidth; // Force reflow to restart animation
        box.classList.add("pulse-highlight");
    }
}

// 10. Finish Current Club Draft
function finishCurrentClubDraft() {
    const record = {
        league: selectedCareerLeague,
        team: selectedCareerTeam,
        years: selectedCareerYears,
        wonLeague: wonLeague,
        leagueTitles: wonLeague ? leagueTitlesCount : 0,
        wonCup: wonCup,
        cupTitles: wonCup ? cupTitlesCount : 0,
        wonContinental: wonContinental,
        continentalTitles: wonContinental ? continentalTitlesCount : 0,
        continentalTournament: wonContinental && selectedContinentalTournament ? selectedContinentalTournament.name : null,
        wonIntercontinental: wonIntercontinental,
        intercontinentalTitles: wonIntercontinental ? intercontinentalTitlesCount : 0,
        wonWorldClubCup: wonWorldClubCup,
        worldClubCupTitles: wonWorldClubCup ? worldClubCupTitlesCount : 0,
        improvedAttributes: improvedAttributes,
        numImproved: improvedAttributes ? numImprovedAttributes : 0
    };
    
    careerHistory.push(record);
    appendTimelineCard(record, currentClubIndex);
    
    remainingSeasons -= selectedCareerYears;
    currentCalendarYear += selectedCareerYears; // Avança o ano civil da carreira!
    currentClubIndex++;
    
    if (currentClubIndex < totalClubsCount) {
        currentSubStep = 0;
        
        // Reset sub-step career variables
        selectedCareerLeague = null;
        selectedCareerTeam = null;
        selectedCareerYears = 0;
        wonLeague = false;
        leagueTitlesCount = 0;
        wonCup = false;
        cupTitlesCount = 0;
        wonContinental = false;
        continentalTitlesCount = 0;
        selectedContinentalTournament = null;
        wonIntercontinental = false;
        intercontinentalTitlesCount = 0;
        wonWorldClubCup = false;
        worldClubCupTitlesCount = 0;
        improvedAttributes = false;
        numImprovedAttributes = 0;
        intercontinentalEligibleCount = 0;
        cwcEligibleCount = 0;
        
        // Transiciona para o próximo clube de forma síncrona para que a roleta atualize e gire imediatamente
        startCareerSubStep();
    } else {
        statusText.innerText = "Fase de clubes encerrada! Preparando convocações internacionais...";
        queueTransition(() => {
            transitionToStep(14);
        });
    }
}

// 11. Append Timeline Card to Sidebar
function appendTimelineCard(record, index) {
    const timelineContainer = document.getElementById("timelineContainer");
    if (!timelineContainer) return;
    
    // Remove placeholder card
    if (index === 0) {
        timelineContainer.innerHTML = "";
    }
    
    const card = document.createElement("div");
    card.className = "timeline-card";
    
    const activeLeagueObj = leagues.find(l => l.name === record.league) || leagues[1];
    card.style.borderColor = activeLeagueObj.color;
    
    const cupName = getDomesticCupName(record.league);
    const contName = record.continentalTournament || getContinentalTournamentName(record.league);
    
    // Localized terms for achievements
    const tLeague = currentLang === 'pt' ? 'Liga' : currentLang === 'en' ? 'League' : currentLang === 'es' ? 'Liga' : currentLang === 'ja' ? 'リーグ' : '联赛';
    const tInter = currentLang === 'pt' ? 'Intercontinental' : currentLang === 'en' ? 'Intercontinental' : currentLang === 'es' ? 'Intercontinental' : currentLang === 'ja' ? 'インターコンチネンタル' : '洲际杯';
    const tWorld = currentLang === 'pt' ? 'Mundial' : currentLang === 'en' ? 'World Cup' : currentLang === 'es' ? 'Mundial' : currentLang === 'ja' ? '世界一' : '世俱杯';
    const tNone = currentLang === 'pt' ? 'Nenhum título coletivo' : currentLang === 'en' ? 'No collective titles' : currentLang === 'es' ? 'Sin títulos colectivos' : currentLang === 'ja' ? '獲得タイトルなし' : '无集体荣誉';
    const tEvol = currentLang === 'pt' ? (record.numImproved === 1 ? 'evolução' : 'evoluções') : currentLang === 'en' ? (record.numImproved === 1 ? 'upgrade' : 'upgrades') : currentLang === 'es' ? (record.numImproved === 1 ? 'evolución' : 'evoluciones') : currentLang === 'ja' ? '能力向上' : '次属性提升';
    const tNoEvol = currentLang === 'pt' ? 'Sem evoluções' : currentLang === 'en' ? 'No upgrades' : currentLang === 'es' ? 'Sin evoluciones' : currentLang === 'ja' ? '能力向上なし' : '无属性提升';
    const tYear = record.years === 1 ? (currentLang === 'ja' || currentLang === 'zh' ? '年' : currentLang === 'en' ? 'year' : 'ano') : (currentLang === 'ja' || currentLang === 'zh' ? '年' : currentLang === 'en' ? 'years' : 'anos');
    
    // Translate cup name if necessary
    let translatedCupName = cupName.split(" ")[0];
    if (currentLang === "en") {
        translatedCupName = cupName.includes("Copa do") ? cupName.replace("Copa do ", "") + " Cup" : cupName.split(" ")[0];
    } else if (currentLang === "ja") {
        translatedCupName = cupName === "Copa do Brasil" ? "ブラジル杯" : "カップ戦";
    } else if (currentLang === "zh") {
        translatedCupName = cupName === "Copa do Brasil" ? "巴西杯" : "杯赛";
    }
    
    let translatedContName = translateContinentalTournamentName(contName, currentLang);
    const shortContName = translatedContName.replace("UEFA ", "").replace("Copa ", "").replace(" League", "");

    let achievements = [];
    if (record.wonLeague) achievements.push(`${record.leagueTitles}x ${tLeague}`);
    if (record.wonCup) achievements.push(`${record.cupTitles}x ${translatedCupName}`);
    if (record.wonContinental) {
        achievements.push(`${record.continentalTitles}x ${shortContName}`);
    }
    if (record.wonIntercontinental) {
        achievements.push(`${record.intercontinentalTitles}x ${tInter} 🌐`);
    }
    if (record.wonWorldClubCup) {
        achievements.push(`${record.worldClubCupTitles}x ${tWorld} 👑`);
    }
    
    const achievementText = achievements.length > 0 
        ? `🏆 ${achievements.join(", ")}` 
        : tNone;
    const achievementClass = achievements.length > 0 ? "timeline-achievement" : "timeline-achievement empty";
    
    const evolutionText = record.improvedAttributes
        ? `📈 ${record.numImproved} ${tEvol}`
        : tNoEvol;
    const evolutionClass = record.improvedAttributes ? "timeline-evolution" : "timeline-evolution empty";
    
    card.innerHTML = `
        <div class="timeline-card-header">
            <span class="timeline-club-name" style="color: ${activeLeagueObj.color}">${getClubCrestEmoji(record.team.name)} ${record.team.name}</span>
            <span class="timeline-club-years">${record.years} ${tYear}</span>
        </div>
        <div class="timeline-card-body">
            <div style="font-size: 0.72rem; color: var(--color-text-secondary); margin-bottom: 2px;">${translateTerm("continents", record.league) || record.league}</div>
            <div class="${achievementClass}">${achievementText}</div>
            <div class="${evolutionClass}">${evolutionText}</div>
        </div>
    `;
    
    timelineContainer.appendChild(card);
    
    // Scroll smoothly to bottom
    timelineContainer.scrollTo({
        top: timelineContainer.scrollHeight,
        behavior: 'smooth'
    });
}

function rebuildTimeline() {
    const timelineContainer = document.getElementById("timelineContainer");
    if (!timelineContainer) return;
    
    timelineContainer.innerHTML = "";
    
    if (careerHistory.length === 0) {
        timelineContainer.innerHTML = `<div class="timeline-placeholder">${translate("timelinePlaceholder")}</div>`;
        return;
    }
    
    careerHistory.forEach((record, index) => {
        appendTimelineCard(record, index);
    });
}

// 12. Confetti Particle System

let confettiActive = false;
let confettiParticles = [];
const confettiColors = ["#ff5f6d", "#ffc371", "#12c2e9", "#c471ed", "#11998e", "#38ef7d", "#f5af19", "#e65c00", "#8a2387", "#e94057", "#00c6ff", "#0072ff"];

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * -confettiCanvas.height - 20;
        this.size = Math.random() * 8 + 6;
        this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 5 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > confettiCanvas.height) {
            this.y = -20;
            this.x = Math.random() * confettiCanvas.width;
        }
    }

    draw() {
        ctxConfetti.save();
        ctxConfetti.translate(this.x, this.y);
        ctxConfetti.rotate((this.rotation * Math.PI) / 180);
        ctxConfetti.fillStyle = this.color;
        ctxConfetti.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctxConfetti.restore();
    }
}

const ctxConfetti = confettiCanvas.getContext("2d");

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function startConfetti() {
    confettiActive = true;
    resizeConfettiCanvas();
    confettiParticles = [];
    for (let i = 0; i < 140; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
    animateConfetti();
}

function stopConfetti() {
    confettiActive = false;
    ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

function animateConfetti() {
    if (!confettiActive) return;
    ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    confettiParticles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animateConfetti);
}

// 13. Event Listeners & Init
spinBtn.addEventListener("click", () => {
    if (currentStep === 15) {
        resultModal.classList.remove("hidden");
        return;
    }
    if (isWaitingToAdvance) {
        const advance = nextAdvanceCallback;
        isWaitingToAdvance = false;
        nextAdvanceCallback = null;
        
        spinBtn.innerHTML = "<span>GIRAR</span>";
        spinBtn.classList.remove("btn-advance");
        
        hasQueuedTransition = false; // Reseta a flag antes de executar a transição
        
        if (advance) advance();
        
        // Gira a roleta imediatamente apenas se nenhuma transição assíncrona foi agendada
        if (!hasQueuedTransition && currentStep < 15) {
            spinWheel();
        }
        return;
    }
    if (!isSpinning && currentStep < 15) {
        spinWheel();
    }
});

// Permitir clicar na roleta (canvas) para acionar o botão de Girar/Avançar
canvas.addEventListener("click", () => {
    if (!spinBtn.disabled) {
        spinBtn.click();
    }
});

resetJourneyBtn.addEventListener("click", () => {
    if (!isSpinning) {
        resetWholeJourney();
    }
});

closeModalBtn.addEventListener("click", resetWholeJourney);

const viewJourneyBtn = document.getElementById("viewJourneyBtn");
if (viewJourneyBtn) {
    viewJourneyBtn.addEventListener("click", () => {
        resultModal.classList.add("hidden");
    });
}

resultModal.addEventListener("click", (e) => {
    if (e.target === resultModal) {
        resultModal.classList.add("hidden");
    }
});

window.addEventListener("resize", () => {
    if (confettiActive) resizeConfettiCanvas();
});

// Girar a roleta ou avançar com a barra de espaço
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.key === " ") {
        // Ignora se o foco estiver em campos de digitação (como o input do nome do card)
        if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
            return;
        }
        
        e.preventDefault(); // Evita a rolagem padrão da página
        
        if (!spinBtn.disabled) {
            spinBtn.click();
        }
    }
});

// Initialize Tabs Click Listeners & Navigation
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");
        switchTab(tabId);
    });
});



function switchTab(tabId) {
    tabBtns.forEach(b => {
        if (b.getAttribute("data-tab") === tabId) {
            b.classList.add("active");
        } else {
            b.classList.remove("active");
        }
    });
    
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.remove("hidden");
        } else {
            content.classList.add("hidden");
        }
    });
}

function updateTableVisibility() {
    const speedTable = document.getElementById("speedTableSection");
    const seasonsTable = document.getElementById("seasonsTableSection");
    const placeholder = document.getElementById("no-table-placeholder");
    
    if (!placeholder) return;
    
    const speedVisible = speedTable && !speedTable.classList.contains("hidden");
    const seasonsVisible = seasonsTable && !seasonsTable.classList.contains("hidden");
    
    if (speedVisible || seasonsVisible) {
        placeholder.classList.add("hidden");
    } else {
        placeholder.classList.remove("hidden");
    }
}

// ==========================================
// INTERNATIONALIZATION (i18n) AUXILIARY FUNCTIONS
// ==========================================

function getTranslatedCountryDesc(countryName, lang) {
    if (lang === "pt") {
        const country = countryData[selectedContinent].find(c => c.name === countryName);
        return country ? country.desc : "";
    }
    // Traduções compactas de alta qualidade de descrições dos países
    const countryDescriptions = {
        "Nigéria": {
            en: "a land known for its vibrant energy, Nollywood film market, and rich culture of over 250 ethnic groups",
            es: "una tierra conocida por su energía vibrante, el mercado de Nollywood y una rica cultura de más de 250 grupos étnicos",
            ja: "活気に満ちたエネルギー、ノリウッド映画市場、そして250以上の民族グループによる豊かな文化で知られる土地",
            zh: "一个以充满活力、诺莱坞电影市场以及拥有250多个民族的丰富文化而闻名遐迩的国家"
        },
        "Etiópia": {
            en: "one of the oldest independent nations on Earth, with towering mountain landscapes and rich coffee traditions",
            es: "una de las naciones independientes más antiguas de la Tierra, con imponentes paisajes montañosos y una rica tradición cafetera",
            ja: "地球上で最も古い独立国の一つであり、そびえ立つ山の風景と豊かなコーヒーの伝統を持つ",
            zh: "地球上最古老的独立国家之一，拥有壮丽的山地景观和深厚的咖啡传统"
        },
        "Egito": {
            en: "the land of the Pharaohs, home to monumental ancient pyramids, sacred temples, and cut by the historic Nile River",
            es: "la tierra de los faraones, hogar de pirámides monumentales milenarias, templos sagrados y atravesada por el histórico río Nilo",
            ja: "ファラオの土地であり、記念碑的な古代のピラミッドや神聖な寺院があり、歴史的なナイル川が流れる",
            zh: "法老的土地，拥有宏伟的千年古金字塔、神圣的神庙，并被历史悠久的尼罗河穿过"
        },
        "R.D. Congo": {
            en: "the green heart of the continent, with the second-largest rainforest on the planet and massive wildlife diversity",
            es: "el corazón verde del continente, con la segunda selva tropical más grande del planeta y una enorme diversidad de vida silvestre",
            ja: "大陸の緑豊かな心臓部であり、地球上で2番目に大きい熱帯雨林と多様な野生生物を誇る",
            zh: "该大陆的绿色心脏，拥有地球上第二大热带雨林和极其丰富的野生动物多样性"
        },
        "África do Sul": {
            en: "the rainbow nation, home to incredible cultural diversity, surf beaches, and wildlife-rich safari reserves",
            es: "la nación del arco iris, hogar de una increíble diversidad cultural, playas de surf y reservas de safari ricas en fauna",
            ja: "レインボーネーション（虹の国）であり、信じられないほどの文化的多様性、サーフィンビーチ、野生動物のサファリ保護区がある",
            zh: "彩虹之国，拥有令人难以置信的文化多样性、冲浪海滩和野生动物丰富的野生动物保护区"
        },
        "Quênia": {
            en: "famous for safaris in the Masai Mara savanna, stunning Rift valleys, and world-dominating running athletes",
            es: "famoso por sus safaris en la sabana de Masai Mara, impresionantes valles del Rift y corredores que dominan el escenario mundial",
            ja: "マサイマラのサバンナでのサファリ、見事なリフトバレー、そして世界を席巻する陸上長距離ランナーで有名",
            zh: "以马赛马拉大草原的野生动物巡游、壮丽的裂谷以及称霸世界的长跑运动员而闻名"
        },
        "Estados Unidos": {
            en: "a globally influential power, filled with iconic metropolises, colossal national parks, and a melting pot of global cultures",
            es: "una potencia de influencia global, repleta de metrópolis icónicas, enormes parques nacionales y una mezcla de culturas de todo el mundo",
            ja: "世界的に影響力のある大国であり、象徴的な大都市、巨大な国立公園、世界中の文化が融合する地",
            zh: "一个具有全球影响力的超级大国，充满地标性的大都市、壮丽的国家公园和融合世界各地的多元文化"
        },
        "México": {
            en: "home to mysterious Mayan and Aztec ruins, sunny Caribbean beaches, and an internationally celebrated gastronomy",
            es: "hogar de misteriosas ruinas mayas y aztecas, playas caribeñas soleadas y una gastronomía celebrada internacionalmente",
            ja: "神秘的なマヤやアステカの遺跡、日当たりの良いカリブ海のビーチ、世界的に有名な美食の故郷",
            zh: "神秘的玛雅和阿兹特克遗址的所在地，拥有阳光明媚的加勒比海滩和享誉全球的国际美食"
        },
        "Canadá": {
            en: "a welcoming and peaceful nation, globally known for its snowy mountains, pine forests, and turquoise lakes",
            es: "una nación acogedora y pacífica, mundialmente conocida por sus montañas nevadas, bosques de pinos y lagos azul turquesa",
            ja: "雪山、松林、そしてターコイズブルーの湖で世界的に知られる、温かく平和な国",
            zh: "一个友好且和平的国家，因其白雪皑皑的山脉、茂密的松林和松石绿色的湖泊而闻名于世"
        },
        "Guatemala": {
            en: "the cultural epicentre of the modern Mayan world, featuring impressive active volcanoes and colorful indigenous markets",
            es: "el epicentro cultural del mundo maya moderno, caracterizado por impresionantes volcanes activos y coloridos mercados indígenas",
            ja: "現代のマヤ世界の文化の中心地であり、印象的な活火山とカラフルな先住民市場が特徴",
            zh: "现代玛雅世界的文化中心，以令人印象深刻的活火山和色彩斑斓的印第安市场为特色"
        },
        "Cuba": {
            en: "a captivating and historic Caribbean island, famous for its preserved classic cars, pulsing salsa music, and tropical beaches",
            es: "una isla caribeña cautivadora e histórica, famosa por sus autos clásicos preservados, música salsa vibrante y playas tropicales",
            ja: "クラシックカー、活気あるサルサ音楽、熱帯ビーチで有名な、魅惑的で歴史的なカリブ海の島",
            zh: "一座迷人且富有历史底蕴的加勒比海岛，以其保存完好的老爷车、动感的萨尔萨音乐和热带沙滩而闻名"
        },
        "Brasil": {
            en: "the largest and most joyful South American nation, globally famous for its exuberant carnival, Amazon Rainforest, and gorgeous beaches",
            es: "la nación sudamericana más grande y alegre, famosa mundialmente por su carnaval exuberante, la Selva Amazónica y playas hermosas",
            ja: "南米最大かつ最も陽気な国であり、華やかなカーニバル、アマゾンの熱帯雨林、美しいビーチで世界的に有名",
            zh: "南美洲最大、最热情的国家，因其狂野欢快的狂欢节、亚马逊雨林和令人惊叹的海岸风光而闻名全球"
        },
        "Colômbia": {
            en: "famous for producing the world's best mild coffee, rich Andean biodiversity, and modern cities adorned with art",
            es: "famosa por producir el mejor café suave del mundo, una rica biodiversidad andina y ciudades modernas adornadas con arte",
            ja: "世界最高の美味しいコーヒーの生産、豊かなアンデスの生物多様性、そして芸術で飾られた近代的な都市で有名",
            zh: "以生产世界上最好的温和咖啡、丰富的安第斯生物多样性以及充满艺术气息的现代城市而闻名"
        },
        "Argentina": {
            en: "the land of passionate tango, spectacular barbecues, the vast icy Patagonia, and a fervent passion for football",
            es: "la tierra del tango apasionado, los asados espectaculares, la inmensa Patagonia helada y una ferviente pasión por el fútbol",
            ja: "情熱的なタンゴ、見事なバーベキュー、広大なパタゴニアの氷河、そしてサッカーへの熱狂的な情熱の土地",
            zh: "充满激情的探戈之乡，拥有令人垂涎的烤肉、广袤冰封的巴塔哥尼亚以及对足球的狂热激情"
        },
        "Peru": {
            en: "cradle of the Inca Empire and the mysterious sacred city of Machu Picchu in the Andes heights, besides acclaimed cuisine",
            es: "cuna del Imperio Inca y la misteriosa ciudad sagrada de Machu Picchu en las alturas de los Andes, además de una aclamada gastronomía",
            ja: "インカ帝国の発祥地であり、アンデス山脈の高地にある神秘的な聖なる都市マチュピチュがあり、世界的に評価の高い美食を誇る",
            zh: "印加帝国的摇篮，拥有安第斯山脉高处神秘的圣城马丘比丘，以及享誉世界的当地美食"
        },
        "Venezuela": {
            en: "home to incredible untouched natural beauties, including Angel Falls, the highest waterfall in the world in the rainforest",
            es: "hogar de increíbles bellezas naturales vírgenes, incluido el Salto Ángel, la cascada más alta del mundo en la selva tropical",
            ja: "熱帯雨林の中にある世界で最も高い滝であるエンジェルフォールを含む、信じられないほどの未開の自然美がある地",
            zh: "拥有令人难以置信的原始自然风光，包括位于热带雨林中世界上最高的瀑布——安赫尔瀑布"
        },
        "Chile": {
            en: "a narrow and fascinating country, stretching from the arid sands of the Atacama Desert to the southern glaciers of Patagonia",
            es: "un país estrecho y fascinante, que se extiende desde las arenas áridas del desierto de Atacama hasta los glaciares del sur de la Patagonia",
            ja: "アタカマ砂漠の乾燥した砂からパタゴニアの南部の氷河まで広がる、細長く魅力的な国",
            zh: "一个狭长而迷人的国家，从阿塔卡马沙漠的荒凉沙滩一直延伸到巴塔哥尼亚的南部冰川"
        },
        "Índia": {
            en: "an unforgettable explosion of colors, deep spirituality, traditionalist festivals, aromatic spices, and the iconic Taj Mahal",
            es: "una explosión inolvidable de colores, espiritualidad profunda, festivales tradicionales, especias aromáticas y el icónico Taj Mahal",
            ja: "色、深い精神性、伝統的な祭り、芳香豊かなスパイス、そして象徴的なタージマハルの忘れられない融合",
            zh: "令人难忘的色彩风暴、深邃的精神信仰、传统节日、芳香的香料以及标志性的泰姬陵"
        },
        "China": {
            en: "one of the oldest continuous civilizations in the world, uniting the historic Great Wall with futuristic skyscrapers",
            es: "una de las civilizaciones continuas más antiguas del mundo, que une la histórica Gran Muralla con rascacielos futuristas",
            ja: "世界で最も古い連続した文明の一つであり、歴史的な万里の長城と近未来的な超高層ビルが融合する国",
            zh: "世界上最古老的连续文明之一，将历史悠久的万里长城与科幻未来的摩天大楼完美融合"
        },
        "Indonésia": {
            en: "a vast archipelago formed by more than 17,000 volcanic islands, dense rainforests, and exotic beaches of Bali",
            es: "un vasto archipiélago formado por más de 17,000 islas volcánicas, densas selvas tropicales y las exóticas playas de Bali",
            ja: "17,000以上の火山島、密集した熱帯雨林、バリのエキゾチックなビーチで構成される広大な群島",
            zh: "由17000多个火山岛屿、茂密的雨林以及巴厘岛异国情调的海滩组成的庞大群岛国家"
        },
        "Paquistão": {
            en: "land of colossal mountains of the Himalaya and K2 range, rich heritage of hospitality, and ancient fertile valleys",
            es: "tierra de montañas colosales del Himalaya y la cordillera K2, una rica herencia de hospitalidad y antiguos valles fértiles",
            ja: "ヒマラヤ山脈とK2の巨大な山々、温かいもてなしの豊かな伝統、そして古代の肥沃な谷の土地",
            zh: "拥有喜马拉雅山脉和K2峰等巍峨雪山、淳朴好客的文化传统以及古老肥沃山谷的国度"
        },
        "Bangladesh": {
            en: "a green plain cut by colossal rivers, famous for textile production and for sheltering the Bengal tiger",
            es: "una llanura verde atravesada por ríos colosales, famosa por la producción textil y por albergar al tigre de Bengala",
            ja: "巨大な川が流れる緑豊かな平野であり、繊維生産とベンガルトラの生息地として有名",
            zh: "被巨川大河纵横交错的葱郁平原，以纺织业发达以及作为孟加拉虎的栖息地而闻名"
        },
        "Japão": {
            en: "where the historical discipline of samurai and ancient Buddhist temples integrate with Tokyo's neon, anime, and high technology",
            es: "donde la disciplina histórica de los samuráis y los antiguos templos budistas se integran con el neón de Tokio, el anime y la alta tecnología",
            ja: "サムライの歴史的規律と古代の仏教寺院が、東京のネオン、アニメ、先端技術と融合する国",
            zh: "在这里，武士的历史底蕴与古老佛教寺庙同东京的霓虹魔幻、动漫以及前沿高科技完美交织"
        },
        "Filipinas": {
            en: "a paradisiacal refuge of thousands of tropical islands with hidden lagoons, ancient rice terraces, and welcoming people",
            es: "un refugio paradisíaco de miles de islas tropicales con lagunas escondidas, antiguas terrazas de arroz y gente acogedora",
            ja: "隠れたラグーン、古代の棚田、そして温かい人々がいる何千もの熱帯の島の楽園のような避難所",
            zh: "由数千个热带岛屿组成的度假天堂，拥有隐秘的泻湖、古老的梯田和热情好客的居民"
        },
        "Arábia Saudita": {
            en: "a desert nation of rich history and sacred Islamic heritage, famous for grand mosques, golden dunes, and futuristic development",
            es: "una nación desértica de rica historia y sagrado patrimonio islámico, famosa por sus grandiosas mezquitas, dunas doradas y desarrollo futurista",
            ja: "豊かな歴史と神聖なイスラムの遺産を持つ砂漠の国であり、壮大なモスク、黄金の砂丘、そして近未来的な開発で有名",
            zh: "拥有丰富历史和神圣伊斯兰文化遗产的沙漠国家，以宏伟的清真寺、金色沙丘以及充满未来感的发展而闻名"
        },
        "Rússia": {
            en: "the largest country on the planet, with outstanding contributions in literature, onion-dome architecture, and space exploration",
            es: "el país más grande del planeta, con contribuciones destacadas en literatura, arquitectura de cúpulas de cebolla y exploración espacial",
            ja: "地球上で最大の領土を持つ国であり、文学、玉ねぎ型ドームの建築、宇宙開発における顕著な貢献で知られる",
            zh: "地球上面积最大的国家，在文学、洋葱头穹顶建筑以及航天探索领域做出过杰出的贡献"
        },
        "Alemanha": {
            en: "European technological powerhouse, famous for its dense forests, fairytale medieval castles, and rich traditions",
            es: "potencia tecnológica europea, famosa por sus densos bosques, castillos medievales de cuentos de hadas y ricas tradiciones",
            ja: "ヨーロッパの技術大国であり、密集した森、おとぎ話のような中世の城、そして豊かな伝統で有名",
            zh: "欧洲的科技与工业巨头，以茂密的森林、童话般的中世古堡以及深厚的文化传统而闻名"
        },
        "Reino Unido": {
            en: "an island with history rich in royalty, imposing castles, green countryside landscapes, and massive influence on world pop music",
            es: "una isla con una historia rica en realeza, castillos imponentes, paisajes campestres verdes e influencia en la música pop mundial",
            ja: "王室の豊かな歴史、壮大な城、緑豊かな田園風景、そして世界のポップミュージックへの多大な影響力を持つ島",
            zh: "一座拥有深厚皇室历史、巍峨城堡、葱郁田园风光以及对世界流行音乐产生巨大影响的岛国"
        },
        "França": {
            en: "the capital of romance, high fashion, charming cafes in the streets of Paris, fine cuisine, and legendary museums like the Louvre",
            es: "la capital del romance, la alta moda, cafés encantadores en las calles de París, alta cocina y museos legendarios como el Louvre",
            ja: "ロマンス、オートクチュール、パリの街角の魅力的なカフェ、美食、そしてルーブルのような伝説的な美術館の都",
            zh: "浪漫、高端时尚的代名词，拥有巴黎街头迷人的咖啡馆、精致的美食以及卢浮宫等享誉世界的传奇博物馆"
        },
        "Itália": {
            en: "cradle of the Roman Empire and the artistic Renaissance, renowned for its home cuisine, Venice canals, and historic ruins",
            es: "cuna del Imperio Romano y del Renacimiento artístico, renombrada por su cocina casera, canales de Venecia e歷史的ruinas",
            ja: "ローマ帝国と芸術的ルネサンスの発祥地であり、家庭的な料理、ベネチアの運河、歴史的な遺跡で有名",
            zh: "罗马帝国和艺术文艺复兴的摇篮，以家庭意式美食、威尼斯运河和波澜壮阔的历史遗迹而闻名于世"
        },
        "Espanha": {
            en: "a sunny country filled with festive energy, fantastic architecture like Gaudi's, incredible beaches, and flavorful tapas",
            es: "un país soleado repleto de energía festiva, arquitectura fantástica como la de Gaudí, playas increíbles y sabrosas tapas",
            ja: "お祭りのエネルギー、ガウディのような幻想的な建築、素晴らしいビーチ、そして風味豊かなタパスに満ちた太陽の国",
            zh: "一个阳光明媚、充满节日活力的国家，拥有高迪等大师的奇幻建筑、绝美的沙滩和美味的塔帕斯"
        },
        "Ucrânia": {
            en: "a land of vast golden agricultural plains, rich Slavic culture, ancient golden-domed cathedrals, and folklore art",
            es: "una tierra de vastas llanuras agrícolas doradas, rica cultura eslava, catedrales antiguas de cúpulas doradas y arte folclórico",
            ja: "広大な黄金の農業平野、豊かなスラブ文化、古代の黄金ドームの大聖堂、そして民俗芸術の土地",
            zh: "一片拥有广袤金色农业平原、深厚斯拉夫文化、古老金顶大教堂和丰富民间艺术的土地"
        },
        "Austrália": {
            en: "an island-continent with unique exotic wildlife, perfect surf beaches, the vast Outback desert, and coral reefs",
            es: "una isla-continente con una fauna exótica única, playas de surf perfectas, el gran desierto de Outback y arrecifes de coral",
            ja: "ユニークでエキゾチックな野生動物、完璧なサーフィンビーチ、広大なアウトバック砂漠、そしてサンゴ礁を持つ島大陸",
            zh: "一个拥有独特奇异野生动物、完美冲浪海滩、广袤内陆荒漠和珊瑚礁的孤立大陆国家"
        },
        "Papua Nova Guiné": {
            en: "one of the most linguistically diverse countries on Earth, filled with isolated tribes and densely forested mountain ranges",
            es: "uno de los países con mayor diversidad lingüística de la Tierra, repleto de tribus aisladas y cadenas montañosas densamente boscosas",
            ja: "地球上で最も言語の多様性が高い国の一つであり、孤立した部族と密集した森林に覆われた山脈がある地",
            zh: "地球上语言多样性最高的国家之一，充满与世隔绝的部落和植被茂密的崇山峻岭"
        },
        "Nova Zelândia": {
            en: "famous for breathtaking volcanic landscapes, majestic glacial fjords, traditional Maori culture, and extreme adventures",
            es: "famosa por sus impresionantes paisajes volcánicos, majestuosos fiordos glaciares, cultura tradicional maorí y aventuras extremas",
            ja: "息をのむような火山風景、壮大な氷河のフィヨルド、伝統的なマオリ文化、そしてエクストリームアドベンチャーで有名",
            zh: "以令人叹为观止的火山风光、雄伟的冰川峡湾、传统的毛利文化和极限运动而闻名"
        },
        "Fiji": {
            en: "an idyllic archipelago with colorful lush coral reefs, warm crystal-clear waters, and legendary local hospitality",
            es: "un archipiélago idílico con coloridos y exuberantes arrecifes de coral, aguas cálidas y cristalinas y una hospitalidad local de leyenda",
            ja: "カラフルで豊かなサンゴ礁、温かく透明な水、そして伝説的な地元のもてなしがある牧歌的な群島",
            zh: "一个田园诗般的群岛，拥有五彩斑斓的珊瑚礁、温暖清澈的海水和传奇般的热情民风"
        }
    };
    
    if (countryDescriptions[countryName]) {
        return countryDescriptions[countryName][lang] || countryDescriptions[countryName]["en"] || "";
    }
    return "";
}

function getTranslatedHeightDesc(heightDesc, lang) {
    if (lang === "pt") return heightDesc;
    
    const heightMappings = {
        "muito baixo e extremamente ágil": {
            en: "very short and extremely agile, low center of gravity",
            es: "muy bajo y extremadamente ágil, bajo centro de gravedad",
            ja: "非常に小柄で極めて俊敏、重心が低い",
            zh: "非常矮小且极其敏捷，重心极低"
        },
        "estatura baixa, muito veloz e dinâmico": {
            en: "short stature, very fast and dynamic on the pitch",
            es: "estatura baja, muy rápido y dinámico en el campo",
            ja: "小柄な体格、ピッチ上で非常に高速かつダイナミック",
            zh: "矮小身材，在场上速度极快且充满活力"
        },
        "estatura mediana, boa flexibilidade e equilíbrio": {
            en: "average height, good flexibility and physical balance",
            es: "estatura mediana, buena flexibilidad y equilibrio físico",
            ja: "平均的な身長、優れた柔軟性と身体のバランス",
            zh: "中等身材，拥有良好的灵活性和身体平衡"
        },
        "estatura ideal para meias-armadores criativos": {
            en: "ideal height for creative attacking midfielders",
            es: "estatura ideal para mediocampistas creativos",
            ja: "創造的な攻撃的MFに最適な理想のサイズ",
            zh: "创意型前腰的理想身高"
        },
        "altura equilibrada, excelente controle de bola": {
            en: "balanced height, excellent body and ball control",
            es: "altura equilibrada, excelente control corporal y del balón",
            ja: "バランスの取れた身長、優れた身体とボールのコントロール",
            zh: "均衡的身高，极佳的身体与控球能力"
        },
        "estatura clássica de atacante moderno": {
            en: "classic stature of a modern complete forward",
            es: "estatura clásica de un delantero moderno completo",
            ja: "現代的なコンプリートフォワードのクラシックな体格",
            zh: "现代全能前锋的经典身材"
        },
        "estatura forte, excelente impulsão vertical": {
            en: "strong build, excellent vertical jumping power",
            es: "estatura fuerte, excelente capacidad de salto vertical",
            ja: "強靭な体格、優れた垂直跳びの跳躍力",
            zh: "强壮的体格，极佳的垂直弹跳能力"
        },
        "porte físico imponente, dominante no ar": {
            en: "imposing physical presence, highly dominant in the air",
            es: "presencia física imponente, muy dominante en el juego aéreo",
            ja: "圧倒的なフィジカルプレゼンス、空中戦で非常に支配的",
            zh: "魁梧的身材，在空中争顶时极具统治力"
        },
        "altura colossal, excelente alcance e força": {
            en: "colossal height, excellent reach, physical power and presence",
            es: "altura colosal, excelente alcance, fuerza física y presencia",
            ja: "巨大な身長、優れたリーチ、フィジカルパワーと存在感",
            zh: "巨人般的身高，极佳的防守范围、力量与球场威慑力"
        },
        "altura de gigante, muralha intransponível": {
            en: "giant height, an absolute insurmountable wall in defense",
            es: "altura de gigante, una muralla absoluta e infranqueable en defensa",
            ja: "巨人のような身長、ディフェンスにおける絶対的な難攻不落の壁",
            zh: "巨人般的身高，防线上面对对手防不胜防的铜墙铁壁"
        }
    };
    
    const cleanDesc = heightDesc.trim();
    if (heightMappings[cleanDesc]) {
        return heightMappings[cleanDesc][lang] || heightMappings[cleanDesc]["en"] || heightDesc;
    }
    return heightDesc;
}

function getTranslatedAgeDesc(ageDesc, lang) {
    if (lang === "pt") return ageDesc;
    
    const ageMappings = {
        "jovem prodígio, estreia precoce histórica": {
            en: "young prodigy, historic precocious debut",
            es: "joven prodigio, debut precoz histórico",
            ja: "若き神童、歴史的な飛び級デビュー",
            zh: "年轻神童，创造历史的超年轻首秀"
        },
        "subida rápida da base, grande promessa": {
            en: "rapid rise from youth ranks, great prospect",
            es: "rápido ascenso de la cantera, gran promesa",
            ja: "ユースからの急速な昇格、大いなる有望株",
            zh: "青训梯队快速提拔，备受瞩目的明日之星"
        },
        "idade de transição clássica, muito focado": {
            en: "classic transition age, highly focused and prepared",
            es: "edad de transición clásica, muy enfocado y preparado",
            ja: "クラシックな昇格年齢、高い集中力と準備体制",
            zh: "黄金首秀年龄，极度专注且准备充分"
        },
        "amadurecimento na base, físico muito pronto": {
            en: "matured in the academy, physically ready for the pros",
            es: "maduración en la cantera, físico muy preparado para profesionales",
            ja: "アカデミーで成熟、プロに通用するフィジカルが完成",
            zh: "在青训营磨砺成熟，身体素质已完全适应职业对抗"
        },
        "profissionalização tardia, resiliência mental": {
            en: "late professionalization, exceptional mental resilience and drive",
            es: "profesionalización tardía, resiliencia mental y empuje excepcional",
            ja: "遅咲きのプロ入り、並外れた精神的レジリエンスと情熱",
            zh: "大器晚成的职业合同，拥有非凡的坚韧意志和渴望"
        }
    };
    
    const cleanDesc = ageDesc.trim();
    if (ageMappings[cleanDesc]) {
        return ageMappings[cleanDesc][lang] || ageMappings[cleanDesc]["en"] || ageDesc;
    }
    return ageDesc;
}

function getTranslatedPositionDesc(positionName, lang) {
    if (lang === "pt") {
        const position = footballPositions.find(p => p.name === positionName);
        return position ? position.desc : "";
    }
    
    const positionDescriptions = {
        "Goleiro": {
            en: "the guardian of the goal. The last line of defense, responsible for impressive athletic saves and leading the defense from the back",
            es: "el guardián de la portería. El último bastión defensivo, responsable de paradas atléticas impresionantes y de liderar la zaga",
            ja: "ゴールの守護神。最後の砦であり、驚異的なアスレチックセーブと最後方からのディフェンス陣の統率を担う",
            zh: "球门守护者。防线的最后一道关卡，负责做出惊人的高难度扑救，并从后场指挥整条防线"
        },
        "Zagueiro": {
            en: "the defensive rock. An unbeatable physical and tactical defender in ground tackles and aerial play, protecting the box at all costs",
            es: "la roca defensiva. Un defensor físico y táctico imbatible en los duelos terrestres y en el juego aéreo, protegiendo el área a toda costa",
            ja: "守備の要石。地上戦や空中戦において無類の強さを誇る物理的・戦術的ディエンダーであり、いかなる対価を払ってもエリアを守り抜く",
            zh: "防守磐石。在地面拦截和空中争顶中均无可匹敌的身体与战术型防守球员，不惜一切代价保护禁区"
        },
        "Lateral Esquerdo": {
            en: "the motor of the left flank. Fast and disciplined, supports the attack with precise crosses and recovers quickly to defend",
            es: "el motor del flanco izquierdo. Rápido y disciplinado, apoya el ataque con centros precisos y regresa rápidamente a defender",
            ja: "左サイドのモーター。俊敏かつ規律正しく、正確なクロスで攻撃をサポートし、守備への素早い帰還を見せる",
            zh: "左路发动机。速度极快且纪律性强，能送出精准的传中支持进攻，并能迅速回撤参与防守"
        },
        "Lateral Direito": {
            en: "the motor of the right flank. Dominates the right wing with explosive runs, baseline crosses, and direct marking combat",
            es: "el motor del flanco derecho. Domina la banda derecha con carreras explosivas, centros desde la línea de fondo y marca directa",
            ja: "右サイドのモーター。爆発的なスプリント、エンドラインからのクロス、そして直接的なマンマークによる競り合いで右サイドを支配する",
            zh: "右路发动机。以爆发力的前插、底线传中和直接的贴身防守统治整个右路"
        },
        "Volante": {
            en: "the midfielder shield. Destroys the opponent's offensive play with precise tackles and organizes ball distribution from the back",
            es: "el escudo del mediocampo. Destruye el juego ofensivo rival con entradas precisas y organiza la salida del balón desde la defensa",
            ja: "中盤の盾。正確なタックルで相手の攻撃の芽を摘み取り、守備陣からのボールの配給を組み立てる",
            zh: "中场铁闸。以精准的抢断摧毁对手的进攻组织，并负责梳理后场进攻的发起"
        },
        "Meio-Campo": {
            en: "the game architect. Controls the match tempo, distributes short and long passes, and dictates precise transitions",
            es: "el arquitecto del juego. Controla el ritmo del partido, distribuye pases cortos y largos y dicta transiciones precisas",
            ja: "ゲームの建築家。試合のテンポをコントロールし、ショートパスとロングパスを配給し、正確なトランジションを決定する",
            zh: "中场大师/节拍器。掌控比赛节奏，送出致命的长短传，组织精准的攻防转换"
        },
        "Meia-Armador": {
            en: "the creative genius. The classic number 10 who sees plays nobody else does, featuring tight dribbles and sweet key passes",
            es: "el genio creativo. El clásico número 10 que ve jugadas donde nadie más las ve, con regates cortos y asistencias precisas",
            ja: "創造的ジーニアス。狭いスペースでのドリブルと絶妙なキーパスで、他の誰もが見逃すような展開を見出すクラシックな背番号10",
            zh: "创意组织天才。经典的前场10号，擅长在狭小空间进行盘带并送出精妙钥匙传球，能看到旁人无法察觉的传球路线"
        },
        "Ponta Esquerda": {
            en: "the left wing wizard. Ultra-fast and highly technical, cuts inside to shoot with their right foot or assists the striker",
            es: "el mago de la banda izquierda. Ultra rápido y muy técnico, recorta hacia adentro para disparar con su pierna derecha o asiste al delantero",
            ja: "左サイドの魔術師。極めて高速で高い技術を持ち、カットインして右足でシュートを放つか、フォワードをアシストする",
            zh: "左路魔术师。拥有极快的爆发速度和高超技术，擅长内切用右足起脚射门或助攻中锋"
        },
        "Ponta Direita": {
            en: "the right wing wizard. Dazzles defense with speed, dribbling, and runs, creating absolute panic in the opponent's area",
            es: "el mago de la banda derecha. Deslumbra a la defensa con velocidad, regate y desborde, creando pánico absoluto en el área rival",
            ja: "右サイドの魔術師。スピード、ドリブル、そして突破力でディフェンスを翻弄し、相手エリアに絶対的なパニックを引き起こす",
            zh: "右路魔术师。以速度、盘带和插上突破撕裂防线，在对手禁区内制造巨大混乱"
        },
        "Ponta Direito": {
            en: "the right wing wizard. Dazzles defense with speed, dribbling, and runs, creating absolute panic in the opponent's area",
            es: "el mago de la banda derecha. Deslumbra a la defensa con velocidad, regate y desborde, creando pánico absoluto en el área rival",
            ja: "右サイドの魔術師。スピード、ドリブル、突破力でディフェンスを翻弄し、相手エリアに絶対的なパニックを引き起こす",
            zh: "右路魔术师。以速度、盘带和插上突破撕裂防线，在对手禁区内制造巨大混乱"
        },
        "Centroavante": {
            en: "the ultimate goalscorer. The classic number 9, clinical finisher who positioning themselves perfectly to put the ball in the net",
            es: "el goleador definitivo. El clásico número 9, definidor clínico que se posiciona perfectamente para mandar el balón a la red",
            ja: "究極の点取り屋。決定力抜群のクラシックな背番号9であり、完璧なポジショニングからボールを網に突き刺す",
            zh: "终极得分手。经典的正印9号，门前嗅觉极其敏锐，能通过完美跑位接球将球送入网窝"
        }
    };
    
    if (positionDescriptions[positionName]) {
        return positionDescriptions[positionName][lang] || positionDescriptions[positionName]["en"] || "";
    }
    return "";
}

function getTranslatedRetirementDesc(reasonName, reasonDesc, lang) {
    if (lang === "pt") return reasonDesc;
    
    const retirementDescriptions = {
        "Dores CrÃ´nicas ðŸ¤•": {
            en: "incessant chronic pain in the knees and joints, making the daily physical sacrifice unbearable",
            es: "dolores crÃ³nicos incesantes en las rodillas y articulaciones, haciendo que el sacrificio fÃ­sico diario sea insoportable",
            ja: "è†ã¨é–¢ç¯€ã®çµ¶ãˆé–“ãªã„æ…¢æ€§çš„ãªç—›ã¿ã®ãŸã‚ã«ã€æ—¥ã€…ã®è‚‰ä½“çš„ãªçŠ ç‰²ãŒè€ãˆé›£ã„ã‚‚ã®ã«ãªã£ãŸãŸã‚",
            zh: "åŒè†å’Œå…³èŠ‚é•¿å¹´ç´¯æœˆé­å—æŒç»­æ€§çš„æ…¢æ€§ç–¼ç—›æŠ˜ç£¨ï¼Œè®©æ¯æ—¥çš„èº«ä½“ä»˜å‡ºå˜å¾—éš¾ä»¥å¿å—"
        },
        "LesÃ£o Grave ðŸ¥": {
            en: "a severe ligament injury in the pre-season, accelerating the decision to hang up the boots",
            es: "una grave lesiÃ³n de ligamento en la pretemporada, acelerando la decisiÃ³n de colgar las botas",
            ja: "ãƒ—ãƒ¬ã‚·ãƒ¼ã‚ºãƒ³ä¸­ã®æ·±åˆ»ãªé­å¸¯ã®æ€ªæˆ‘ã«ã‚ˆã‚Šã€ã‚¹ãƒ‘ã‚¤ã‚¯ã‚’è„±ãæ±ºæ–­ã‚’æ—©ã‚ãŸãŸã‚",
            zh: "å­£å‰èµ›ä¸­ä¸å¹¸é­é‡ä¸¥é‡çš„éŸ§å¸¦æ’•è£‚ä¼¤ç—…ï¼Œè¿«ä½¿ä½ åŠ é€Ÿåšå‡ºé€€å½¹çš„å†³å®š"
        },
        "Escolha PrÃ³pria ðŸš¶â€â™‚ï¸": {
            en: "a personal choice to leave at the top, wanting to enjoy free time with family while still at physical peak",
            es: "elecciÃ³n propia de retirarse en la cima, queriendo disfrutar del tiempo libre con la familia mientras aÃºn estÃ¡ en el apogeo fÃ­sico",
            ja: "è‚‰ä½“çš„ãªå…¨ç››æœŸã«ã‚ã‚‹ã†ã¡ã«ã€å®¶æ—ã¨ã®è‡ªç”±ãªæ™‚é–“ã‚’æ¥½ã—ã¿ãŸã„ã¨ã„ã†è‡ªç™ºçš„ãªæ±ºæ–­ã«ã‚ˆã‚‹ã‚‚ã®",
            zh: "åœ¨èº«ä½“æœºèƒ½ä»å¤„äºŽå·…å³°æ—¶é€‰æ‹©åŠŸæˆèº«é€€ï¼Œæ¸´æœ›é™ªä¼´å®¶äººå¹¶äº«å—è½»æ¾çš„é—²æš‡æ—¶å…‰"
        },
        "Idade AvanÃ§ada ðŸ‘´": {
            en: "advanced age reflecting on physical pace, preferring to give space for young talents to shine",
            es: "edad avanzada que se refleja en el ritmo fÃ­sico, prefiriendo dar espacio para que brillen los jÃ³venes talentos",
            ja: "å¹´é½¢ãŒè‚‰ä½“çš„ãªãƒšãƒ¼ã‚¹ã«å½±éŸ¿ã—å§‹ã‚ã€è‹¥ã„æ‰èƒ½ãŒè¼ããŸã‚ã®é“ã‚’é–‹ãã“ã¨ã‚’å„ªå…ˆã—ãŸãŸã‚",
            zh: "é«˜é¾„å¼€å§‹å½±å“çƒåœºä¸Šçš„ç«žæŠ€èŠ‚å¥ï¼Œé€‰æ‹©ä¸»åŠ¨è®©ä½ç»™æ›´å¹´è½»çš„å¤©æ‰çƒå‘˜ä»¬"
        },
        "Desejo de ser Treinador ðŸ“‹": {
            en: "a burning desire to immediately start studying to become a football manager",
            es: "el deseo ardiente de comenzar inmediatamente los estudios para convertirse en entrenador de fÃºtbol",
            ja: "ã‚µãƒƒã‚«ãƒ¼æŒ‡å°Žè€…ã«ãªã‚‹ãŸã‚ã®å‹‰å¼·ã‚’ã™ãã«å§‹ã‚ãŸã„ã¨ã„ã†ç†±çƒˆãªæ„æ¬²ã«ã‚ˆã‚‹ã‚‚ã®",
            zh: "å†…å¿ƒæžåº¦æ¸´æœ›ç«‹å³å¼€å¯ä¸“ä¸šå­¦ä¹ ï¼Œä»¥å°½æ—©è½¬åž‹æˆä¸ºä¸€åèŒä¸šè¶³çƒæ•™ç»ƒ"
        },
        "Desgaste Mental ðŸ§ ": {
            en: "accumulated mental wear with the heavy routine of travels, hotels, and unsustainable fan pressure",
            es: "desgaste mental acumulado con la pesada rutina de viajes, hoteles y presiones insostenibles de la aficiÃ³n",
            ja: "é å¾ã‚„ãƒ›ãƒ†ãƒ«ç”Ÿæ´» de éŽé…·ãªãƒ«ãƒ¼ãƒ†ã‚£ãƒ³ã€ç²¾ç¥žçš„ã«è€ãˆé›£ã„ãƒ—ãƒ¬ãƒƒã‚·ãƒ£ãƒ¼ã«ã‚ˆã‚‹ã‚¹ãƒˆãƒ¬ã‚¹ã®è“„ç©ã®ãŸã‚",
            zh: "å¸¸å¹´å¥”æ³¢å®¢åœºæ—…é€”ã€é›†è®­é…’åº—ä»¥åŠçƒè¿·ç¾¤ä½“å¸¦æ¥çš„æ— å½¢åŽ‹åŠ›ï¼Œè®©ä½ ç§¯ç´¯äº†ä¸¥é‡çš„ç²¾ç¥žç–²æƒ«"
        }
    };
    
    if (retirementDescriptions[reasonName]) {
        return retirementDescriptions[reasonName][lang] || retirementDescriptions[reasonName]["en"] || reasonDesc;
    }
    return reasonDesc;
}

function translateContinentalTournamentName(contName, lang) {
    if (lang === "pt") return contName;
    
    const tournamentTranslations = {
        "Copa Libertadores": { en: "Copa Libertadores", es: "Copa Libertadores", ja: "コパ・リベルタドーレス", zh: "南美解放者杯" },
        "Copa Sul-Americana": { en: "Copa Sudamericana", es: "Copa Sudamericana", ja: "コパ・スダメリカーナ", zh: "南美杯" },
        "UEFA Champions League": { en: "UEFA Champions League", es: "UEFA Champions League", ja: "UEFAチャンピオンズリーグ", zh: "欧洲冠军联赛" },
        "UEFA Europa League": { en: "UEFA Europa League", es: "UEFA Europa League", ja: "UEFAヨーロッパリーグ", zh: "欧足联欧洲联赛" },
        "UEFA Conference League": { en: "UEFA Conference League", es: "UEFA Conference League", ja: "UEFAカンファレンスリーグ", zh: "欧足联欧洲协会联赛" },
        "Concacaf Champions Cup": { en: "Concacaf Champions Cup", es: "Copa de Campeones de la Concacaf", ja: "CONCACAFチャンピオンズカップ", zh: "中北美及加勒比海冠军杯" },
        "Leagues Cup": { en: "Leagues Cup", es: "Leagues Cup", ja: "リーグスカップ", zh: "联盟杯" },
        "CAF Champions League": { en: "CAF Champions League", es: "Liga de Campeones de la CAF", ja: "CAFチャンピオンズリーグ", zh: "非洲冠军联赛" },
        "AFC Champions League": { en: "AFC Champions League", es: "Liga de Campeones de la AFC", ja: "AFCチャンピオンズリーグ", zh: "亚足联冠军联赛" },
        "OFC Champions League": { en: "OFC Champions League", es: "Liga de Campeones de la OFC", ja: "OFCチャンピオンズリーグ", zh: "大洋洲冠军联赛" },
        "Copa América": { en: "Copa America", es: "Copa América", ja: "コパ・アメリカ", zh: "美洲杯" },
        "Eurocopa": { en: "UEFA Euro", es: "Eurocopa", ja: "ユーロ", zh: "欧洲杯" },
        "Copa Ouro": { en: "CONCACAF Gold Cup", es: "Copa Oro", ja: "ゴールドカップ", zh: "美金杯" },
        "Copa das Nações Africanas": { en: "Africa Cup of Nations", es: "Copa Africana de Naciones", ja: "アフリカネイションズカップ", zh: "非洲国家杯" },
        "Copa da Ásia": { en: "AFC Asian Cup", es: "Copa Asiática", ja: "アジアカップ", zh: "亚洲杯" },
        "Copa das Nações da OFC": { en: "OFC Nations Cup", es: "Copa de las Naciones de la OFC", ja: "OFCネイションズカップ", zh: "大洋洲国家杯" }
    };
    
    // Busca aproximada caso o nome contenha partes
    for (const [key, mapping] of Object.entries(tournamentTranslations)) {
        if (contName.includes(key)) {
            return mapping[lang] || mapping["en"] || contName;
        }
    }
    return contName;
}

function translateContinentalSelectionTournamentName() {
    const contName = getContinentalSelectionTournamentName();
    return translateContinentalTournamentName(contName, currentLang);
}

// ==========================================
// INTERNATIONALIZATION (i18n) IMPLEMENTATION
// ==========================================

const stepSubtitles = {
    pt: [
        "Etapa 1: Gire a roleta para descobrir em qual continente você irá nascer!",
        "Etapa 2: Gire a roleta para descobrir o seu país de nascimento!",
        "Etapa 3: Gire a roleta para descobrir a sua estatura física!",
        "Etapa 4: Gire a roleta para descobrir a sua idade de estreia profissional!",
        "Etapa 5: Gire a roleta para descobrir a sua posição ideal nos gramados!",
        "Etapa 6: Gire a roleta para descobrir o seu atributo de velocidade!",
        "Etapa 7: Gire a roleta para descobrir o seu atributo de finalização!",
        "Etapa 8: Gire a roleta para descobrir o seu atributo de drible!",
        "Etapa 9: Gire a roleta para descobrir o seu atributo de passe!",
        "Etapa 10: Gire a roleta para descobrir o seu atributo de força física!",
        "Etapa 11: Gire a roleta para descobrir o seu atributo de defesa!",
        "Etapa 12: Gire a roleta para descobrir quantas temporadas durará sua carreira!",
        "Etapa 13: Gire a roleta para descobrir quantos clubes você defenderá!",
        "Etapa 14: Carreira em andamento! Acompanhe seus sorteios de clubes e seleção!"
    ],
    en: [
        "Step 1: Spin the wheel to discover which continent you will be born in!",
        "Step 2: Spin the wheel to discover your birth country!",
        "Step 3: Spin the wheel to discover your physical height!",
        "Step 4: Spin the wheel to discover your professional debut age!",
        "Step 5: Spin the wheel to discover your playing position!",
        "Step 6: Spin the wheel to discover your speed attribute!",
        "Step 7: Spin the wheel to discover your finishing attribute!",
        "Step 8: Spin the wheel to discover your dribbling attribute!",
        "Step 9: Spin the wheel to discover your passing attribute!",
        "Step 10: Spin the wheel to discover your physical strength!",
        "Step 11: Spin the wheel to discover your defending attribute!",
        "Step 12: Spin the wheel to discover how many seasons you will play!",
        "Step 13: Spin the wheel to discover how many clubs you will defend!",
        "Step 14: Career in progress! Follow your club contract drafts and international caps!"
    ],
    es: [
        "Etapa 1: ¡Gira la ruleta para descubrir en qué continente nacerás!",
        "Etapa 2: ¡Gira la ruleta para descubrir tu país de nacimiento!",
        "Etapa 3: ¡Gira la ruleta para descubrir tu estatura física!",
        "Etapa 4: ¡Gira la ruleta para descubrir tu edad de debut profesional!",
        "Etapa 5: ¡Gira la ruleta para descubrir tu posición ideal en el campo!",
        "Etapa 6: ¡Gira la ruleta para descubrir tu atributo de velocidad!",
        "Etapa 7: ¡Gira la ruleta para descubrir tu atributo de finalización!",
        "Etapa 8: ¡Gira la ruleta para descubrir tu atributo de regate!",
        "Etapa 9: ¡Gira la ruleta para descubrir tu atributo de pase!",
        "Etapa 10: ¡Gira la ruleta para descubrir tu fuerza física!",
        "Etapa 11: ¡Gira la ruleta para descubrir tu atributo de defensa!",
        "Etapa 12: ¡Gira la ruleta para descubrir cuántas temporadas durará tu carrera!",
        "Etapa 13: ¡Gira la ruleta para descubrir cuántos clubes defenderás!",
        "Etapa 14: ¡Carrera en curso! Sigue tus sorteos de clubes y selección nacional!"
    ],
    ja: [
        "ステップ 1: ルーレットを回して、生まれる大陸を決定しましょう！",
        "ステップ 2: ルーレットを回して、あなたの出身国を決定しましょう！",
        "ステップ 3: ルーレットを回して、あなたの身長を決定しましょう！",
        "ステップ 4: ルーレットを回して、あなたのプロデビュー年齢を決定しましょう！",
        "ステップ 5: ルーレットを回して、ピッチ上でのポジションを決定しましょう！",
        "ステップ 6: ルーレットを回して、スピード属性を決定しましょう！",
        "ステップ 7: ルーレットを回して、決定力属性を決定しましょう！",
        "ステップ 8: ルーレットを回して、ドリブル属性を決定しましょう！",
        "ステップ 9: ルーレットを回して、パス属性を決定しましょう！",
        "ステップ 10: ルーレットを回して、フィジカル強度の属性を決定しましょう！",
        "ステップ 11: ルーレットを回して、ディフェンス属性を決定しましょう！",
        "ステップ 12: ルーレットを回して、現役シーズン数を決定しましょう！",
        "ステップ 13: ルーレットを回して、所属するクラブ数を決定しましょう！",
        "ステップ 14: キャリア進行中！クラブ移籍のドラフトと代表戦を追いかけましょう！"
    ],
    zh: [
        "步骤 1：旋转轮盘，探索你出生的洲！",
        "步骤 2：旋转轮盘，探索你的出生国家！",
        "步骤 3：旋转轮盘，探索你的身高！",
        "步骤 4：旋转轮盘，探索你的职业首秀年龄！",
        "步骤 5：旋转轮盘，探索你的场上位置！",
        "步骤 6：旋转轮盘，探索你的速度属性！",
        "步骤 7：旋转轮盘，探索你的射门属性！",
        "步骤 8：旋转轮盘，探索你的盘带属性！",
        "步骤 9：旋转轮盘，探索你的传球属性！",
        "步骤 10：旋转轮盘，探索你的力量属性！",
        "步骤 11：旋转轮盘，探索你的防守属性！",
        "步骤 12：旋转轮盘，探索你的生涯赛季数！",
        "步骤 13：旋转轮盘，探索你的所属俱乐部数！",
        "步骤 14：生涯正在进行！关注你的俱乐部签约与国家队征程！"
    ]
};

function initLanguageSelector() {
    const trigger = document.getElementById("langDropdownTrigger");
    const menu = document.getElementById("langDropdownMenu");
    const items = document.querySelectorAll(".dropdown-item");
    
    if (trigger && menu) {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            trigger.classList.toggle("open");
            menu.classList.toggle("open");
        });
        
        document.addEventListener("click", (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                trigger.classList.remove("open");
                menu.classList.remove("open");
            }
        });
    }
    
    items.forEach(item => {
        if (item.getAttribute("data-lang") === currentLang) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
        
        item.addEventListener("click", () => {
            const newLang = item.getAttribute("data-lang");
            if (newLang !== currentLang) {
                currentLang = newLang;
                localStorage.setItem("rumo_estrelato_lang", currentLang);
                
                items.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                
                if (trigger && menu) {
                    trigger.classList.remove("open");
                    menu.classList.remove("open");
                }
                
                applyLanguage();
            }
        });
    });
}

function applyLanguage() {
    // Sincronizar rótulos ativos do dropdown trigger (médios/longos e curtos)
    const langNamesLong = {
        pt: "Português",
        en: "English",
        es: "Español",
        ja: "日本語",
        zh: "简体中文"
    };

    const langNamesShort = {
        pt: "PT",
        en: "EN",
        es: "ES",
        ja: "JA",
        zh: "ZH"
    };

    const activeLangNameLongEl = document.querySelector(".lang-name-long");
    const activeLangNameShortEl = document.querySelector(".lang-name-short");
    if (activeLangNameLongEl) {
        activeLangNameLongEl.innerText = langNamesLong[currentLang] || "Português";
    }
    if (activeLangNameShortEl) {
        activeLangNameShortEl.innerText = langNamesShort[currentLang] || "PT";
    }

    // 1. Traduzir elementos estáticos do HTML que possuem data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.innerText = translate(key, el.innerText);
    });
    
    // 2. Traduzir texto do rodapé dinamicamente
    const footerText = document.getElementById("footer-text");
    if (footerText) {
        let desc = "O mais completo simulador RPG de carreira futebolística.";
        if (currentLang === "en") desc = "The most complete football career RPG simulator.";
        else if (currentLang === "es") desc = "El simulador RPG de carrera futbolística más completo.";
        else if (currentLang === "ja") desc = "最も完成度の高いサッカーキャリアRPGシミュレーター。";
        else if (currentLang === "zh") desc = "最完整的足球职业生涯RPG模拟器。";
        
        footerText.innerHTML = `${translate("appTitle")} &copy; 2026. ${desc}`;
    }
    
    // 3. Atualizar rótulos das caixas de resultados e placeholders
    updateResultBoxLabels();
    
    // 4. Atualizar textos e status dinâmicos
    updateDynamicStatusText();
    
    // 5. Redesenhar a roleta com textos traduzidos
    drawWheel();
    
    // 6. Se o modal final estiver aberto, regera a biografia e o card FIFA em tempo real!
    if (currentStep === 15) {
        showFinalJourney();
    }
}

function updateResultBoxLabels() {
    const boxLabelMappings = {
        "box-continent": "boxContinent",
        "box-country": "boxCountry",
        "box-height": "boxHeight",
        "box-age": "boxAge",
        "box-position": "boxPosition",
        "box-speed": "boxSpeed",
        "box-finishing": "boxFinishing",
        "box-dribbling": "boxDribbling",
        "box-passing": "boxPassing",
        "box-strength": "boxStrength",
        "box-defending": "boxDefending",
        "box-seasons": "boxSeasons",
        "box-clubs": "boxClubs"
    };
    
    for (const [id, translationKey] of Object.entries(boxLabelMappings)) {
        const box = document.getElementById(id);
        if (box) {
            const label = box.querySelector(".box-label");
            if (label) label.innerText = translate(translationKey);
            
            // Traduz o placeholder se for correspondente a Pendente
            const placeholder = box.querySelector(".box-placeholder");
            if (placeholder && placeholder.style.display !== "none") {
                placeholder.innerText = translate("boxPlaceholderPending");
            }
        }
    }
    
    // Update active completed boxes' values in real-time
    if (typeof selectedContinent !== 'undefined' && selectedContinent) updateResultBoxValueOnly("box-continent", selectedContinent);
    if (typeof selectedCountry !== 'undefined' && selectedCountry) updateResultBoxValueOnly("box-country", selectedCountry.name);
    if (typeof selectedHeight !== 'undefined' && selectedHeight) updateResultBoxValueOnly("box-height", selectedHeight.name);
    if (typeof selectedAge !== 'undefined' && selectedAge) updateResultBoxValueOnly("box-age", selectedAge.name);
    if (typeof selectedPosition !== 'undefined' && selectedPosition) updateResultBoxValueOnly("box-position", selectedPosition.name);
    if (typeof selectedSpeed !== 'undefined' && selectedSpeed) updateResultBoxValueOnly("box-speed", selectedSpeed.name);
    if (typeof selectedFinishing !== 'undefined' && selectedFinishing) updateResultBoxValueOnly("box-finishing", selectedFinishing.name);
    if (typeof selectedDribbling !== 'undefined' && selectedDribbling) updateResultBoxValueOnly("box-dribbling", selectedDribbling.name);
    if (typeof selectedPassing !== 'undefined' && selectedPassing) updateResultBoxValueOnly("box-passing", selectedPassing.name);
    if (typeof selectedStrength !== 'undefined' && selectedStrength) updateResultBoxValueOnly("box-strength", selectedStrength.name);
    if (typeof selectedDefending !== 'undefined' && selectedDefending) updateResultBoxValueOnly("box-defending", selectedDefending.name);
    if (typeof selectedSeasons !== 'undefined' && selectedSeasons) updateResultBoxValueOnly("box-seasons", selectedSeasons.name);
    if (typeof selectedClubs !== 'undefined' && selectedClubs) updateResultBoxValueOnly("box-clubs", selectedClubs.name);
    
    // Rebuild the timeline in real-time to translate it
    if (typeof rebuildTimeline === 'function') rebuildTimeline();
    
    // Atualiza o placeholder da linha do tempo da carreira
    const timelineContainer = document.getElementById("timelineContainer");
    if (timelineContainer && timelineContainer.querySelector(".timeline-placeholder")) {
        timelineContainer.querySelector(".timeline-placeholder").innerText = translate("timelinePlaceholder");
    }
    
    // Atualiza a tabela de referência de placeholders
    const tablePlaceholder = document.getElementById("no-table-placeholder");
    if (tablePlaceholder) {
        tablePlaceholder.innerText = translate("noTablePlaceholder");
    }
    
    // Atualiza cabeçalhos de tabelas ativas se estiverem visíveis
    const rarityTableTitle = document.querySelector("#speedTableSection .table-title");
    if (rarityTableTitle) rarityTableTitle.innerText = translate("rarityTableTitle");
    
    const seasonsTableTitle = document.querySelector("#seasonsTableSection .table-title");
    if (seasonsTableTitle) seasonsTableTitle.innerText = translate("seasonsTableTitle");
    
    // Traduz os cabeçalhos das colunas das tabelas
    document.querySelectorAll(".speed-rarity-table").forEach(table => {
        const headers = table.querySelectorAll("th");
        if (headers.length >= 2) {
            if (table.parentElement.id === "speedTableSection") {
                headers[0].innerText = translate("levelHeader");
                headers[1].innerText = translate("rarityHeader");
                headers[2].innerText = translate("chanceHeader");
            } else {
                headers[0].innerText = translate("seasonsHeader");
                headers[1].innerText = translate("classificationHeader");
            }
        }
    });
}

function updateDynamicStatusText() {
    // 1. Traduzir texto do botão central
    const btnSpan = spinBtn.querySelector("span");
    if (btnSpan) {
        if (spinBtn.classList.contains("btn-advance")) {
            btnSpan.innerText = translate("btnAdvance");
        } else if (currentStep === 15) {
            btnSpan.innerText = translate("btnRestart");
        } else {
            btnSpan.innerText = translate("btnSpin");
        }
    }
    
    // 2. Se no final da carreira, desconsidera etapas intermediárias
    if (currentStep === 15) {
        appSubtitle.innerText = translate("statusCareerPhase");
        return;
    }
    
    // 3. Traduzir o subtítulo da etapa atual
    if (stepSubtitles[currentLang] && stepSubtitles[currentLang][currentStep] !== undefined) {
        appSubtitle.innerText = stepSubtitles[currentLang][currentStep];
    } else {
        appSubtitle.innerText = stepSubtitles["pt"][currentStep] || "";
    }
    
    // 4. Traduzir o statusText (apenas se não estiver no meio do spin para manter fidelidade visual)
    if (!isSpinning && !isWaitingToAdvance) {
        const stepStatusMappings = {
            0: "statusWaitingContinent",
            1: "statusWaitingCountry",
            2: "statusWaitingHeight",
            3: "statusWaitingAge",
            4: "statusWaitingPosition",
            5: "statusWaitingSpeed",
            6: "statusWaitingFinishing",
            7: "statusWaitingDribbling",
            8: "statusWaitingPassing",
            9: "statusWaitingStrength",
            10: "statusWaitingDefending",
            11: "statusWaitingSeasons",
            12: "statusWaitingClubs",
            13: "statusCareerPhase",
            14: "statusIntPhase"
        };
        
        const statusKey = stepStatusMappings[currentStep];
        if (statusKey) {
            statusText.innerText = translate(statusKey);
        }
    }
}

// Initialize i18n and UI
initLanguageSelector();
applyLanguage();

// Initialize
document.getElementById("box-continent").classList.add("active-step");

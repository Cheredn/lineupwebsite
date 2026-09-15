import logoImage from "../assets/logo.png";

export interface Tournament {
  id: string;
  title: string;
  subtitle: string;
  game: string;
  format: string;
  teamCount: number;
  date: string;
  time: string;
  prizePool: string;
  firstPlacePrize: string;
  secondPlacePrize: string;
  thirdPlacePrize?: string;
  status: "РЕГИСТРАЦИЯ ОТКРЫТА" | "В ПРОЦЕССЕ" | "СКОРО" | "ЗАВЕРШЕН";
  region: string;
  serverLocation: string;
  antiCheat: string;
  entryFee: string;
  registrationDeadline: string;
  maps: string[];
}

export interface Match {
  id: string;
  tournamentName: string;
  stage: string;
  date: string;
  time: string;
  format: string; // e.g., "BO3" or "BO1"
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  teamA: {
    name: string;
    tag: string;
    country: string;
    seed: number;
    score?: number;
  };
  teamB: {
    name: string;
    tag: string;
    country: string;
    seed: number;
    score?: number;
  };
  maps?: string[];
  streamUrl?: string;
}

export interface RuleSection {
  number: string;
  title: string;
  summary: string;
  rules: string[];
}

export const SITE_CONFIG = {
  name: "LINEUP TOURNAMENTS",
  tagline: "Соревновательные турниры по CS2.",
  slogan: "Играй. Соревнуйся. Побеждай.",
  description: "Официальная платформа турниров CS2 от LINEUP TOURNAMENTS. Регистрация команд, турнирные сетки, расписание матчей, регламент и киберспортивное сообщество.",
  
  // Official logo asset
  logo: logoImage || "/assets/logo.png",
  
  // Registration Google Form URLs provided by the user
  googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLScMcHvsl6MQWNxmqhalPbu6v2zcneoslkwHGS1V583CPtaaOQ/viewform",
  googleFormEmbedUrl: "https://docs.google.com/forms/d/e/1FAIpQLScMcHvsl6MQWNxmqhalPbu6v2zcneoslkwHGS1V583CPtaaOQ/viewform?embedded=true",
  
  // Official Telegram Channel & Community URL
  telegramUrl: "https://t.me/LineUpT",
  telegramHandle: "@LineUpT",
  
  // Official tournament bracket URL on GoodGame
  bracketUrl: "https://goodgame.ru/cup/bracket/12312312-6aa3285cc1161a00411b4c60",

  socials: {
    telegram: "https://t.me/LineUpT",
    steam: "https://steamcommunity.com",
    twitch: "https://twitch.tv",
    x: "https://x.com",
    youtube: "https://youtube.com",
  },

  tournaments: [] as Tournament[],

  matches: [
    {
      id: "m-01",
      tournamentName: "LINEUP OPEN #1",
      stage: "ПОЛУФИНАЛ",
      date: "20 СЕН 2026",
      time: "19:00 МСК",
      format: "BO3",
      status: "UPCOMING",
      teamA: {
        name: "ECLIPSE ESPORTS",
        tag: "ECL",
        country: "EU",
        seed: 1,
      },
      teamB: {
        name: "NEXUS PRIME",
        tag: "NXS",
        country: "CIS",
        seed: 4,
      },
      maps: ["Mirage", "Inferno", "Десайдер: Nuke"],
    },
    {
      id: "m-02",
      tournamentName: "LINEUP OPEN #1",
      stage: "ПОЛУФИНАЛ",
      date: "20 СЕН 2026",
      time: "20:30 МСК",
      format: "BO3",
      status: "UPCOMING",
      teamA: {
        name: "VALKYRIE GAMING",
        tag: "VLK",
        country: "DK",
        seed: 2,
      },
      teamB: {
        name: "PHANTOM FIVE",
        tag: "P5",
        country: "SE",
        seed: 3,
      },
      maps: ["Anubis", "Ancient", "Десайдер: Dust II"],
    },
    {
      id: "m-03",
      tournamentName: "LINEUP OPEN #1",
      stage: "ГРАНД-ФИНАЛ",
      date: "20 СЕН 2026",
      time: "22:00 МСК",
      format: "BO3",
      status: "UPCOMING",
      teamA: {
        name: "ПОБЕДИТЕЛЬ ПОЛУФИНАЛА 1",
        tag: "TBD",
        country: "—",
        seed: 0,
      },
      teamB: {
        name: "ПОБЕДИТЕЛЬ ПОЛУФИНАЛА 2",
        tag: "TBD",
        country: "—",
        seed: 0,
      },
      maps: ["Вето перед матчем"],
    },
  ] as Match[],

  rules: [
    {
      number: "01",
      title: "Общие правила",
      summary: "Структура турнира, требования к участникам, чек-ин и коммуникация.",
      rules: [
        "Все игроки обязаны иметь действующий аккаунт Steam с Prime-статусом без блокировок VAC или игровых банов в CS:GO / CS2 за последние 365 дней.",
        "Состав команды должен состоять из 5 основных игроков и не более 2 зарегистрированных запасных.",
        "Капитаны команд обязаны пройти чек-ин в официальном Telegram-канале / чате LINEUP TOURNAMENTS (@LineUpT) минимум за 30 минут до начала матча.",
        "Матчи начинаются строго по расписанию. Команде, не явившейся полным составом в течение 15 минут после времени старта, засчитывается техническое поражение."
      ]
    },
    {
      number: "02",
      title: "Правила матчей",
      summary: "Настройки серверов, овертаймы, паузы и регламент вето карт.",
      rules: [
        "Все матчи проводятся по официальному соревновательному регламенту Valve CS2: система MR12 (12 раундов за сторону, победа при 13 выигранных раундах).",
        "Формат овертайма: MR3 (3 раунда за сторону) со стартовым банком $10,000 до определения победителя.",
        "Система вето карт: жеребьевка на платформе вето. Команда с более высоким посевом выбирает сторону (Team A или Team B). Очередность: Бан, Бан, Бан, Бан, Пик, Пик, Десайдер.",
        "Тактические паузы: каждой команде доступно 4 тактических тайм-аута по 30 секунд на каждой карте.",
        "Технические паузы: разрешены при отключении игрока. Максимальное суммарное время техпаузы составляет 10 минут на команду за матч."
      ]
    },
    {
      number: "03",
      title: "Правила для игроков",
      summary: "Оборудование, лимиты пинга, задержка стримов и фиксация состава.",
      rules: [
        "Игроки обязаны подключаться с подтвержденных аккаунтов SteamID64, указанных в регистрационной форме.",
        "Составы команд фиксируются за 2 часа до начала турнира. Замены разрешены только между картами с предварительным уведомлением главного судьи.",
        "Максимально допустимый пинг в игре — 100 мс. При постоянном пинге выше 120 мс судья вправе потребовать использование утвержденного запасного игрока.",
        "Личные трансляции матчей игроками разрешены исключительно с обязательной задержкой стрима не менее 120 секунд (2 минуты)."
      ]
    },
    {
      number: "04",
      title: "Античит и безопасность",
      summary: "Античит Valve, клиентский контроль и автоматическая запись демок.",
      rules: [
        "На всех турнирных серверах включена строгая защита Valve Anti-Cheat (VACnet) вместе с серверным аудитом целостности игры.",
        "Администрация турнира оставляет за собой право потребовать от любого игрока запуск назначенного клиентского античита или запись полной POV-демки.",
        "Любое использование запрещенного ПО, вх, аимбота, макросов, скриптов на отдачу, эксплойтов карт (пиксель-бусты) или модификации радара влечет пожизненный бан и аннулирование призовых.",
        "Все файлы записей матчей (.dem) автоматически архивируются и могут быть пересмотрены судейской коллегией после каждого раунда."
      ]
    },
    {
      number: "05",
      title: "Дисциплина и поведение",
      summary: "Спортивная этика, запрет токсичности, правила чата и стандарты уважения.",
      rules: [
        "Неспортивное поведение, оскорбления, расизм, дискриминация или агрессия в игровом чате и официальном канале Telegram строго запрещены.",
        "Общение между командами и судейской коллегией должно оставаться корректным и уважительным. Оскорбление судей наказывается немедленной дисквалификацией.",
        "Намеренный слив матчей (322), договорные игры и ставки категорически запрещены. Нарушители навсегда исключаются из всех турниров LINEUP TOURNAMENTS."
      ]
    },
    {
      number: "06",
      title: "Дисквалификация и протесты",
      summary: "Основания для дисквалификации, распределение призовых и регламент подачи апелляций.",
      rules: [
        "Дисквалифицированная за нарушения или читерство команда лишается права на получение призовых. Призовые передаются следующей команде по сетке.",
        "Решения главного судьи турнира по спорным игровым ситуациям, регламенту и перезапускам раундов являются окончательными.",
        "Официальные протесты подаются исключительно капитаном команды судьям в Telegram (@LineUpT) в течение 15 минут после завершения матча с доказательствами."
      ]
    }
  ] as RuleSection[],

  infoCards: [
    {
      label: "ИГРА",
      value: "COUNTER-STRIKE 2",
      subtext: "Соревновательный режим Valve",
      badge: "АКТИВНО",
    },
    {
      label: "ФОРМАТ",
      value: "5 НА 5 (MR12)",
      subtext: "Single Elimination до финала",
      badge: "СТАНДАРТ",
    },
    {
      label: "КОМАНДЫ",
      value: "16 КОМАНД",
      subtext: "5 в основе + до 2 замен",
      badge: "ЛИМИТ",
    },
    {
      label: "РЕГИОН",
      value: "ЕВРОПА / СНГ",
      subtext: "Франкфурт и Стокгольм",
      badge: "НИЗКИЙ ПИНГ",
    },
    {
      label: "ВЗНОС",
      value: "БЕСПЛАТНО",
      subtext: "Открытая регистрация",
      badge: "БЕЗ ВЗНОСА",
    },
    {
      label: "ПРИЗОВОЙ ФОНД",
      value: "$500 CAD",
      subtext: "Быстрая выплата победителям",
      badge: "ГАРАНТИРОВАНО",
    },
  ]
};


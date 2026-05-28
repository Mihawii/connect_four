export type Language = "EN" | "RU" | "KZ";

export const DEFAULT_LANGUAGE: Language = "EN";
export const LANGUAGE_ORDER: Language[] = ["EN", "RU", "KZ"];

type MessageTree = {
  nav: {
    play: string;
    daily: string;
    ladder: string;
    store: string;
    learn: string;
    playNow: string;
    changeLanguage: string;
  };
  play: {
    title: string;
    playFriend: string;
    loadingBoard: string;
  };
  hud: {
    modeClassic: string;
    modeInferno: string;
    modeBlitz: string;
    opponentHuman: string;
    opponentBot: string;
    difficultySparkler: string;
    difficultyKindling: string;
    difficultyBonfire: string;
    difficultyInferno: string;
    untimed: string;
    hint: string;
  };
  leaderboard: {
    title: string;
    currentMark: string;
    noLeaderYet: string;
    global: string;
    almaty: string;
    friends: string;
    rank: string;
    player: string;
    tier: string;
    games: string;
    rating: string;
    weeklyTables: string;
    howRatingMoves: string;
    ratingRule: string;
  };
};

export const MESSAGES: Record<Language, MessageTree> = {
  EN: {
    nav: {
      play: "Play",
      daily: "Daily",
      ladder: "Ladder",
      store: "Store",
      learn: "Learn",
      playNow: "Play now",
      changeLanguage: "Change language",
    },
    play: {
      title: "Play",
      playFriend: "Play a friend",
      loadingBoard: "Lighting the board…",
    },
    hud: {
      modeClassic: "Classic",
      modeInferno: "Inferno",
      modeBlitz: "Blitz",
      opponentHuman: "Human",
      opponentBot: "Bot",
      difficultySparkler: "Sparkler",
      difficultyKindling: "Kindling",
      difficultyBonfire: "Bonfire",
      difficultyInferno: "Inferno",
      untimed: "Untimed",
      hint: "Hint",
    },
    leaderboard: {
      title: "The Ladder",
      currentMark: "Current mark",
      noLeaderYet: "No leader yet",
      global: "Global",
      almaty: "Almaty",
      friends: "Friends",
      rank: "Rank",
      player: "Player",
      tier: "Tier",
      games: "Games",
      rating: "Rating",
      weeklyTables: "Weekly tables",
      howRatingMoves: "How rating moves",
      ratingRule: "Beat stronger players to climb faster. Inferno Blitz is weighted separately from Classic.",
    },
  },
  RU: {
    nav: {
      play: "Играть",
      daily: "Ежедневно",
      ladder: "Рейтинг",
      store: "Магазин",
      learn: "Обучение",
      playNow: "Играть",
      changeLanguage: "Сменить язык",
    },
    play: {
      title: "Игра",
      playFriend: "Играть с другом",
      loadingBoard: "Поджигаем доску…",
    },
    hud: {
      modeClassic: "Классика",
      modeInferno: "Инферно",
      modeBlitz: "Блиц",
      opponentHuman: "Человек",
      opponentBot: "Бот",
      difficultySparkler: "Искра",
      difficultyKindling: "Розжиг",
      difficultyBonfire: "Костер",
      difficultyInferno: "Инферно",
      untimed: "Без таймера",
      hint: "Подсказка",
    },
    leaderboard: {
      title: "Рейтинг",
      currentMark: "Текущий лидер",
      noLeaderYet: "Пока нет лидера",
      global: "Глобально",
      almaty: "Алматы",
      friends: "Друзья",
      rank: "Место",
      player: "Игрок",
      tier: "Тир",
      games: "Игры",
      rating: "Рейтинг",
      weeklyTables: "Недельные турниры",
      howRatingMoves: "Как двигается рейтинг",
      ratingRule: "Побеждай более сильных игроков, чтобы расти быстрее. Inferno Blitz считается отдельно от Classic.",
    },
  },
  KZ: {
    nav: {
      play: "Ойын",
      daily: "Күнделікті",
      ladder: "Рейтинг",
      store: "Дүкен",
      learn: "Үйрену",
      playNow: "Ойнау",
      changeLanguage: "Тілді ауыстыру",
    },
    play: {
      title: "Ойын",
      playFriend: "Досыңмен ойна",
      loadingBoard: "Тақта жүктеліп жатыр…",
    },
    hud: {
      modeClassic: "Классика",
      modeInferno: "Инферно",
      modeBlitz: "Блиц",
      opponentHuman: "Адам",
      opponentBot: "Бот",
      difficultySparkler: "Ұшқын",
      difficultyKindling: "Тұтану",
      difficultyBonfire: "Алау",
      difficultyInferno: "Инферно",
      untimed: "Уақытсыз",
      hint: "Кеңес",
    },
    leaderboard: {
      title: "Рейтинг",
      currentMark: "Қазіргі көшбасшы",
      noLeaderYet: "Көшбасшы әлі жоқ",
      global: "Жаһандық",
      almaty: "Алматы",
      friends: "Достар",
      rank: "Орын",
      player: "Ойыншы",
      tier: "Деңгей",
      games: "Ойын",
      rating: "Рейтинг",
      weeklyTables: "Апталық кестелер",
      howRatingMoves: "Рейтинг қалай өзгереді",
      ratingRule: "Күшті қарсыластарды жеңсең, рейтинг тез өседі. Inferno Blitz Classic-тен бөлек есептеледі.",
    },
  },
};

function lookup(language: Language, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = MESSAGES[language];
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in (current as Record<string, unknown>))) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function resolveMessage(language: Language, path: string): string {
  return lookup(language, path) ?? lookup(DEFAULT_LANGUAGE, path) ?? path;
}

export function makeFamily(name, total, unlocked) {
  return {
    name,
    levels: Array.from({ length: total }, (_, i) => ({
      name:   `Niveau ${i + 1}`,
      stars:  i < unlocked ? Math.max(0, 3 - i) : 0,
      locked: i >= unlocked
    }))
  };
}

export const FAMILIES_DATA = {
  // ── Mathématiques (3 jeux) ──
  'Addition': [
    makeFamily('Nombres entiers',    6,  4),
    makeFamily('Nombres décimaux',   9,  2),
    makeFamily('Grands nombres',     4,  4),
    makeFamily('Additions à trous', 12,  1),
  ],
  'Multiplication': [
    makeFamily('Tables de base',     16, 8),
    makeFamily('Par 10, 100, 1000',   3, 3),
  ],
  'Géométrie': [
    makeFamily('Périmètres',  5, 3),
    makeFamily('Aires',       8, 1),
    makeFamily('Volumes',     3, 0),
  ],
  // ── Français (4 jeux) ──
  'Grammaire': [
    makeFamily('Nom et adjectif',  7, 5),
    makeFamily('Verbe',           10, 3),
    makeFamily('Compléments',      4, 2),
  ],
  'Conjugaison': [
    makeFamily('Présent',       14, 10),
    makeFamily('Passé composé',  8,  4),
    makeFamily('Futur',          5,  2),
    makeFamily('Imparfait',      6,  1),
    makeFamily('Subjonctif',     9,  0),
    makeFamily('Conditionnel',   3,  0),
  ],
  'Lecture': [
    makeFamily('Compréhension', 12, 6),
  ],
  'Dictée': [
    makeFamily('Mots courants', 16, 12),
    makeFamily('Accords',        9,  3),
    makeFamily('Homophones',     6,  1),
    makeFamily('Ponctuation',    3,  0),
  ],
  // ── Anglais (6 jeux) ──
  'Vocabulary': [
    makeFamily('Daily life',  8, 6),
    makeFamily('Family',      5, 5),
    makeFamily('School',      6, 3),
    makeFamily('Nature',      4, 1),
  ],
  'Grammar': [
    makeFamily('Present tense', 10, 7),
    makeFamily('Past tense',     8, 2),
    makeFamily('Questions',      6, 1),
  ],
  'Listening': [
    makeFamily('Short dialogues', 5, 4),
    makeFamily('Stories',         9, 2),
    makeFamily('Instructions',    4, 4),
    makeFamily('Songs',           6, 1),
    makeFamily('Descriptions',    3, 0),
  ],
  'Speaking': [
    makeFamily('Introduce yourself', 4, 4),
    makeFamily('Describe',           7, 2),
    makeFamily('Tell a story',       5, 0),
  ],
  'Reading': [
    makeFamily('Simple texts',   8, 6),
    makeFamily('Short stories', 11, 2),
  ],
  'Writing': [
    makeFamily('Sentences',     6, 5),
    makeFamily('Paragraphs',    8, 1),
    makeFamily('Short essays',  3, 0),
  ],
  // ── Géographie (1 jeu) ──
  'Capitales': [
    makeFamily('Europe',    16, 10),
    makeFamily('Amériques', 10,  4),
    makeFamily('Asie',      12,  2),
    makeFamily('Afrique',    8,  0),
    makeFamily('Océanie',    4,  0),
  ],
};

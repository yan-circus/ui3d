export const THEME = {
  panelW:      960,
  panelH:      540,
  padH:         44,
  padTop:       36,
  padBot:       32,
  gap:          12,
  titleSz:      18,
  titleLS:       5,
  levelSz:      13,
  starsSz:      14,
  lockSz:       22,
  sepMargin:    14,
  gridMargin:   14,
  cardRadius:   12,
  panelRadius:  20,
  cardGap:       8,
  cardPadV:     18,
  cardPadH:     12,
  cardMinH:    100,
  gridPadTop:    4,
  gridPadRight: 24,
};

export function applyThemeVars() {
  const s = document.documentElement.style;
  s.setProperty('--panel-w',        THEME.panelW       + 'px');
  s.setProperty('--panel-h',        THEME.panelH       + 'px');
  s.setProperty('--pad-h',          THEME.padH         + 'px');
  s.setProperty('--pad-top',        THEME.padTop       + 'px');
  s.setProperty('--pad-bot',        THEME.padBot       + 'px');
  s.setProperty('--gap',            THEME.gap          + 'px');
  s.setProperty('--title-sz',       THEME.titleSz      + 'px');
  s.setProperty('--title-ls',       THEME.titleLS      + 'px');
  s.setProperty('--level-sz',       THEME.levelSz      + 'px');
  s.setProperty('--stars-sz',       THEME.starsSz      + 'px');
  s.setProperty('--lock-sz',        THEME.lockSz       + 'px');
  s.setProperty('--sep-margin',     THEME.sepMargin    + 'px');
  s.setProperty('--grid-margin',    THEME.gridMargin   + 'px');
  s.setProperty('--card-radius',    THEME.cardRadius   + 'px');
  s.setProperty('--panel-radius',   THEME.panelRadius  + 'px');
  s.setProperty('--card-gap',       THEME.cardGap      + 'px');
  s.setProperty('--card-pad-v',     THEME.cardPadV     + 'px');
  s.setProperty('--card-pad-h',     THEME.cardPadH     + 'px');
  s.setProperty('--card-min-h',     THEME.cardMinH     + 'px');
  s.setProperty('--grid-pad-top',   THEME.gridPadTop   + 'px');
  s.setProperty('--grid-pad-right', THEME.gridPadRight + 'px');
}

export const { BASE_URL, PROD } = import.meta.env;

export const META_INFO = {
  TITLE: '音乐可视化',
  AUTHOR: 'Hakula',
  REPO_URL: 'https://github.com/hakula139/music-visualization',
};

export const ANALYZER = {
  FFT_SIZE: 2 ** 8,
  SMOOTHING_TIME_CONST: 0.8,
};

export const CANVAS = {
  BAR_GAP: 5,
  BAR_WIDTH: 16,
  MIN_HEIGHT: 2,
};

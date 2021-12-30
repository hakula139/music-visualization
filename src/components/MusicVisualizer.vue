<template>
  <audio
    ref="audioPlayerRef"
    class="w-full"
    :src="audioSrcUrl"
    controls
    loop
  />
  <canvas
    ref="canvasRef"
    class="w-full"
  />
</template>

<script setup lang="ts">
// #region imports

import { nextTick, ref } from 'vue';

import { CANVAS, FFT_SIZE } from '@/configs';

import defaultAudioSrcUrl from '../../tests/399367387.mp3'; // はな - 櫻ノ詩

// #endregion

// #region audio analyser

const audioPlayerRef = ref<HTMLAudioElement>();
const audioContext = new AudioContext({ latencyHint: 'interactive' });
const audioSrcUrl = ref(defaultAudioSrcUrl);
const audioSrc = ref<MediaElementAudioSourceNode>();

const audioAnalyser = audioContext.createAnalyser();
audioAnalyser.connect(audioContext.destination);
audioAnalyser.fftSize = FFT_SIZE;

nextTick(() => {
  audioSrc.value = audioContext.createMediaElementSource(audioPlayerRef.value!);
  audioSrc.value.connect(audioAnalyser);
});

// #endregion

// #region canvas

const { BAR_GAP, BAR_WIDTH } = CANVAS;

const canvasRef = ref<HTMLCanvasElement>();
const canvasContext = ref<CanvasRenderingContext2D>();

const render = (): void => {
  const { width, height } = canvasRef.value!;
  canvasContext.value!.clearRect(0, 0, width, height);

  const spectrum = new Uint8Array(audioAnalyser.frequencyBinCount);
  audioAnalyser.getByteFrequencyData(spectrum);

  const barCount = Math.round(width / (BAR_WIDTH + BAR_GAP));
  const step = Math.round(spectrum.length / BAR_WIDTH);
  for (let i = 0; i < barCount; i += 1) {
    const value = spectrum[i * step];
    canvasContext.value!.fillRect(i * (BAR_WIDTH + BAR_GAP), height - value, BAR_WIDTH, value);
  }

  requestAnimationFrame(render);
};

nextTick(() => {
  canvasContext.value = canvasRef.value!.getContext('2d')!;
  canvasContext.value!.fillStyle = '#fb8c00';
  render();
});

// #endregion
</script>

<style scoped>
canvas {
  height: calc(100% - 54px);
}
</style>

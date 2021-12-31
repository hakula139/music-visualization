<template>
  <canvas
    ref="canvasRef"
    class="w-full p-4 pb-0"
    :style="{ height: 'calc(100% - 88px)' }"
  />

  <div class="flex flex-row items-center p-4">
    <a-button
      class="m-2"
      type="primary"
      size="large"
      @click="openMusicSelectModal"
    >
      选择音乐
    </a-button>
    <audio
      v-show="audioSrcUrl"
      ref="audioPlayerRef"
      class="w-full"
      :src="audioSrcUrl"
      controls
    />
  </div>

  <a-modal
    :visible="musicSelectModal.visible"
    title="选择音乐"
    ok-text="确定"
    cancel-text="取消"
    @ok="submitMusicSelectForm"
    @cancel="closeMusicSelectModal"
  >
    <a-form
      ref="musicSelectFormRef"
      :model="musicSelectModal.data"
      :wrapper-col="{ span: 24 }"
    >
      <a-form-item v-bind="validateInfos.localAudioSrcUrl">
        <a-select
          v-model:value="musicSelectModal.data.localAudioSrcUrl"
          placeholder="请选择需要可视化的音乐"
          :options="musicSelectOptions"
        />
      </a-form-item>
      <a-form-item
        v-show="musicSelectModal.data.localAudioSrcUrl === '/'"
        v-bind="validateInfos.remoteAudioSrcUrl"
      >
        <a-input
          v-model:value="musicSelectModal.data.remoteAudioSrcUrl"
          placeholder="请输入外链地址 (.mp3)"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
// #region imports

import { reactive, ref } from 'vue';
import { Form, SelectProps } from 'ant-design-vue';
import { RuleObject, ValidateErrorEntity } from 'ant-design-vue/es/form/interface';

import { ANALYZER, CANVAS } from '@/configs';
import { average } from '@/composables';

import LOCAL_AUDIO_SRC_URL_399367387 from '../../tests/399367387.mp3'; // はな - 櫻ノ詩

const { useForm } = Form;

// #endregion

// #region audio analyser

const { FFT_SIZE, SMOOTHING_TIME_CONST } = ANALYZER;

const audioPlayerRef = ref<HTMLAudioElement>();
const audioSrcUrl = ref<string>();
const audioSrc = ref<MediaElementAudioSourceNode>();
const audioContext = ref<AudioContext>();
const audioAnalyser = ref<AnalyserNode>();

const setupAudioAnalyser = (): void => {
  if (audioPlayerRef.value && !audioContext.value) {
    audioContext.value = new AudioContext({ latencyHint: 'interactive' });

    audioPlayerRef.value.onplay = () => audioContext.value?.resume();
    audioSrc.value = audioContext.value.createMediaElementSource(audioPlayerRef.value);

    audioAnalyser.value = audioContext.value.createAnalyser();
    audioAnalyser.value.smoothingTimeConstant = SMOOTHING_TIME_CONST;
    audioAnalyser.value.fftSize = FFT_SIZE;

    audioSrc.value.connect(audioAnalyser.value);
    audioAnalyser.value.connect(audioContext.value.destination);
  }
};

// #endregion

// #region canvas

const { BAR_GAP, BAR_WIDTH, MIN_HEIGHT } = CANVAS;

const canvasRef = ref<HTMLCanvasElement>();
const canvasContext = ref<CanvasRenderingContext2D>();

const setupCanvas = (): void => {
  if (canvasRef.value && !canvasContext.value) {
    canvasContext.value = canvasRef.value.getContext('2d')!;
  }
};

const setFillStyle = (): void => {
  if (canvasRef.value && canvasContext.value) {
    const gradient = canvasContext.value.createLinearGradient(0, 0, 0, canvasRef.value.height);
    gradient.addColorStop(0, '#ffc947');
    gradient.addColorStop(0.5, '#ff9800');
    gradient.addColorStop(1, '#c66900');
    canvasContext.value.fillStyle = gradient;
  }
};

const render = (): void => {
  if (canvasRef.value && canvasContext.value && audioAnalyser.value) {
    const { clientWidth: width, clientHeight: height } = canvasRef.value;
    canvasRef.value.width = width;
    canvasRef.value.height = height;
    setFillStyle();

    const spectrum = new Uint8Array(audioAnalyser.value.frequencyBinCount);
    audioAnalyser.value.getByteFrequencyData(spectrum);

    const barCount = Math.floor(width / (BAR_WIDTH + BAR_GAP));
    const step = Math.round(spectrum.length / barCount);
    for (let i = 0; i < barCount; i += 1) {
      const barValue = average(Array.from(spectrum), i * step, (i + 1) * step);
      const barHeight = Math.max((barValue / FFT_SIZE) * height, MIN_HEIGHT);
      canvasContext.value.fillRect(i * (BAR_WIDTH + BAR_GAP), height - barHeight, BAR_WIDTH, barHeight);
    }

    requestAnimationFrame(render);
  }
};

// #endregion

// #region music select modal

const musicSelectModal = reactive({
  visible: false,
  data: {
    localAudioSrcUrl: undefined as string | undefined,
    remoteAudioSrcUrl: undefined as string | undefined,
  },
});

const musicSelectOptions = ref<SelectProps['options']>([
  {
    value: LOCAL_AUDIO_SRC_URL_399367387,
    label: 'はな - 櫻ノ詩',
  },
  {
    value: '/',
    label: '其他',
  },
]);

const validateRemoteAudioSrcUrl = async (_rule: RuleObject, value: string): Promise<void> => {
  if (musicSelectModal.data.localAudioSrcUrl === '/' && (!value || !value.trim())) {
    return Promise.reject(new Error('外链地址不能为空'));
  }
  return Promise.resolve();
};

const musicSelectFormRules = reactive({
  localAudioSrcUrl: [
    {
      required: true,
      message: '选择项不能为空',
      trigger: ['blur', 'change'],
    },
  ],
  remoteAudioSrcUrl: [
    {
      validator: validateRemoteAudioSrcUrl,
      trigger: ['blur'],
    },
  ],
});

const { validate, validateInfos } = useForm(musicSelectModal.data, musicSelectFormRules);

const openMusicSelectModal = (): void => {
  musicSelectModal.visible = true;
};

const closeMusicSelectModal = (): void => {
  musicSelectModal.visible = false;
};

const submitMusicSelectForm = (): void => {
  validate()
    .then((): void => {
      const { localAudioSrcUrl, remoteAudioSrcUrl } = musicSelectModal.data;
      audioSrcUrl.value = localAudioSrcUrl || remoteAudioSrcUrl || '';

      setupAudioAnalyser();
      setupCanvas();
      render();
      closeMusicSelectModal();
    })
    .catch((err: ValidateErrorEntity): void => {
      console.log('validate error:', err);
    });
};

// #endregion
</script>

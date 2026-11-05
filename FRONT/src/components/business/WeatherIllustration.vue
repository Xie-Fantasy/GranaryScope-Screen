<script setup lang="ts">
import { computed, useId } from 'vue';

const props = withDefaults(defineProps<{ condition: string; active?: boolean }>(), { active: true });
const illustrationId = useId();
const variant = computed(() => {
  if (props.condition.includes('雨')) return 'rain';
  if (props.condition.includes('阴')) return 'overcast';
  if (props.condition === '多云') return 'cloudy';
  return 'partly-cloudy';
});
const cloudPath = 'M55 111c-13 0-23-9-23-21 0-12 9-21 21-21h2c3-15 14-25 29-25 17 0 30 12 32 28 15-1 26 8 26 20s-10 19-23 19Z';
</script>

<template>
  <svg
    class="weather-illustration"
    :class="[`weather-illustration--${variant}`, { 'weather-illustration--paused': !active }]"
    viewBox="0 0 160 150"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="illustrationId + '-sun'" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--text-primary)" />
        <stop offset=".38" stop-color="var(--theme-gold)" />
        <stop offset="1" stop-color="var(--warning)" />
      </linearGradient>
      <linearGradient :id="illustrationId + '-cloud'" x1="0" y1="0" x2=".6" y2="1">
        <stop offset="0" stop-color="var(--weather-cloud-light)" />
        <stop offset=".45" stop-color="var(--weather-cloud-mid)" />
        <stop offset="1" stop-color="var(--weather-cloud-base)" />
      </linearGradient>
      <radialGradient :id="illustrationId + '-glow'">
        <stop offset="0" stop-color="var(--primary)" stop-opacity=".5" />
        <stop offset=".45" stop-color="var(--primary)" stop-opacity=".16" />
        <stop offset="1" stop-color="var(--primary)" stop-opacity="0" />
      </radialGradient>
      <radialGradient :id="illustrationId + '-fade'">
        <stop offset="0" stop-color="white" />
        <stop offset=".6" stop-color="white" />
        <stop offset="1" stop-color="black" />
      </radialGradient>
      <mask :id="illustrationId + '-orbit-mask'" maskUnits="userSpaceOnUse" x="5" y="113" width="150" height="34">
        <ellipse cx="80" cy="130" rx="75" ry="17" :fill="`url(#${illustrationId}-fade)`" />
      </mask>
    </defs>

    <ellipse class="weather-illustration__glow" cx="80" cy="130" rx="66" ry="14" :fill="`url(#${illustrationId}-glow)`" />
    <g class="weather-illustration__orbits" :mask="`url(#${illustrationId}-orbit-mask)`">
      <ellipse class="weather-illustration__orbit" cx="80" cy="130" rx="70" ry="15" />
      <ellipse class="weather-illustration__orbit weather-illustration__orbit--delayed" cx="80" cy="130" rx="70" ry="15" />
      <ellipse class="weather-illustration__core" cx="80" cy="130" rx="25" ry="4" />
    </g>

    <g v-if="variant === 'partly-cloudy'" class="weather-illustration__sun">
      <path d="M63 14V6M36 24l-6-6M25 50h-9M95 24l6-6M102 50h9M36 79l-6 6" />
      <circle cx="63" cy="51" r="26" :fill="`url(#${illustrationId}-sun)`" />
    </g>
    <path
      v-else
      class="weather-illustration__cloud weather-illustration__cloud--back"
      :d="cloudPath"
      transform="translate(-12 -5) scale(.86)"
      :fill="`url(#${illustrationId}-cloud)`"
    />
    <path
      class="weather-illustration__cloud"
      :d="cloudPath"
      :transform="variant === 'rain' ? 'translate(0 -15)' : undefined"
      :fill="`url(#${illustrationId}-cloud)`"
    />
    <g v-if="variant === 'rain'" class="weather-illustration__rain">
      <path d="m55 104-4 8m30-8-4 8m30-8-4 8" />
      <path d="m66 115-3 6m30-6-3 6" opacity=".65" />
    </g>
  </svg>
</template>

<style scoped lang="scss">
.weather-illustration {
  --weather-cloud-light: var(--text-primary);
  --weather-cloud-mid: color-mix(in srgb, var(--text-primary) 65%, var(--theme-secondary));
  --weather-cloud-base: var(--theme-secondary);
  display: block;
  width: 100%;
  max-height: 142px;
  overflow: visible;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--primary) 16%, transparent));

  &--overcast,
  &--rain {
    --weather-cloud-light: color-mix(in srgb, var(--text-primary) 76%, var(--theme-inactive));
    --weather-cloud-mid: color-mix(in srgb, var(--text-primary) 35%, var(--theme-inactive));
    --weather-cloud-base: var(--theme-inactive);
  }
}

.weather-illustration__sun {
  stroke: var(--theme-gold);
  stroke-width: 3;
  stroke-linecap: round;
}

.weather-illustration__cloud {
  stroke: color-mix(in srgb, var(--weather-cloud-light) 65%, var(--primary));
  stroke-width: 2.5;

  &--back { opacity: .75; }
}

.weather-illustration__rain {
  stroke: var(--primary);
  stroke-width: 3;
  stroke-linecap: round;
}

.weather-illustration__orbits {
  stroke: var(--primary);
  stroke-width: .7;
}

.weather-illustration__orbit {
  transform-box: fill-box;
  transform-origin: center;
  animation: weather-orbit-expand 5s linear infinite;

  &--delayed { animation-delay: -2.5s; }
}

.weather-illustration__core { opacity: .15; }
.weather-illustration__glow { animation: weather-glow-breathe 6s ease-in-out infinite; }

.weather-illustration--paused * { animation-play-state: paused; }

@keyframes weather-orbit-expand {
  0% { transform: scale(.28); opacity: 0; }
  18% { opacity: .4; }
  100% { transform: scale(1.08); opacity: 0; }
}

@keyframes weather-glow-breathe {
  0%, 100% { opacity: .3; }
  50% { opacity: .65; }
}

@media (prefers-reduced-motion: reduce) {
  .weather-illustration__orbit { animation: none; transform: scale(.65); opacity: .18; }
  .weather-illustration__orbit--delayed { transform: scale(1); opacity: .08; }
  .weather-illustration__glow { animation: none; opacity: .4; }
}
</style>

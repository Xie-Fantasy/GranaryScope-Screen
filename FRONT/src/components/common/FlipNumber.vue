<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

defineOptions({ name: 'FlipNumber' });

const props = withDefaults(defineProps<{
  value: number | string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  variant?: 'standard' | 'neon';
}>(), {
  tone: 'primary',
  variant: 'standard',
});

const currentValue = computed(() => String(props.value));
const previousValue = ref(currentValue.value);
const isFlipping = ref(false);
let animationTimer: number | null = null;

function clearAnimationTimer(): void {
  if (animationTimer !== null) {
    window.clearTimeout(animationTimer);
    animationTimer = null;
  }
}

function playFlip(previous: string): void {
  previousValue.value = previous;
  isFlipping.value = false;
  clearAnimationTimer();

  requestAnimationFrame(() => {
    isFlipping.value = true;
    animationTimer = window.setTimeout(() => {
      isFlipping.value = false;
      animationTimer = null;
    }, 480);
  });
}

function previousDigitAt(index: number, digit: string): string {
  const offset = currentValue.value.length - previousValue.value.length;
  return previousValue.value[index - offset] ?? digit;
}

function isDigit(value: string): boolean {
  return /^\d$/.test(value);
}

function isDecimalSeparator(value: string): boolean {
  return value === '.';
}

watch(currentValue, (_next, previous) => {
  playFlip(previous);
});

onMounted(() => {
  playFlip('0'.repeat(currentValue.value.length));
});

onBeforeUnmount(clearAnimationTimer);
</script>

<template>
  <span
    class="flip-number"
    :class="[`flip-number--${tone}`, `flip-number--${variant}`]"
    :aria-label="currentValue"
  >
    <template
      v-for="(digit, index) in currentValue"
      :key="`${index}-${digit}`"
    >
      <span
        v-if="isDigit(digit)"
        class="flip-number__digit"
        :class="{
          'flip-number__digit--flipping': isFlipping,
          'flip-number__digit--changed': digit !== previousDigitAt(index, digit),
        }"
      >
        <span class="flip-number__previous" aria-hidden="true">{{ previousDigitAt(index, digit) }}</span>
        <span class="flip-number__current">{{ digit }}</span>
      </span>
      <span
        v-else
        class="flip-number__separator"
        :class="{
          'flip-number__separator--decimal': isDecimalSeparator(digit),
        }"
      >
        {{ digit }}
      </span>
    </template>
  </span>
</template>

<style scoped lang="scss">
.flip-number {
  --flip-number-decimal-size: 3px;
  --flip-number-decimal-offset: 4px;

  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  color: var(--primary);
  font-size: 23px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.flip-number--success { color: var(--success); }
.flip-number--warning { color: var(--warning); }
.flip-number--danger { color: var(--danger); }
.flip-number--neutral { color: var(--text-primary); }

.flip-number--neon {
  --flip-number-decimal-size: 5px;
  --flip-number-decimal-offset: 6px;

  color: color-mix(in srgb, var(--primary) 36%, #e8fbff);
  font-size: 40px;
  font-weight: 700;
  gap: 3px;
}

.flip-number__digit {
  position: relative;
  display: grid;
  width: .92em;
  height: 1.15em;
  overflow: hidden;
  place-items: center;
  perspective: 100px;
  background: color-mix(in srgb, currentColor 10%, var(--bg-elevated));
  border: 1px solid color-mix(in srgb, currentColor 34%, var(--border-default));
  border-radius: 2px;
  box-shadow: inset 0 1px color-mix(in srgb, #fff 9%, transparent);
}

.flip-number__current,
.flip-number__previous {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.flip-number__current {
  z-index: 1;
  text-shadow: 0 0 8px color-mix(in srgb, currentColor 25%, transparent);
}

.flip-number__previous {
  z-index: 3;
  color: inherit;
  background: color-mix(in srgb, currentColor 9%, var(--bg-elevated));
  opacity: 0;
  transform-origin: center bottom;
}

.flip-number__digit--flipping.flip-number__digit--changed .flip-number__previous {
  animation: flip-number-turn 440ms cubic-bezier(.2, .82, .2, 1) both;
}

.flip-number--neon .flip-number__digit {
  width: .78em;
  height: 1.18em;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--primary) 13%, var(--bg-panel-elevated)), color-mix(in srgb, #02070d 42%, var(--bg-panel)));
  border-color: color-mix(in srgb, var(--primary) 45%, var(--border-strong));
  border-radius: 6px;
  box-shadow: inset 0 1px color-mix(in srgb, #fff 13%, transparent), 0 0 12px color-mix(in srgb, var(--primary) 16%, transparent);
}

.flip-number--neon .flip-number__current {
  text-shadow: 0 0 6px color-mix(in srgb, var(--primary) 72%, transparent), 0 0 14px color-mix(in srgb, var(--primary) 28%, transparent);
}

.flip-number--neon .flip-number__previous {
  background: color-mix(in srgb, var(--primary) 14%, var(--bg-panel-elevated));
}

.flip-number__separator {
  display: inline-flex;
  align-items: flex-end;
  flex: 0 0 .14em;
  width: .14em;
  height: 1.18em;
  justify-content: center;
  padding-bottom: .12em;
  box-sizing: border-box;
  color: currentColor;
  line-height: 1;
}

.flip-number__separator--decimal {
  position: relative;
  flex-basis: .28em;
  width: .28em;
  padding: 0;
  font-size: 0;
}

.flip-number__separator--decimal::after {
  position: absolute;
  bottom: var(--flip-number-decimal-offset);
  left: 50%;
  width: var(--flip-number-decimal-size);
  height: var(--flip-number-decimal-size);
  content: '';
  background: currentColor;
  border-radius: 50%;
  transform: translateX(-50%);
}

@keyframes flip-number-turn {
  0% { opacity: 1; transform: rotateX(0deg); }
  58% { opacity: 1; transform: rotateX(-88deg); }
  100% { opacity: 0; transform: rotateX(-90deg); }
}

@media (prefers-reduced-motion: reduce) {
  .flip-number__digit--flipping.flip-number__digit--changed .flip-number__previous { animation: none; }
}
</style>

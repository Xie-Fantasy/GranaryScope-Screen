<script setup lang="ts">
// Shared, static stand-in for the future digital twin scene.
// The visual stays intentionally quiet until a real model integration exists.

defineOptions({ name: 'ModelPlaceholder' });
</script>

<template>
  <section class="model-placeholder" aria-label="数字孪生工作区占位">
    <div class="model-placeholder__grid" aria-hidden="true"></div>
    <div class="model-placeholder__radial" aria-hidden="true"></div>

    <div class="model-placeholder__content">
      <svg class="model-placeholder__icon" viewBox="0 0 72 64" fill="none" aria-hidden="true">
        <path d="M36 4 62 18v28L36 60 10 46V18L36 4Z" />
        <path d="m10 18 26 15 26-15M36 33v27" />
        <path d="m20 24 16 9 16-9" />
      </svg>
      <p class="model-placeholder__title">数字孪生场景待接入</p>
      <p class="model-placeholder__description">当前未加载园区模型</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.model-placeholder {
  @include shell.panel;
  --model-stage-opacity: 68%;
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-panel) var(--model-stage-opacity), transparent);
  backdrop-filter: blur(1.5px);
  -webkit-backdrop-filter: blur(1.5px);
}

:global(html[data-theme='green'] .model-placeholder) {
  --model-stage-opacity: 80%;
}

.model-placeholder__grid,
.model-placeholder__radial {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.model-placeholder__grid {
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.65;
}

.model-placeholder__radial {
  background: radial-gradient(circle at 50% 44%, var(--primary-soft), transparent 42%);
  opacity: 0.34;
}

.model-placeholder__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  text-align: center;
}

.model-placeholder__icon {
  width: 56px;
  height: 50px;
  margin-bottom: $spacing-xs;
  color: var(--primary-muted);
  opacity: 0.82;

  path {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.model-placeholder__title,
.model-placeholder__description {
  margin: 0;
  line-height: 1.4;
}

.model-placeholder__title {
  color: var(--text-secondary);
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
}

.model-placeholder__description {
  color: var(--text-tertiary);
  font-size: $font-size-xs;
}
</style>

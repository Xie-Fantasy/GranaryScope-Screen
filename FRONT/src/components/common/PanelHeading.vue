<script setup lang="ts">
withDefaults(defineProps<{ as?: 'h3' | 'h4' | 'div' }>(), { as: 'h3' });
</script>

<template>
  <component :is="as" class="panel-heading">
    <span class="panel-heading__wing" aria-hidden="true"></span>
    <slot></slot>
    <span class="panel-heading__wing panel-heading__wing--right" aria-hidden="true"></span>
  </component>
</template>

<style scoped lang="scss">
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-width: 0;
  margin: 0;
  color: var(--text-primary);
  font-size: var(--panel-heading-size, 22px);
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: .1em;
  white-space: nowrap;
}

.panel-heading__wing {
  position: relative;
  display: block;
  flex: 0 0 var(--panel-heading-wing-width, 48px);
  height: var(--panel-heading-wing-height, 13px);
  color: var(--primary);
  pointer-events: none;

  &::before {
    position: absolute;
    inset: 0;
    content: '';
    background: linear-gradient(90deg, transparent, currentColor);
    clip-path: polygon(0 0, 85% 0, 100% 100%, 89% 100%, 80% 8%, 0 8%);
  }

  &::after {
    position: absolute;
    right: 12px;
    bottom: 1px;
    width: 29px;
    height: 4px;
    content: '';
    opacity: .3;
    transform: skewX(35deg);
    background: repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 5px);
  }

  &--right { transform: scaleX(-1); }
}
</style>

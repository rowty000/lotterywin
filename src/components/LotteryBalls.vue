<script setup lang="ts">
import { ref, withDefaults, watch } from 'vue'
import { BallColor } from '@/enums'
import gsap from 'gsap'

const fullBalls = ref<number[]>([])
const balls = ref<number[]>([])
const animatingBallIndex = ref(-1)
const tl = gsap.timeline({ paused: true })

const props = withDefaults(
  defineProps<{
    ballCount: number
    pickCount: number
    repeatable: boolean
    fromZero: boolean
    ballColor: BallColor
  }>(),
  {
    ballCount: 10,
    pickCount: 3,
    repeatable: false,
    fromZero: false,
    ballColor: BallColor.RED
  }
)

const reset = () => {
  tl.clear()
  animatingBallIndex.value = -1
  const offset = props.fromZero ? 0 : 1
  fullBalls.value = Array.from({ length: props.ballCount }, (_, index) => index + offset)
  balls.value = Array(props.pickCount).fill(0)
}

watch(
  () => props,
  () => {
    reset()
  },
  { immediate: true, deep: true }
)

const updateBallNumber = (index: number) => {
  animatingBallIndex.value = index
  const randomIndex = Math.floor(Math.random() * fullBalls.value.length)
  balls.value[index] = fullBalls.value[randomIndex]
}

const lockBallNumber = (index: number) => {
  if (!props.repeatable) {
    const pos = fullBalls.value.indexOf(balls.value[index])
    fullBalls.value.splice(pos, 1)
  }
}

const stopAnimation = () => {
  animatingBallIndex.value = -1
}

const start = async (): Promise<void> => {
  if (animatingBallIndex.value !== -1) return
  return new Promise((resolve) => {
    reset()
    animatingBallIndex.value = 0

    for (let i = 0; i < balls.value.length; i++) {
      tl.to(
        {},
        {
          duration: 1,
          ease: 'linear',
          onStart: () => updateBallNumber(i),
          onUpdate: () => updateBallNumber(i),
          onComplete:
            i === balls.value.length - 1
              ? () => {
                  stopAnimation()
                  resolve()
                }
              : () => lockBallNumber(i)
        }
      )
    }

    tl.play()
  })
}

const sortBalls = () => {
  if (!props.repeatable) {
    balls.value = [...balls.value].sort((a, b) => a - b)
  }
}

defineExpose({
  reset,
  start,
  sortBalls
})
</script>

<template>
  <div class="balls">
    <div
      v-for="(ball, index) in balls"
      :key="index"
      class="ball"
      :class="{
        'is-animating': animatingBallIndex === index,
        'ball-red': ballColor === BallColor.RED,
        'ball-blue': ballColor === BallColor.BLUE
      }"
    >
      {{ ball }}
    </div>
  </div>
</template>

<style scoped>
.balls {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25em;
}

.ball {
  position: relative;
  width: 2.5em;
  height: 2.5em;
  line-height: 2.5em;
  border-radius: 50%;
  background-color: #ddd;
  margin: 0 0.3em;
  text-align: center;
  font-weight: bold;
  font-size: 1.25em; /* 增大字体大小 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
  color: white; /* 设置字体颜色为白色 */
}

/* 根据彩票球的颜色分类，可以添加不同的类 */
.ball.ball-blue {
  /* background-color: #3498db; */
  background-color: #0000b0;
}

.ball.ball-red {
  background-color: #b00000;
}

/* 更立体的阴影效果 */
.ball::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.ball.ball-blue::after {
  box-shadow: inset -0.5em 0.5em 0.5em rgba(128, 128, 255, 0.8);
}

.ball.ball-red::after {
  box-shadow: inset -0.5em 0.5em 0.5em rgba(255, 128, 128, 0.8);
}

.is-animating {
  animation: bounce 0.1s infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-1.25em);
  }
}
</style>

<script setup lang="ts">
import { ref, watch, onBeforeUpdate } from 'vue'
import { BallColor } from '@/enums'
import LotteryBalls from '@/components/LotteryBalls.vue'
import gsap from 'gsap'
enum Company {
  FUCAI,
  TICAI,
  CUSTOM
}

enum Game {
  ShuangSeQiu,
  KuaiLe8,
  SanD,
  DaLeTou,
  QiXingCai,
  PaiLieWu
}

interface GameDetail {
  id: Game
  com: Company
  name: string
  range: {
    ballCount: number
    pickCount: number
    repeatable: boolean
    fromZero?: boolean
    ballColor?: BallColor
  }[]
}

const GAME_DETAILS: GameDetail[] = [
  {
    id: Game.ShuangSeQiu,
    com: Company.FUCAI,
    name: '双色球',
    range: [
      { ballCount: 33, pickCount: 6, repeatable: false },
      { ballCount: 16, pickCount: 1, repeatable: false, ballColor: BallColor.BLUE }
    ]
  },
  {
    id: Game.KuaiLe8,
    com: Company.FUCAI,
    name: '快乐8',
    range: [{ ballCount: 80, pickCount: 10, repeatable: false }]
  },
  {
    id: Game.SanD,
    com: Company.FUCAI,
    name: '3D',
    range: [{ ballCount: 10, pickCount: 3, repeatable: true, fromZero: true }]
  },
  {
    id: Game.DaLeTou,
    com: Company.TICAI,
    name: '大乐透',
    range: [
      { ballCount: 35, pickCount: 5, repeatable: false },
      { ballCount: 12, pickCount: 2, repeatable: false, ballColor: BallColor.BLUE }
    ]
  },
  {
    id: Game.QiXingCai,
    com: Company.TICAI,
    name: '七星彩',
    range: [
      { ballCount: 10, pickCount: 6, repeatable: true, fromZero: true },
      { ballCount: 15, pickCount: 1, repeatable: true, fromZero: true, ballColor: BallColor.BLUE }
    ]
  },
  {
    id: Game.PaiLieWu,
    com: Company.TICAI,
    name: '排列5',
    range: [{ ballCount: 10, pickCount: 5, repeatable: true, fromZero: true }]
  }
]

const lotteryCompany = ref<Company>(Company.TICAI)
const lotteryGame = ref<Game>(Game.DaLeTou)
const gameOptions = ref<GameDetail[]>([])
const gameDetail = ref<GameDetail>()

const lotteryBallsRefs = ref<InstanceType<typeof LotteryBalls>[]>([])

const running = ref(false)

watch(
  lotteryCompany,
  (newVal) => {
    gameOptions.value = GAME_DETAILS.filter((item) => item.com === newVal)
    lotteryGame.value = gameOptions.value[0].id
  },
  { immediate: true }
)

watch(
  lotteryGame,
  (newVal) => {
    gameDetail.value = GAME_DETAILS.find((item) => item.id === newVal)
  },
  { immediate: true }
)

watch(running, (newVal) => {
  if (newVal) {
    document.querySelectorAll('.button-char').forEach((char, index) => {
      const tl = gsap.timeline({ repeat: -1, delay: index * 0.1 })
      tl.to(char, {
        y: -10,
        ease: 'power1.out',
        duration: 0.2
      })
        .to(char, {
          y: 10,
          ease: 'power1.inOut',
          duration: 0.4
        })
        .to(char, {
          y: 0,
          ease: 'power1.in',
          duration: 0.2
        })
    })
  } else {
    // 停止动画并重置位置
    gsap.killTweensOf('.button-char')
    document.querySelectorAll('.button-char').forEach((char) => {
      gsap.to(char, { y: 0, duration: 0.2 })
    })
  }
})

onBeforeUpdate(() => {
  lotteryBallsRefs.value = []
})

const setLotteryBallsRef = (el: unknown) => {
  if (el) {
    lotteryBallsRefs.value.push(el as InstanceType<typeof LotteryBalls>)
  }
}

const start = async () => {
  if (running.value) {
    return
  }
  running.value = true
  for (let i = 0; i < lotteryBallsRefs.value.length; i++) {
    await lotteryBallsRefs.value[i].start()
  }
  bounceBalls()
  for (let i = 0; i < lotteryBallsRefs.value.length; i++) {
    lotteryBallsRefs.value[i].sortBalls()
  }
  running.value = false
}

const bounceBalls = () => {
  gsap.to('.ball', {
    scale: 1.2,
    yoyo: true,
    repeat: 1,
    stagger: 0.1,
    duration: 0.5,
    ease: 'power1.inOut'
  })
}
</script>

<template>
  <div class="lottery">
    <div class="radio-buttons">
      <input type="radio" id="ticai" :value="Company.TICAI" v-model="lotteryCompany" hidden />
      <label for="ticai" class="radio-btn">体彩</label>

      <input type="radio" id="fucai" :value="Company.FUCAI" v-model="lotteryCompany" hidden />
      <label for="fucai" class="radio-btn">福彩</label>
    </div>
    <div class="radio-buttons">
      <div v-for="game in gameOptions">
        <input
          type="radio"
          :id="game.id.toString()"
          :value="game.id"
          v-model="lotteryGame"
          hidden
        />
        <label :for="game.id.toString()" class="radio-btn radio-btn-small">{{ game.name }}</label>
      </div>
    </div>
    <div class="lottery-balls" :class="{ 'lottery-balls-small': lotteryGame == Game.KuaiLe8 }">
      <div v-for="range in gameDetail?.range">
        <LotteryBalls
          :ref="setLotteryBallsRef"
          :ball-count="range.ballCount"
          :pick-count="range.pickCount"
          :repeatable="range.repeatable"
          :from-zero="range.fromZero"
          :ball-color="range.ballColor"
        ></LotteryBalls>
      </div>
    </div>

    <button :disabled="running" @click="start" class="start-button">
      <span class="button-char">中</span>
      <span class="button-char">奖</span>
      <span class="button-char">吧</span>
    </button>
  </div>
</template>

<style scoped>
.lottery {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10vw;
  width: 100vw;
  text-align: center;
}

.lottery-balls {
  margin: 1em 0;
}

@media (max-width: 480px) {
  .lottery-balls {
    font-size: 10px;
  }
  .lottery-balls-small {
    font-size: 8px;
  }
}

.radio-buttons {
  display: flex;
  margin-bottom: 1em;
}

.radio-btn {
  padding: 0.5em 1em;
  color: white; /* 文字颜色保持为白色 */
  font-weight: bold;
  border: 2px solid #555; /* 边框颜色为深灰色，以增加对比度 */
  border-radius: 4px;
  background-color: #333; /* 按钮背景为深灰色 */
  margin: 0 0.3em;
  cursor: pointer;
  transition: background-color 0.3s; /* 添加过渡效果 */
}

.radio-btn.radio-btn-small {
  padding: 0.25em 0.5em;
  font-weight: normal;
}

.radio-btn:hover {
  background-color: #555; /* 鼠标悬停时按钮变为稍微亮一点的灰色 */
}

input[type='radio']:checked + .radio-btn {
  background-color: #007bff; /* 选中时的背景颜色，可以选一个亮色 */
  border-color: #007bff; /* 选中时的边框颜色与背景相同 */
}

.start-button {
  padding: 1em 1.5em;
  border: 2px solid #ff6347; /* 边框颜色调整为淡红色 */
  border-radius: 4px;
  background-color: #e74c3c; /* 按钮背景颜色为较深的红色 */
  color: white;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1); /* 使用较浅的阴影颜色 */
}

@media (max-width: 640px) {
  .start-button {
    padding: 0.5em 1em;
  }
}

.start-button:hover {
  background-color: #ff6347; /* 鼠标悬停时的背景颜色为较亮的红色 */
  border-color: #ff6347; /* 鼠标悬停时的边框颜色与背景颜色保持一致 */
  box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2); /* 增加阴影的模糊度和透明度 */
}

.start-button:disabled {
  cursor: default; /* 更改鼠标样式 */
}

.button-char {
  display: inline-block;
  font-weight: bold;
}
</style>

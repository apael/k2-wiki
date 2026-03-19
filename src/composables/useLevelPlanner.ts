import { computed, type Ref } from 'vue'
import { useCreatures } from '@/composables/useCreatures'
import { useCreatureCollection } from '@/composables/useCreatureCollection'
import { planLevelingPath, MAX_LEVEL, type LevelingPlan } from '@/utils/levelPlanner'
import { xpForLevel } from '@/utils/formulas'

export function useLevelPlanner(
  creatureId: Ref<string>,
  targetLevel: Ref<number>,
) {
  const { creatures } = useCreatures()
  const { getLevel } = useCreatureCollection()

  const creature = computed(() =>
    creatures.value.find(c => c.id === creatureId.value) ?? null,
  )

  const startLevel = computed(() =>
    creature.value ? getLevel(creature.value.id) : 1,
  )

  const isMaxLevel = computed(() => startLevel.value >= MAX_LEVEL)

  const totalXpNeeded = computed(() => {
    if (!creature.value) return 0
    return Math.max(0, xpForLevel(targetLevel.value) - xpForLevel(startLevel.value))
  })

  const plan = computed<LevelingPlan | null>(() => {
    if (!creature.value || isMaxLevel.value) return null
    return planLevelingPath({
      creature: creature.value,
      startLevel: startLevel.value,
      targetLevel: targetLevel.value,
    })
  })

  return {
    creature,
    startLevel,
    targetLevel,
    plan,
    totalXpNeeded,
    isMaxLevel,
  }
}

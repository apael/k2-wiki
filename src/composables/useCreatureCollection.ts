import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { CreatureCollectionEntry } from '@/types'

const collection = useLocalStorage<Record<string, CreatureCollectionEntry>>('creature-collection', {})

export function useCreatureCollection() {
  const ownedCreatureIds = computed(() => {
    const ids = new Set<string>()
    for (const [id, entry] of Object.entries(collection.value)) {
      if (entry.owned) ids.add(id)
    }
    return ids
  })

  const collectionLevels = computed(() => {
    const levels: Record<string, number> = {}
    for (const [id, entry] of Object.entries(collection.value)) {
      if (entry.owned) levels[id] = entry.level
    }
    return levels
  })

  function isOwned(id: string): boolean {
    return collection.value[id]?.owned ?? false
  }

  function getLevel(id: string): number {
    return collection.value[id]?.level ?? 1
  }

  function toggleOwned(id: string) {
    const current = collection.value[id]
    collection.value = {
      ...collection.value,
      [id]: { owned: !current?.owned, level: current?.level ?? 1 },
    }
  }

  function setOwned(id: string, owned: boolean) {
    const current = collection.value[id]
    collection.value = {
      ...collection.value,
      [id]: { owned, level: current?.level ?? 1 },
    }
  }

  function setLevel(id: string, level: number) {
    const clamped = Math.max(1, Math.min(120, Math.round(level)))
    const current = collection.value[id]
    collection.value = {
      ...collection.value,
      [id]: { owned: current?.owned ?? false, level: clamped },
    }
  }

  return {
    collection,
    ownedCreatureIds,
    collectionLevels,
    toggleOwned,
    setOwned,
    setLevel,
    isOwned,
    getLevel,
  }
}

/**
 * Precomputed table generation script.
 * Run with: npm run generate-tables
 *
 * Generates static JSON lookup tables from game data + formulas.
 * Output: src/data/precomputed/*.json
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import biomesData from '../src/data/biomes.json'
import creaturesData from '../src/data/creatures.json'
import expeditionsData from '../src/data/expeditions.json'
import type { Biome, Creature, Expedition } from '../src/types'
import {
  calculateCreatureRating,
  calculateDuration,
  calculateExpeditionXp,
} from '../src/utils/formulas'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../src/data/precomputed')

const expeditions = expeditionsData as Expedition[]
const biomes = biomesData as Biome[]
const creatures = creaturesData as Creature[]
const biomeMap = new Map(biomes.map((b) => [b.id, b]))

const NUM_LEVELS = 120
const TOP_K = 5

mkdirSync(OUT_DIR, { recursive: true })

// ── Creature Ratings ──────────────────────────────────────────────────
console.log('Computing creature ratings...')
const creatureRatings: Record<string, Record<string, number[]>> = {}

for (const creature of creatures) {
  creatureRatings[creature.id] = {}
  for (const expedition of expeditions) {
    const biome = biomeMap.get(expedition.biome)
    const ratings: number[] = []
    for (let level = 1; level <= NUM_LEVELS; level++) {
      ratings.push(
        Math.round(calculateCreatureRating(creature, expedition, level, biome) * 100) / 100,
      )
    }
    creatureRatings[creature.id][expedition.id] = ratings
  }
}

writeFileSync(resolve(OUT_DIR, 'creature-ratings.json'), JSON.stringify(creatureRatings) + '\n')
console.log('  → creature-ratings.json')

// ── Solo Rates ────────────────────────────────────────────────────────
console.log('Computing solo rates...')
const soloRates: Record<string, number[]> = {}

for (const creature of creatures) {
  const rates: number[] = []
  for (let level = 1; level <= NUM_LEVELS; level++) {
    let bestRate = 0
    for (const expedition of expeditions) {
      const rating = creatureRatings[creature.id][expedition.id][level - 1]
      for (let tier = 1; tier <= 5; tier++) {
        const duration = calculateDuration(rating, expedition, tier)
        const xpPerRun = calculateExpeditionXp(expedition, tier, 10, 1)
        if (duration <= 0 || xpPerRun <= 0) continue
        const rate = xpPerRun / duration
        if (rate > bestRate) bestRate = rate
      }
    }
    rates.push(Math.round(bestRate * 100) / 100)
  }
  soloRates[creature.id] = rates
}

writeFileSync(resolve(OUT_DIR, 'solo-rates.json'), JSON.stringify(soloRates) + '\n')
console.log('  → solo-rates.json')

// ── Top Expeditions ──────────────────────────────────────────────────
console.log('Computing top expeditions...')
const topExpeditions: Record<string, string[][]> = {}

for (const creature of creatures) {
  const perLevel: string[][] = []
  for (let level = 1; level <= NUM_LEVELS; level++) {
    const rates: { expeditionId: string; bestRate: number }[] = []
    for (const expedition of expeditions) {
      const rating = creatureRatings[creature.id][expedition.id][level - 1]
      let bestRate = 0
      for (let tier = 1; tier <= 5; tier++) {
        const duration = calculateDuration(rating, expedition, tier)
        const xpPerRun = calculateExpeditionXp(expedition, tier, 10, 1)
        if (duration <= 0 || xpPerRun <= 0) continue
        const rate = xpPerRun / duration
        if (rate > bestRate) bestRate = rate
      }
      if (bestRate > 0) rates.push({ expeditionId: expedition.id, bestRate })
    }
    rates.sort((a, b) => b.bestRate - a.bestRate)
    perLevel.push(rates.slice(0, TOP_K).map((r) => r.expeditionId))
  }
  topExpeditions[creature.id] = perLevel
}

writeFileSync(resolve(OUT_DIR, 'top-expeditions.json'), JSON.stringify(topExpeditions) + '\n')
console.log('  → top-expeditions.json')

// ── Best Expedition ──────────────────────────────────────────────────
console.log('Computing best expedition per level...')
const bestExpedition: Record<string, string[]> = {}

for (const creature of creatures) {
  const best: string[] = []
  for (let level = 1; level <= NUM_LEVELS; level++) {
    let bestRate = 0
    let bestId = ''
    for (const expedition of expeditions) {
      const rating = creatureRatings[creature.id][expedition.id][level - 1]
      for (let tier = 1; tier <= 5; tier++) {
        const duration = calculateDuration(rating, expedition, tier)
        const xpPerRun = calculateExpeditionXp(expedition, tier, 10, 1)
        if (duration <= 0 || xpPerRun <= 0) continue
        const rate = xpPerRun / duration
        if (rate > bestRate) {
          bestRate = rate
          bestId = expedition.id
        }
      }
    }
    best.push(bestId)
  }
  bestExpedition[creature.id] = best
}

writeFileSync(resolve(OUT_DIR, 'best-expedition.json'), JSON.stringify(bestExpedition) + '\n')
console.log('  → best-expedition.json')

// ── Level Transitions ────────────────────────────────────────────────
console.log('Computing level transitions...')
const levelTransitions: Record<string, number[]> = {}

for (const creature of creatures) {
  const transitions: number[] = []
  const best = bestExpedition[creature.id]
  for (let level = 2; level <= NUM_LEVELS; level++) {
    if (best[level - 2] !== best[level - 1]) {
      transitions.push(level)
    }
  }
  levelTransitions[creature.id] = transitions
}

writeFileSync(resolve(OUT_DIR, 'level-transitions.json'), JSON.stringify(levelTransitions) + '\n')
console.log('  → level-transitions.json')

console.log('\nDone! All tables written to src/data/precomputed/')

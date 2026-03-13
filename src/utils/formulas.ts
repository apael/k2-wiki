import type { Creature, Expedition, Biome, CreatureStats, ExpeditionStatKey } from '@/types'

// Consolidated stat labels & abbreviations (creature and expedition stats share the same keys)
export const statLabels: Record<keyof CreatureStats, string> = {
  power: 'Power',
  grit: 'Grit',
  agility: 'Agility',
  smarts: 'Smarts',
  looting: 'Looting',
  luck: 'Luck',
}

export const statAbbreviations: Record<keyof CreatureStats, string> = {
  power: 'POW',
  grit: 'GRT',
  agility: 'AGI',
  smarts: 'SMT',
  looting: 'LOT',
  luck: 'LCK',
}

export const jobLabels: Record<keyof Creature['jobs'], string> = {
  chopping: 'Chopping',
  mining: 'Mining',
  digging: 'Digging',
  exploring: 'Exploring',
  fishing: 'Fishing',
  farming: 'Farming',
}

export const jobColors: Record<keyof Creature['jobs'], string> = {
  chopping: 'var(--color-job-chopping)',
  mining: 'var(--color-job-mining)',
  digging: 'var(--color-job-digging)',
  exploring: 'var(--color-job-exploring)',
  fishing: 'var(--color-job-fishing)',
  farming: 'var(--color-job-farming)',
}

export const tierModifiers = {
  difficulty: [1, 1.5, 2, 2.5, 3],
  duration: [1, 1.5, 2, 2.5, 3],
  xp: [1.0, 1.2, 1.4, 1.6, 1.8],
  loot: [1, 2, 3, 4, 5],
}

export function biomeMultiplier(creature: Creature, biome: Biome): number {
  let hasAdvantage = false
  let hasDisadvantage = false
  for (const type of creature.types) {
    if (biome.advantage.includes(type)) hasAdvantage = true
    if (biome.disadvantage.includes(type)) hasDisadvantage = true
  }
  if (hasAdvantage) return 1.5
  if (hasDisadvantage) return 0.5
  return 1.0
}

export function calculateCreatureRating(
  creature: Creature,
  expedition: Expedition,
  level: number = 1,
  biome?: Biome
): number {
  let weightedStatSum = 0
  for (const [stat, weight] of Object.entries(expedition.statWeights) as [ExpeditionStatKey, number][]) {
    if (weight > 0) {
      weightedStatSum += creature.stats[stat] * weight
    }
  }

  const rawScore = weightedStatSum * level
  const biomeScore = biome ? rawScore * biomeMultiplier(creature, biome) : rawScore
  const traitBonus = creature.trait === expedition.trait ? 1.5 : 1.0

  return Math.floor(biomeScore * traitBonus)
}

export function calculateDifficultyRating(expedition: Expedition, tier: number): number {
  return Math.floor(expedition.baseRating * tierModifiers.difficulty[tier - 1])
}

export function calculatePartyScore(
  creatures: (Creature | null)[],
  expedition: Expedition,
  levels: Record<string, number>,
  biome?: Biome
): number {
  let total = 0
  for (const creature of creatures) {
    if (creature) {
      const level = levels[creature.id] || 1
      total += calculateCreatureRating(creature, expedition, level, biome)
    }
  }
  return total
}

export function calculateDuration(
  partyScore: number,
  expedition: Expedition,
  tier: number
): number {
  const baseDuration = expedition.baseDuration * tierModifiers.duration[tier - 1]
  const difficultyRating = calculateDifficultyRating(expedition, tier)

  if (partyScore <= 0) return Math.floor(baseDuration)

  const scoreRatio = difficultyRating / partyScore
  const rawDuration = baseDuration * scoreRatio
  const minDuration = baseDuration * 0.8

  return Math.floor(Math.max(rawDuration, minDuration))
}

export function estimateCompletionTime(
  partyScore: number,
  expedition: Expedition,
  tier: number = 1
): number {
  const durationSeconds = calculateDuration(partyScore, expedition, tier)
  return Math.round(durationSeconds / 60)
}

export function calculateXpPerSecond(
  expedition: Expedition,
  tier: number = 1
): number {
  return expedition.baseXP * tierModifiers.xp[tier - 1]
}

export function xpForLevel(level: number): number {
  return 50 * (level - 1) * (level - 1)
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1
}

export function getRecommendedCreatures(
  creatures: Creature[],
  expedition: Expedition,
  levels: Record<string, number> = {},
  biome?: Biome
): { creature: Creature; rating: number; level: number }[] {
  return creatures
    .map((creature) => {
      const level = levels[creature.id] || 1
      return {
        creature,
        rating: calculateCreatureRating(creature, expedition, level, biome),
        level,
      }
    })
    .sort((a, b) => b.rating - a.rating)
}

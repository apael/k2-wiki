<script setup lang="ts">
import { ref } from 'vue'
import { Columns3, Grid2x2, Minus, Pencil, Plus, Search, SlidersHorizontal } from 'lucide-vue-next'
import type { ElementType } from '@/types'
import { toTitleCase } from '@/utils/format'

const props = defineProps<{
  searchQuery: string
  typeFilter: ElementType | 'all'
  tierFilter: number | 'all'
  traitFilter: string | 'all'
  jobFilter: string | 'all'
  viewMode: 'grid' | 'table'
  ownedFilter: 'all' | 'owned' | 'unowned'
  editing: boolean
  bulkLevel: number
  ownedCount: number
  resultCount: number
  traitOptions: string[]
  jobOptions: string[]
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:typeFilter': [value: ElementType | 'all']
  'update:tierFilter': [value: number | 'all']
  'update:traitFilter': [value: string | 'all']
  'update:jobFilter': [value: string | 'all']
  'update:viewMode': [value: 'grid' | 'table']
  'update:ownedFilter': [value: 'all' | 'owned' | 'unowned']
  'update:editing': [value: boolean]
  'update:bulkLevel': [value: number]
  'selectAll': []
  'deselectAll': []
  'applyBulkLevel': []
}>()

const typeOptions: Array<ElementType | 'all'> = ['all', 'Fire', 'Water', 'Wind', 'Earth']
const tierOptions = ['all', 0, 1, 2, 3, 4, 5] as const

const showFilters = ref(false)

const typeDotColor: Record<ElementType, string> = {
  Fire: 'hsl(var(--type-fire))',
  Water: 'hsl(var(--type-water))',
  Wind: 'hsl(var(--type-wind))',
  Earth: 'hsl(var(--type-earth))',
}
</script>

<template>
  <div class="surface-card p-4 sm:p-5">
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search input with icon -->
      <label class="relative min-w-[220px] flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          :value="props.searchQuery"
          type="text"
          class="focus-ring w-full rounded-xl border border-input bg-background/70 py-2.5 pl-10 pr-4 text-sm"
          placeholder="Search creatures by name, type, trait, or role"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <!-- View mode toggle -->
      <div class="inline-flex items-center rounded-xl border border-border bg-muted/50 p-1" role="radiogroup" aria-label="View mode">
        <button
          role="radio"
          :aria-checked="props.viewMode === 'grid'"
          class="focus-ring inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition"
          :class="props.viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-foreground'"
          @click="emit('update:viewMode', 'grid')"
        >
          <Grid2x2 class="size-3.5" />
          Grid
        </button>
        <button
          role="radio"
          :aria-checked="props.viewMode === 'table'"
          class="focus-ring inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition"
          :class="props.viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-foreground'"
          @click="emit('update:viewMode', 'table')"
        >
          <Columns3 class="size-3.5" />
          Table
        </button>
      </div>

      <!-- Edit mode toggle -->
      <button
        class="focus-ring inline-flex w-[5.5rem] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition"
        :class="props.editing
          ? 'border-primary bg-primary text-primary-foreground shadow-glow'
          : 'border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground'"
        @click="emit('update:editing', !props.editing)"
      >
        <Pencil class="size-4" />
        {{ props.editing ? 'Done' : 'Edit' }}
      </button>

      <!-- Mobile filter toggle -->
      <button
        class="focus-ring inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-accent/50 hover:text-foreground lg:hidden"
        :aria-expanded="showFilters"
        aria-controls="beastiary-filters"
        @click="showFilters = !showFilters"
      >
        <SlidersHorizontal class="size-4" />
        Filters
      </button>
    </div>

    <!-- Filter pills -->
    <div
      id="beastiary-filters"
      class="mt-4 space-y-3"
      :class="showFilters ? 'block' : 'hidden lg:block'"
    >
      <!-- Type filter -->
      <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Filter by type">
        <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Type</span>
        <button
          v-for="option in typeOptions"
          :key="option"
          role="radio"
          :aria-checked="props.typeFilter === option"
          class="pill focus-ring"
          :class="props.typeFilter === option ? 'pill-active' : ''"
          @click="emit('update:typeFilter', option)"
        >
          <span
            v-if="option !== 'all'"
            class="mr-1.5 inline-block size-2 rounded-full"
            :style="{ backgroundColor: typeDotColor[option as ElementType] }"
          />
          {{ option === 'all' ? 'All Types' : option }}
        </button>
      </div>

      <!-- Tier filter -->
      <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Filter by tier">
        <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Tier</span>
        <button
          v-for="option in tierOptions"
          :key="option"
          role="radio"
          :aria-checked="props.tierFilter === option"
          class="pill focus-ring font-mono"
          :class="props.tierFilter === option ? 'pill-active' : ''"
          @click="emit('update:tierFilter', option)"
        >
          {{ option === 'all' ? 'All' : `T${(option as number) + 1}` }}
        </button>
      </div>

      <!-- Job filter -->
      <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Filter by job">
        <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Job</span>
        <button
          role="radio"
          :aria-checked="props.jobFilter === 'all'"
          class="pill focus-ring"
          :class="props.jobFilter === 'all' ? 'pill-active' : ''"
          @click="emit('update:jobFilter', 'all')"
        >
          All Jobs
        </button>
        <button
          v-for="job in props.jobOptions"
          :key="job"
          role="radio"
          :aria-checked="props.jobFilter === job"
          class="pill focus-ring"
          :class="props.jobFilter === job ? 'pill-active' : ''"
          @click="emit('update:jobFilter', job)"
        >
          {{ toTitleCase(job) }}
        </button>
      </div>

      <!-- Trait filter -->
      <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Filter by trait">
        <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Trait</span>
        <button
          role="radio"
          :aria-checked="props.traitFilter === 'all'"
          class="pill focus-ring"
          :class="props.traitFilter === 'all' ? 'pill-active' : ''"
          @click="emit('update:traitFilter', 'all')"
        >
          All Traits
        </button>
        <button
          v-for="trait in props.traitOptions"
          :key="trait"
          role="radio"
          :aria-checked="props.traitFilter === trait"
          class="pill focus-ring"
          :class="props.traitFilter === trait ? 'pill-active' : ''"
          @click="emit('update:traitFilter', trait)"
        >
          {{ toTitleCase(trait) }}
        </button>
      </div>

      <!-- Summoned filter -->
      <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Filter by summoned">
        <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Summoned</span>
        <button
          v-for="option in (['all', 'owned', 'unowned'] as const)"
          :key="option"
          role="radio"
          :aria-checked="props.ownedFilter === option"
          class="pill focus-ring"
          :class="props.ownedFilter === option ? 'pill-active' : ''"
          @click="emit('update:ownedFilter', option)"
        >
          {{ option === 'all' ? 'All' : option === 'owned' ? 'Summoned' : 'Not Summoned' }}
        </button>

        <div class="ml-auto rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground" aria-live="polite">
          {{ props.ownedCount }} summoned · {{ props.resultCount }} results
        </div>
      </div>

      <!-- Bulk summon (edit mode) -->
      <div v-if="props.editing" class="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Mark</span>
        <button class="pill focus-ring pill-active" @click="emit('selectAll')">
          All Visible as Summoned
        </button>
        <button class="pill focus-ring" @click="emit('deselectAll')">
          All Visible as Not Summoned
        </button>
      </div>

      <!-- Bulk level (edit mode) -->
      <div v-if="props.editing" class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Level</span>
        <div class="inline-flex items-center overflow-hidden rounded-md border border-input bg-background/85">
          <button
            class="focus-ring inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="props.bulkLevel <= 1"
            aria-label="Decrease bulk level"
            @click="emit('update:bulkLevel', Math.max(1, props.bulkLevel - 1))"
          >
            <Minus class="size-3" />
          </button>
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="focus-ring h-7 w-11 border-x border-input bg-transparent text-center text-xs font-mono"
            :value="props.bulkLevel"
            aria-label="Bulk level"
            @blur="emit('update:bulkLevel', Math.max(1, Math.min(120, Math.round(Number(($event.target as HTMLInputElement).value) || 1))))"
          />
          <button
            class="focus-ring inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="props.bulkLevel >= 120"
            aria-label="Increase bulk level"
            @click="emit('update:bulkLevel', Math.min(120, props.bulkLevel + 1))"
          >
            <Plus class="size-3" />
          </button>
        </div>
        <button class="pill focus-ring pill-active" @click="emit('applyBulkLevel')">
          Apply to All Summoned
        </button>
        <span class="text-[11px] text-muted-foreground">Sets level for all summoned creatures shown</span>
      </div>
    </div>
  </div>
</template>

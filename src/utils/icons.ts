import choppingIcon from '@/assets/icons/chopping.png'
import diggingIcon from '@/assets/icons/digging.png'
import exploringIcon from '@/assets/icons/explorering.png'
import farmingIcon from '@/assets/icons/farming.png'
import fishingIcon from '@/assets/icons/fishing.png'
import furnaceIcon from '@/assets/icons/furnace.png'
import helpersIcon from '@/assets/icons/helpers.png'
import machinesIcon from '@/assets/icons/machines.png'
import miningIcon from '@/assets/icons/mining.png'
import sanctuaryIcon from '@/assets/icons/sanctuary.png'
import stoveIcon from '@/assets/icons/stove.png'
import workbenchIcon from '@/assets/icons/workbench.png'

export { helpersIcon, machinesIcon, sanctuaryIcon }

export const jobIcons: Record<string, string> = {
  chopping: choppingIcon,
  mining: miningIcon,
  digging: diggingIcon,
  exploring: exploringIcon,
  fishing: fishingIcon,
  farming: farmingIcon,
}

import commonSkull from '@/assets/icons/common-skull.png'
import legendarySkull from '@/assets/icons/legendary-skull.png'
import rareSkull from '@/assets/icons/rare-skull.png'
import superRareSkull from '@/assets/icons/super-rare-skull.png'
import uncommonSkull from '@/assets/icons/uncommon-skull.png'

export const expeditionTierIcons: Record<number, string> = {
  1: commonSkull,
  2: uncommonSkull,
  3: rareSkull,
  4: superRareSkull,
  5: legendarySkull,
}

export const sourceIcons: Record<string, string> = {
  ...jobIcons,
  // Title-cased variants (used in ItemDetail jobId)
  Chopping: choppingIcon,
  Mining: miningIcon,
  Digging: diggingIcon,
  Exploring: exploringIcon,
  Fishing: fishingIcon,
  Farming: farmingIcon,
  // Workstation source keys
  crafting_furnace: furnaceIcon,
  crafting_stove: stoveIcon,
  crafting_workbench: workbenchIcon,
  // Display label variants (for table badges)
  Furnace: furnaceIcon,
  Stove: stoveIcon,
  Workbench: workbenchIcon,
}

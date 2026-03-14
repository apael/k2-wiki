import type { Item } from '@/types'

const itemImageModules = import.meta.glob('../assets/items/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const itemImagesById = Object.fromEntries(
  Object.entries(itemImageModules).map(([filePath, imageUrl]) => {
    const filename = filePath.split('/').pop() ?? ''
    const id = filename.replace('.png', '').toLowerCase()
    return [id, imageUrl]
  }),
)

export function getItemImage(item: Pick<Item, 'id'>): string | undefined {
  return itemImagesById[item.id.toLowerCase()]
}

import Dexie, {
  Table,
} from 'dexie'

export interface OfflineQueue {

  id?: number

  table: string

  recordId: string

  payload: any

  action: string
}

export interface CachedItem {

  id?: number

  key: string

  data: any

  updated_at: string
}

class OfflineDB
  extends Dexie {

  queue!: Table<
    OfflineQueue
  >

  cache!: Table<
    CachedItem
  >

  constructor() {

    super('OfflineDB')

    this.version(1)
      .stores({

        queue:
          '++id, table, recordId',

        cache:
          '++id, key',
      })
  }
}

export const offlineDB =
  new OfflineDB()
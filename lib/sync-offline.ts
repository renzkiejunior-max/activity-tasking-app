import {
  offlineDB,
} from './offline-db'

import {
  supabase,
} from './supabase'

export const syncOfflineData =
  async () => {

    const queue =
      await offlineDB
        .queue
        .toArray()

    for (
      const item of queue
    ) {

      try {

        if (
          item.action ===
          'update'
        ) {

          await supabase

            .from(item.table)

            .update(
              item.payload
            )

            .eq(
              'id',
              item.recordId
            )
        }

        if (
          item.action ===
          'insert'
        ) {

          await supabase

            .from(item.table)

            .insert(
              item.payload
            )
        }

        // REMOVE AFTER SUCCESS
        await offlineDB
          .queue
          .delete(item.id!)

      } catch (error) {

        console.log(
          'Sync failed:',
          error
        )
      }
    }
}
import type { Strapi5ResponseSingle, Strapi5RequestPopulateParam } from '@nuxtjs/strapi'
import type { GlobalSettings } from '~/types/strapi/global'

export const useGlobalSettings = async () => {
  const { findOne } = useStrapi()
  const res = await useAsyncData<Strapi5ResponseSingle<GlobalSettings>>('global-settings', () =>
    findOne<GlobalSettings>('global', '', {
      populate: 'favicon' as Strapi5RequestPopulateParam<GlobalSettings>,
    }),
  )

  return computed(() => res.data.value?.data)
}

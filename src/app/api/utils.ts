import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'

export const getNutInstance = async () => {
  const NUT_HOST = await getSettings('NUT_HOST')
  const NUT_PORT = await getSettings('NUT_PORT')
  const USERNAME = await getSettings('USERNAME')
  const PASSWORD = await getSettings('PASSWORD')
  return new Nut(NUT_HOST, NUT_PORT, USERNAME, PASSWORD)
}

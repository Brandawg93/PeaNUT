import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'

export const getNutInstances = async (): Promise<Array<Nut>> => {
  const NUT_SERVERS = await getSettings('NUT_SERVERS')
  return NUT_SERVERS.map((server: any) => new Nut(server.HOST, server.PORT, server.USERNAME, server.PASSWORD))
}

export const getSingleNutInstance = async (device: string): Promise<Nut | undefined> => {
  return (await getNutInstances()).find((nut) => nut.deviceExists(device))
}

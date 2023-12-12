import { NextRequest, NextResponse } from 'next/server';

import { Nut } from '@/app/connection/nut';

export async function GET(request: NextRequest, { params }: { params: any }) {
  // api/v1/devices
  if (!params) {
    const nut = new Nut(
      process.env.NUT_HOST || 'localhost',
      parseInt(process.env.NUT_PORT || '3493', 10),
      process.env.USERNAME,
      process.env.PASSWORD,
    );
    await nut.connect();
    const devices = await nut.getDevices();
    const promises = devices.map((device) => nut.getData(device));
    const data = await Promise.all(promises);
    await nut.close();
    return NextResponse.json(data);
  }

  // api/v1/devices/[device]
  const device = params.device[0];
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493', 10),
    process.env.USERNAME,
    process.env.PASSWORD,
  );
  await nut.connect();
  const devices = await nut.getDevices();
  if (!devices.includes(device)) {
    return NextResponse.json(`Device ${device} not found`, { status: 404 });
  }
  const data = await nut.getData(device);
  await nut.close();
  return NextResponse.json(data);
}

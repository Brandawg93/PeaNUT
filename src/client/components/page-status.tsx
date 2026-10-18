import { ReactNode } from 'react'
import NavBar from '@/client/components/navbar'
import { Card } from '@/client/components/ui/card'

type Props = Readonly<{
  testId: string
  controls: ReactNode
  children: ReactNode
  action: ReactNode
}>

export default function PageStatus({ testId, controls, children, action }: Props) {
  return (
    <div className='bg-background flex h-full min-h-screen flex-col' data-testid={testId}>
      <NavBar>{controls}</NavBar>
      <div className='flex flex-1 flex-col items-center justify-center'>
        <Card className='border-border-card bg-card flex flex-col items-center p-6 shadow-none'>
          <div className='flex flex-col items-center pb-2'>{children}</div>
          <div>{action}</div>
        </Card>
      </div>
    </div>
  )
}

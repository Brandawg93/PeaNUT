import React from 'react'
import { Card } from '@/client/components/ui/card'

type Props = Readonly<{
  text: string
  description: string
  onClick?: () => void
}>

export default function Kpi({ text, description, onClick }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const spanRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)

  const resize = () => {
    const container = containerRef.current
    const span = spanRef.current

    if (container && span) {
      const containerWidth = container.clientWidth
      const spanWidth = span.clientWidth
      const newScale = containerWidth / spanWidth
      setScale(Math.min(newScale, 7))
    }
  }

  React.useEffect(() => {
    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [text])

  const onClickHandler = () => {
    if (onClick) {
      onClick()
      resize()
    }
  }

  const clickableProps = onClick
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: onClickHandler,
        onKeyUp: (e: any) => {
          if (e.key === 'Enter' && onClickHandler) {
            onClickHandler()
          }
        },
      }
    : {}

  return (
    <Card
      {...clickableProps}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className='border-border-card bg-card relative flex h-52 flex-row justify-around border text-center shadow-none'
      data-testid='kpi'
    >
      <div
        style={{ width: 'calc(100% - 30px' }}
        className='motion-safe:animate-fade flex h-full flex-col justify-around pb-5 align-middle text-3xl font-semibold'
      >
        <div className='inline-block' ref={containerRef}>
          <div ref={spanRef} style={{ transform: `scale(${scale})` }} className='inline-block'>
            <span>{text}</span>
          </div>
        </div>
      </div>
      <div className='text-muted-foreground motion-safe:animate-fade absolute bottom-4.5 w-full text-xs font-semibold'>
        {description}
      </div>
    </Card>
  )
}

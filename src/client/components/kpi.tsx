import React from 'react'
import { Card } from '@/client/components/ui/card'

type Props = {
  text: string
  description: string
  onClick?: () => void
}

export default function Kpi(props: Props) {
  const { text, description, onClick } = props
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

  return (
    <Card
      onClick={onClickHandler}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className='relative flex h-52 flex-row justify-around border border-border-card bg-card text-center shadow-none'
      data-testid='kpi'
    >
      <div
        style={{ width: 'calc(100% - 30px' }}
        className='flex h-full flex-col justify-around pb-5 align-middle text-3xl font-semibold text-black motion-safe:animate-fade dark:text-white'
      >
        <div className='inline-block' ref={containerRef}>
          <div ref={spanRef} style={{ transform: `scale(${scale})` }} className='inline-block'>
            <span>{text}</span>
          </div>
        </div>
      </div>
      <div className='absolute bottom-3.5 w-full text-xs font-semibold text-muted-foreground motion-safe:animate-fade'>
        {description}
      </div>
    </Card>
  )
}

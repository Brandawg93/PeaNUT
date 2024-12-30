// ldrs.d.ts
import {} from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'l-dot-pulse': {
        size?: string | number
        color?: string | number
        speed?: string | number
      }
      'l-helix': {
        size?: string | number
        color?: string | number
        speed?: string | number
      }
    }
  }
}

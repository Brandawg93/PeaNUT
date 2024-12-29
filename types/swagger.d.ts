// swagger.d.ts
import {} from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicAttributes {
      spec?: object
    }
  }
}

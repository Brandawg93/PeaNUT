// material-tailwind.d.ts
import {} from '@material-tailwind/react'

type EventCapture = {
  onPointerEnterCapture?: unknown
  onPointerLeaveCapture?: unknown
}

declare module '@material-tailwind/react' {
  export interface ButtonProps extends EventCapture {
    placeholder?: unknown
  }
  export interface ButtonGroupProps extends EventCapture {
    placeholder?: unknown
  }
  export interface InputProps extends EventCapture {
    crossOrigin?: unknown
  }
  export interface SelectProps extends EventCapture {
    placeholder?: unknown
  }
  export interface NavbarProps extends EventCapture {
    placeholder?: unknown
  }
  export interface TypographyProps extends EventCapture {
    placeholder?: unknown
  }
  export interface IconButtonProps extends EventCapture {
    placeholder?: unknown
  }
  export interface CardProps extends EventCapture {
    placeholder?: unknown
  }
  export interface DrawerProps extends EventCapture {
    placeholder?: unknown
  }
  export interface MenuProps extends EventCapture {
    placeholder?: unknown
  }
  export interface MenuItemProps extends EventCapture {
    placeholder?: unknown
  }
  export interface MenuListProps extends EventCapture {
    placeholder?: unknown
  }
  export interface ListProps extends EventCapture {
    placeholder?: unknown
  }
  export interface ListItemProps extends EventCapture {
    placeholder?: unknown
  }
  export interface ListItemPrefixProps extends EventCapture {
    placeholder?: unknown
  }
}

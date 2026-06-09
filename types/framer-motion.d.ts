declare module 'framer-motion' {
  import type { ComponentType, CSSProperties, ReactNode } from 'react'

  type MotionComponentProps = {
    children?: ReactNode
    className?: string
    key?: string | number
    initial?: unknown
    animate?: unknown
    exit?: unknown
    transition?: unknown
    whileHover?: unknown
    style?: CSSProperties
  } & Record<string, unknown>

  export const motion: {
    div: ComponentType<MotionComponentProps>
  }

  export const AnimatePresence: ComponentType<{
    children?: ReactNode
  } & Record<string, unknown>>
}

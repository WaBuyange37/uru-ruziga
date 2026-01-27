// components/UmweroText.tsx
'use client'

import { useLanguage } from '../app/contexts/LanguageContext'
import { ReactNode } from 'react'

interface UmweroTextProps {
  children: ReactNode
  className?: string
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/**
 * Component that automatically applies Umwero font when language is 'um'
 * Usage: <UmweroText>Your text here</UmweroText>
 */
export function UmweroText({ children, className = '', as = 'span' }: UmweroTextProps) {
  const { language } = useLanguage()
  
  const umweroStyle = language === 'um' ? {
    fontFamily: "'UMWEROalpha', serif"
  } : {}
  
  const Component = as
  
  return (
    <Component 
      className={className} 
      style={umweroStyle}
    >
      {children}
    </Component>
  )
}

/**
 * HOC version for wrapping components
 */
export function withUmweroFont<P extends object>(
  Component: React.ComponentType<P>
) {
  return function UmweroFontWrapper(props: P) {
    const { language } = useLanguage()
    
    if (language === 'um') {
      return (
        <div style={{ fontFamily: "'UMWEROalpha', serif" }}>
          <Component {...props} />
        </div>
      )
    }
    
    return <Component {...props} />
  }
}
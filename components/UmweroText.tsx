// components/UmweroText.tsx
'use client'

import { useLanguage } from '../app/contexts/LanguageContext'
import { ReactNode } from 'react'

interface UmweroTextProps {
  children: ReactNode
  className?: string
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  style?: React.CSSProperties
}

interface UmweroHeadingProps {
  children: ReactNode
  className?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  style?: React.CSSProperties
}

interface UmweroParagraphProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * Component that automatically applies Umwero font when language is 'um'
 * Usage: <UmweroText>Your text here</UmweroText>
 */
export function UmweroText({ children, className = '', as = 'span', style }: UmweroTextProps) {
  const { language } = useLanguage()
  
  const umweroStyle = language === 'um' ? {
    fontFamily: "'UMWEROalpha', serif",
    ...style
  } : style
  
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
 * Heading component with Umwero font support
 * Usage: <UmweroHeading level={1}>Your heading</UmweroHeading>
 */
export function UmweroHeading({ children, className = '', level = 1, style }: UmweroHeadingProps) {
  const { language } = useLanguage()
  
  const umweroStyle = language === 'um' ? {
    fontFamily: "'UMWEROalpha', serif",
    ...style
  } : style
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Tag 
      className={className} 
      style={umweroStyle}
    >
      {children}
    </Tag>
  )
}

/**
 * Paragraph component with Umwero font support
 * Usage: <UmweroParagraph>Your paragraph text</UmweroParagraph>
 */
export function UmweroParagraph({ children, className = '', style }: UmweroParagraphProps) {
  const { language } = useLanguage()
  
  const umweroStyle = language === 'um' ? {
    fontFamily: "'UMWEROalpha', serif",
    ...style
  } : style
  
  return (
    <p 
      className={className} 
      style={umweroStyle}
    >
      {children}
    </p>
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
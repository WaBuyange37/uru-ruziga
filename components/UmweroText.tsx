// Create this file: components/UmweroText.tsx

import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

interface UmweroTextProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  tag?: keyof JSX.IntrinsicElements
}

export function UmweroText({ 
  children, 
  className = '', 
  style = {}, 
  tag: Tag = 'span' 
}: UmweroTextProps) {
  const { getLanguageStyle, isUmwero } = useTranslation()
  
  const combinedStyle = {
    ...getLanguageStyle(),
    ...style
  }
  
  return (
    <Tag 
      className={`${className} ${isUmwero ? 'umwero-font' : ''}`}
      style={combinedStyle}
    >
      {children}
    </Tag>
  )
}

// Specific components for common elements
export function UmweroHeading({ 
  children, 
  level = 1, 
  className = '', 
  style = {} 
}: {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  style?: React.CSSProperties
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  return (
    <UmweroText tag={Tag} className={className} style={style}>
      {children}
    </UmweroText>
  )
}

export function UmweroParagraph({ 
  children, 
  className = '', 
  style = {} 
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <UmweroText tag="p" className={className} style={style}>
      {children}
    </UmweroText>
  )
}

export function UmweroButton({ 
  children, 
  className = '', 
  style = {},
  ...props 
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  [key: string]: any
}) {
  return (
    <UmweroText tag="button" className={className} style={style} {...props}>
      {children}
    </UmweroText>
  )
}
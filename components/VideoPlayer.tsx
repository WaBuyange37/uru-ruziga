import React from 'react'

interface VideoPlayerProps {
  src: string
  title: string
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  return (
    <div className="w-full">
      <video
        className="w-full rounded-lg shadow-lg"
        controls
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {title && <p className="mt-2 text-center text-sm text-[#8B4513]">{title}</p>}
    </div>
  )
}


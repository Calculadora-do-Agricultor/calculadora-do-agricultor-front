

import { useState, useRef, useEffect } from "react"

export const Tooltip = ({ children, content, position = "top", delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef(null)
  const targetRef = useRef(null)
  const timerRef = useRef(null)

  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true)
      updatePosition()
    }, delay)
  }

  const hideTooltip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsVisible(false)
  }

  const updatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return

    const targetRect = targetRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    let x = 0
    let y = 0

    switch (position) {
      case "top":
        x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
        y = targetRect.top - tooltipRect.height - 8
        break
      case "bottom":
        x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
        y = targetRect.bottom + 8
        break
      case "left":
        x = targetRect.left - tooltipRect.width - 8
        y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
        break
      case "right":
        x = targetRect.right + 8
        y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
        break
    }

    // Ensure tooltip stays within viewport
    const padding = 10
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Adjust horizontal position
    if (x < padding) {
      x = padding
    } else if (x + tooltipRect.width > viewportWidth - padding) {
      x = viewportWidth - tooltipRect.width - padding
    }

    // Adjust vertical position
    if (y < padding) {
      y = padding
    } else if (y + tooltipRect.height > viewportHeight - padding) {
      y = viewportHeight - tooltipRect.height - padding
    }

    setCoords({ x, y })
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      window.addEventListener("scroll", updatePosition)
      window.addEventListener("resize", updatePosition)
    }

    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
    }
  }, [isVisible])

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm pointer-events-none whitespace-nowrap opacity-90"
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: "translateZ(0)",
            animation: "tooltipFadeIn 0.2s ease-out",
          }}
        >
          {content}
        </div>
      )}
    </>
  )
}

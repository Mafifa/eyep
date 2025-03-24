import { BrowserWindow, screen } from 'electron'
import { app } from 'electron'

interface CursorTrackerOptions {
  topWindow: BrowserWindow
  onActivity: (mouseMoved: boolean) => void
}

export function startCursorTracking(options: CursorTrackerOptions): void {
  const { topWindow, onActivity } = options

  if (!topWindow) {
    console.error('Error: topWindow no está definida')
    return
  }

  let lastMousePos = { x: 0, y: 0 }

  const checkInterval = setInterval(() => {
    try {
      const mousePos = screen.getCursorScreenPoint()
      const mouseMoved = mousePos.x !== lastMousePos.x || mousePos.y !== lastMousePos.y

      if (mouseMoved) {
        lastMousePos = mousePos
        const windowBounds = topWindow.getBounds()
        const relativePos = {
          x: mousePos.x - windowBounds.x,
          y: mousePos.y - windowBounds.y,
          isInWindow:
            mousePos.x >= windowBounds.x &&
            mousePos.x <= windowBounds.x + windowBounds.width &&
            mousePos.y >= windowBounds.y &&
            mousePos.y <= windowBounds.y + windowBounds.height,
          globalX: mousePos.x,
          globalY: mousePos.y
        }
        topWindow.webContents.send('cursor-position', relativePos)
      }

      onActivity?.(mouseMoved) // Llamada segura
    } catch (error) {
      console.error('Cursor tracking error:', error)
    }
  }, 100)

  app.on('before-quit', () => clearInterval(checkInterval))
}

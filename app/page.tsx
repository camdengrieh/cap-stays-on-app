"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Upload, Download, RotateCcw, Move, Plus, Trash2, Copy } from "lucide-react"

interface Cap {
  id: string
  position: { x: number; y: number }
  size: number
  rotation: number
  flipX: boolean
  flipY: boolean
}

export default function CapStaysOn() {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const [capImage, setCapImage] = useState<HTMLImageElement | null>(null)
  const [caps, setCaps] = useState<Cap[]>([
    {
      id: "cap-1",
      position: { x: 50, y: 30 },
      size: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
    },
  ])
  const [selectedCapId, setSelectedCapId] = useState("cap-1")
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedCap = caps.find((cap) => cap.id === selectedCapId) || caps[0]

  // Load the cap image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setCapImage(img)
    img.src = "/cap.png"
  }, [])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => setUploadedImage(img)
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const drawCanvas = useCallback(
    (showSelection = true) => {
      const canvas = canvasRef.current
      if (!canvas || !uploadedImage || !capImage) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas size to match uploaded image
      canvas.width = uploadedImage.width
      canvas.height = uploadedImage.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw uploaded image
      ctx.drawImage(uploadedImage, 0, 0)

      // Draw all caps
      caps.forEach((cap) => {
        const capWidth = (canvas.width * cap.size) / 100
        const capHeight = (capImage.height * capWidth) / capImage.width
        const x = (canvas.width * cap.position.x) / 100 - capWidth / 2
        const y = (canvas.height * cap.position.y) / 100 - capHeight / 2

        // Save context for rotation and flipping
        ctx.save()
        ctx.translate(x + capWidth / 2, y + capHeight / 2)
        ctx.rotate((cap.rotation * Math.PI) / 180)
        ctx.scale(cap.flipX ? -1 : 1, cap.flipY ? -1 : 1)
        ctx.translate(-capWidth / 2, -capHeight / 2)

        // Draw cap
        ctx.drawImage(capImage, 0, 0, capWidth, capHeight)

        // Draw selection border for selected cap only if showSelection is true
        if (showSelection && cap.id === selectedCapId) {
          ctx.strokeStyle = "#0d9488"
          ctx.lineWidth = 3
          ctx.setLineDash([5, 5])
          ctx.strokeRect(-2, -2, capWidth + 4, capHeight + 4)
          ctx.setLineDash([])
        }

        // Restore context
        ctx.restore()
      })
    },
    [uploadedImage, capImage, caps, selectedCapId],
  )

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const getCapAtPosition = (mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current
    if (!canvas || !capImage) return null

    // Check caps in reverse order (top to bottom)
    for (let i = caps.length - 1; i >= 0; i--) {
      const cap = caps[i]
      const capWidth = (canvas.width * cap.size) / 100
      const capHeight = (capImage.height * capWidth) / capImage.width
      const capX = (canvas.width * cap.position.x) / 100 - capWidth / 2
      const capY = (canvas.height * cap.position.y) / 100 - capHeight / 2

      if (mouseX >= capX && mouseX <= capX + capWidth && mouseY >= capY && mouseY <= capY + capHeight) {
        return cap
      }
    }
    return null
  }

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const mouseX = (event.clientX - rect.left) * scaleX
    const mouseY = (event.clientY - rect.top) * scaleY

    const clickedCap = getCapAtPosition(mouseX, mouseY)
    if (clickedCap) {
      setSelectedCapId(clickedCap.id)
      setIsDragging(true)
      setDragOffset({
        x: mouseX - (canvas.width * clickedCap.position.x) / 100,
        y: mouseY - (canvas.height * clickedCap.position.y) / 100,
      })
    }
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const mouseX = (event.clientX - rect.left) * scaleX
    const mouseY = (event.clientY - rect.top) * scaleY

    setCaps((prevCaps) =>
      prevCaps.map((cap) =>
        cap.id === selectedCapId
          ? {
              ...cap,
              position: {
                x: Math.max(0, Math.min(100, ((mouseX - dragOffset.x) / canvas.width) * 100)),
                y: Math.max(0, Math.min(100, ((mouseY - dragOffset.y) / canvas.height) * 100)),
              },
            }
          : cap,
      ),
    )
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const updateSelectedCap = (updates: Partial<Cap>) => {
    setCaps((prevCaps) => prevCaps.map((cap) => (cap.id === selectedCapId ? { ...cap, ...updates } : cap)))
  }

  const addCap = () => {
    const newCap: Cap = {
      id: `cap-${Date.now()}`,
      position: { x: 50, y: 50 },
      size: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
    }
    setCaps((prevCaps) => [...prevCaps, newCap])
    setSelectedCapId(newCap.id)
  }

  const duplicateCap = () => {
    if (!selectedCap) return
    const newCap: Cap = {
      ...selectedCap,
      id: `cap-${Date.now()}`,
      position: {
        x: Math.min(90, selectedCap.position.x + 10),
        y: Math.min(90, selectedCap.position.y + 10),
      },
    }
    setCaps((prevCaps) => [...prevCaps, newCap])
    setSelectedCapId(newCap.id)
  }

  const deleteCap = () => {
    if (caps.length <= 1) return
    setCaps((prevCaps) => prevCaps.filter((cap) => cap.id !== selectedCapId))
    setSelectedCapId(caps.find((cap) => cap.id !== selectedCapId)?.id || caps[0].id)
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Draw canvas without selection borders for download
    drawCanvas(false)

    const link = document.createElement("a")
    link.download = "cap-stays-on.png"
    link.href = canvas.toDataURL()
    link.click()

    // Redraw with selection borders for UI
    drawCanvas(true)
  }

  const resetSelectedCap = () => {
    updateSelectedCap({
      position: { x: 50, y: 30 },
      size: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-800 mb-2">Cap Stays On</h1>
          <p className="text-teal-600">Add the iconic teal cap to any image</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-teal-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                <p className="text-teal-600 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </CardContent>
          </Card>

          {/* Controls Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Move className="w-5 h-5" />
                Cap Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cap Management */}
              <div>
                <label className="text-sm font-medium mb-2 block">Caps ({caps.length})</label>
                <div className="flex gap-2 mb-3">
                  <Button onClick={addCap} size="sm" className="flex-1">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button onClick={duplicateCap} size="sm" variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    onClick={deleteCap}
                    size="sm"
                    variant="outline"
                    disabled={caps.length <= 1}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {caps.map((cap, index) => (
                    <Button
                      key={cap.id}
                      onClick={() => setSelectedCapId(cap.id)}
                      variant={cap.id === selectedCapId ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      Cap {index + 1}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedCap && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Size</label>
                    <Slider
                      value={[selectedCap.size]}
                      onValueChange={(value) => updateSelectedCap({ size: value[0] })}
                      max={80}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">{selectedCap.size}%</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rotation</label>
                    <Slider
                      value={[selectedCap.rotation]}
                      onValueChange={(value) => updateSelectedCap({ rotation: value[0] })}
                      max={180}
                      min={-180}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">{selectedCap.rotation}°</div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Flip Horizontal</label>
                      <Button
                        onClick={() => updateSelectedCap({ flipX: !selectedCap.flipX })}
                        variant={selectedCap.flipX ? "default" : "outline"}
                        className="w-full"
                      >
                        {selectedCap.flipX ? "Flipped" : "Normal"}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Flip Vertical</label>
                      <Button
                        onClick={() => updateSelectedCap({ flipY: !selectedCap.flipY })}
                        variant={selectedCap.flipY ? "default" : "outline"}
                        className="w-full"
                      >
                        {selectedCap.flipY ? "Flipped" : "Normal"}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button onClick={resetSelectedCap} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={downloadImage}
                  disabled={!uploadedImage}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Section */}
        {uploadedImage && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <p className="text-sm text-gray-600">
                Click on any cap to select it, then drag to reposition. Selected cap has a dashed border.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-96 border border-gray-200 rounded-lg cursor-move"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {!uploadedImage && (
          <Card className="mt-6">
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload an image to get started</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-teal-200">
          <div className="text-center">
            <p className="text-teal-600">
              Created by{" "}
              <a
                href="https://x.com/camdenincrypto"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-teal-800 transition-colors underline"
              >
                Camden
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

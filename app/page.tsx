"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Upload, Download, RotateCcw, Move } from "lucide-react"

export default function CapStaysOn() {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const [capImage, setCapImage] = useState<HTMLImageElement | null>(null)
  const [capPosition, setCapPosition] = useState({ x: 50, y: 30 })
  const [capSize, setCapSize] = useState([40])
  const [capRotation, setCapRotation] = useState([0])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [capFlipX, setCapFlipX] = useState(false)
  const [capFlipY, setCapFlipY] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const drawCanvas = useCallback(() => {
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

    // Calculate cap dimensions and position
    const capWidth = (canvas.width * capSize[0]) / 100
    const capHeight = (capImage.height * capWidth) / capImage.width
    const x = (canvas.width * capPosition.x) / 100 - capWidth / 2
    const y = (canvas.height * capPosition.y) / 100 - capHeight / 2

    // Save context for rotation and flipping
    ctx.save()
    ctx.translate(x + capWidth / 2, y + capHeight / 2)
    ctx.rotate((capRotation[0] * Math.PI) / 180)
    ctx.scale(capFlipX ? -1 : 1, capFlipY ? -1 : 1)
    ctx.translate(-capWidth / 2, -capHeight / 2)

    // Draw cap
    ctx.drawImage(capImage, 0, 0, capWidth, capHeight)

    // Restore context
    ctx.restore()
  }, [uploadedImage, capImage, capPosition, capSize, capRotation, capFlipX, capFlipY])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const mouseX = (event.clientX - rect.left) * scaleX
    const mouseY = (event.clientY - rect.top) * scaleY

    // Check if click is on the cap
    const capWidth = (canvas.width * capSize[0]) / 100
    const capHeight = capImage ? (capImage.height * capWidth) / capImage.width : 0
    const capX = (canvas.width * capPosition.x) / 100 - capWidth / 2
    const capY = (canvas.height * capPosition.y) / 100 - capHeight / 2

    if (mouseX >= capX && mouseX <= capX + capWidth && mouseY >= capY && mouseY <= capY + capHeight) {
      setIsDragging(true)
      setDragOffset({
        x: mouseX - (canvas.width * capPosition.x) / 100,
        y: mouseY - (canvas.height * capPosition.y) / 100,
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

    setCapPosition({
      x: Math.max(0, Math.min(100, ((mouseX - dragOffset.x) / canvas.width) * 100)),
      y: Math.max(0, Math.min(100, ((mouseY - dragOffset.y) / canvas.height) * 100)),
    })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "cap-stays-on.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  const resetPosition = () => {
    setCapPosition({ x: 50, y: 30 })
    setCapSize([40])
    setCapRotation([0])
    setCapFlipX(false)
    setCapFlipY(false)
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
              <div>
                <label className="text-sm font-medium mb-2 block">Size</label>
                <Slider value={capSize} onValueChange={setCapSize} max={80} min={10} step={1} className="w-full" />
                <div className="text-xs text-gray-500 mt-1">{capSize[0]}%</div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rotation</label>
                <Slider
                  value={capRotation}
                  onValueChange={setCapRotation}
                  max={180}
                  min={-180}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">{capRotation[0]}°</div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Flip Horizontal</label>
                  <Button
                    onClick={() => setCapFlipX(!capFlipX)}
                    variant={capFlipX ? "default" : "outline"}
                    className="w-full"
                  >
                    {capFlipX ? "Flipped" : "Normal"}
                  </Button>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Flip Vertical</label>
                  <Button
                    onClick={() => setCapFlipY(!capFlipY)}
                    variant={capFlipY ? "default" : "outline"}
                    className="w-full"
                  >
                    {capFlipY ? "Flipped" : "Normal"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={resetPosition} variant="outline" className="flex-1">
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
              <p className="text-sm text-gray-600">Drag the cap to reposition it</p>
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
      </div>
    </div>
  )
}

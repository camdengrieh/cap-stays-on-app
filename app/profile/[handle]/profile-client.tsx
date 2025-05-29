"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Share2, Calendar, Grid, List } from "lucide-react"
import { toggleLike, type UserProfile } from "../../actions"

interface ProfileClientProps {
  userProfile: UserProfile
}

export default function ProfileClient({ userProfile }: ProfileClientProps) {
  const [images, setImages] = useState(userProfile.images)
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleLike = async (imageId: string) => {
    // Optimistic update
    const newLikedImages = new Set(likedImages)
    if (likedImages.has(imageId)) {
      newLikedImages.delete(imageId)
    } else {
      newLikedImages.add(imageId)
    }
    setLikedImages(newLikedImages)

    // Update the images optimistically
    setImages((prev) =>
      prev.map((image) =>
        image.id === imageId ? { ...image, likes: (image.likes || 0) + (likedImages.has(imageId) ? -1 : 1) } : image,
      ),
    )

    // Call server action
    try {
      await toggleLike(imageId)
    } catch (error) {
      // Revert on error
      setLikedImages(likedImages)
      setImages(userProfile.images)
      console.error("Error toggling like:", error)
    }
  }

  const shareImage = (imageUrl: string) => {
    try {
      const text = `Check out this awesome cap creation by @${userProfile.handle}! 🧢 #capstayson`
      const url = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}/feed` : "/feed"
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

      try {
        const newWindow = window.open(twitterUrl, "_blank", "noopener,noreferrer")
        if (!newWindow) {
          alert("Twitter sharing popup was blocked. Please allow popups or use the link: " + twitterUrl)
        }
      } catch (e) {
        alert("Could not open Twitter. Please try again or copy this URL: " + twitterUrl)
      }
    } catch (error) {
      console.error("Error sharing to Twitter:", error)
      alert("There was an error sharing to Twitter. Please try again.")
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {images.length} creation{images.length !== 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt="Cap creation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(image.timestamp)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {image.caps} cap{image.caps !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(image.id)}
                      className={`p-1 h-auto ${
                        likedImages.has(image.id)
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${likedImages.has(image.id) ? "fill-current" : ""}`} />
                      {image.likes || 0}
                    </Button>

                    <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-500 hover:text-blue-500">
                      <MessageCircle className="w-4 h-4 mr-1" />0
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareImage(image.url)}
                    className="p-1 h-auto text-gray-500 hover:text-blue-500"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 bg-gray-100">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt="Cap creation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(image.timestamp)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {image.caps} cap{image.caps !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(image.id)}
                          className={`${
                            likedImages.has(image.id)
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-500 hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${likedImages.has(image.id) ? "fill-current" : ""}`} />
                          {image.likes || 0}
                        </Button>

                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Comment
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareImage(image.url)}
                        className="text-gray-500 hover:text-blue-500"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Tweet
                      </Button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-teal-600 font-medium">#capstayson</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

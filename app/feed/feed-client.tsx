"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Share2, Calendar } from "lucide-react"
import { toggleLike, type FeedImage } from "../actions"
import Link from "next/link"

interface FeedClientProps {
  initialImages: FeedImage[]
}

export default function FeedClient({ initialImages }: FeedClientProps) {
  const [feedImages, setFeedImages] = useState<FeedImage[]>(initialImages)
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set())

  const handleLike = async (imageId: string) => {
    // Optimistic update
    const newLikedImages = new Set(likedImages)
    if (likedImages.has(imageId)) {
      newLikedImages.delete(imageId)
    } else {
      newLikedImages.add(imageId)
    }
    setLikedImages(newLikedImages)

    // Update the feed images optimistically
    setFeedImages((prev) =>
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
      setFeedImages(initialImages)
      console.error("Error toggling like:", error)
    }
  }

  const shareImage = (imageUrl: string) => {
    try {
      const text = "#CapStaysOn - capstayson.fun"
      const url = "https://capstayson.fun"
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
      {feedImages.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🧢</span>
                </div>
                <div>
                  {image.twitterHandle ? (
                    <Link
                      href={`/profile/${image.twitterHandle}`}
                      className="font-semibold text-sm hover:text-teal-600 transition-colors"
                    >
                      @{image.twitterHandle}
                    </Link>
                  ) : (
                    <p className="font-semibold text-sm">Anonymous Creator</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(image.timestamp)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {image.caps} cap{image.caps !== 1 ? "s" : ""}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Image */}
            <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={image.url || "/placeholder.svg"}
                alt="Cap creation"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(image.id)}
                  className={`${
                    likedImages.has(image.id) ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
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

            {/* Hashtag */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-teal-600 font-medium">#capstayson</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

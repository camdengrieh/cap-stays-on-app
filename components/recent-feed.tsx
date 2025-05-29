import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Heart, Calendar } from "lucide-react"
import Link from "next/link"
import { getRecentFeedImages } from "../app/actions"

export default async function RecentFeed() {
  const recentImages = await getRecentFeedImages(6)

  if (recentImages.length === 0) {
    return null
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Community Creations
          </CardTitle>
          <Link href="/feed">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recentImages.map((image) => (
            <div key={image.id} className="group cursor-pointer">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt="Cap creation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(image.timestamp)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {image.likes || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {image.twitterHandle ? (
                    <Link
                      href={`/profile/${image.twitterHandle}`}
                      className="text-xs font-medium hover:text-teal-600 transition-colors"
                    >
                      @{image.twitterHandle}
                    </Link>
                  ) : (
                    <span className="text-xs font-medium">Anonymous</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {image.caps} cap{image.caps !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Join the community and share your cap creations!</p>
          <Link href="/feed">
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Explore Community Feed
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

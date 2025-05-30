import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Calendar, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { getPostById, getFeedImages } from "../../actions"
import PostClient from "./post-client"
import { notFound } from "next/navigation"

interface PostPageProps {
  params: {
    id: string
  }
}

export async function generateStaticParams() {
  const images = await getFeedImages()
  return images.map((image) => ({
    id: image.id,
  }))
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await getPostById(params.id)

  if (!post) {
    return {
      title: "Post Not Found - Cap Stays On",
      description: "This post could not be found.",
    }
  }

  const author = post.twitterHandle ? `@${post.twitterHandle}` : "Anonymous Creator"
  const commentCount = post.comments?.length || 0

  return {
    title: `${author}'s Cap Creation - Cap Stays On`,
    description: `Check out this cap creation by ${author}! ${post.caps} caps with ${post.likes || 0} likes and ${commentCount} comments.`,
    openGraph: {
      title: `${author}'s Cap Creation - Cap Stays On`,
      description: `${post.caps} caps with ${post.likes || 0} likes and ${commentCount} comments`,
      images: [post.url],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author}'s Cap Creation - Cap Stays On`,
      description: `${post.caps} caps with ${post.likes || 0} likes and ${commentCount} comments`,
      images: [post.url],
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostById(params.id)

  if (!post) {
    notFound()
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/feed">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </Link>
        </div>

        {/* Post Content */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">🧢</span>
                </div>
                <div>
                  {post.twitterHandle ? (
                    <Link
                      href={`/profile/${post.twitterHandle}`}
                      className="font-semibold text-lg hover:text-teal-600 transition-colors"
                    >
                      @{post.twitterHandle}
                    </Link>
                  ) : (
                    <h2 className="font-semibold text-lg">Anonymous Creator</h2>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.timestamp)}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {post.caps} cap{post.caps !== 1 ? "s" : ""}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Image */}
            <div className="relative mb-6 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={post.url || "/placeholder.svg"}
                alt="Cap creation"
                className="w-full h-auto max-h-[600px] object-contain mx-auto"
              />
            </div>

            {/* Post Stats and Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">{post.likes || 0} likes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{post.comments?.length || 0} comments</span>
                </div>
              </div>
              <div className="text-sm text-teal-600 font-medium">#capstayson</div>
            </div>
          </CardContent>
        </Card>

        {/* Comments and Interactions */}
        <PostClient post={post} />

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

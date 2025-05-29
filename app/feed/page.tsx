import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Hash } from "lucide-react"
import Link from "next/link"
import { getFeedImages } from "../actions"
import FeedClient from "./feed-client"

export default async function Feed() {
  const feedImages = await getFeedImages()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-teal-800">#CapStaysOn Feed</h1>
              <p className="text-teal-600">Community cap creations</p>
            </div>
          </div>
        </div>

        {/* Feed Instructions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Hash className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-teal-800">How to join the feed</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Create your cap masterpiece in the editor</p>
              <p>2. Click "Upload to Feed" to add it here</p>
              <p>
                3. Tweet your creation with <span className="font-mono bg-teal-100 px-1 rounded">#capstayson</span> to
                share with the world!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feed Content */}
        {feedImages.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Hash className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No caps in the feed yet!</h3>
                <p className="mb-4">Be the first to upload your cap creation.</p>
                <Link href="/">
                  <Button className="bg-teal-600 hover:bg-teal-700">Create Your First Cap</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <FeedClient initialImages={feedImages} />
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

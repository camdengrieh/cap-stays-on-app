import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ImageOff } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
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

        {/* Not Found Content */}
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <ImageOff className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                This cap creation doesn't exist or may have been removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/feed">
                  <Button className="bg-teal-600 hover:bg-teal-700">Browse Community Feed</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Create Your Own Cap</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

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

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Haberler - Voice of Eagle",
  description: "Latest news and updates",
}

export default function HaberlerPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Haberler</h1>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Haberler Yakında</h3>
              <p className="text-gray-500">
                En son haberler ve güncellemeler burada görünecek.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

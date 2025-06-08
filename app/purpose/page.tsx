import { MessageSquare, TrendingUp, Users, Target, Vote, BarChart3 } from "lucide-react";

export default function PurposePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Voice of Eagle</h1>
          <p className="text-xl text-gray-600">
            Empowering the community to track transfer rumours and share collective wisdom
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Our Mission</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Voice of Eagle was created to centralize transfer rumours, news, and opinions in one place. 
              We believe that the collective intelligence of passionate fans can provide valuable insights 
              into the transfer market and help everyone stay informed about potential player movements.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By bringing together rumours from various sources and allowing the community to vote and 
              prioritize them, we create a democratic platform where the most credible and important 
              transfer news rises to the top.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Vote className="h-5 w-5" />
              <h3 className="text-xl font-bold">Community Voting</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Every rumour can be voted on by the community using two systems:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Community Vote</span>
                <span className="text-sm text-gray-600">Upvote or downvote based on credibility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Priority Vote</span>
                <span className="text-sm text-gray-600">Rate importance as High, Medium, or Low</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5" />
              <h3 className="text-xl font-bold">Smart Scoring</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Our algorithm combines community feedback to generate:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Community approval percentages</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Priority level calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Overall rumour rankings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6" />
            <h2 className="text-2xl font-bold">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Submit Rumours</h4>
              <p className="text-sm text-gray-600">Community members and admins share transfer rumours from reliable sources</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Vote className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Vote & Prioritize</h4>
              <p className="text-sm text-gray-600">Users vote on credibility and set priority levels for each rumour</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Track Trends</h4>
              <p className="text-sm text-gray-600">Watch as community consensus shapes the most important transfer news</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-2">Join the Community</h3>
          <p className="text-blue-700">
            Your voice matters! Help us build the most comprehensive and reliable transfer rumour platform 
            by participating in our voting system and sharing your insights.
          </p>
        </div>
      </div>
    </div>
  );
}

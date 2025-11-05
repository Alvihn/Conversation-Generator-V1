"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Heart, RefreshCw, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const moods = [
  { value: "happy", label: "Happy & Cheerful", emoji: "😊" },
  { value: "serious", label: "Serious & Deep", emoji: "🤔" },
  { value: "funny", label: "Funny & Playful", emoji: "😄" },
  { value: "romantic", label: "Romantic", emoji: "💕" },
  { value: "curious", label: "Curious & Inquisitive", emoji: "🧐" },
  { value: "nostalgic", label: "Nostalgic", emoji: "🕰️" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
  { value: "casual", label: "Casual & Relaxed", emoji: "😌" }
]

const topics = [
  { value: "hobbies", label: "Hobbies & Interests", emoji: "🎨" },
  { value: "travel", label: "Travel & Adventure", emoji: "✈️" },
  { value: "food", label: "Food & Cooking", emoji: "🍕" },
  { value: "work", label: "Work & Career", emoji: "💼" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "movies", label: "Movies & Entertainment", emoji: "🎬" },
  { value: "music", label: "Music", emoji: "🎵" },
  { value: "books", label: "Books & Literature", emoji: "📚" },
  { value: "technology", label: "Technology", emoji: "💻" },
  { value: "sports", label: "Sports & Fitness", emoji: "⚽" },
  { value: "nature", label: "Nature & Environment", emoji: "🌿" },
  { value: "future", label: "Future & Dreams", emoji: "🔮" }
]

const conversationTypes = [
  { value: "icebreaker", label: "Ice Breaker", description: "Great for meeting new people" },
  { value: "deep", label: "Deep Question", description: "Meaningful conversations" },
  { value: "fun", label: "Fun Fact", description: "Interesting tidbits to share" },
  { value: "story", label: "Story Prompt", description: "Share personal experiences" },
  { value: "opinion", label: "Opinion Seeker", description: "Get their perspective" },
  { value: "hypothetical", label: "Hypothetical", description: "Imaginative scenarios" }
]

interface ConversationPrompt {
  id: string
  prompt: string
  mood: string
  topic: string
  type: string
  isFavorite: boolean
}

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [generatedPrompt, setGeneratedPrompt] = useState<ConversationPrompt | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [favorites, setFavorites] = useState<ConversationPrompt[]>([])
  const { toast } = useToast()

  const generateConversation = async () => {
    if (!selectedMood || !selectedTopic || !selectedType) {
      toast({
        title: "Missing selections",
        description: "Please select a mood, topic, and conversation type.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: selectedMood,
          topic: selectedTopic,
          type: selectedType
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate conversation")
      }

      const data = await response.json()
      const newPrompt: ConversationPrompt = {
        id: Date.now().toString(),
        prompt: data.prompt,
        mood: selectedMood,
        topic: selectedTopic,
        type: selectedType,
        isFavorite: false
      }
      setGeneratedPrompt(newPrompt)
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate conversation prompt. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleFavorite = (prompt: ConversationPrompt) => {
    if (prompt.isFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== prompt.id))
      if (generatedPrompt?.id === prompt.id) {
        setGeneratedPrompt({ ...generatedPrompt, isFavorite: false })
      }
    } else {
      const favoritePrompt = { ...prompt, isFavorite: true }
      setFavorites([...favorites, favoritePrompt])
      if (generatedPrompt?.id === prompt.id) {
        setGeneratedPrompt({ ...generatedPrompt, isFavorite: true })
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Conversation prompt copied to clipboard."
    })
  }

  const getMoodEmoji = (mood: string) => {
    return moods.find(m => m.value === mood)?.emoji || "💬"
  }

  const getTopicEmoji = (topic: string) => {
    return topics.find(t => t.value === topic)?.emoji || "🎯"
  }

  const getTypeLabel = (type: string) => {
    return conversationTypes.find(t => t.value === type)?.label || type
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-4 sm:pt-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Conversation Generator
            </h1>
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600" />
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Never run out of things to say! Generate engaging conversation starters tailored to any mood, topic, or situation.
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Generate</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            {/* Selection Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Mood Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">😊</span>
                    Choose Mood
                  </CardTitle>
                  <CardDescription>
                    How do you want the conversation to feel?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((mood) => (
                        <SelectItem key={mood.value} value={mood.value}>
                          <div className="flex items-center gap-2">
                            <span>{mood.emoji}</span>
                            {mood.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Topic Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Choose Topic
                  </CardTitle>
                  <CardDescription>
                    What do you want to talk about?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.value} value={topic.value}>
                          <div className="flex items-center gap-2">
                            <span>{topic.emoji}</span>
                            {topic.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    Conversation Type
                  </CardTitle>
                  <CardDescription>
                    What kind of conversation starter?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {conversationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center px-4">
              <Button 
                onClick={generateConversation} 
                disabled={isGenerating || !selectedMood || !selectedTopic || !selectedType}
                size="lg"
                className="px-6 sm:px-8 py-3 text-lg w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Conversation
                  </>
                )}
              </Button>
            </div>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMoodEmoji(generatedPrompt.mood)}</span>
                      <div>
                        <CardTitle>Your Conversation Starter</CardTitle>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs sm:text-sm">
                            {getMoodEmoji(generatedPrompt.mood)} {moods.find(m => m.value === generatedPrompt.mood)?.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs sm:text-sm">
                            {getTopicEmoji(generatedPrompt.topic)} {topics.find(t => t.value === generatedPrompt.topic)?.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs sm:text-sm">
                            {getTypeLabel(generatedPrompt.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.prompt)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorite(generatedPrompt)}
                      >
                        <Heart className={`h-4 w-4 ${generatedPrompt.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {generatedPrompt.prompt}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Generate some conversation starters and save your favorites here!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="border-2 border-pink-200 dark:border-pink-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getMoodEmoji(favorite.mood)}</span>
                          <div>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              <Badge variant="secondary" className="text-xs sm:text-sm">
                                {getMoodEmoji(favorite.mood)} {moods.find(m => m.value === favorite.mood)?.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs sm:text-sm">
                                {getTopicEmoji(favorite.topic)} {topics.find(t => t.value === favorite.topic)?.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs sm:text-sm">
                                {getTypeLabel(favorite.type)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(favorite.prompt)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFavorite(favorite)}
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300">
                        {favorite.prompt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
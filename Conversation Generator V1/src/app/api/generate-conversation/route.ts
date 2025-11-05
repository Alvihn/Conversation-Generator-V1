import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface GenerateRequest {
  mood: string
  topic: string
  type: string
}

const moodDescriptions = {
  happy: "happy, cheerful, and upbeat",
  serious: "serious, thoughtful, and deep",
  funny: "funny, playful, and humorous",
  romantic: "romantic, sweet, and affectionate",
  curious: "curious, inquisitive, and interested",
  nostalgic: "nostalgic, reminiscent, and sentimental",
  inspirational: "inspirational, motivational, and uplifting",
  casual: "casual, relaxed, and easygoing"
}

const topicDescriptions = {
  hobbies: "hobbies, interests, and personal passions",
  travel: "travel, adventure, and exploring new places",
  food: "food, cooking, and culinary experiences",
  work: "work, career, and professional life",
  relationships: "relationships, friendships, and social connections",
  movies: "movies, entertainment, and film",
  music: "music, songs, and musical experiences",
  books: "books, literature, and reading",
  technology: "technology, gadgets, and digital innovations",
  sports: "sports, fitness, and athletic activities",
  nature: "nature, environment, and outdoor activities",
  future: "future, dreams, and aspirations"
}

const typeInstructions = {
  icebreaker: "Create a simple, friendly icebreaker question that helps people get to know each other. Make it easy to answer and not too personal.",
  deep: "Create a thoughtful, deep question that encourages meaningful conversation and reflection. Make it philosophical or insightful.",
  fun: "Create an interesting fun fact or trivia question that's entertaining and engaging. Make it surprising or amusing.",
  story: "Create a prompt that encourages sharing personal stories or experiences. Make it open-ended and inviting.",
  opinion: "Create a question that asks for someone's opinion or perspective on a topic. Make it balanced and open to different viewpoints.",
  hypothetical: "Create a hypothetical scenario or 'what if' question that sparks imagination and creative thinking."
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { mood, topic, type } = body

    if (!mood || !topic || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: mood, topic, and type are required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are a conversation starter expert. Your task is to generate engaging, natural conversation prompts that help people avoid awkward silences and connect with others.

Generate a conversation prompt with the following characteristics:
- Mood: ${moodDescriptions[mood as keyof typeof moodDescriptions] || mood}
- Topic: ${topicDescriptions[topic as keyof typeof topicDescriptions] || topic}
- Type: ${typeInstructions[type as keyof typeof typeInstructions] || type}

Important guidelines:
1. Make it sound natural and conversational, not robotic or scripted
2. Keep it concise (1-2 sentences maximum)
3. Make it easy for anyone to answer
4. Avoid controversial or overly personal topics
5. Ensure it's appropriate for most social situations
6. Make it engaging and thought-provoking
7. Return ONLY the conversation prompt text, no additional explanations or formatting

The prompt should feel like something a real person would naturally say in a conversation.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate a ${mood} conversation starter about ${topic} that works as a ${type}.`
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    })

    const prompt = completion.choices[0]?.message?.content?.trim()

    if (!prompt) {
      throw new Error('Failed to generate conversation prompt')
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error generating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to generate conversation prompt' },
      { status: 500 }
    )
  }
}
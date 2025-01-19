import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { title, content, authorId } = req.body

    const client = await clientPromise
    const db = client.db('uruziga')

    const newPost = {
      title,
      content,
      author: new ObjectId(authorId),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('posts').insertOne(newPost)

    res.status(201).json({ message: 'Post created successfully', postId: result.insertedId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}


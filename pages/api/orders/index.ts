import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'

// Helper function to verify JWT token
function verifyToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies.token
  
  if (!token) throw new Error('No token provided')
  
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId } = verifyToken(req)
      const { items, total, shippingAddress, paymentMethod } = req.body

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order items are required' })
      }

      if (!total || total <= 0) {
        return res.status(400).json({ message: 'Valid total amount is required' })
      }

      // Create order with items
      const order = await prisma.order.create({
        data: {
          userId,
          total: parseFloat(total),
          status: 'PENDING',
          shippingAddress,
          paymentMethod,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price)
            }))
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      })

      res.status(201).json({ 
        message: 'Order created successfully', 
        order: {
          id: order.id,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items
        }
      })
    } catch (error) {
      console.error('Error creating order:', error)
      if (error.message === 'No token provided') {
        res.status(401).json({ message: 'Authentication required' })
      } else {
        res.status(500).json({ message: 'Error creating order' })
      }
    }
  } else if (req.method === 'GET') {
    try {
      const { userId } = verifyToken(req)

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      res.status(200).json({ orders })
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (error.message === 'No token provided') {
        res.status(401).json({ message: 'Authentication required' })
      } else {
        res.status(500).json({ message: 'Error fetching orders' })
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
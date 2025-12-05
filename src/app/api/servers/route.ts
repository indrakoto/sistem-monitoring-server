import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/servers - Get all servers
export async function GET(request: NextRequest) {
  try {
    // Check authorization (optional untuk sekarang)
    const authToken = request.headers.get('Authorization')
    
    const servers = await prisma.server.findMany({
      select: {
        id: true,
        name: true,
        url_api: true,
        createdAt: true
      },
      orderBy: {
        id: 'asc'
      }
    })
    
    return NextResponse.json(servers)
    
  } catch (error) {
    console.error('Error fetching servers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    )
  }
}

// POST /api/servers - Create new server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url_api } = body
    
    if (!name || !url_api) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      )
    }
    
    const server = await prisma.server.create({
      data: {
        name,
        url_api
      }
    })
    
    // PASTIKAN status 201 (Created)
    return NextResponse.json(server, { status: 201 })
    
  } catch (error) {
    console.error('Error creating server:', error)
    return NextResponse.json(
      { error: 'Failed to create server' },
      { status: 500 }
    )
  }
}
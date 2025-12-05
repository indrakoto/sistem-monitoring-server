import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/servers/[id] - Get single server
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const serverId = parseInt(id)
    
    if (isNaN(serverId)) {
      return NextResponse.json(
        { error: 'Invalid server ID' },
        { status: 400 }
      )
    }
    
    const server = await prisma.server.findUnique({
      where: { id: serverId }
    })
    
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(server)
    
  } catch (error) {
    console.error('Error fetching server:', error)
    return NextResponse.json(
      { error: 'Failed to fetch server' },
      { status: 500 }
    )
  }
}

// DELETE /api/servers/[id] - Delete server
// Next.js 13+ butuh ini untuk extract params
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Tunggu params selesai
    const { id } = await context.params
    const serverId = parseInt(id)
    
    if (isNaN(serverId)) {
      return NextResponse.json(
        { error: 'Invalid server ID' },
        { status: 400 }
      )
    }
    
    // Cek jika server ada
    const existingServer = await prisma.server.findUnique({
      where: { id: serverId }
    })
    
    if (!existingServer) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }
    
    // Hapus server
    await prisma.server.delete({
      where: { id: serverId }
    })
    
    return NextResponse.json(
      { message: 'Server deleted successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error deleting server:', error)
    return NextResponse.json(
      { error: 'Failed to delete server' },
      { status: 500 }
    )
  }
}
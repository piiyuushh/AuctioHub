import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { User } from '@/lib/models'

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { session: null, user: null }
  }

  const dbUser = await User.findOne({ email: session.user.email.toLowerCase() })
  if (!dbUser) {
    return { session, user: null }
  }

  return { session, user: dbUser }
}

export async function GET() {
  try {
    const { session, user } = await getAuthenticatedUser()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name || '',
      image: user.image || '',
      role: user.role,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { session, user } = await getAuthenticatedUser()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user?.id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const allowedKeys = ['name', 'image']
    const providedKeys = Object.keys(body || {})

    if (providedKeys.some(key => !allowedKeys.includes(key))) {
      return NextResponse.json(
        { error: 'Only name and image can be updated' },
        { status: 400 }
      )
    }

    const updates: { name?: string; image?: string } = {}

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length > 255) {
        return NextResponse.json(
          { error: 'Invalid name' },
          { status: 400 }
        )
      }
      updates.name = body.name.trim()
    }

    if (body.image !== undefined) {
      if (typeof body.image !== 'string' || body.image.length > 2000) {
        return NextResponse.json(
          { error: 'Invalid image URL' },
          { status: 400 }
        )
      }
      updates.image = body.image.trim()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided' },
        { status: 400 }
      )
    }

    const updated = await User.findByIdAndUpdate(user.id, updates)

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: updated.id,
        email: updated.email,
        name: updated.name || '',
        image: updated.image || '',
        role: updated.role,
      },
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

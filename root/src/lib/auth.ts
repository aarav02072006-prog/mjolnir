import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from './prisma'

export async function getAuthUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('meesho_token')?.value
    if (!token) return null

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, name: true, email: true, role: true },
    })
    return user
  } catch {
    return null
  }
}

export function getJwtSecret() {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

// Auth is now handled by Supabase — see /auth/callback/route.ts
export async function GET() {
  return new Response(null, { status: 404 });
}
export async function POST() {
  return new Response(null, { status: 404 });
}

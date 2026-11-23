import { NextResponse } from 'next/server';
import { STUDENT_DIRECTORY, createGuestProfile } from '@/lib/data/studentDirectory';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('id') || searchParams.get('studentId') || '';
  const studentName = searchParams.get('name') || '';
  const isGuest = searchParams.get('guest') === 'true' || searchParams.get('isGuest') === 'true';

  // Simulated database network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (isGuest) {
    const guest = createGuestProfile(studentName);
    return NextResponse.json(guest);
  }

  if (studentId && STUDENT_DIRECTORY[studentId]) {
    return NextResponse.json(STUDENT_DIRECTORY[studentId]);
  }

  if (studentName) {
    const found = Object.values(STUDENT_DIRECTORY).find(
      (s) => s.name.toLowerCase() === studentName.toLowerCase()
    );
    if (found) return NextResponse.json(found);

    return NextResponse.json(createGuestProfile(studentName));
  }

  // Default enrolled profile
  return NextResponse.json(STUDENT_DIRECTORY['12311668']);
}

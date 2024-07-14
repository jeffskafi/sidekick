import { NextResponse } from 'next/server';
import redis from '~/lib/redis';

interface Skill {
    id: string;
    name: string;
}
    
async function searchSkills(query: string, count = 10): Promise<Skill[]> {
    const lowercaseQuery = query.toLowerCase();
    const matchingSkills = await redis.zrangebylex(
        'linkedin_skills_lowercase',
        `[${lowercaseQuery}`,
        `[${lowercaseQuery}\xff`,
        'LIMIT',
        0,
        count
    );

    const originalSkills = matchingSkills.length > 0 ? await redis.hmget('linkedin_skills_original', ...matchingSkills) : [];
    return originalSkills.filter(Boolean).map((skill): Skill => ({
        id: skill!,
        name: skill!,
    }));
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query') ?? '';

        const results = await searchSkills(query);

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
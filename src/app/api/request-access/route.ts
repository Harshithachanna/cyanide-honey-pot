import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, websiteUrl, contactEmail } = body;

    // Manual Production Validation
    if (!companyName || typeof companyName !== 'string' || companyName.length < 2) {
      return NextResponse.json({ error: 'VAL_ERR: Company Name is required.' }, { status: 400 });
    }
    if (!websiteUrl || !websiteUrl.includes('.') || websiteUrl.length < 4) {
      return NextResponse.json({ error: 'VAL_ERR: Invalid Website URL.' }, { status: 400 });
    }
    if (!contactEmail || !contactEmail.includes('@') || contactEmail.length < 5) {
      return NextResponse.json({ error: 'VAL_ERR: Valid Security Contact Email is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('tenants')
      .insert([
        {
          company_name: companyName,
          website_url: websiteUrl,
          contact_email: contactEmail,
          status: 'PENDING',
        }
      ]);

    if (error) {
      console.error('Error inserting tenant:', error);
      // Determine if it is a unique constraint violation on email
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Request access error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

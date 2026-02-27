import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, email, phone } = await req.json();

    if (!firstName || !email || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Save to Supabase
    const supabase = getSupabase();
    const { error: dbError } = await supabase
      .from("signups")
      .insert({ first_name: firstName, email, phone });

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "You're already signed up! Check your email." },
          { status: 409 }
        );
      }
      console.error("Supabase error:", dbError);
      return NextResponse.json(
        { error: "Failed to save. Try again." },
        { status: 500 }
      );
    }

    // Send welcome email via Resend
    try {
      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Alpha Reset <noreply@alphareset.com>",
        to: email,
        subject: "Welcome to Alpha Reset 🦾",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #E5E5E5; padding: 40px;">
            <h1 style="color: #D4AF37; font-size: 28px; margin-bottom: 8px;">Alpha Reset</h1>
            <p style="color: #888; font-size: 14px; margin-bottom: 32px;">Live like the 1%</p>
            
            <p style="font-size: 18px; margin-bottom: 8px;">Welcome, <strong>${firstName}</strong>.</p>
            <p style="color: #999; line-height: 1.6;">You're in. The next Alpha Reset starts <strong style="color: #D4AF37;">23 March 2026</strong> and runs for 72 hours.</p>
            
            <div style="background: #0A0A0A; border: 1px solid #222; padding: 24px; margin: 24px 0; border-radius: 2px;">
              <p style="color: #D4AF37; font-weight: bold; margin-bottom: 12px;">WHAT TO EXPECT:</p>
              <ul style="color: #999; line-height: 2; padding-left: 20px;">
                <li>72-hour water fast (water & coffee only)</li>
                <li>Daily walks or runs</li>
                <li>Deep prayer and meditation</li>
                <li>Written 90-day life review</li>
                <li>Set direction for the next quarter</li>
              </ul>
            </div>
            
            <p style="color: #999; margin-bottom: 24px;">Join the group on Bestday to connect with other Alphas:</p>
            
            <a href="https://getbestdayapp.app.link/5SerCVKw60b" style="display: inline-block; background: #D4AF37; color: #000; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 2px;">Join on Bestday →</a>
            
            <p style="color: #444; font-size: 12px; margin-top: 40px; border-top: 1px solid #1a1a1a; padding-top: 20px;">
              Alpha Reset — Every quarter, become a completely different human being. By choice.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Resend error:", emailError);
      // Don't fail the signup if email fails
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

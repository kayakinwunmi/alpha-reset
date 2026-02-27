import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, email, phone, company, _t } = await req.json();

    // Honeypot check — bots fill hidden fields
    if (company) {
      return NextResponse.json({ success: true }); // Silent fail
    }

    // Time check — form submitted too fast (< 3 seconds = bot)
    if (typeof _t === "number" && _t < 3000) {
      return NextResponse.json({ success: true }); // Silent fail
    }

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
        text: `Hey ${firstName},

Welcome to Alpha Reset. You're in.

The next session starts 23 March 2026 and runs for 72 hours. Here's what to expect:

- 72-hour water fast (water & coffee only)
- Daily walks or runs
- Deep prayer and meditation
- Written 90-day life review
- Set direction for the next quarter

Join the group on Bestday to connect with other Alphas: https://getbestdayapp.app.link/5SerCVKw60b

See you on the 23rd.

Kay`,
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

import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { firstName, email, phone, intention, company, _t } = await req.json();

    // Honeypot check — bots fill hidden fields
    if (company) {
      return NextResponse.json({ success: true }); // Silent fail
    }

    // Time check — form submitted too fast (< 3 seconds = bot)
    if (typeof _t === "number" && _t < 3000) {
      return NextResponse.json({ success: true }); // Silent fail
    }

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const row = {
      first_name: String(firstName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      intention: intention ? String(intention).trim().slice(0, 1000) : null,
    };

    let { error: dbError } = await supabase.from("signups").insert(row);

    // If the intention column hasn't been migrated yet, retry without it
    // rather than losing the signup.
    if (dbError && (dbError.code === "42703" || dbError.code === "PGRST204")) {
      const { intention: _dropped, ...legacyRow } = row;
      void _dropped;
      ({ error: dbError } = await supabase.from("signups").insert(legacyRow));
    }

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

    try {
      await sendWelcomeEmail(row.email, row.first_name.split(" ")[0]);
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

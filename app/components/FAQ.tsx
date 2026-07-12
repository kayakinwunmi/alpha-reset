"use client";

import { useState } from "react";
import { GROUP_CALL_TIME } from "@/lib/event";

const faqs = [
  {
    q: "What exactly is the Alpha Reset?",
    a: "A quarterly 3-day water-fasting and life review challenge. For 72 hours, you fast from food and distractions — and use that time to review the last 90 days, reconnect with God, and set clear direction for the next quarter.",
  },
  {
    q: "Do I really eat nothing for 3 days?",
    a: "Water and black coffee only. No food. It's hard — your body will scream for it by day two. But that's the point. You're telling your body and mind: I'm in control. If you have medical conditions, consult your doctor first.",
  },
  {
    q: "What happens each day?",
    a: `Day 1 is Reset — disconnect from digital noise and face yourself. Day 2 is Reflect — review the past 90 days honestly. Day 3 is Focus — plan the next 90 days with intention and purpose. There's a group call each evening at ${GROUP_CALL_TIME}.`,
  },
  {
    q: "Is this a religious programme?",
    a: "It's rooted in faith — prayer, scripture, and spiritual connection are central. But it's open to anyone willing to commit. The core is discipline, self-reflection, and becoming the best version of yourself.",
  },
  {
    q: "How much does it cost?",
    a: "Alpha Reset itself is free. However, the group runs on Bestday AI, which requires a Premium + AI membership at $249/year. This gives you access to the accountability community and AI tools to track your goals.",
  },
  {
    q: "What do I need to prepare?",
    a: "Clear your calendar for 3 days. Stock up on water and coffee. Get a journal. Download Bestday and join the group. Most importantly — set an intention. Know why you're doing this before you start. The Field Guide covers all of it, step by step.",
    link: { label: "Read the Field Guide →", href: "/guide" },
  },
  {
    q: "Is a 72-hour fast safe for me?",
    a: "For most healthy adults, a supervised short fast is manageable — but it isn't for everyone. If you're pregnant or breastfeeding, under 18, have diabetes, a heart condition, a history of eating disorders, or take regular medication, talk to your doctor before joining. And during the fast: if you feel genuinely unwell — not just hungry — stop and eat. Discipline is the goal, not harm.",
  },
  {
    q: "Can I exercise during the fast?",
    a: "Walking and light running are encouraged — get outside, move your body, clear your head. Avoid intense workouts. Listen to your body.",
  },
  {
    q: "How do I break the fast safely?",
    a: "Start with easily digestible foods — clear broths, diluted fruit juices, yogurt. Don't overeat immediately. Continue drinking plenty of water. Then gradually reintroduce whole foods: fruits, vegetables, lean proteins.",
  },
  {
    q: "What if I've never fasted before?",
    a: "That's fine. Most people haven't done a 72-hour fast. The group is there to support you. You'll be surprised what you're capable of when you commit.",
  },
  {
    q: "What's the in-person reset?",
    a: "Once a year we do the reset together, in person — three days in a house somewhere remote, everyone contributes to the costs. Places are limited, so you request one when you sign up and Kay confirms each place personally. People say it's the best thing they do all year.",
  },
];

export function FAQ({
  nextRangeLabel,
  nextWeekday,
}: {
  nextRangeLabel: string;
  nextWeekday: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const allFaqs = [
    ...faqs,
    {
      q: "When is the next one?",
      a: `${nextRangeLabel}. Starts midnight on ${nextWeekday}. The full schedule is in The Calendar above — sign up below and join us on Bestday.`,
    },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-light text-[var(--ink)] mb-12 text-center">
          Questions
        </h2>

        <div className="divide-y divide-[var(--rule)]">
          {allFaqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full py-5 flex justify-between items-start text-left group"
              >
                <span className="text-lg text-[var(--ink)] pr-4 group-hover:text-[var(--accent)] transition-colors">
                  {faq.q}
                </span>
                <span className="text-[var(--ink-faint)] text-xl flex-shrink-0 mt-0.5">
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <div className="pb-5">
                  <p className="text-[var(--ink-light)] leading-relaxed">{faq.a}</p>
                  {"link" in faq && faq.link && (
                    <a href={faq.link.href} className="inline-block mt-3 font-sans text-sm text-[var(--accent)] underline">
                      {faq.link.label}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

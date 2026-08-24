"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent(`[Speakur] ${topic}: ${name || "Message"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`,
    );
    window.location.href = `mailto:hello@speakur.com?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-paper-line bg-paper-raised p-6">
      <div>
        <label htmlFor="name" className="text-sm text-ink-muted">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-voice/30"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm text-ink-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-voice/30"
        />
      </div>
      <div>
        <label htmlFor="topic" className="text-sm text-ink-muted">
          Topic
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1 w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-voice/30"
        >
          <option value="general">General</option>
          <option value="privacy">Privacy request</option>
          <option value="accessibility">Accessibility</option>
          <option value="partnership">Partnership</option>
          <option value="press">Press</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="text-sm text-ink-muted">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-voice/30"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper-raised hover:bg-voice-dark"
      >
        Send message
      </button>
    </form>
  );
}

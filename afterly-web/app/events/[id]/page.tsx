import { Metadata } from "next";
import { supabase } from "../../../lib/supabase";
import EventClientPage from "./EventClientPage";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: event } = await supabase
    .from('event_with_stats')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) {
    return {
      title: "Event Not Found — Afterly",
    };
  }

  return {
    title: `${event.name || event.title} — Afterly`,
    description: event.description || "Discover and join this event on Afterly.",
    openGraph: {
      title: event.name || event.title,
      description: event.description,
      images: [event.cover_image_url || '/og-image.png'],
    },
  };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  // Fetch event server side for SEO and initial data
  const { data: event } = await supabase
    .from('event_with_stats')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", color: "#FFF" }}>
        Event not found.
      </div>
    );
  }

  return <EventClientPage event={event} />;
}

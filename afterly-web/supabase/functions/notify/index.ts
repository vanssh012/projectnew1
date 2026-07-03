import { withSupabase } from "npm:@supabase/server"

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    try {
      const { userId, title, body } = await req.json();

      if (!userId || !title || !body) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Fetch user's push token from profiles using supabaseAdmin (which bypasses RLS)
      const { data: profile, error } = await ctx.supabaseAdmin
        .from("profiles")
        .select("expo_push_token")
        .eq("id", userId)
        .single();

      if (error || !profile?.expo_push_token) {
        return Response.json({ error: "User or push token not found" }, { status: 404 });
      }

      // Send Push Notification via Expo
      const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: profile.expo_push_token,
          title,
          body,
          sound: "default",
        }),
      });

      const expoData = await expoResponse.json();

      return Response.json({ success: true, data: expoData }, { status: 200 });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  })
}

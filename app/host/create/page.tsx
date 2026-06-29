"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import EventCard from "../../components/EventCard";

function CreateEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  
  // Validate type
  const type = (typeParam === "farewell" || typeParam === "freshers" || typeParam === "house_party") 
    ? typeParam 
    : "farewell";

  // Category Configuration
  const catConfig = {
    farewell: { color: "var(--gold)", label: "Farewell", symbol: "✦", bg: "#1E1A0E" },
    freshers: { color: "var(--teal)", label: "Freshers", symbol: "◈", bg: "#0E1A1E" },
    house_party: { color: "var(--purple)", label: "House Party", symbol: "◉", bg: "#1A0E1E" },
  }[type];

  // State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    batch: "",
    date: "",
    time: "",
    venue: "",
    city: "",
    maxGuests: "",
    price: "",
    isFree: false,
    tags: [] as string[],
    description: "",
    accessControl: "approval",
    collegeOnly: type !== "house_party",
    showGuestList: false,
    hasPhoto: false
  });
  
  const [isPublishing, setIsPublishing] = useState(false);

  // Computed validity
  const step1Valid = formData.name && (type === "house_party" || (formData.college && formData.batch)) && formData.date && formData.time && formData.venue && formData.city;
  const checklist = {
    name: !!formData.name,
    datetime: !!(formData.date && formData.time),
    venue: !!formData.venue,
    tags: formData.tags.length > 0,
    photo: formData.hasPhoto
  };

  const VIBE_TAGS = [
    'DJ Night','Neon Theme','Games','Photo Booth','Dinner Included','Bollywood',
    'Acoustic','Introductions','Karaoke','BYOB','Retro','Rooftop','Dress Code',
    'Surprise Act','Open Mic','Board Games'
  ];

  const handleUpdate = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      if (prev.tags.includes(tag)) return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      return { ...prev, tags: [...prev.tags, tag] };
    });
  };

  const handlePublish = () => {
    setIsPublishing(true);
    // Simulate Supabase INSERT delay
    setTimeout(() => {
      // Mock generated ID
      const mockEventId = "evt_" + Math.random().toString(36).substring(2, 9);
      router.push(`/host/dashboard/${mockEventId}`);
    }, 2000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      
      {/* LEFT SIDE — FORM */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOP BAR / PROGRESS */}
        <div style={{ padding: "40px 60px", borderBottom: "0.5px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(0,0,0,0.9)", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 600, margin: "0 auto" }}>
            <Link href="/host" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, position: "absolute", left: 60 }}>← back</Link>
            
            <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center" }}>
              {/* Step 1 Node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: step >= 1 ? "#FFF" : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {step > 1 && <span style={{ color: "#000", fontSize: 8 }}>✓</span>}
                </div>
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: step >= 1 ? "#FFF" : "rgba(255,255,255,0.4)" }}>basics</div>
              </div>
              
              <div style={{ height: 1, width: 80, background: step >= 2 ? "#FFF" : "rgba(255,255,255,0.2)", margin: "0 -20px 20px" }} />
              
              {/* Step 2 Node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: step >= 2 ? "#FFF" : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {step > 2 && <span style={{ color: "#000", fontSize: 8 }}>✓</span>}
                </div>
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: step >= 2 ? "#FFF" : "rgba(255,255,255,0.4)" }}>vibe</div>
              </div>

              <div style={{ height: 1, width: 80, background: step >= 3 ? "#FFF" : "rgba(255,255,255,0.2)", margin: "0 -20px 20px" }} />
              
              {/* Step 3 Node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: step >= 3 ? "#FFF" : "rgba(255,255,255,0.2)" }} />
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: step >= 3 ? "#FFF" : "rgba(255,255,255,0.4)" }}>preview</div>
              </div>
            </div>
          </div>
        </div>

        {/* FORM CONTENT SCROLL AREA */}
        <div style={{ flex: 1, padding: "60px", overflowY: "auto" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            
            {/* Category Badge Top */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
              <div style={{ background: catConfig.bg, color: catConfig.color, padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: `0.5px solid ${catConfig.color}` }}>
                {catConfig.symbol} {catConfig.label}
              </div>
              <Link href="/host" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "underline" }}>change</Link>
            </div>

            {/* =============== STEP 1: BASICS =============== */}
            {step === 1 && (
              <div className="page-load-animate" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                
                <div className="form-group">
                  <label className="form-label">EVENT NAME</label>
                  <input className="form-input" placeholder="e.g. Golden Memories Farewell Night" value={formData.name} onChange={e => handleUpdate("name", e.target.value)} />
                </div>

                {type !== "house_party" && (
                  <div style={{ display: "flex", gap: 16 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">COLLEGE</label>
                      <input className="form-input" placeholder="DTU, Delhi" value={formData.college} onChange={e => handleUpdate("college", e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">BATCH</label>
                      <input className="form-input" placeholder="Batch of 2025" value={formData.batch} onChange={e => handleUpdate("batch", e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">COVER PHOTO</label>
                  <div 
                    onClick={() => handleUpdate("hasPhoto", true)}
                    style={{ 
                      height: 120, background: formData.hasPhoto ? "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000') center/cover" : "#0A0A0A", 
                      border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 16, display: "flex", flexDirection: "column", 
                      alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" 
                    }}
                  >
                    {!formData.hasPhoto && (
                      <>
                        <div style={{ fontSize: 24, color: "#FFF", marginBottom: 8 }}>+</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>click to simulate upload</div>
                        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>JPG, PNG up to 10MB</div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">DATE</label>
                    <input type="date" className="form-input" style={{ colorScheme: "dark" }} value={formData.date} onChange={e => handleUpdate("date", e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">TIME</label>
                    <input type="time" className="form-input" style={{ colorScheme: "dark" }} value={formData.time} onChange={e => handleUpdate("time", e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">VENUE</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}>📍</span>
                    <input className="form-input" style={{ paddingLeft: 44 }} placeholder="Rohini, New Delhi" value={formData.venue} onChange={e => handleUpdate("venue", e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">CITY</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {["Delhi NCR", "Bangalore", "Mumbai", "Pune", "Goa", "Other"].map(city => (
                      <div 
                        key={city} 
                        onClick={() => handleUpdate("city", city)}
                        style={{
                          background: formData.city === city ? "#FFF" : "transparent",
                          color: formData.city === city ? "#000" : "rgba(255,255,255,0.4)",
                          border: `0.5px solid ${formData.city === city ? "transparent" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: 100, padding: "8px 18px", fontSize: 13, fontWeight: formData.city === city ? 500 : 400, cursor: "pointer"
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">MAX GUESTS</label>
                  <input type="number" className="form-input" placeholder="50" value={formData.maxGuests} onChange={e => handleUpdate("maxGuests", e.target.value)} />
                  <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 8 }}>you can always reduce this later</div>
                </div>

                <button 
                  onClick={() => step1Valid && setStep(2)}
                  style={{ 
                    background: step1Valid ? catConfig.color : "rgba(255,255,255,0.1)", 
                    color: step1Valid ? "#000" : "rgba(255,255,255,0.3)", 
                    borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 500, marginTop: 32, cursor: step1Valid ? "pointer" : "not-allowed", transition: "all 0.2s" 
                  }}
                >
                  next — set the vibe →
                </button>
              </div>
            )}

            {/* =============== STEP 2: VIBE =============== */}
            {step === 2 && (
              <div className="page-load-animate" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                
                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>TICKET PRICE</label>
                    <div 
                      onClick={() => handleUpdate("isFree", !formData.isFree)}
                      style={{
                        background: formData.isFree ? "#FFF" : "transparent",
                        color: formData.isFree ? "#000" : "rgba(255,255,255,0.6)",
                        border: formData.isFree ? "none" : "0.5px solid rgba(255,255,255,0.1)",
                        borderRadius: 100, padding: "4px 12px", fontSize: 11, cursor: "pointer"
                      }}
                    >
                      {formData.isFree ? "free event ✓" : "make it free"}
                    </div>
                  </div>
                  
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: formData.isFree ? "rgba(255,255,255,0.2)" : "#FFF", fontWeight: 500, fontSize: 18 }}>₹</span>
                    <input 
                      type="number" className="form-input" style={{ paddingLeft: 36, opacity: formData.isFree ? 0.3 : 1 }} 
                      placeholder="999" value={formData.isFree ? "0" : formData.price} onChange={e => handleUpdate("price", e.target.value)} disabled={formData.isFree} 
                    />
                  </div>
                  
                  {!formData.isFree && formData.price && (
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 8 }}>
                      guests pay ₹{formData.price} · you receive ₹{Math.floor(parseInt(formData.price) * 0.925)} after 7.5% fee
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">VIBE TAGS</label>
                  <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, marginBottom: 12, marginTop: -4 }}>select all that apply</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {VIBE_TAGS.map(tag => {
                      const isSelected = formData.tags.includes(tag);
                      return (
                        <div 
                          key={tag} onClick={() => toggleTag(tag)}
                          style={{
                            background: isSelected ? catConfig.color : "#111",
                            color: isSelected ? "#000" : "rgba(255,255,255,0.4)",
                            border: `0.5px solid ${isSelected ? "transparent" : "rgba(255,255,255,0.1)"}`,
                            borderRadius: 100, padding: "8px 16px", fontSize: 13, fontWeight: isSelected ? 500 : 400, cursor: "pointer"
                          }}
                        >
                          {tag}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <label className="form-label">DESCRIBE YOUR NIGHT</label>
                    <span style={{ fontSize: 11, color: formData.description.length > 290 ? "#CF7A7A" : formData.description.length > 250 ? "var(--gold)" : "rgba(255,255,255,0.2)" }}>{formData.description.length} / 300</span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, marginBottom: 12, marginTop: -4 }}>what's the theme? dress code? what should guests expect?</div>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: 120, resize: "none" }} 
                    placeholder="e.g. 90s Bollywood night — retro outfits mandatory..."
                    value={formData.description} 
                    onChange={e => handleUpdate("description", e.target.value.substring(0, 300))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WHO CAN JOIN?</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { id: "open", title: "open to all", desc: "anyone can join instantly, no approval", icon: "🌐" },
                      { id: "approval", title: "approval required", desc: "you review and approve every request", icon: "✓" },
                      { id: "invite", title: "invite only", desc: "guests need a direct invite from you", icon: "🔒" }
                    ].map(opt => (
                      <div 
                        key={opt.id} onClick={() => handleUpdate("accessControl", opt.id)}
                        style={{
                          background: formData.accessControl === opt.id ? "rgba(255,255,255,0.04)" : "#111",
                          border: `0.5px solid ${formData.accessControl === opt.id ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${formData.accessControl === opt.id ? "#FFF" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {formData.accessControl === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFF" }} />}
                        </div>
                        <div style={{ fontSize: 20, filter: "grayscale(1) opacity(0.6)" }}>{opt.icon}</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 500, color: "#FFF", marginBottom: 2 }}>{opt.title}</div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{opt.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: 24, borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: 32 }}>
                  {type !== "house_party" && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: "#FFF" }}>college email only</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>restrict to guests from your college</div>
                      </div>
                      <div 
                        onClick={() => handleUpdate("collegeOnly", !formData.collegeOnly)}
                        style={{ width: 44, height: 24, borderRadius: 100, background: formData.collegeOnly ? "#FFF" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "all 0.2s" }}
                      >
                        <div style={{ position: "absolute", top: 2, left: formData.collegeOnly ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: formData.collegeOnly ? "#000" : "#FFF", transition: "all 0.2s" }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: "#FFF" }}>show guest list</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>attendees can see who else is coming</div>
                    </div>
                    <div 
                      onClick={() => handleUpdate("showGuestList", !formData.showGuestList)}
                      style={{ width: 44, height: 24, borderRadius: 100, background: formData.showGuestList ? "#FFF" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <div style={{ position: "absolute", top: 2, left: formData.showGuestList ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: formData.showGuestList ? "#000" : "#FFF", transition: "all 0.2s" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", color: "rgba(255,255,255,0.5)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, fontSize: 15 }}>
                    back
                  </button>
                  <button onClick={() => setStep(3)} style={{ flex: 2, background: catConfig.color, color: "#000", borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 500 }}>
                    preview your event →
                  </button>
                </div>
              </div>
            )}

            {/* =============== STEP 3: PREVIEW & PUBLISH =============== */}
            {step === 3 && (
              <div className="page-load-animate" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                
                <div style={{ textAlign: "center" }}>
                  <h1 style={{ fontSize: 32, fontWeight: 500, color: "#FFF", letterSpacing: -1, marginBottom: 8 }}>looks good?</h1>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>this is exactly how your event appears to guests.</p>
                </div>

                {/* PHONE MOCKUP FRAME */}
                <div style={{ 
                  width: 320, margin: "0 auto", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: 40, padding: 12, boxShadow: "0 40px 80px rgba(0,0,0,0.6)", height: 500, display: "flex", flexDirection: "column"
                }}>
                  <div style={{ width: 100, height: 24, background: "#000", borderBottomLeftRadius: 16, borderBottomRightRadius: 16, margin: "-12px auto 8px" }} />
                  
                  <div style={{ flex: 1, overflowY: "auto", background: "#0A0A0A", borderRadius: 28, paddingBottom: 24 }}>
                    {/* Mock Image */}
                    <div style={{ height: 200, background: formData.hasPhoto ? "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000') center/cover" : catConfig.bg, position: "relative" }}>
                      {!formData.hasPhoto && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.1 }}>{catConfig.symbol}</div>}
                    </div>
                    
                    <div style={{ padding: 16 }}>
                      <div style={{ color: catConfig.color, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{catConfig.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 500, color: "#FFF", lineHeight: 1.2, marginBottom: 12 }}>{formData.name || "Untitled Event"}</div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
                        <div>📅 {formData.date || "TBD"} · {formData.time || "TBD"}</div>
                        <div>📍 {formData.venue || "TBD"}, {formData.city || "TBD"}</div>
                      </div>

                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 20 }}>
                        {formData.description || "No description provided."}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {formData.tags.map(tag => (
                          <div key={tag} style={{ background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 100, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{tag}</div>
                        ))}
                      </div>

                      <button style={{ width: "100%", background: "#FFF", color: "#000", padding: 12, borderRadius: 12, fontWeight: 500, fontSize: 13, marginTop: 24 }}>
                        request to join · {formData.isFree ? "Free" : formData.price ? `₹${formData.price}` : "Free"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* TICKET STUB */}
                <div style={{ 
                  background: "#111", borderRadius: 16, border: "0.5px solid rgba(255,255,255,0.08)", width: 320, margin: "0 auto", position: "relative"
                }}>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 10, background: "#FFF", color: "#000", padding: "4px 8px", borderRadius: 100, fontWeight: 600, textTransform: "uppercase" }}>{catConfig.label}</span>
                      <span style={{ color: "#FFF", fontWeight: 500, fontSize: 14 }}>{formData.isFree ? "Free" : formData.price ? `₹${formData.price}` : "Free"}</span>
                    </div>
                    <div style={{ color: "#FFF", fontSize: 16, fontWeight: 500 }}>{formData.name || "Untitled Event"}</div>
                  </div>
                  
                  {/* Dashed line with cutouts */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 10, height: 20, background: "var(--bg-primary)", borderRadius: "0 20px 20px 0", borderRight: "0.5px solid rgba(255,255,255,0.08)" }} />
                    <div style={{ flex: 1, borderTop: "2px dashed rgba(255,255,255,0.1)" }} />
                    <div style={{ width: 10, height: 20, background: "var(--bg-primary)", borderRadius: "20px 0 0 20px", borderLeft: "0.5px solid rgba(255,255,255,0.08)" }} />
                  </div>

                  <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4 }}>{formData.date || "TBD"}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{formData.time || "TBD"}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1 }}>QR AT DOOR</div>
                  </div>
                </div>

                {/* CHECKLIST */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: checklist.name ? "var(--teal)" : "#CF7A7A" }}>{checklist.name ? "✓" : "✗"}</span> event name set
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: checklist.datetime ? "var(--teal)" : "#CF7A7A" }}>{checklist.datetime ? "✓" : "✗"}</span> date and time confirmed
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: checklist.venue ? "var(--teal)" : "#CF7A7A" }}>{checklist.venue ? "✓" : "✗"}</span> venue added
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: checklist.tags ? "var(--teal)" : "#CF7A7A" }}>{checklist.tags ? "✓" : "✗"}</span> at least one vibe tag selected
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: checklist.photo ? "var(--teal)" : "rgba(207,122,122,0.6)" }}>{checklist.photo ? "✓" : "✗"}</span> {checklist.photo ? "cover photo added" : "cover photo missing (not required)"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(2)} disabled={isPublishing} style={{ width: "80px", background: "transparent", color: "rgba(255,255,255,0.5)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 14, fontSize: 15 }}>
                    back
                  </button>
                  <button 
                    onClick={handlePublish}
                    disabled={isPublishing || !checklist.name || !checklist.datetime || !checklist.venue}
                    style={{ 
                      flex: 1, background: "#FFF", color: "#000", borderRadius: 14, padding: 18, fontSize: 16, fontWeight: 600,
                      opacity: (!checklist.name || !checklist.datetime || !checklist.venue) ? 0.4 : 1, transition: "all 0.2s"
                    }}
                  >
                    {isPublishing ? "publishing..." : "publish event"}
                  </button>
                </div>
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", marginTop: -16 }}>
                  your event goes live immediately after publishing
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* RIGHT SIDE — LIVE PREVIEW (Desktop Only) */}
      <div className="desktop-preview" style={{ width: 380, background: "#0A0A0A", borderLeft: "0.5px solid rgba(255,255,255,0.06)", position: "relative" }}>
        <div style={{ position: "sticky", top: 80, padding: "40px 32px" }}>
          
          <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 24 }}>
            LIVE PREVIEW
          </div>
          
          {/* We import the EventCard but render it manually to pass live reactive mock data */}
          <EventCard 
            id="preview"
            title={formData.name || "your event name"}
            date={formData.date || "date TBD"}
            location={formData.city || "location TBD"}
            hostInitial="H"
            hostName="You"
            category={type as any}
            spots={parseInt(formData.maxGuests) || 0}
            price={formData.isFree ? "Free" : formData.price ? `₹${formData.price}` : "Free"}
          />
          
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", marginTop: 16 }}>
            this is how it looks in the feed
          </div>
        </div>
      </div>

      <style>{`
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .form-input {
          background: #111;
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px 18px;
          color: #FFF;
          font-size: 15px;
          width: 100%;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: rgba(255,255,255,0.3);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
        }
        .form-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .desktop-preview { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#000" }} />}>
      <CreateEventForm />
    </Suspense>
  );
}

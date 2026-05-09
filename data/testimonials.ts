export interface Testimonial {
  q: string
  name: string
  role: string
  company: string
}

export const testimonials: Testimonial[] = [
  {
    q: "Thomas integrated offline mode, iOS support, and BLE communication on our mobile app, then led the Supabase migration that replaced Bubble.io and cut our costs significantly. His React Native depth, independence, and creative problem-solving made him an outstanding asset to the team.",
    name: "Armand Petit",
    role: "CTO",
    company: "Osly Solutions",
  },
  {
    q: "Thomas stood out not only for his technical expertise but also for his eagerness to help others. Working across FlutterFlow, React Native, React, and PostgreSQL, he consistently demonstrated strong problem-solving skills and a deep understanding of the development process.",
    name: "Kayla Kenney",
    role: "Front End Developer",
    company: "Frigate Global",
  },
]

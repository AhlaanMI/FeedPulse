import FeedbackForm from "@/components/FeedbackForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-white py-20 px-4 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-slate-50 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -z-10"></div>

      <FeedbackForm />
    </main>
  );
}

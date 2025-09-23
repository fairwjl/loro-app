// client/src/pages/JournalPage.jsx
import AppShell from "../ui/AppShell.jsx";
import Journal from "../components/Journal.jsx";

export default function JournalPage(){
  return (
    <AppShell
      title="Your Journal"
      subtitle="A safe space to process your thoughts and feelings."
    >
      <section className="card" style={{padding:20}}>
        {/* Your existing journal (with reflections) lives here */}
        <Journal />
      </section>
    </AppShell>
  );
}
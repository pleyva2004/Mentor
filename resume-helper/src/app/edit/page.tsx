import { Header } from '@/components/layout';
import { EditScreen } from '@/components/screens';

export default function EditPage() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <section id="edit-screen" className="screen">
          <EditScreen />
        </section>
      </main>
    </div>
  );
}

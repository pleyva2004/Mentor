import { Header } from '@/components/layout';
import { UploadScreen } from '@/components/screens';

export default function HomePage() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <section id="upload-screen" className="screen">
          <UploadScreen />
        </section>
      </main>
    </div>
  );
}

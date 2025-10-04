/**
 * Main App component
 */

import { Header } from './components/layout';
import { UploadScreen, EditScreen } from './components/screens';
import { useResumeStore } from './stores/resumeStore';

function App() {
  const { currentScreen } = useResumeStore();

  return (
    <div className="app-container">
      <Header />
      <main>
        {currentScreen === 'upload' && (
          <section id="upload-screen" className="screen">
            <UploadScreen />
          </section>
        )}
        {currentScreen === 'edit' && (
          <section id="edit-screen" className="screen">
            <EditScreen />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
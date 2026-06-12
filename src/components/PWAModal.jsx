import { usePWA } from '../context/usePWA';

const PWAModal = () => {
  const { deferredPrompt, installPWA, showModal, closePrompt, dismissPermanently } = usePWA();

  if (!showModal) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Tətbiqimizi Yükləyin!</h2>
        <p>Daha sürətli giriş və oflayn rejim üçün tətbiqi ana ekranınıza əlavə edin.</p>
        
        <div style={styles.actions}>
          {deferredPrompt ? (
            <button onClick={installPWA} style={styles.installBtn}>İndi Quraşdır</button>
          ) : (
             <div style={styles.iosInstruction}>
               <p>iOS-da quraşdırmaq üçün:</p>
               <ol>
                 <li>Aşağıdakı <b>"Paylaş"</b> (Share) ikonuna toxunun.</li>
                 <li><b>"Ana Ekrana Əlavə Et"</b> (Add to Home Screen) seçin.</li>
               </ol>
             </div>
          )}
          <button onClick={closePrompt} style={styles.laterBtn}>Daha sonra</button>
          <button onClick={dismissPermanently} style={styles.dismissBtn}>Bir daha göstərmə</button>
        </div>
      </div>
    </div>
  );
};

// Çox bəsit CSS stilləri (Tailwind və ya öz CSS-nizlə əvəz edə bilərsiniz)
const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', maxWidth: '350px' },
  actions: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
  installBtn: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  laterBtn: { padding: '10px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  dismissBtn: { padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#888', cursor: 'pointer' },
  iosInstruction: { backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', textAlign: 'left', fontSize: '14px' }
};

export default PWAModal;

import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useWalletStore } from './store/walletStore';
import ConnectWalletPrompt from './components/ui/ConnectWalletPrompt';
import { useEffect } from 'react';
import { FHEService } from './lib/fheService';
import Landing from './pages/Landing';
import RegisterPage from './pages/Register';
import BattleArenaPage from './pages/BattleArena';
import HowItWorks from './pages/HowItWorks';
import FightHistory from './pages/FightHistory';

export default function App() {

  const { account } = useWalletStore();


  useEffect(() => {
    const instance = FHEService.getInstance();
    instance.initialize();

  }, []);

  return (
    <Layout>
      {
        account ?
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/battle-arena" element={<BattleArenaPage />} />
            <Route path="/history" element={<FightHistory />} />
            <Route path="/how-works" element={<HowItWorks />} />
          </Routes>
          :
          <ConnectWalletPrompt />
      }
    </Layout>
  );
}

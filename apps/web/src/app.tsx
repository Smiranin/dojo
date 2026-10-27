import { Route, Routes } from 'react-router';
import { HomeScreen } from './screens/HomeScreen.js';
import { InboxScreen } from './screens/InboxScreen.js';
import { KataScreen } from './screens/KataScreen.js';
import { TrainingScreen } from './screens/TrainingScreen.js';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/kata/:kataId" element={<KataScreen />} />
      <Route path="/train" element={<TrainingScreen />} />
      <Route path="/inbox" element={<InboxScreen />} />
    </Routes>
  );
}

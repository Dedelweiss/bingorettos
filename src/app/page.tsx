// pages/index.tsx
import React from 'react';
import Bingo from '../components/Bingo';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Bingo size={5} />
    </div>
  );
};

export default Home;

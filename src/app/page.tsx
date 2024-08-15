// pages/index.tsx
import React from 'react';
import Bingo from '../components/Bingo';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className='uppercase text-2xl pb-10'>Bingorettos porto</h1>
      <Bingo size={5} />
    </div>
  );
};

export default Home;

"use client";

import React, { useState, useEffect } from 'react';
import { bingoData } from '../data/bingoData';

type BingoProps = {
  size?: number;
};

const Bingo: React.FC<BingoProps> = ({ size = 5 }) => {
  const [activeButtons, setActiveButtons] = useState<boolean[]>([]);
  const [validatedButtons, setValidatedButtons] = useState<boolean[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [animatedCells, setAnimatedCells] = useState<number[]>([]);

  // Initialize states from localStorage
  useEffect(() => {
    const storedActiveButtons = localStorage.getItem('activeButtons');
    const storedValidatedButtons = localStorage.getItem('validatedButtons');

    setActiveButtons(storedActiveButtons ? JSON.parse(storedActiveButtons) : Array(bingoData.length).fill(false));
    setValidatedButtons(storedValidatedButtons ? JSON.parse(storedValidatedButtons) : Array(bingoData.length).fill(false));
  }, []);

  // Update localStorage whenever activeButtons changes
  useEffect(() => {
    if (activeButtons.length > 0) {
      localStorage.setItem('activeButtons', JSON.stringify(activeButtons));
    }
  }, [activeButtons]);

  // Update localStorage whenever validatedButtons changes
  useEffect(() => {
    if (validatedButtons.length > 0) {
      localStorage.setItem('validatedButtons', JSON.stringify(validatedButtons));
    }
  }, [validatedButtons]);

  const handleClick = (index: number) => {
    if (activeButtons[index]) {
      setSelectedCell(index);
    }
  };

  const closeModal = () => {
    setSelectedCell(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = () => {
    const index = bingoData.findIndex(item => item.keyword.toLowerCase() === inputValue.toLowerCase());
    if (index !== -1) {
      const newActiveButtons = [...activeButtons];
      newActiveButtons[index] = true;
      setActiveButtons(newActiveButtons);
    }
    setInputValue('');
  };

  const handleValidate = () => {
    if (selectedCell !== null) {
      const newValidatedButtons = [...validatedButtons];
      newValidatedButtons[selectedCell] = true;
      setValidatedButtons(newValidatedButtons);

      // Check for line or column completion upon validation
      checkForLineOrColumnCompletion(selectedCell, newValidatedButtons);

      closeModal();
    }
  };

  const checkForLineOrColumnCompletion = (index: number, validatedButtons: boolean[]) => {
    const rowStart = Math.floor(index / size) * size;
    const colStart = index % size;

    // Check row
    const isRowComplete = validatedButtons.slice(rowStart, rowStart + size).every(button => button);
    
    // Check column
    const isColumnComplete = Array(size).fill(0).every((_, i) => validatedButtons[colStart + i * size]);

    if (isRowComplete) {
      setAnimatedCells([...Array(size).keys()].map(i => rowStart + i));
    } else if (isColumnComplete) {
      setAnimatedCells([...Array(size).keys()].map(i => colStart + i * size));
    }
  };

  useEffect(() => {
    if (animatedCells.length > 0) {
      const timeout = setTimeout(() => {
        setAnimatedCells([]);
      }, 1000); // Animation duration
      return () => clearTimeout(timeout);
    }
  }, [animatedCells]);

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-5 gap-4 mb-4">
        {bingoData.slice(0, size * size).map((item, index) => (
          <div key={item.id} className="p-2">
            <button
              onClick={() => handleClick(index)}
              disabled={!activeButtons[index]}
              className={`w-full h-24 text-white font-bold rounded-lg p-4 ${
                animatedCells.includes(index) ? 'animate-bounce' : ''
              } ${
                validatedButtons[index] 
                  ? `bg-green-500 border-4 ${item.color === 'bg-blue-500' ? 'border-blue-500' : 
                    item.color === 'bg-red-500' ? 'border-red-500' : 
                    item.color === 'bg-yellow-500' ? 'border-yellow-500' : 
                    'border-gray-500'}`
                  : activeButtons[index] 
                  ? item.color + ' hover:bg-opacity-80' 
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
            >
              {item.text}
            </button>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Entrez un mot-clé"
        className="p-2 border border-gray-300 rounded mb-4 text-black"
      />
      <button
        onClick={handleInputSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        Activer le bouton
      </button>

      {/* Modal */}
      {selectedCell !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold">
              {bingoData[selectedCell].text}
            </h2>
            <p>{bingoData[selectedCell].description}</p>
            <button
              onClick={handleValidate}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Valider
            </button>
            <button
              onClick={closeModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 ml-2"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bingo;

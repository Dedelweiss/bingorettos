"use client";

import React, { useState, useEffect } from 'react';
import { bingoData, adminKeyWord, hints, clue } from '../data/bingoData';
import basquiatCrown from '../assets/basquiatcrown.png';

type BingoProps = {
  size?: number;
};

const Bingo: React.FC<BingoProps> = ({ size = 5 }) => {
  const [activeButtons, setActiveButtons] = useState<boolean[]>([]);
  const [validatedButtons, setValidatedButtons] = useState<boolean[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [animatedCells, setAnimatedCells] = useState<number[]>([]);
  const [images, setImages] = useState<(string | null)[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [hintUses, setHintUses] = useState<number>(0);
  const [canUseHint, setCanUseHint] = useState<boolean>(false);

  // Initialize states from localStorage
  useEffect(() => {
    const storedActiveButtons = localStorage.getItem('activeButtons');
    const storedValidatedButtons = localStorage.getItem('validatedButtons');
    const storedImages = localStorage.getItem('images');
    const storedHintUses = localStorage.getItem('hintUses');
    const lastHintUseDate = localStorage.getItem('lastHintUseDate');

    setActiveButtons(storedActiveButtons ? JSON.parse(storedActiveButtons) : Array(bingoData.length).fill(false));
    setValidatedButtons(storedValidatedButtons ? JSON.parse(storedValidatedButtons) : Array(bingoData.length).fill(false));
    setImages(storedImages ? JSON.parse(storedImages) : Array(bingoData.length).fill(null));

    // Check the date to reset the uses if the day has changed
    const currentDate = new Date().toDateString();
    if (lastHintUseDate !== currentDate) {
      setHintUses(0);
      localStorage.setItem('hintUses', '0'); // Reset usage count
      localStorage.setItem('lastHintUseDate', currentDate); // Update the date in storage
    } else {
      setHintUses(storedHintUses ? parseInt(storedHintUses, 10) : 0);
    }
  }, []);

  // Update localStorage whenever hintUses changes
  useEffect(() => {
    localStorage.setItem('hintUses', hintUses.toString());
  }, [hintUses]);

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

  // Update localStorage whenever images changes
  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem('images', JSON.stringify(images));
    }
  }, [images]);

  // Check if the button should be active based on the time (between 12:30 and 12:31)
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Activate the button only between 12:30 and 12:31, with a limit of 5 uses per day
      if (hour === 12 && minute === 30 && hintUses < 5) {
        setCanUseHint(true);
      } else {
        setCanUseHint(false);
      }
    };

    // Check the time immediately and set up an interval to check every second
    checkTime();
    const intervalId = setInterval(checkTime, 1000); // Check every second
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [hintUses]);

  const handleHintButtonClick = () => {
    if (canUseHint && hintUses < 5) {
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      setHint(randomHint);
      setHintUses(hintUses + 1);
    }
  };

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
    const trimmedInputValue = inputValue.toLowerCase().trim();
  
    if (trimmedInputValue === adminKeyWord.toLowerCase().trim()) {
      setActiveButtons(Array(bingoData.length).fill(true));
    } else if (trimmedInputValue === clue.toLowerCase().trim()) {
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      setHint(randomHint);
    } else {
      const index = bingoData.findIndex(item => 
        item.keyword.some(keyword => keyword.toLowerCase().trim().includes(trimmedInputValue))
      );
      if (index !== -1) {
        const newActiveButtons = [...activeButtons];
        newActiveButtons[index] = true;
        setActiveButtons(newActiveButtons);
      }
    }
    setInputValue('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const handleValidate = () => {
    if (selectedCell !== null) {
      const newValidatedButtons = [...validatedButtons];
      newValidatedButtons[selectedCell] = !newValidatedButtons[selectedCell]; // Toggle validation state
      setValidatedButtons(newValidatedButtons);

      // Check for line or column completion upon validation
      checkForLineOrColumnCompletion(selectedCell, newValidatedButtons);

      closeModal();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCell !== null && e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const newImages = [...images];
        newImages[selectedCell] = fileReader.result as string;
        setImages(newImages);
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (selectedCell !== null) {
      const newImages = [...images];
      newImages[selectedCell] = null;
      setImages(newImages);
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

  const toggleInfoModal = () => {
    setIsInfoModalOpen(!isInfoModalOpen);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-4">
        <h1 className='uppercase text-2xl pb-10'>Bingorettos porto</h1>
        <button 
          onClick={toggleInfoModal} 
          className="ml-4 bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600">
          ?
        </button>
      </div>

      {/* Info Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center text-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl">
            <h2 className="text-lg font-bold mb-4">Informations</h2>
            <p className='pb-2'>Salut les ptits potes, le but de ce jeu est de débloquer les cases en trouvant le mot clé correspondant. Lorsque celle-ci sera débloqué vous pourrez essayé de la valider en executant un défi ou étant présent durant un évenement précis. Amusez vous bien</p>
            <p className="mb-2">Les cases <span className="text-red-500">rouges</span> sont à réaliser en groupe. Tu peux les partager si tu le souhaite</p>
            <p className="mb-2">Les cases <span className="text-blue-500">bleues</span> sont à réaliser seul. Ne les partage pas</p>
            <button 
              onClick={toggleInfoModal} 
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Fermer
            </button>
          </div>
        </div>
      )}

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
        onKeyDown={handleKeyPress}
        placeholder="Entrez un mot-clé"
        className="p-2 border border-gray-300 rounded mb-4 text-black"
      />
      <button
        onClick={handleInputSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        Activer le bouton
      </button>

      {/* Bouton d'affichage d'indice */}
      <button
        onClick={handleHintButtonClick}
        disabled={!canUseHint}
        className={`mt-4 px-4 py-2 rounded-lg ${canUseHint ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
      >
        Obtenir un indice (Disponible entre 12:30 et 12:31)
      </button>

      {/* Affichage de l'indice */}
      {hint && (
        <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg">
          {hint}
        </div>
      )}

      {/* Modal */}
      {selectedCell !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl relative">
            <h2 className="text-lg p-2 text-center text-black font-bold">
              {bingoData[selectedCell].keyword}
            </h2>

            {bingoData[selectedCell].description.includes(" ou ") ? (
              <div className="text-center text-black">
                <p>{bingoData[selectedCell].description.split(" ou ")[0]}</p>
                <p className="mt-2 font-semibold">ou</p>
                <p>{bingoData[selectedCell].description.split(" ou ")[1]}</p>
              </div>
            ) : (
              <p className="text-black text-center">{bingoData[selectedCell].description}</p>
            )}

            <div className="absolute top-2 right-2">
              <div className="relative group">
                <img src={basquiatCrown.src} alt="Basquiat Crown" className="w-6 h-6 cursor-pointer" />
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-gray-700 text-white text-sm rounded-lg">
                  {bingoData[selectedCell].lucasDare}
                </div>
              </div>
            </div>

            {images[selectedCell] ? (
              <>
                <img src={images[selectedCell]} alt="Selected" className="mb-4 max-h-64" />
                <button
                  onClick={handleRemoveImage}
                  className="bg-red-500 text-white px-4 py-2 pr-2 rounded-lg hover:bg-red-600 mb-4"
                >
                  Delete image
                </button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-4"
                />
              </>
            )}

            <button
              onClick={handleValidate}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              {validatedButtons[selectedCell] ? 'Dévalider' : 'Valider'}
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

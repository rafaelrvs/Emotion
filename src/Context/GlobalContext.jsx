import React, { createContext, useState } from 'react';

// Cria o contexto
export const GlobalContext = createContext();

// Provedor do contexto
export const GlobalProvider = ({ children }) => {
  const [emojiClicks, setEmojiClicks] = useState({});

  // Função para incrementar o contador de emojis
  const incrementEmojiClick = (emoji) => {
    setEmojiClicks((prevState) => ({
      ...prevState,
      [emoji]: (prevState[emoji] || 0) + 1,
    }));
  };

  return (
    <GlobalContext.Provider value={{ emojiClicks, incrementEmojiClick }}>
      {children}
    </GlobalContext.Provider>
  );
};

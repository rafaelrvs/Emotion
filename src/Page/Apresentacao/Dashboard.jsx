import React, { useContext } from 'react'
import { GlobalContext } from '../../Context/GlobalContext';

export const Dashboard = () => {
  const {emojiClicks, incrementEmojiClick } = useContext(GlobalContext); // Acessar o contexto global
  return (
    <div>

    </div>
  )
}

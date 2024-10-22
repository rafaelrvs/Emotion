import React, { useState } from 'react';
import Select from 'react-select';
import styles from "./HomePergunta.module.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
const emotiOptionList = [
  { id: 1, emocao: "feliz", url: "/public/emogi/feliz.png" },
  { id: 2, emocao: "alegre", url: "/public/emogi/Alegre.png" },
  { id: 3, emocao: "apaixonado", url: "/public/emogi/apaixonado.png" },
  { id: 4, emocao: "assustado", url: "/public/emogi/assustado.png" },
  { id: 5, emocao: "bravo", url: "/public/emogi/bravo.png" },
  { id: 6, emocao: "cansado", url: "/public/emogi/Cansado.png" },
  { id: 7, emocao: "chocado", url: "/public/emogi/Chocado.png" },
  { id: 8, emocao: "decepcionado", url: "/public/emogi/Decepcionado.png" },
  { id: 9, emocao: "empolgado", url: "/public/emogi/Empolgado.png" },
  { id: 10, emocao: "envergonhado", url: "/public/emogi/Envergonhado.png" },
  { id: 11, emocao: "grato", url: "/public/emogi/Grato.png" },
  { id: 12, emocao: "nervoso", url: "/public/emogi/Nervoso.png" },
  { id: 13, emocao: "orgulhoso", url: "/public/emogi/Orgulhoso.png" },
  { id: 14, emocao: "surpreso", url: "/public/emogi/Surpreso.png" },
  { id: 15, emocao: "triste", url: "/public/emogi/triste.png" }
];

export const HomePergunta = () => {
  
  let Personagem = "/public/personagem/diana.webp";
  const [conversa, setConversa] = useState("Como você está se sentindo hoje? Escolha o emoticon que melhor te representa 🤩.");
  const [imagemEscolhida, setImagemEscolhida] = useState("");

  // Função para lidar com a chamada da AI
  function selectImage() {
    activeAi(imagemEscolhida);
  }
  async function activeAi() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `meu emoticon escolhido hoje que representa nmeu sentimento é ${imagemEscolhida}` }],
        },
        {
          role: "model",
          parts: [{ text: "Você tem que agir como piscologo e um assistente muito efetivo e prestativo, gosta de ajudar e responder com emoticons, deve tratar a pessoa bem, com resposta rapida e acertiva?" }],
        },
      ],
    });
    let result = await chat.sendMessage(`meu emoticon escolhido hoje que representa nmeu sentimento é ${imagemEscolhida}`);
    setConversa(result.response.text());

}
  return (
    <div className={styles.ContainerMain}>
      <div className={styles.bubble}>
        <p className={styles.conversa}>{conversa}</p>
        <div className={styles.triangle}></div>
      </div>
      <img className={styles.Personagem} src={Personagem} alt="Personagem" />

      <div className={styles.selectEmogi}>
        {emotiOptionList.map((emoti) => (
          <img
            key={emoti.emocao}
            className={`${styles.emoti} ${imagemEscolhida === emoti.emocao ? styles.selected : ''}`} // Adiciona a classe 'selected' se for o escolhido
            src={emoti.url}
            alt={emoti.emocao}
            onClick={() => setImagemEscolhida(emoti.emocao)}  // Atualiza a emoção quando clicado
          />
        ))}
      </div>

      <input 
        className={styles.btnSub} 
        type="submit" 
        value="Enviar" 
        onClick={selectImage}  // Chama a função corretamente no clique
      />
    </div>
  );
};

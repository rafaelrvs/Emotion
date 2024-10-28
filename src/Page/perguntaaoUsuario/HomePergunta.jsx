import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import styles from "./HomePergunta.module.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Popup } from '../../Components/PopUp/Popup';
const emotiOptionList = [
  { id: 1, emocao: "Feliz", url: "/public/emogi/feliz.png" },
  { id: 2, emocao: "Alegre", url: "/public/emogi/Alegre.png" },
  { id: 3, emocao: "Apaixonado", url: "/public/emogi/apaixonado.png" },
  { id: 4, emocao: "Assustado", url: "/public/emogi/assustado.png" },
  { id: 5, emocao: "Bravo", url: "/public/emogi/bravo.png" },
  { id: 6, emocao: "Cansado", url: "/public/emogi/Cansado.png" },
  { id: 7, emocao: "Chocado", url: "/public/emogi/Chocado.png" },
  { id: 8, emocao: "Decepcionado", url: "/public/emogi/Decepcionado.png" },
  { id: 9, emocao: "Empolgado", url: "/public/emogi/Empolgado.png" },
  { id: 10, emocao: "Envergonhado", url: "/public/emogi/Envergonhado.png" },
  { id: 11, emocao: "Grato", url: "/public/emogi/Grato.png" },
  { id: 12, emocao: "Nervoso", url: "/public/emogi/Nervoso.png" },
  { id: 13, emocao: "Orgulhoso", url: "/public/emogi/Orgulhoso.png" },
  { id: 14, emocao: "Surpreso", url: "/public/emogi/Surpreso.png" },
  { id: 15, emocao: "Triste", url: "/public/emogi/triste.png" }
];

export const HomePergunta = () => {
  
  let logo = "/public/icons/logo preto.png";
  const [imagemEscolhida, setImagemEscolhida] = useState("");
  const [animacao, setAnimacao] = useState(false);
useEffect(()=>{
  if(imagemEscolhida ==="ativo"){
    setTimeout(()=>{
      setAnimacao(false)
    },2000)
    setAnimacao(true)
  }
},[imagemEscolhida])

function handleClick(emoti){
  setImagemEscolhida(emoti);
}

  
 
  return (
    <div className={styles.Container}>
      <div className={styles.ContainerMain}>
        <img className={styles.logo} src={logo} alt="logo" />

          <p className={styles.conversa}>Como você está se sentindo hoje?</p>
        <div className={styles.selectEmogi}>
          {emotiOptionList.map((emoti) => (
            <div className={styles.containerEmoti}>
              <img
                key={emoti.emocao}
                className={`${styles.emoti} ${imagemEscolhida === emoti.emocao ? styles.fade : ''}`} 
                src={emoti.url}
                alt={emoti.emocao}
                onClick={() => handleClick(emoti.emocao)} 
                />
              <img className={animacao? styles.comemoracao:styles.comemoracaoFalse} src="public/icons/confete.gif" alt="comemoração" />
              <p>{emoti.emocao}</p>
              </div>
          ))}
        </div>{
          imagemEscolhida && imagemEscolhida !=="desativo"&& imagemEscolhida !=="ativo"?
          <Popup emocao={imagemEscolhida} setImagemEscolhida={setImagemEscolhida}/>:""
        }
      </div>
    </div>
  );
};

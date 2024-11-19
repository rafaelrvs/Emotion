import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from "./HomePergunta.module.css";
import { Popup } from '../../Components/PopUp/Popup';
import emotiOptionList from '@/data/data.js';


export const HomePergunta = () => {
  const logo = "/icons/logo preto.png";
  const [imagemEscolhida, setImagemEscolhida] = useState("");
  const [animacao, setAnimacao] = useState(false);
  const [emocaoData, setEmocaoData] = useState([]);
  const [emocaoID, setEmocaoID] = useState("");

  const fetchData = () => {
    console.log(emocaoID);
    
    if (emocaoID) {
      axios.post('https://clima.amalfis.com.br/api/usuario_emocao', { sentimento_id: emocaoID })
        .then(response => {
          setEmocaoData(response.data);
          console.log(response.data);
        })
        .catch(error => {
          console.error('Erro ao buscar os dados:', error);
        });
    }
  };

  useEffect(() => {
    if (imagemEscolhida === "ativo") {
      setAnimacao(true);
      fetchData();
      setTimeout(() => {
        setAnimacao(false);
      }, 2000);
    }
  }, [imagemEscolhida]);

  // Função para lidar com o clique em um emoji
  const handleClick = (emoti) => {
    setEmocaoID(emoti.id);
    setImagemEscolhida(emoti.emocao);
  };

  return (
    <div className={styles.Container}>
      <div className={styles.ContainerMain}>
        <img className={styles.logo} src={logo} alt="logo" />
        <p className={styles.conversa}>Como você está se sentindo hoje?</p>
        <div className={styles.selectEmogi}>
          {emotiOptionList.map((emoti) => (
            <div key={emoti.id} className={styles.containerEmoti}>
              <img
                className={`${styles.emoti} ${imagemEscolhida === emoti.emocao ? styles.fade : ''}`} 
                src={emoti.url}
                alt={emoti.emocao}
                onClick={() => handleClick(emoti)} 
              />
              {animacao && (
                <img className={styles.comemoracao} src="/icons/confete.gif" alt="comemoração" />
              )}
              <p>{emoti.emocao}</p>
            </div>
          ))}
        </div>
        {imagemEscolhida && imagemEscolhida !== "desativo" && imagemEscolhida !== "ativo" && (
          <Popup emocao={imagemEscolhida} setImagemEscolhida={setImagemEscolhida} />
        )}
      </div>
    </div>
  );
};

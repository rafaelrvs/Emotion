import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';
import emotiOptionList from '../../data/data';

export const Dashboard = () => {
  const [emocaoData, setEmocaoData] = useState([]);
  const [rankingEmocoes, setRankingEmocoes] = useState([]);

  useEffect(() => {
    // Função para buscar dados da API
    const fetchData = () => {
      axios.get('http://localhost:8080/api/usuario_emocao')
        .then(response => {
          setEmocaoData(response.data); 
          verificaMaisVotados(response.data); // Chama a função com os dados atualizados
        })
        .catch(error => {
          console.error('Erro ao buscar os dados:', error);
        });
    };

    // Função para verificar as três emoções mais votadas
    const verificaMaisVotados = (data) => {
      // Contar as ocorrências de cada sentimento_id
      const contagem = data.reduce((acc, item) => {
        acc[item.sentimento_id] = (acc[item.sentimento_id] || 0) + 1;
        return acc;
      }, {});

      // Converter o objeto contagem em um array e ordenar por frequência
      const ordenadoPorFrequencia = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1]) // Ordena do mais frequente para o menos frequente
        .slice(0, 3); // Pega os três primeiros

      // Mapear os IDs ordenados para encontrar os nomes e imagens das emoções em emotiOptionList
      const ranking = ordenadoPorFrequencia.map(([sentimento_id, count]) => {
        const emocao = emotiOptionList.find(item => item.id === sentimento_id);
        return {
          nome: emocao ? emocao.emocao : "Indefinido",
          url: emocao ? emocao.url : "",
          count
        };
      });

      // Atualizar o estado com o ranking das três emoções mais votadas
      setRankingEmocoes(ranking);
    };
    
    fetchData();
    
    const intervalId = setInterval(fetchData, 43200000);
    
    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);

  }, []); 

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <h2 className={styles.h2Ranking}>Ranking de sentimentos</h2>
        <div className={styles.messageBox}>
          <p className={styles.messageText}>O pessoal está</p>
          <div className={styles.triangle}></div>
        </div>
        <div className={styles.containerRanking}>
          {rankingEmocoes.map((item, index) => (
            <div key={index} className={styles.emojiWrapper}>
              <img
                src={item.url}
                alt={item.nome}
                className={styles.emojiImage}
              />
              <div className={`${styles.bar} ${styles[`bar${index + 1}`]}`} style={{ width: `${item.count * 10}%` }}></div>
              <p className={styles.ranking}>{item.nome} ({item.count} votos)</p>
            </div>
          ))}
        </div>
        <img src={"/public/personagem/di.png"} alt="personagem" className={styles.characterImage} />
      </div>
    </div>
  );
};

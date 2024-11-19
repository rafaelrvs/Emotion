import React, { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from './Dashboard.module.css';
import emotiOptionList from '@/data/data.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const [emocaoData, setEmocaoData] = useState([]); // Dados de emoções recebidos
  const [rankingEmocoes, setRankingEmocoes] = useState([]); // Ranking das emoções
  const [geminiResponse, setGeminiResponse] = useState(""); // Resposta gerada pelo modelo Gemini AI

  // **WebSocket**
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//clima.amalfis.com.br:8000`);

    socket.onopen = () => {
      console.log('Conectado ao WebSocket');
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Dados recebidos do WebSocket:', data);

        if (data.type === 'novo_cadastro') {
          setEmocaoData((prevData) => [...prevData, data.data]);
        }
      } catch (error) {
        console.error('Erro ao processar dados do WebSocket:', error);
      }
    };

    socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };

    return () => socket.close();
  }, []);

  // **Atualização de Dados em Tempo Real**
  useEffect(() => {
    const updateRanking = (data) => {
      const contagem = data.reduce((acc, item) => {
        acc[item.sentimento_id] = (acc[item.sentimento_id] || 0) + 1;
        return acc;
      }, {});

      const ordenadoPorFrequencia = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const ranking = ordenadoPorFrequencia.map(([sentimento_id, count], index) => {
        const emocao = emotiOptionList.find((item) => item.id === sentimento_id);
        return {
          nome: emocao ? emocao.emocao : 'Indefinido',
          url: emocao ? emocao.url : '',
          count,
          position: index === 0 ? 'center' : index === 1 ? 'right' : 'left', // Define a posição
        };
      });

      setRankingEmocoes(ranking);
    };

    updateRanking(emocaoData);
  }, [emocaoData]);

  // **Busca inicial na API**
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://clima.amalfis.com.br/api/usuario_emocao');
        const data = await response.json();

        const today = new Date().toISOString().split('T')[0];
        const filteredData = data.filter((item) => {
          const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
          return itemDate === today;
        });

        setEmocaoData(filteredData);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Atualiza a cada 1 minuto

    return () => clearInterval(intervalId);
  }, []);

  // **Preparação dos Dados para os Gráficos**
  const graphData = emocaoData.reduce((acc, item) => {
    const emocao = emotiOptionList.find((e) => e.id === item.sentimento_id);
    if (emocao) {
      acc[emocao.emocao] = (acc[emocao.emocao] || 0) + 1;
    }
    return acc;
  }, {});

  const chartData = Object.entries(graphData).map(([name, count]) => ({ name, count }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8A2BE2', '#FF6347'];

  const renderCustomizedLabel = ({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`;

  // **Renderização do Componente**
  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <h2 className={styles.h2Ranking}>Ranking de sentimentos</h2>
        <div className={styles.containerGraficoEmoti}>
          <div className={styles.containerRanking}>
            {rankingEmocoes.map((item, index) => (
              <div
                key={index}
                className={`${styles.emojiWrapper} ${item.position === 'center' ? styles.center : item.position === 'right' ? styles.right : styles.left}`}
              >
                <div className={styles.itemContainerRanking}>
                  <div className={styles.emoti}>
                    <img src={item.url} alt={item.nome} className={styles.emojiImage} />
                  </div>
                  <div className={`${styles.bar} ${styles[`bar${index + 1}`]}`} style={{ width: `${item.count * 10}%` }}></div>
                  <p className={styles.ranking}>{item.nome} <br /> ({item.count} votos)</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.containerGrafico}>
            <div className={styles.chart1}>
              <BarChart width={900} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#5b55cc" />
              </BarChart>
            </div>
            <div className={styles.chart}>
              <PieChart width={900} height={450}>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label={renderCustomizedLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        </div>
        <div className={styles.containerRobo}>
          <div className={styles.messageBox}>
            <p className={styles.messageText}>{geminiResponse}</p>
            <div className={styles.triangle}></div>
          </div>
          <img src="/personagem/di.png" alt="personagem" className={styles.characterImage} />
        </div>
      </div>
    </div>
  );
};

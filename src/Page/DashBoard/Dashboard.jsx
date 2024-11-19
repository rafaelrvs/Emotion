import React, { useEffect, useState, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import styles from './Dashboard.module.css';
import emotiOptionList from '@/data/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const [emocaoData, setEmocaoData] = useState([]);
  const [rankingEmocoes, setRankingEmocoes] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState("");

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//clima.amalfis.com.br/ws/`);
  
    socket.onopen = () => {
      console.log('Conectado ao WebSocket');
    };
  
    socket.onmessage = async (event) => {
      try {
        let data;
    
        if (event.data instanceof Blob) {
          const text = await event.data.text(); // Converte o Blob em texto
          data = JSON.parse(text);
        } else {
          data = JSON.parse(event.data); // Parse direto se não for Blob
        }
        
        console.log('Dados recebidos:', data);

        if (data.type === "novo_cadastro" && data.data) {
          setEmocaoData((prevData) => [...prevData, data.data]); // Atualiza `emocaoData` diretamente
        }
      } catch (error) {
        console.error('Erro ao processar dados do WebSocket:', error);
      }
    };
  
    socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };
  
    return () => socket.close(); // Fecha o WebSocket ao desmontar o componente
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://clima.amalfis.com.br/api/usuario_emocao');
        const data = await response.json();

        // Filtrar os dados para incluir apenas aqueles com data de hoje
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const filteredData = data.filter(item => {
          const itemDate = new Date(item.createdAt).toISOString().split('T')[0]; // Certifique-se de que `createdAt` é a chave correta para a data
          return itemDate === today;
        });

        setEmocaoData(filteredData);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 43200000); // Atualiza a cada 12 horas

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const calculaRanking = async (data) => {
      const contagem = data.reduce((acc, item) => {
        acc[item.sentimento_id] = (acc[item.sentimento_id] || 0) + 1;
        return acc;
      }, {});

      const ordenadoPorFrequencia = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const ranking = ordenadoPorFrequencia.map(([sentimento_id, count]) => {
        const emocao = emotiOptionList.find(item => item.id === sentimento_id);
        return {
          nome: emocao ? emocao.emocao : "Indefinido",
          url: emocao ? emocao.url : "",
          count
        };
      });

      const valorPrompt = ranking.map((item) => `${item.count} votos para ${item.nome}`);
      const prompt = `De acordo com o ranking, como estão os colaboradores de minha empresa? Defina pela quantidade de votos: ${valorPrompt}`;

      //const geminiResponseText = await fetchGeminiChatResponse(prompt);
      //setGeminiResponse(geminiResponseText);

      if (ranking.length > 1) {
        [ranking[0], ranking[1]] = [ranking[1], ranking[0]];
      }

      setRankingEmocoes(ranking);
    };

    calculaRanking(emocaoData);
  }, [emocaoData]);

  async function fetchGeminiChatResponse(userMessage) {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); 
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
          {
            role: 'model',
            parts: [{ text: "Você é um analista de sentimentos e deve analisar qual é o sentimento da empresa e responder em uma linha" }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
        },
      });

      const result = await chat.sendMessage(userMessage);
      return result.response.text();
    } catch (error) {
      console.error("Erro ao buscar dados do Gemini:", error.message);
      return "Erro ao gerar resposta.";
    }
  }

  const chartData = useMemo(() => {
    const graphData = emocaoData.reduce((acc, item) => {
      const emocao = emotiOptionList.find(e => e.id === item.sentimento_id);
      if (emocao) {
        acc[emocao.emocao] = (acc[emocao.emocao] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(graphData).map(([name, count]) => ({ name, count }));
  }, [emocaoData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8A2BE2', '#FF6347'];

  const renderCustomizedLabel = ({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`;

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <h2 className={styles.h2Ranking}>Ranking de sentimentos</h2>
        <div className={styles.containerGraficoEmoti}>
          <div className={styles.containerRanking}>
            {rankingEmocoes.map((item, index) => (
              <div
                key={index}
                className={`${styles.emojiWrapper} ${index === 0 ? styles.center : index === 1 ? styles.right : styles.left}`}
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

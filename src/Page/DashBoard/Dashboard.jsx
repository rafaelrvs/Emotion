import React, { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from './Dashboard.module.css';
import emotiOptionList from '@/data/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const [emocaoData, setEmocaoData] = useState([]);
  const [rankingEmocoes, setRankingEmocoes] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [bdState, setBdState] = useState(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//clima.amalfis.com.br:8000`);

    socket.onopen = () => {
      console.log('Conectado ao WebSocket');
    };

    socket.onmessage = async (event) => {
      try {
        let data;
        if (event.data instanceof Blob) {
          const text = await event.data.text();
          data = JSON.parse(text);
        } else {
          data = JSON.parse(event.data);
        }
        console.log('Dados recebidos:', data);
        setBdState(data);
      } catch (error) {
        console.error('Erro ao processar dados do WebSocket:', error);
      }
    };

    socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/usuario_emocao');
        const data = await response.json();

        const today = new Date().toISOString().split('T')[0];
        const filteredData = data.filter(item => {
          const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
          return itemDate === today;
        });

        setEmocaoData(filteredData);
        processRanking(filteredData);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    const processRanking = async (data) => {
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
          nome: emocao?.emocao || "Indefinido",
          url: emocao?.url || "",
          count,
        };
      });

      const valorPrompt = ranking.map(item => `${item.count} votos para ${item.nome}`).join(", ");
      const prompt = `De acordo com o ranking, como estão os colaboradores de minha empresa? Defina pela quantidade de votos: ${valorPrompt}`;
      const geminiResponseText = await fetchGeminiChatResponse(prompt);

      setGeminiResponse(geminiResponseText);
      setRankingEmocoes(ranking);
    };

    fetchData();
    const intervalId = setInterval(fetchData, 43200000);

    return () => clearInterval(intervalId);
  }, [bdState]);

  const fetchGeminiChatResponse = async (userMessage) => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.startChat({
        history: [
          { role: 'user', content: userMessage },
          { role: 'model', content: "Você é um analista de sentimentos e deve analisar qual é o sentimento da empresa e responder em uma linha" },
        ],
        generationConfig: { maxOutputTokens: 100 },
      });

      const response = await result.response();
      return response.text();
    } catch (error) {
      console.error("Erro ao buscar dados do Gemini:", error.message);
      return "Erro ao gerar resposta.";
    }
  };

  const graphData = emocaoData.reduce((acc, item) => {
    const emocao = emotiOptionList.find(e => e.id === item.sentimento_id);
    if (emocao) {
      acc[emocao.emocao] = (acc[emocao.emocao] || 0) + 1;
    }
    return acc;
  }, {});

  const chartData = Object.entries(graphData).map(([name, count]) => ({ name, count }));
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
          <div className={styles.containerRobo}>
            <div className={styles.messageBox}>
              <p className={styles.messageText}>{geminiResponse}</p>
              <div className={styles.triangle}></div>
            </div>
            <img src="/personagem/di.png" alt="personagem" className={styles.characterImage} />
          </div>
        </div>
      </div>
    </div>
  );
};

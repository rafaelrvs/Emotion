import React, { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Biblioteca para interagir com o Gemini AI
import styles from './Dashboard.module.css'; // Estilo específico para o componente
import emotiOptionList from '@/data/data.js'; // Lista de opções de emoções
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'; // Biblioteca para gráficos

export const Dashboard = () => {
  // **Estados**
  const [emocaoData, setEmocaoData] = useState([]); // Dados de emoções recebidos
  const [rankingEmocoes, setRankingEmocoes] = useState([]); // Ranking das emoções
  const [geminiResponse, setGeminiResponse] = useState(""); // Resposta gerada pelo modelo Gemini AI
  const [bdState, setBdState] = useState(null); // Estado intermediário para dados recebidos em tempo real

  // **WebSocket**
  useEffect(() => {
    const socket = new WebSocket('ws://clima.amalfis.com.br:8000'); // Conexão com o WebSocket

    // Evento de conexão aberta
    socket.onopen = () => {
      console.log('Conectado ao WebSocket');
    };

    // Evento de recebimento de mensagens
    socket.onmessage = async (event) => {
      try {
        let data;

        if (event.data instanceof Blob) {
          const text = await event.data.text(); // Converte o Blob em texto
          data = JSON.parse(text);
        } else {
          data = JSON.parse(event.data); // Parse direto se não for Blob
        }

        console.log('Dados recebidos do WebSocket:', data);

        // Atualiza o estado `emocaoData` com os novos dados
        if (data.type === 'novo_cadastro') {
          setEmocaoData((prevData) => [...prevData, data.data]);
        }
      } catch (error) {
        console.error('Erro ao processar dados do WebSocket:', error);
      }
    };

    // Evento de conexão fechada
    socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };

    // Fecha o WebSocket quando o componente for desmontado
    return () => socket.close();
  }, []);

  // **Atualização de Dados em Tempo Real**
  useEffect(() => {
    const verificaMaisVotados = (data) => {
      const contagem = data.reduce((acc, item) => {
        acc[item.sentimento_id] = (acc[item.sentimento_id] || 0) + 1; // Conta votos por sentimento_id
        return acc;
      }, {});

      const ordenadoPorFrequencia = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1]) // Ordena pelo número de votos
        .slice(0, 3); // Seleciona os 3 mais votados

      const ranking = ordenadoPorFrequencia.map(([sentimento_id, count]) => {
        const emocao = emotiOptionList.find((item) => item.id === sentimento_id);
        return {
          nome: emocao ? emocao.emocao : 'Indefinido',
          url: emocao ? emocao.url : '',
          count,
        };
      });

      setRankingEmocoes(ranking);
    };

    // Processar dados para gráficos
    const graphData = emocaoData.reduce((acc, item) => {
      const emocao = emotiOptionList.find((e) => e.id === item.sentimento_id);
      if (emocao) {
        acc[emocao.emocao] = (acc[emocao.emocao] || 0) + 1; // Conta emoções para os gráficos
      }
      return acc;
    }, {});

    const chartData = Object.entries(graphData).map(([name, count]) => ({
      name,
      count,
    }));

    // Atualizar rankings e gráficos
    verificaMaisVotados(emocaoData);
  }, [emocaoData]);

  // **Inicialização e Atualização Periódica**
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://clima.amalfis.com.br/api/usuario_emocao');
        const data = await response.json();

        // Filtra dados por data de hoje
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const filteredData = data.filter((item) => {
          const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
          return itemDate === today;
        });

        setEmocaoData(filteredData); // Atualiza o estado com os dados filtrados
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    fetchData(); // Busca inicial
    const intervalId = setInterval(fetchData, 43200000); // Atualiza a cada 12 horas

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
  }, []);

  // **Requisição ao Gemini AI**
  async function fetchGeminiChatResponse(userMessage) {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); // Configuração do modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    try {
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();
      return text; // Retorna a resposta do Gemini
    } catch (error) {
      console.error("Erro ao buscar dados do Gemini:", error.message);
      return "Erro ao gerar resposta.";
    }
  }

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
          {/* Renderização dos Rankings */}
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

          {/* Renderização dos Gráficos */}
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

        {/* Mensagem do Gemini */}
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

import React, { useEffect, useState, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from './Dashboard.module.css';
import emotiOptionList from '@/data/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const [emocaoData, setEmocaoData] = useState([]);
  const [rankingEmocoes, setRankingEmocoes] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [messageActive, setMessageActive] = useState(false);
  const [error, setError] = useState(false);

  function reloadTask() {
    console.log("Reload executado em:", new Date());
   
  }
  

  const interval = 5 * 60 * 1000;
  
  setInterval(reloadTask, interval);

  useEffect(() => {

    if (geminiResponse === "") {
      setMessageActive(true)

    }
    setTimeout(() => {
      setMessageActive(true)

    }, 15000)
    setMessageActive(false)

  }, [emocaoData])
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
   // const socket = new WebSocket(`${protocol}//localhost:3000/ws/`);
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
        //const response = await fetch('http://localhost:8080/api/usuario_emocao');
        const response = await fetch('https://clima.amalfis.com.br/api/usuario_emocao');
        const data = await response.json();
        
        // Filtrar os dados para incluir apenas aqueles com data de hoje
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const filteredData = data.filter(item => {
          const itemDate = new Date(item.createdAt).toISOString().split('T')[0]; // Certifique-se de que `createdAt` é a chave correta para a data
          setError(false)
          return itemDate === today;
        });
        
        setEmocaoData(filteredData);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
        setError(true)
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

      if (ranking === ranking) {

        setGeminiResponse("Como você está se sentindo hoje?")

      }

      if (ranking.length > 1) {
        [ranking[0], ranking[1]] = [ranking[1], ranking[0]];
      }

      setRankingEmocoes(ranking);
    };


    calculaRanking(emocaoData);
  }, [emocaoData]);


  // async function fetchGeminiChatResponse(userMessage) {
  //   const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); 
  //   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  //   try {
  //     const chat = model.startChat({
  //       history: [
  //         {
  //           role: 'user',
  //           parts: [{ text: userMessage }],
  //         },
  //         {
  //           role: 'model',
  //           parts: [{ text: "Você é um analista de sentimentos e deve analisar qual é o sentimento da empresa e responder em uma linha" }],
  //         },
  //       ],
  //       generationConfig: {
  //         maxOutputTokens: 100,
  //       },
  //     });

  //     const result = await chat.sendMessage(userMessage);
  //     return result.response.text();
  //   } catch (error) {
  //     console.error("Erro ao buscar dados do Gemini:", error.message);
  //     return "Erro ao gerar resposta.";
  //   }
  // }

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

      <h2 className={styles.h2Ranking}>Como você está se sentindo ?</h2>
      {error?<p className={styles.zeroVoto}>Me conte, como você está hoje?</p>:<>
      <div className={styles.subContainer}>
       
        <div className={styles.containerRanking}>
       <>
            {rankingEmocoes.map((item, index) => (
              <div
              key={index}
                className={`${styles.emojiWrapper} ${index === 0 ? styles.center : index === 1 ? styles.right : styles.left}`}
                >
                <div className={styles.itemContainerRanking}>
                  <div className={styles.emoti}>
                    <img
                      src={item.url}
                      alt={item.nome}
                      className={`${styles.emojiImage} ${styles[`animation${index + 1}`]}`}
                      />
                  </div>
                  <div className={`${styles.bar} ${styles[`bar${index + 1}`]}`}></div>
                  <p className={styles.ranking}>{item.nome} <br /> ({item.count} votos)</p>
                </div>
                
              </div>
              
            ))
            }
              </>
              <div className={styles.containerRobo}>
          <div className={messageActive ? styles.messageBoxDisable : styles.messageBox}>
            <p className={messageActive ? styles.messagetextDisable : styles.messageText}>{geminiResponse}</p>

          </div>
          <img src="/personagem/di.png" alt="personagem" className={styles.characterImage} />
        </div>
          </div>
          
        <div className={styles.containerGraficoEmoti}>
   
            <div className={styles.chart}>
      <ResponsiveContainer width="100%" height={750}>
        <PieChart >
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={250}
            fill="#8884d8"
            label={renderCustomizedLabel}
            >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
        </ResponsiveContainer>
        
      </div>
      
      <div className={styles.containerGrafico}>
            <div className={styles.chart1}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#5b55cc" />
                </BarChart>
              </ResponsiveContainer>
            </div>



          </div>
        </div>

      </div>
</>
}
    </div >
  );
};

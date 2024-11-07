import styles from"./Popup.module.css"
import React from 'react'
export const Popup = ({emocao,setImagemEscolhida,emocaoID}) => {

 
    

  return (
    <div className={styles.popUp}>
        Você está {emocao} hoje?
        <div>

        <button className={styles.btn2} onClick={()=>{setImagemEscolhida("desativo")}}>Não</button>
        <button className={styles.btn1} onClick={()=>{setImagemEscolhida("ativo")}}>Sim</button>
        </div>
    </div>
  )
}

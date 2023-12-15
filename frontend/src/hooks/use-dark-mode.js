  
import { useState } from 'react'

const data = localStorage ? JSON.parse(localStorage.getItem('darkMode')) : false;

export default function useDarkMode(){

    const [ darkMode, setSaveDarkMode ] = useState(data);
    // Salva no storage uma atualizacao do modo dark
    function setDarkMode(value){
        localStorage && localStorage.setItem('darkMode', JSON.stringify(value) );
        setSaveDarkMode(value);
    }

    return [darkMode, setDarkMode ];

}
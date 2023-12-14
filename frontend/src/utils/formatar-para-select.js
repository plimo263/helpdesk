

// Funcao para formatar ao select
export default function formatarParaSelect(arr, concatRotulo = ''){
    const newArr = arr.map((ele)=>({
         label: `${Array.isArray(ele) ? ele[1] : ele}${concatRotulo}`,
         value: Array.isArray(ele) ? ele[0] : ele,
         key: Array.isArray(ele) ? ele[0] : ele,
    }))
    return newArr;
}
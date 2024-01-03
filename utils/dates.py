

class DateFormat:

    def __init__(self) -> None:
        self.__months = meses = [ 
            "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", 
            "JUL", "AGO", "SET", "OUT", "NOV", "DEZ" 
        ]

    def map_month(self, month: int):
        ''' Recebe um inteiro para identificar qual mês informado e retorna 
        a sigla do mês solicitado.
        
        Parameters:
            mes: O identificador do mês
        
        Examples:
            >>> d = DateFormat()
            >>> d.map_month(1)
            "JAN"
        '''

        return self.__months[month - 1]

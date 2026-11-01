# Pianificazione delle consegne di Laerte Antico Forno

 Project Work 23, Informatica per le Aziende Digitali (L-31).

Il programma cerca i percorsi di consegna più corti partendo dal deposito di Laterza verso cinque clienti (Ginosa, Castellaneta, Palagianello, Santeramo in Colle, Matera) e confronta i costi di due scenari:

- Scenario A: un solo furgone grande (Iveco Daily 50C, 2000 kg) che serve tutti i clienti (TSP)
- Scenario B: due furgoni piccoli uguali (Fiat Doblò Maxi, 900 kg ciascuno) che si dividono i clienti (VRP)

La merce da consegnare è 1500 kg, quindi nello scenario B un furgone da solo non basta e servono tutti e due.

## Cartelle e file

```
progetto_consegne/
    consegne.py          programma principale
    dati/
        localita.json    deposito e clienti con coordinate e kg da consegnare
        distanze.json    km tra i paesi, per ogni partenza (Google Maps)
        parametri.json   prezzi, dati del viaggio e dei furgoni
    pagina/
        index.html       pagina con i risultati
        stile.css        grafica della pagina
        grafici.js       tabelle, grafi dei percorsi e grafici dei costi
        risultati.js     creato da consegne.py
```

## Come si usa

Serve Python 3, senza librerie da installare (`itertools` e `json` ci sono già).

1. Aprire il terminale nella cartella `progetto_consegne`
2. Lanciare `python consegne.py`
3. Aprire `pagina/index.html` con il browser (basta il doppio clic)

I grafici usano la libreria Chart.js presa da internet, quindi per vederli serve la connessione.

Se si cambia un valore nei file della cartella `dati` basta rilanciare `python consegne.py` e ricaricare la pagina.

## Come funziona il programma

Scenario A: il programma prova tutti gli ordini possibili dei 5 clienti (5! = 120 giri), ognuno parte e torna a Laterza, e tiene quello con meno km.

Scenario B: ogni cliente può andare sul furgone 1 o sul furgone 2, quindi ci sono 2^5 = 32 modi di dividerli. Il programma scarta le divisioni in cui un furgone resta vuoto o supera i 900 kg. Per quelle rimaste calcola il giro migliore di ciascun furgone con lo stesso metodo dello scenario A e tiene la divisione con il totale di km più basso.

I costi considerati sono il noleggio giornaliero, il gasolio (km / consumo x prezzo), l'usura del mezzo per ogni km e la paga degli autisti per le ore di guida e scarico. Poi il programma cambia un prezzo alla volta (gasolio, paga dell'autista, noleggio del furgone piccolo) per trovare il valore in cui i due scenari costano uguale.

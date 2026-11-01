# Project Work 23 - Pianificazione delle consegne di un panificio di Laterza
# Il programma legge i dati dalla cartella "dati", cerca il percorso migliore
# provando tutte le possibilita' (enumerazione completa) e confronta i costi
# di due scenari:
#   Scenario A: un solo furgone grande che passa da tutti i clienti (TSP)
#   Scenario B: due furgoni piccoli uguali che si dividono i clienti (VRP)
# Alla fine scrive il file pagina/risultati.js che viene letto dalla pagina HTML.

import itertools
import json

# ---------------------------------------------------------------
# LETTURA DEI DATI
# ---------------------------------------------------------------

def leggi_json(nome_file):
    file = open(nome_file, "r", encoding="utf-8")
    contenuto = json.load(file)
    file.close()
    return contenuto

def leggi_localita(nome_file):
    # nelle liste il deposito ha il numero 0, i clienti da 1 a 5
    dati = leggi_json(nome_file)
    deposito = dati["deposito"]
    nomi = [deposito["nome"]]
    latitudini = [deposito["latitudine"]]
    longitudini = [deposito["longitudine"]]
    quantita = [0]
    for cliente in dati["clienti"]:
        nomi.append(cliente["nome"])
        latitudini.append(cliente["latitudine"])
        longitudini.append(cliente["longitudine"])
        quantita.append(cliente["merce_da_consegnare_kg"])
    return nomi, latitudini, longitudini, quantita

def leggi_distanze(nome_file, nomi):
    # Trasformo le distanze scritte per nome in una matrice:
    # distanze[i][j] sono i km per andare dalla localita' i alla localita' j
    dati = leggi_json(nome_file)
    km_da = dati["partenza_da"]
    matrice = []
    for partenza in nomi:
        riga = []
        for arrivo in nomi:
            if partenza == arrivo:
                riga.append(0)
            elif partenza in km_da and arrivo in km_da[partenza]:
                riga.append(km_da[partenza][arrivo])
            else:
                print("ERRORE: in distanze.json manca la distanza da", partenza, "a", arrivo)
                exit()
        matrice.append(riga)
    return matrice

def leggi_parametri(nome_file):
    # Il file e' diviso in gruppi per essere piu' leggibile,
    # qui metto tutti i valori in un unico dizionario
    dati = leggi_json(nome_file)
    prezzi = dati["prezzi"]
    viaggio = dati["viaggio"]
    grande = dati["furgone_grande_scenario_a"]
    piccolo = dati["furgone_piccolo_scenario_b"]

    costi = {}
    costi["prezzo_gasolio"] = prezzi["gasolio_euro_al_litro"]
    costi["paga_autista"] = prezzi["paga_autista_euro_all_ora"]
    costi["velocita_media"] = viaggio["velocita_media_km_all_ora"]
    costi["minuti_scarico"] = viaggio["minuti_di_scarico_per_cliente"]
    costi["ora_partenza"] = viaggio["ora_di_partenza_dal_deposito"]

    costi["nome_furgone_grande"] = grande["modello"]
    costi["capacita_furgone_grande"] = grande["capacita_kg"]
    costi["noleggio_furgone_grande"] = grande["noleggio_euro_al_giorno"]
    costi["consumo_furgone_grande"] = grande["km_con_un_litro"]
    costi["usura_furgone_grande"] = grande["usura_euro_al_km"]

    costi["nome_furgone_piccolo"] = piccolo["modello"]
    costi["capacita_furgone_piccolo"] = piccolo["capacita_kg"]
    costi["noleggio_furgone_piccolo"] = piccolo["noleggio_euro_al_giorno"]
    costi["consumo_furgone_piccolo"] = piccolo["km_con_un_litro"]
    costi["usura_furgone_piccolo"] = piccolo["usura_euro_al_km"]
    return costi

# ---------------------------------------------------------------
# FUNZIONI SUI PERCORSI
# ---------------------------------------------------------------

def lunghezza_percorso(percorso, distanze):
    totale = 0
    for i in range(len(percorso) - 1):
        partenza = percorso[i]
        arrivo = percorso[i + 1]
        totale = totale + distanze[partenza][arrivo]
    return totale

def miglior_giro(clienti, distanze):
    # Prova tutti gli ordini possibili per visitare i clienti,
    # partendo e tornando sempre al deposito (nodo 0).
    # Restituisce il giro piu' corto e quanti giri ha provato.
    giro_migliore = []
    km_migliori = 999999
    giri_provati = 0
    for ordine in itertools.permutations(clienti):
        giro = [0]
        for cliente in ordine:
            giro.append(cliente)
        giro.append(0)
        km = lunghezza_percorso(giro, distanze)
        giri_provati = giri_provati + 1
        if km < km_migliori:
            km_migliori = km
            giro_migliore = giro
    return giro_migliore, km_migliori, giri_provati

def carico_totale(clienti, quantita):
    totale = 0
    for cliente in clienti:
        totale = totale + quantita[cliente]
    return totale

def ore_di_lavoro(km, numero_clienti, costi):
    ore_guida = km / costi["velocita_media"]
    ore_scarico = numero_clienti * costi["minuti_scarico"] / 60
    return ore_guida + ore_scarico

def scrivi_orario(ore):
    # trasforma per esempio 8.75 in "08:45"
    ore_intere = int(ore)
    minuti = int(round((ore - ore_intere) * 60))
    if minuti == 60:
        ore_intere = ore_intere + 1
        minuti = 0
    testo = str(ore_intere).zfill(2) + ":" + str(minuti).zfill(2)
    return testo

def nomi_del_giro(giro, nomi):
    testo = ""
    for i in range(len(giro)):
        if i > 0:
            testo = testo + " -> "
        testo = testo + nomi[giro[i]]
    return testo

# ---------------------------------------------------------------
# SCENARIO A: UN SOLO FURGONE (TSP)
# ---------------------------------------------------------------

def risolvi_scenario_a(clienti, quantita, distanze, costi):
    carico = carico_totale(clienti, quantita)
    if carico > costi["capacita_furgone_grande"]:
        print("ERRORE: il furgone grande non riesce a portare tutta la merce")
        return None

    giro, km, giri_provati = miglior_giro(clienti, distanze)
    ore = ore_di_lavoro(km, len(clienti), costi)

    scenario = {}
    scenario["giri"] = [giro]
    scenario["carichi"] = [carico]
    scenario["km_giri"] = [round(km, 1)]
    scenario["ore_giri"] = [round(ore, 2)]
    scenario["km_totali"] = round(km, 1)
    scenario["ore_totali"] = round(ore, 2)
    scenario["fine_consegne"] = scrivi_orario(costi["ora_partenza"] + ore)
    scenario["soluzioni_provate"] = giri_provati
    return scenario

# ---------------------------------------------------------------
# SCENARIO B: DUE FURGONI UGUALI (VRP)
# ---------------------------------------------------------------

def risolvi_scenario_b(clienti, quantita, distanze, costi):
    capacita = costi["capacita_furgone_piccolo"]
    migliore = None
    km_migliori = 999999
    divisioni_provate = 0
    divisioni_scartate = 0
    giri_provati = 0

    # Ogni cliente puo' andare sul furgone 1 o sul furgone 2.
    # Con 5 clienti le possibilita' sono 2 alla quinta = 32.
    for assegnazione in itertools.product([1, 2], repeat=len(clienti)):
        divisioni_provate = divisioni_provate + 1
        clienti_furgone_1 = []
        clienti_furgone_2 = []
        for i in range(len(clienti)):
            if assegnazione[i] == 1:
                clienti_furgone_1.append(clienti[i])
            else:
                clienti_furgone_2.append(clienti[i])

        # vincolo: tutti e due i furgoni devono partire
        if len(clienti_furgone_1) == 0 or len(clienti_furgone_2) == 0:
            divisioni_scartate = divisioni_scartate + 1
            continue

        # vincolo di capacita': nessun furgone puo' superare il suo carico massimo
        carico_1 = carico_totale(clienti_furgone_1, quantita)
        carico_2 = carico_totale(clienti_furgone_2, quantita)
        if carico_1 > capacita or carico_2 > capacita:
            divisioni_scartate = divisioni_scartate + 1
            continue

        giro_1, km_1, provati_1 = miglior_giro(clienti_furgone_1, distanze)
        giro_2, km_2, provati_2 = miglior_giro(clienti_furgone_2, distanze)
        giri_provati = giri_provati + provati_1 + provati_2

        if km_1 + km_2 < km_migliori:
            km_migliori = km_1 + km_2
            ore_1 = ore_di_lavoro(km_1, len(clienti_furgone_1), costi)
            ore_2 = ore_di_lavoro(km_2, len(clienti_furgone_2), costi)
            migliore = {}
            migliore["giri"] = [giro_1, giro_2]
            migliore["carichi"] = [carico_1, carico_2]
            migliore["km_giri"] = [round(km_1, 1), round(km_2, 1)]
            migliore["ore_giri"] = [round(ore_1, 2), round(ore_2, 2)]
            migliore["km_totali"] = round(km_1 + km_2, 1)
            migliore["ore_totali"] = round(ore_1 + ore_2, 2)
            # i due furgoni viaggiano insieme, quindi le consegne finiscono
            # quando torna il furgone che ci mette di piu'
            ore_piu_lunghe = max(ore_1, ore_2)
            migliore["fine_consegne"] = scrivi_orario(costi["ora_partenza"] + ore_piu_lunghe)

    if migliore is None:
        print("ERRORE: nessuna divisione dei clienti rispetta la capacita' dei furgoni")
        return None

    migliore["soluzioni_provate"] = giri_provati
    migliore["divisioni_provate"] = divisioni_provate
    migliore["divisioni_scartate"] = divisioni_scartate
    return migliore

# ---------------------------------------------------------------
# COSTI
# ---------------------------------------------------------------

def costo_scenario(scenario, tipo_furgone, costi):
    # tipo_furgone vale "grande" oppure "piccolo"
    numero_furgoni = len(scenario["giri"])
    km = scenario["km_totali"]
    ore = scenario["ore_totali"]

    noleggio = numero_furgoni * costi["noleggio_furgone_" + tipo_furgone]
    litri = km / costi["consumo_furgone_" + tipo_furgone]
    carburante = litri * costi["prezzo_gasolio"]
    usura = km * costi["usura_furgone_" + tipo_furgone]
    # ogni furgone ha il suo autista, quindi si pagano le ore di tutti e due
    autisti = ore * costi["paga_autista"]

    risultato = {}
    risultato["noleggio"] = round(noleggio, 2)
    risultato["carburante"] = round(carburante, 2)
    risultato["usura"] = round(usura, 2)
    risultato["autisti"] = round(autisti, 2)
    risultato["totale"] = round(noleggio + carburante + usura + autisti, 2)
    return risultato

def analisi_sensibilita(scenario_a, scenario_b, costi, voce, valore_minimo, valore_massimo, passo):
    # Cambia una voce di costo alla volta (le altre restano uguali)
    # e ricalcola il costo dei due scenari per ogni valore.
    costi_modificati = dict(costi)
    valori = []
    totali_a = []
    totali_b = []
    valore = valore_minimo
    while valore <= valore_massimo + 0.0001:
        costi_modificati[voce] = valore
        costo_a = costo_scenario(scenario_a, "grande", costi_modificati)
        costo_b = costo_scenario(scenario_b, "piccolo", costi_modificati)
        valori.append(round(valore, 2))
        totali_a.append(costo_a["totale"])
        totali_b.append(costo_b["totale"])
        valore = valore + passo

    # cerco il punto in cui cambia lo scenario piu' conveniente
    pareggio = None
    for i in range(1, len(valori)):
        prima_conviene_a = totali_a[i - 1] <= totali_b[i - 1]
        ora_conviene_a = totali_a[i] <= totali_b[i]
        if prima_conviene_a != ora_conviene_a:
            # tra i due valori i costi si incrociano: faccio una proporzione
            differenza_prima = totali_a[i - 1] - totali_b[i - 1]
            differenza_dopo = totali_a[i] - totali_b[i]
            frazione = differenza_prima / (differenza_prima - differenza_dopo)
            pareggio = round(valori[i - 1] + frazione * (valori[i] - valori[i - 1]), 2)

    analisi = {}
    analisi["voce"] = voce
    analisi["valori"] = valori
    analisi["totali_a"] = totali_a
    analisi["totali_b"] = totali_b
    analisi["pareggio"] = pareggio
    return analisi

# ---------------------------------------------------------------
# STAMPA A VIDEO
# ---------------------------------------------------------------

def stampa_scenario(titolo, scenario, costo, nomi):
    print(titolo)
    for i in range(len(scenario["giri"])):
        print("  Furgone", i + 1, ":", nomi_del_giro(scenario["giri"][i], nomi))
        print("     carico", scenario["carichi"][i], "kg -", scenario["km_giri"][i], "km -",
              scenario["ore_giri"][i], "ore")
    print("  Km totali:", scenario["km_totali"], " Ore di lavoro totali:", scenario["ore_totali"])
    print("  Ultimo furgone rientrato alle", scenario["fine_consegne"])
    print("  Costi: noleggio", costo["noleggio"], "| carburante", costo["carburante"],
          "| usura", costo["usura"], "| autisti", costo["autisti"])
    print("  COSTO TOTALE:", costo["totale"], "euro")
    print()

# ---------------------------------------------------------------
# PROGRAMMA PRINCIPALE
# ---------------------------------------------------------------

nomi, latitudini, longitudini, quantita = leggi_localita("dati/localita.json")
distanze = leggi_distanze("dati/distanze.json", nomi)
costi = leggi_parametri("dati/parametri.json")

# i clienti sono tutti i nodi tranne il deposito (che e' il numero 0)
clienti = []
for i in range(1, len(nomi)):
    clienti.append(i)

scenario_a = risolvi_scenario_a(clienti, quantita, distanze, costi)
scenario_b = risolvi_scenario_b(clienti, quantita, distanze, costi)

if scenario_a is None or scenario_b is None:
    print("Controlla i dati nella cartella dati: il problema non ha soluzione.")
    exit()

costo_a = costo_scenario(scenario_a, "grande", costi)
costo_b = costo_scenario(scenario_b, "piccolo", costi)

print("==============================================================")
print("  PIANIFICAZIONE CONSEGNE - deposito di", nomi[0])
print("  Merce da consegnare:", carico_totale(clienti, quantita), "kg")
print("==============================================================")
print()
stampa_scenario("SCENARIO A - un " + costi["nome_furgone_grande"], scenario_a, costo_a, nomi)
print("  Giri provati:", scenario_a["soluzioni_provate"])
print()
stampa_scenario("SCENARIO B - due " + costi["nome_furgone_piccolo"], scenario_b, costo_b, nomi)
print("  Divisioni dei clienti provate:", scenario_b["divisioni_provate"],
      "di cui scartate per i vincoli:", scenario_b["divisioni_scartate"])
print("  Giri provati:", scenario_b["soluzioni_provate"])
print()

if costo_a["totale"] < costo_b["totale"]:
    print("Con i prezzi di partenza conviene lo scenario A, si risparmiano",
          round(costo_b["totale"] - costo_a["totale"], 2), "euro al giorno")
else:
    print("Con i prezzi di partenza conviene lo scenario B, si risparmiano",
          round(costo_a["totale"] - costo_b["totale"], 2), "euro al giorno")
print()

# analisi di sensibilita': faccio cambiare un prezzo alla volta
analisi_gasolio = analisi_sensibilita(scenario_a, scenario_b, costi, "prezzo_gasolio", 1.5, 4.0, 0.1)
analisi_paga = analisi_sensibilita(scenario_a, scenario_b, costi, "paga_autista", 12, 30, 1)
analisi_noleggio = analisi_sensibilita(scenario_a, scenario_b, costi, "noleggio_furgone_piccolo", 40, 90, 2.5)

tutte_le_analisi = [analisi_gasolio, analisi_paga, analisi_noleggio]
for analisi in tutte_le_analisi:
    if analisi["pareggio"] is None:
        print("Variando", analisi["voce"], "lo scenario piu' conveniente non cambia")
    else:
        print("Variando", analisi["voce"], "i due scenari costano uguale a circa", analisi["pareggio"])

# preparo tutti i risultati per la pagina HTML
localita = []
for i in range(len(nomi)):
    nodo = {}
    nodo["nome"] = nomi[i]
    nodo["latitudine"] = latitudini[i]
    nodo["longitudine"] = longitudini[i]
    nodo["quantita"] = quantita[i]
    localita.append(nodo)

risultati = {}
risultati["localita"] = localita
risultati["distanze"] = distanze
risultati["costi"] = costi
risultati["scenario_a"] = scenario_a
risultati["scenario_b"] = scenario_b
risultati["costo_a"] = costo_a
risultati["costo_b"] = costo_b
risultati["analisi"] = tutte_le_analisi

# lo salvo come file .js cosi' la pagina si apre anche con un doppio clic
file = open("pagina/risultati.js", "w", encoding="utf-8")
file.write("// File creato da consegne.py, non modificarlo a mano\n")
file.write("var risultati = " + json.dumps(risultati, indent=2, ensure_ascii=False) + ";\n")
file.close()
print()
print("Risultati salvati in pagina/risultati.js")

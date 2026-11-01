// Questo file prende i dati da risultati.js (variabile "risultati")
// e riempie le tabelle, disegna i grafi dei percorsi e i grafici dei costi.

var COLORE_A = "#1d4ed8";
var COLORE_B = "#c2410c";
var COLORE_B2 = "#0f766e";

function euro(numero) {
    return numero.toFixed(2).replace(".", ",") + " €";
}

function numeroConVirgola(numero, decimali) {
    return numero.toFixed(decimali).replace(".", ",");
}

function scriviGiro(giro) {
    var testo = "";
    for (var i = 0; i < giro.length; i++) {
        if (i > 0) {
            testo = testo + " → ";
        }
        testo = testo + risultati.localita[giro[i]].nome;
    }
    return testo;
}


// ---------------- TABELLE DEI DATI ----------------

function riempiTabellaClienti() {
    var html = "<thead><tr><th>Località</th><th>Ruolo</th><th>Merce (kg)</th></tr></thead><tbody>";
    var totale = 0;
    for (var i = 0; i < risultati.localita.length; i++) {
        var localita = risultati.localita[i];
        var ruolo = "Cliente " + i;
        if (i == 0) {
            ruolo = "Deposito";
        }
        html = html + "<tr><td>" + localita.nome + "</td><td>" + ruolo + "</td><td>" + localita.quantita + "</td></tr>";
        totale = totale + localita.quantita;
    }
    html = html + "<tr class='riga-totale'><td>Totale</td><td></td><td>" + totale + "</td></tr></tbody>";
    document.getElementById("tabella-clienti").innerHTML = html;
}

function riempiTabellaDistanze() {
    var html = "<thead><tr><th>Da \\ A</th>";
    for (var i = 0; i < risultati.localita.length; i++) {
        html = html + "<th>" + risultati.localita[i].nome + "</th>";
    }
    html = html + "</tr></thead><tbody>";
    for (var riga = 0; riga < risultati.distanze.length; riga++) {
        html = html + "<tr><td><strong>" + risultati.localita[riga].nome + "</strong></td>";
        for (var colonna = 0; colonna < risultati.distanze[riga].length; colonna++) {
            var km = risultati.distanze[riga][colonna];
            if (riga == colonna) {
                html = html + "<td>-</td>";
            } else {
                html = html + "<td>" + numeroConVirgola(km, 1) + "</td>";
            }
        }
        html = html + "</tr>";
    }
    html = html + "</tbody>";
    document.getElementById("tabella-distanze").innerHTML = html;
}

function riempiTabellaFurgoni() {
    var c = risultati.costi;
    var html = "<thead><tr><th></th><th>Scenario A</th><th>Scenario B</th></tr></thead><tbody>";
    html = html + "<tr><td>Modello</td><td>" + c.nome_furgone_grande + "</td><td>" + c.nome_furgone_piccolo + "</td></tr>";
    html = html + "<tr><td>Numero di furgoni</td><td>1</td><td>2</td></tr>";
    html = html + "<tr><td>Capacità di un furgone</td><td>" + c.capacita_furgone_grande + " kg</td><td>" + c.capacita_furgone_piccolo + " kg</td></tr>";
    html = html + "<tr><td>Noleggio di un furgone</td><td>" + euro(c.noleggio_furgone_grande) + " al giorno</td><td>" + euro(c.noleggio_furgone_piccolo) + " al giorno</td></tr>";
    html = html + "<tr><td>Consumo</td><td>" + c.consumo_furgone_grande + " km/litro</td><td>" + c.consumo_furgone_piccolo + " km/litro</td></tr>";
    html = html + "<tr><td>Usura e manutenzione</td><td>" + euro(c.usura_furgone_grande) + " al km</td><td>" + euro(c.usura_furgone_piccolo) + " al km</td></tr>";
    html = html + "</tbody>";
    document.getElementById("tabella-furgoni").innerHTML = html;

    document.getElementById("nota-prezzi").innerHTML =
        "Prezzi uguali per i due scenari: gasolio " + euro(c.prezzo_gasolio) + " al litro, autista " +
        euro(c.paga_autista) + " all'ora, velocità media " + c.velocita_media + " km/h, " +
        c.minuti_scarico + " minuti di scarico per ogni cliente, partenza dal deposito alle " + c.ora_partenza + ":00.";
}


// ---------------- GRAFI DEI PERCORSI ----------------

// Trasforma latitudine e longitudine in coordinate dentro il disegno (400 x 300)
function calcolaPosizioni() {
    var minLat = 999, maxLat = -999, minLon = 999, maxLon = -999;
    for (var i = 0; i < risultati.localita.length; i++) {
        var l = risultati.localita[i];
        if (l.latitudine < minLat) minLat = l.latitudine;
        if (l.latitudine > maxLat) maxLat = l.latitudine;
        if (l.longitudine < minLon) minLon = l.longitudine;
        if (l.longitudine > maxLon) maxLon = l.longitudine;
    }
    var posizioni = [];
    for (var j = 0; j < risultati.localita.length; j++) {
        var loc = risultati.localita[j];
        var x = 70 + (loc.longitudine - minLon) / (maxLon - minLon) * 420;
        // la y va al contrario: nel disegno lo zero e' in alto, sulla mappa il nord e' in alto
        var y = 50 + (maxLat - loc.latitudine) / (maxLat - minLat) * 270;
        posizioni.push({ x: x, y: y });
    }
    return posizioni;
}

function disegnaGrafo(idSvg, giri, colori) {
    var svg = document.getElementById(idSvg);
    var posizioni = calcolaPosizioni();
    var raggio = 13;
    var disegno = "<defs>";
    for (var c = 0; c < colori.length; c++) {
        disegno = disegno + "<marker id='freccia-" + idSvg + "-" + c + "' viewBox='0 0 10 10' refX='9' refY='5' " +
            "markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L10,5 L0,10 z' fill='" + colori[c] + "'/></marker>";
    }
    disegno = disegno + "</defs>";

    // per ogni cliente mi segno a che tappa viene servito e da quale furgone
    var tappa = [];
    var coloreCliente = [];
    for (var f = 0; f < giri.length; f++) {
        for (var t = 1; t < giri[f].length - 1; t++) {
            tappa[giri[f][t]] = t;
            coloreCliente[giri[f][t]] = colori[f];
        }
    }

    // prima disegno gli archi, cosi' i nodi stanno sopra
    for (var g = 0; g < giri.length; g++) {
        var giro = giri[g];
        for (var i = 0; i < giro.length - 1; i++) {
            var da = posizioni[giro[i]];
            var a = posizioni[giro[i + 1]];
            // accorcio la linea per non coprire i cerchi dei nodi
            var dx = a.x - da.x;
            var dy = a.y - da.y;
            var lunghezza = Math.sqrt(dx * dx + dy * dy);
            var x1 = da.x + dx / lunghezza * (raggio + 2);
            var y1 = da.y + dy / lunghezza * (raggio + 2);
            var x2 = a.x - dx / lunghezza * (raggio + 4);
            var y2 = a.y - dy / lunghezza * (raggio + 4);
            disegno = disegno + "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' stroke='" + colori[g] +
                "' stroke-width='2.5' marker-end='url(#freccia-" + idSvg + "-" + g + ")'/>";

            // i km vanno a meta' della freccia ma spostati di lato, cosi' non stanno sopra la linea
            var km = risultati.distanze[giro[i]][giro[i + 1]];
            var latoX = -dy / lunghezza * 12;
            var latoY = dx / lunghezza * 12;
            var mezzoX = (da.x + a.x) / 2 + latoX;
            var mezzoY = (da.y + a.y) / 2 + latoY + 4;
            disegno = disegno + "<text x='" + mezzoX + "' y='" + mezzoY + "' font-size='12' font-weight='600' fill='" + colori[g] +
                "' text-anchor='middle' stroke='#f8fafc' stroke-width='4' paint-order='stroke'>" + numeroConVirgola(km, 1) + "</text>";
        }
    }

    for (var n = 0; n < posizioni.length; n++) {
        var p = posizioni[n];
        if (n == 0) {
            // il deposito e' scuro con la lettera D
            disegno = disegno + "<circle cx='" + p.x + "' cy='" + p.y + "' r='" + (raggio + 2) + "' fill='#0f172a'/>";
            disegno = disegno + "<text x='" + p.x + "' y='" + (p.y + 5) + "' font-size='14' font-weight='700' fill='#ffffff' text-anchor='middle'>D</text>";
        } else {
            // i clienti sono bianchi, con il bordo del colore del furgone e il numero della tappa
            disegno = disegno + "<circle cx='" + p.x + "' cy='" + p.y + "' r='" + raggio + "' fill='#ffffff' stroke='" + coloreCliente[n] + "' stroke-width='3'/>";
            disegno = disegno + "<text x='" + p.x + "' y='" + (p.y + 5) + "' font-size='13' font-weight='700' fill='" + coloreCliente[n] + "' text-anchor='middle'>" + tappa[n] + "</text>";
        }
        // il nome va sopra il nodo, tranne per i paesi piu' a sud del deposito
        var yNome = p.y - 20;
        if (p.y > posizioni[0].y + 10) {
            yNome = p.y + 30;
        }
        disegno = disegno + "<text x='" + p.x + "' y='" + yNome + "' font-size='13' font-weight='600' fill='#0f172a' text-anchor='middle'" +
            " stroke='#f8fafc' stroke-width='4' paint-order='stroke'>" + risultati.localita[n].nome + "</text>";
    }
    svg.innerHTML = disegno;
}

function descriviScenario(idDiv, scenario, colori) {
    var html = "";
    for (var i = 0; i < scenario.giri.length; i++) {
        html = html + "<div class='giro' style='border-left-color:" + colori[i] + "'>";
        html = html + "<p><strong>Furgone " + (i + 1) + ":</strong> " + scriviGiro(scenario.giri[i]) + "</p>";
        html = html + "<p class='nota'>Carico " + scenario.carichi[i] + " kg, " + numeroConVirgola(scenario.km_giri[i], 1) +
            " km, " + numeroConVirgola(scenario.ore_giri[i], 2) + " ore di lavoro</p>";
        html = html + "</div>";
    }
    html = html + "<p>Totale: <strong>" + numeroConVirgola(scenario.km_totali, 1) + " km</strong>, " +
        numeroConVirgola(scenario.ore_totali, 2) + " ore di lavoro pagate. Consegne finite e furgoni al deposito alle <strong>" +
        scenario.fine_consegne + "</strong>.</p>";
    if (scenario.divisioni_provate) {
        html = html + "<p class='nota'>Divisioni dei clienti tra i due furgoni provate: " + scenario.divisioni_provate +
            ", scartate perché non rispettano i vincoli: " + scenario.divisioni_scartate +
            ". Giri calcolati in totale: " + scenario.soluzioni_provate + ".</p>";
    } else {
        html = html + "<p class='nota'>Giri provati: " + scenario.soluzioni_provate + " (tutti gli ordini possibili dei 5 clienti).</p>";
    }
    document.getElementById(idDiv).innerHTML = html;
}


// ---------------- COSTI ----------------

function arrotonda(numero) {
    return Math.round(numero * 100) / 100;
}

// Stessa formula usata in consegne.py (anche lì ogni voce è arrotondata ai centesimi)
function calcolaCosto(scenario, tipo, costi) {
    var numeroFurgoni = scenario.giri.length;
    var noleggio = arrotonda(numeroFurgoni * costi["noleggio_furgone_" + tipo]);
    var carburante = arrotonda(scenario.km_totali / costi["consumo_furgone_" + tipo] * costi.prezzo_gasolio);
    var usura = arrotonda(scenario.km_totali * costi["usura_furgone_" + tipo]);
    var autisti = arrotonda(scenario.ore_totali * costi.paga_autista);
    return {
        noleggio: noleggio,
        carburante: carburante,
        usura: usura,
        autisti: autisti,
        totale: noleggio + carburante + usura + autisti
    };
}

function riempiTabellaCosti() {
    var a = risultati.costo_a;
    var b = risultati.costo_b;
    var html = "<thead><tr><th>Voce</th><th>Scenario A</th><th>Scenario B</th></tr></thead><tbody>";
    html = html + "<tr><td>Noleggio furgoni</td><td>" + euro(a.noleggio) + "</td><td>" + euro(b.noleggio) + "</td></tr>";
    html = html + "<tr><td>Gasolio</td><td>" + euro(a.carburante) + "</td><td>" + euro(b.carburante) + "</td></tr>";
    html = html + "<tr><td>Usura</td><td>" + euro(a.usura) + "</td><td>" + euro(b.usura) + "</td></tr>";
    html = html + "<tr><td>Autisti</td><td>" + euro(a.autisti) + "</td><td>" + euro(b.autisti) + "</td></tr>";
    html = html + "<tr class='riga-totale'><td>Totale al giorno</td><td>" + euro(a.totale) + "</td><td>" + euro(b.totale) + "</td></tr>";
    html = html + "</tbody>";
    document.getElementById("tabella-costi").innerHTML = html;

    var frase = "";
    if (a.totale < b.totale) {
        frase = "Con i prezzi di partenza conviene lo <strong>scenario A</strong>: costa " + euro(b.totale - a.totale) +
            " in meno al giorno. Lo scenario B però finisce le consegne alle " + risultati.scenario_b.fine_consegne +
            " invece che alle " + risultati.scenario_a.fine_consegne + ", quindi il pane arriva prima ai clienti.";
    } else {
        frase = "Con i prezzi di partenza conviene lo <strong>scenario B</strong>: costa " + euro(a.totale - b.totale) +
            " in meno al giorno e finisce le consegne alle " + risultati.scenario_b.fine_consegne + ".";
    }
    document.getElementById("frase-convenienza").innerHTML = frase;
}

function graficoVociDiCosto() {
    var a = risultati.costo_a;
    var b = risultati.costo_b;
    new Chart(document.getElementById("grafico-voci"), {
        type: "bar",
        data: {
            labels: ["Scenario A", "Scenario B"],
            datasets: [
                { label: "Noleggio", data: [a.noleggio, b.noleggio], backgroundColor: "#1e3a8a" },
                { label: "Gasolio", data: [a.carburante, b.carburante], backgroundColor: "#3b82f6" },
                { label: "Usura", data: [a.usura, b.usura], backgroundColor: "#93c5fd" },
                { label: "Autisti", data: [a.autisti, b.autisti], backgroundColor: "#f97316" }
            ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true },
                y: { stacked: true, title: { display: true, text: "Euro al giorno" } }
            }
        }
    });
}

function graficoSensibilita(idCanvas, analisi, titoloAsse, numero) {
    new Chart(document.getElementById(idCanvas), {
        type: "line",
        data: {
            labels: analisi.valori,
            datasets: [
                { label: "Scenario A", data: analisi.totali_a, borderColor: COLORE_A, backgroundColor: COLORE_A, pointRadius: 0 },
                { label: "Scenario B", data: analisi.totali_b, borderColor: COLORE_B, backgroundColor: COLORE_B, pointRadius: 0, borderDash: [6, 4] }
            ]
        },
        options: {
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            scales: {
                x: { title: { display: true, text: titoloAsse } },
                y: { title: { display: true, text: "Costo totale (€)" } }
            }
        }
    });

    var testo = "";
    var primoA = analisi.totali_a[0];
    var primoB = analisi.totali_b[0];
    if (analisi.pareggio === null) {
        if (primoA < primoB) {
            testo = "In tutto l'intervallo provato conviene sempre lo scenario A.";
        } else {
            testo = "In tutto l'intervallo provato conviene sempre lo scenario B.";
        }
    } else {
        var sotto = "B";
        var sopra = "A";
        if (primoA < primoB) {
            sotto = "A";
            sopra = "B";
        }
        testo = "I due scenari costano uguale a circa <strong>" + numeroConVirgola(analisi.pareggio, 2) +
            "</strong>. Sotto questo valore conviene lo scenario " + sotto + ", sopra conviene lo scenario " + sopra + ".";
    }
    document.getElementById("pareggio-" + numero).innerHTML = testo;
}


// ---------------- PROVA TU ----------------

function preparaModulo() {
    var c = risultati.costi;
    document.getElementById("campo-gasolio").value = c.prezzo_gasolio;
    document.getElementById("campo-paga").value = c.paga_autista;
    document.getElementById("campo-noleggio-grande").value = c.noleggio_furgone_grande;
    document.getElementById("campo-noleggio-piccolo").value = c.noleggio_furgone_piccolo;

    document.getElementById("modulo-prezzi").addEventListener("submit", function (evento) {
        // evito che la pagina si ricarichi
        evento.preventDefault();
        calcolaProva();
    });
    calcolaProva();
}

function calcolaProva() {
    // copio i costi di partenza e cambio solo quelli scritti nel modulo
    var costi = Object.assign({}, risultati.costi);
    costi.prezzo_gasolio = parseFloat(document.getElementById("campo-gasolio").value);
    costi.paga_autista = parseFloat(document.getElementById("campo-paga").value);
    costi.noleggio_furgone_grande = parseFloat(document.getElementById("campo-noleggio-grande").value);
    costi.noleggio_furgone_piccolo = parseFloat(document.getElementById("campo-noleggio-piccolo").value);

    var casella = document.getElementById("risultato-prova");
    if (isNaN(costi.prezzo_gasolio) || isNaN(costi.paga_autista) ||
        isNaN(costi.noleggio_furgone_grande) || isNaN(costi.noleggio_furgone_piccolo)) {
        casella.innerHTML = "Scrivi un numero in tutti i campi.";
        return;
    }

    var a = calcolaCosto(risultati.scenario_a, "grande", costi);
    var b = calcolaCosto(risultati.scenario_b, "piccolo", costi);
    var html = "Scenario A: <strong>" + euro(a.totale) + "</strong> &nbsp; Scenario B: <strong>" + euro(b.totale) + "</strong><br>";
    if (a.totale < b.totale) {
        html = html + "Conviene lo scenario A, si risparmiano " + euro(b.totale - a.totale) + " al giorno.";
    } else if (b.totale < a.totale) {
        html = html + "Conviene lo scenario B, si risparmiano " + euro(a.totale - b.totale) + " al giorno.";
    } else {
        html = html + "I due scenari costano uguale.";
    }
    casella.innerHTML = html;
}


// ---------------- AVVIO ----------------

riempiTabellaClienti();
riempiTabellaDistanze();
riempiTabellaFurgoni();
disegnaGrafo("grafo-a", risultati.scenario_a.giri, [COLORE_A]);
disegnaGrafo("grafo-b", risultati.scenario_b.giri, [COLORE_B, COLORE_B2]);
descriviScenario("descrizione-a", risultati.scenario_a, [COLORE_A]);
descriviScenario("descrizione-b", risultati.scenario_b, [COLORE_B, COLORE_B2]);
riempiTabellaCosti();
preparaModulo();

// Chart.js arriva da internet: se manca la connessione i grafici non si vedono
if (typeof Chart === "undefined") {
    var avviso = "Per vedere i grafici serve la connessione a internet (libreria Chart.js).";
    document.getElementById("pareggio-0").innerHTML = avviso;
} else {
    graficoVociDiCosto();
    graficoSensibilita("grafico-gasolio", risultati.analisi[0], "Prezzo gasolio (€/litro)", 0);
    graficoSensibilita("grafico-paga", risultati.analisi[1], "Paga autista (€/ora)", 1);
    graficoSensibilita("grafico-noleggio", risultati.analisi[2], "Noleggio furgone piccolo (€/giorno)", 2);
}

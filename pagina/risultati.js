// File creato da consegne.py, non modificarlo a mano
var risultati = {
  "localita": [
    {
      "nome": "Laterza",
      "latitudine": 40.6286,
      "longitudine": 16.7975,
      "quantita": 0
    },
    {
      "nome": "Ginosa",
      "latitudine": 40.5786,
      "longitudine": 16.7567,
      "quantita": 350
    },
    {
      "nome": "Castellaneta",
      "latitudine": 40.6297,
      "longitudine": 16.9397,
      "quantita": 300
    },
    {
      "nome": "Palagianello",
      "latitudine": 40.6094,
      "longitudine": 16.9772,
      "quantita": 200
    },
    {
      "nome": "Santeramo in Colle",
      "latitudine": 40.7942,
      "longitudine": 16.7569,
      "quantita": 250
    },
    {
      "nome": "Matera",
      "latitudine": 40.6664,
      "longitudine": 16.6043,
      "quantita": 400
    }
  ],
  "distanze": [
    [
      0,
      8.3,
      15.3,
      21.0,
      21.9,
      22.0
    ],
    [
      8.3,
      0,
      24.6,
      27.1,
      29.5,
      24.4
    ],
    [
      15.3,
      24.6,
      0,
      8.8,
      33.2,
      33.1
    ],
    [
      21.0,
      28.2,
      9.1,
      0,
      40.2,
      46.3
    ],
    [
      21.9,
      29.2,
      33.4,
      42.0,
      0,
      21.0
    ],
    [
      22.0,
      24.6,
      33.2,
      46.3,
      21.9,
      0
    ]
  ],
  "costi": {
    "prezzo_gasolio": 1.75,
    "paga_autista": 18,
    "velocita_media": 50,
    "minuti_scarico": 15,
    "ora_partenza": 6,
    "nome_furgone_grande": "Iveco Daily 50C",
    "capacita_furgone_grande": 2000,
    "noleggio_furgone_grande": 110,
    "consumo_furgone_grande": 9,
    "usura_furgone_grande": 0.12,
    "nome_furgone_piccolo": "Fiat Doblò Maxi",
    "capacita_furgone_piccolo": 900,
    "noleggio_furgone_piccolo": 65,
    "consumo_furgone_piccolo": 15,
    "usura_furgone_piccolo": 0.07
  },
  "scenario_a": {
    "giri": [
      [
        0,
        3,
        2,
        4,
        5,
        1,
        0
      ]
    ],
    "carichi": [
      1500
    ],
    "km_giri": [
      117.2
    ],
    "ore_giri": [
      3.59
    ],
    "km_totali": 117.2,
    "ore_totali": 3.59,
    "fine_consegne": "09:36",
    "soluzioni_provate": 120
  },
  "scenario_b": {
    "giri": [
      [
        0,
        1,
        3,
        2,
        0
      ],
      [
        0,
        4,
        5,
        0
      ]
    ],
    "carichi": [
      850,
      650
    ],
    "km_giri": [
      59.8,
      64.9
    ],
    "ore_giri": [
      1.95,
      1.8
    ],
    "km_totali": 124.7,
    "ore_totali": 3.74,
    "fine_consegne": "07:57",
    "soluzioni_provate": 96,
    "divisioni_provate": 32,
    "divisioni_scartate": 20
  },
  "costo_a": {
    "noleggio": 110,
    "carburante": 22.79,
    "usura": 14.06,
    "autisti": 64.62,
    "totale": 211.47
  },
  "costo_b": {
    "noleggio": 130,
    "carburante": 14.55,
    "usura": 8.73,
    "autisti": 67.32,
    "totale": 220.6
  },
  "analisi": [
    {
      "voce": "prezzo_gasolio",
      "valori": [
        1.5,
        1.6,
        1.7,
        1.8,
        1.9,
        2.0,
        2.1,
        2.2,
        2.3,
        2.4,
        2.5,
        2.6,
        2.7,
        2.8,
        2.9,
        3.0,
        3.1,
        3.2,
        3.3,
        3.4,
        3.5,
        3.6,
        3.7,
        3.8,
        3.9,
        4.0
      ],
      "totali_a": [
        208.22,
        209.52,
        210.82,
        212.12,
        213.43,
        214.73,
        216.03,
        217.33,
        218.64,
        219.94,
        221.24,
        222.54,
        223.84,
        225.15,
        226.45,
        227.75,
        229.05,
        230.36,
        231.66,
        232.96,
        234.26,
        235.56,
        236.87,
        238.17,
        239.47,
        240.77
      ],
      "totali_b": [
        218.52,
        219.35,
        220.18,
        221.01,
        221.84,
        222.68,
        223.51,
        224.34,
        225.17,
        226.0,
        226.83,
        227.66,
        228.5,
        229.33,
        230.16,
        230.99,
        231.82,
        232.65,
        233.48,
        234.31,
        235.15,
        235.98,
        236.81,
        237.64,
        238.47,
        239.3
      ],
      "pareggio": 3.69
    },
    {
      "voce": "paga_autista",
      "valori": [
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30
      ],
      "totali_a": [
        189.93,
        193.52,
        197.11,
        200.7,
        204.29,
        207.88,
        211.47,
        215.06,
        218.65,
        222.24,
        225.83,
        229.42,
        233.01,
        236.6,
        240.19,
        243.78,
        247.37,
        250.96,
        254.55
      ],
      "totali_b": [
        198.16,
        201.9,
        205.64,
        209.38,
        213.12,
        216.86,
        220.6,
        224.34,
        228.08,
        231.82,
        235.56,
        239.3,
        243.04,
        246.78,
        250.52,
        254.26,
        258.0,
        261.74,
        265.48
      ],
      "pareggio": null
    },
    {
      "voce": "noleggio_furgone_piccolo",
      "valori": [
        40,
        42.5,
        45.0,
        47.5,
        50.0,
        52.5,
        55.0,
        57.5,
        60.0,
        62.5,
        65.0,
        67.5,
        70.0,
        72.5,
        75.0,
        77.5,
        80.0,
        82.5,
        85.0,
        87.5,
        90.0
      ],
      "totali_a": [
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47,
        211.47
      ],
      "totali_b": [
        170.6,
        175.6,
        180.6,
        185.6,
        190.6,
        195.6,
        200.6,
        205.6,
        210.6,
        215.6,
        220.6,
        225.6,
        230.6,
        235.6,
        240.6,
        245.6,
        250.6,
        255.6,
        260.6,
        265.6,
        270.6
      ],
      "pareggio": 60.44
    }
  ]
};

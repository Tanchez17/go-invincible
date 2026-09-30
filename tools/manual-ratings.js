// Go Invincible — manual baseline ratings (hand-set 1-99 estimates per club and era).
// Format: "Name|POS:RATING,..." — first position is the natural one.
// tools/build_ratings.py blends these with real stats and writes js/data.js.
const DATA = {
  eras: {
    "90s": "1992–99",
    "00s": "2000–09",
    "10s": "2010–19",
    "20s": "2020–26"
  },
  clubs: {
    ARS: { name: "Arsenal", color: "#EF0107", eras: {
      "90s": ["David Seaman|GK:88","Tony Adams|CB:88","Martin Keown|CB:83","Lee Dixon|RB:82,LB:78","Nigel Winterburn|LB:80,RB:76","Patrick Vieira|CM:89","Emmanuel Petit|CM:84","Anders Limpar|LW:78,RW:75,ST:75,CM:74","Marc Overmars|LW:86,RW:83,ST:83,CM:82","Dennis Bergkamp|ST:91,CM:88,LW:86,RW:86","Ian Wright|ST:88,LW:83,RW:83","Nicolas Anelka|ST:82,LW:77,RW:77"],
      "00s": ["Jens Lehmann|GK:84","Sol Campbell|CB:88","Ashley Cole|LB:87,RB:83","Kolo Touré|CB:82","Lauren|RB:80,LB:76,CM:76,RW:76","Patrick Vieira|CM:91","Robert Pirès|LW:88,RW:85,ST:85,CM:84","Cesc Fàbregas|CM:87","Freddie Ljungberg|RW:84,LW:81,ST:81,CM:80","Thierry Henry|ST:96,LW:95,RW:91,CM:90","Robin van Persie|ST:83,LW:78,RW:78"],
      "10s": ["Petr Čech|GK:84","Wojciech Szczęsny|GK:80","Laurent Koscielny|CB:84","Bacary Sagna|RB:81,LB:77","Per Mertesacker|CB:80","Mesut Özil|CM:88,LW:84,RW:84,ST:82","Santi Cazorla|CM:86","Aaron Ramsey|CM:82,LW:78,RW:78,ST:76","Robin van Persie|ST:92,LW:87,RW:87","Alexis Sánchez|LW:89,RW:86,ST:86,CM:85","Pierre-Emerick Aubameyang|ST:86,LW:81,RW:81"],
      "20s": ["David Raya|GK:85","Aaron Ramsdale|GK:80","William Saliba|CB:89","Gabriel Magalhães|CB:87","Ben White|RB:83,LB:79","Declan Rice|CM:89","Martin Ødegaard|CM:89,RW:86,LW:85,ST:83","Thomas Partey|CM:82","Bukayo Saka|RW:90,LW:87,ST:87","Gabriel Martinelli|LW:83,RW:80,ST:80"]
    }},
    CHE: { name: "Chelsea", color: "#034694", eras: {
      "90s": ["Ed de Goey|GK:80","Dmitri Kharine|GK:76","Marcel Desailly|CB:86","Graeme Le Saux|LB:81,LW:78,RB:77,CM:77","Frank Leboeuf|CB:80","Gustavo Poyet|CM:82","Dennis Wise|CM:81","Roberto Di Matteo|CM:81","Gianfranco Zola|ST:89,CM:85,LW:84,RW:84","Gianluca Vialli|ST:81,LW:76,RW:76","Mark Hughes|ST:80,LW:75,RW:75"],
      "00s": ["Petr Čech|GK:92","John Terry|CB:91","Ricardo Carvalho|CB:87","Ashley Cole|LB:86,RB:82","Frank Lampard|CM:92","Claude Makélélé|CM:88","Michael Essien|CM:87,CB:83,RB:83","Didier Drogba|ST:91,LW:86,RW:86","Arjen Robben|RW:86,LW:83,ST:83,CM:82","Jimmy Floyd Hasselbaink|ST:86,LW:81,RW:81","Gianfranco Zola|ST:84,CM:80,LW:79,RW:79"],
      "10s": ["Thibaut Courtois|GK:87","Petr Čech|GK:86","John Terry|CB:86","César Azpilicueta|RB:85,LB:81","Branislav Ivanović|RB:84,LB:80","N'Golo Kanté|CM:90","Frank Lampard|CM:85","Juan Mata|CM:83,LW:79,RW:79,ST:77","Eden Hazard|LW:92,RW:89,ST:89,CM:88","Diego Costa|ST:87,LW:82,RW:82"],
      "20s": ["Édouard Mendy|GK:82","Robert Sánchez|GK:74","Thiago Silva|CB:84","Reece James|RB:84,LB:80,CM:80,RW:80,CB:80","Antonio Rüdiger|CB:84","Cole Palmer|CM:88,RW:86,LW:84,ST:84","Moisés Caicedo|CM:85","Enzo Fernández|CM:82","Mason Mount|CM:82,LW:78,RW:78,ST:76","Kai Havertz|ST:78,LW:73,RW:73,CM:72","Nicolas Jackson|ST:77,LW:72,RW:72"]
    }},
    LIV: { name: "Liverpool", color: "#C8102E", eras: {
      "90s": ["David James|GK:76","Mark Wright|CB:77","Jamie Carragher|CB:76","Stig Inge Bjørnebye|LB:76,RB:72","Steve McManaman|LW:85,RW:82,ST:82,CM:81","John Barnes|CM:82,LW:78,RW:78,ST:76","Jamie Redknapp|CM:80","Robbie Fowler|ST:89,LW:84,RW:84","Michael Owen|ST:87,LW:82,RW:82","Stan Collymore|ST:80,LW:75,RW:75"],
      "00s": ["Pepe Reina|GK:87","Sami Hyypiä|CB:86","Jamie Carragher|CB:86","Steven Gerrard|CM:93,LW:89,RW:89,ST:89","Xabi Alonso|CM:88","Javier Mascherano|CM:85,CB:82","Dietmar Hamann|CM:82","Fernando Torres|ST:91,LW:86,RW:86","Michael Owen|ST:88,LW:83,RW:83"],
      "10s": ["Alisson|GK:90","Simon Mignolet|GK:76","Virgil van Dijk|CB:93","Andrew Robertson|LB:87,RB:83","Trent Alexander-Arnold|RB:86,CM:83,LB:82,RW:82","Philippe Coutinho|CM:87,LW:83,RW:83,ST:81","Jordan Henderson|CM:84","Luis Suárez|ST:94,LW:89,RW:89","Mohamed Salah|RW:93,LW:90,ST:90","Sadio Mané|LW:89,RW:86,ST:86","Roberto Firmino|ST:86,CM:83,LW:81,RW:81"],
      "20s": ["Alisson|GK:90","Virgil van Dijk|CB:91","Trent Alexander-Arnold|RB:87,CM:84,LB:83,RW:83","Ibrahima Konaté|CB:84","Fabinho|CM:85,CB:81","Alexis Mac Allister|CM:85","Ryan Gravenberch|CM:84","Mohamed Salah|RW:94,LW:91,ST:91","Luis Díaz|LW:85,RW:82,ST:82,CM:81","Diogo Jota|ST:84,LW:83,RW:79,CM:78"]
    }},
    MUN: { name: "Manchester United", color: "#DA291C", eras: {
      "90s": ["Peter Schmeichel|GK:93","Jaap Stam|CB:89","Gary Neville|RB:84,LB:80","Steve Bruce|CB:83","Denis Irwin|LB:83,RB:79","Roy Keane|CM:91","David Beckham|RW:88,LW:85,ST:85,CM:84","Ryan Giggs|LW:88,RW:85,ST:85,CM:84","Paul Scholes|CM:87","Eric Cantona|ST:92,CM:88,LW:87,RW:87","Andy Cole|ST:87,LW:82,RW:82","Dwight Yorke|ST:87,LW:82,RW:82"],
      "00s": ["Edwin van der Sar|GK:89","Rio Ferdinand|CB:90","Nemanja Vidić|CB:89","Patrice Evra|LB:85,RB:81","Paul Scholes|CM:88","Roy Keane|CM:88","Cristiano Ronaldo|RW:95,LW:92,ST:92,CM:91","Ruud van Nistelrooy|ST:91,LW:86,RW:86","Wayne Rooney|ST:89,CM:86,LW:84,RW:84","Henrik Larsson|ST:80,LW:75,RW:75"],
      "10s": ["David de Gea|GK:89","Nemanja Vidić|CB:85","Rio Ferdinand|CB:83","Chris Smalling|CB:78","Paul Pogba|CM:85","Michael Carrick|CM:84,CB:80","Ander Herrera|CM:80","Wayne Rooney|ST:88,CM:85,LW:83,RW:83","Robin van Persie|ST:88,LW:83,RW:83","Zlatan Ibrahimović|ST:85,LW:80,RW:80"],
      "20s": ["David de Gea|GK:83","André Onana|GK:76","Lisandro Martínez|CB:83","Raphaël Varane|CB:83","Harry Maguire|CB:78","Bruno Fernandes|CM:88,LW:84,RW:84,ST:82","Casemiro|CM:83","Cristiano Ronaldo|RW:85,LW:82,ST:82,CM:81","Marcus Rashford|LW:84,RW:81,ST:81"]
    }},
    MCI: { name: "Manchester City", color: "#6CABDD", eras: {
      "90s": ["Tony Coton|GK:76","Keith Curle|CB:76","Terry Phelan|LB:74,RB:70","Georgi Kinkladze|CM:82,LW:78,RW:78,ST:76","Garry Flitcroft|CM:76","Niall Quinn|ST:78,LW:73,RW:73","Uwe Rösler|ST:78,LW:73,RW:73"],
      "00s": ["Shay Given|GK:82","David James|GK:78","Richard Dunne|CB:80","Sylvain Distin|CB:77","Shaun Wright-Phillips|RW:80,LW:77,ST:77,CM:76","Stephen Ireland|CM:79","Elano|CM:79","Nicolas Anelka|ST:82,LW:77,RW:77","Robinho|LW:82,RW:79,ST:79,CM:78"],
      "10s": ["Ederson|GK:88","Joe Hart|GK:84","Vincent Kompany|CB:89","Aymeric Laporte|CB:85","Kyle Walker|RB:85,LB:81,CB:81","Pablo Zabaleta|RB:83,LB:79","Kevin De Bruyne|CM:93,LW:89,RW:89,ST:87","David Silva|CM:91","Yaya Touré|CM:90","Sergio Agüero|ST:94,LW:89,RW:89","Raheem Sterling|LW:88,RW:87,ST:85,CM:84"],
      "20s": ["Ederson|GK:87","Rúben Dias|CB:89","John Stones|CB:85,CM:81,RB:80","Joško Gvardiol|LB:84,CB:82,RB:80","Rodri|CM:93","Kevin De Bruyne|CM:92,LW:88,RW:88,ST:86","Bernardo Silva|CM:88,RW:86,LW:84,ST:82","Erling Haaland|ST:95,LW:90,RW:90","Phil Foden|RW:89,LW:86,ST:86,CM:85"]
    }},
    TOT: { name: "Tottenham", color: "#132257", eras: {
      "90s": ["Ian Walker|GK:77","Sol Campbell|CB:84","Gary Mabbutt|CB:77","David Ginola|LW:86,RW:83,ST:83,CM:82","Darren Anderton|RW:81,LW:78,ST:78,CM:77","Jürgen Klinsmann|ST:88,LW:83,RW:83","Teddy Sheringham|ST:86,CM:82,LW:81,RW:81","Les Ferdinand|ST:82,LW:77,RW:77"],
      "00s": ["Paul Robinson|GK:80","Ledley King|CB:86","Michael Dawson|CB:78","Luka Modrić|CM:85","Michael Carrick|CM:81,CB:77","Aaron Lennon|RW:79,LW:76,ST:76,CM:75","Dimitar Berbatov|ST:87,LW:82,RW:82","Robbie Keane|ST:85,LW:80,RW:80","Jermain Defoe|ST:82,LW:77,RW:77"],
      "10s": ["Hugo Lloris|GK:88","Jan Vertonghen|CB:86","Toby Alderweireld|CB:86","Kyle Walker|RB:82,LB:78,CB:78","Christian Eriksen|CM:87","Luka Modrić|CM:87","Dele Alli|CM:84,LW:80,RW:80,ST:78","Harry Kane|ST:92,LW:87,RW:87,CM:84","Gareth Bale|LW:91,RW:90,ST:88,CM:87","Son Heung-min|LW:87,ST:85,RW:84,CM:83"],
      "20s": ["Hugo Lloris|GK:83","Guglielmo Vicario|GK:81","Cristian Romero|CB:84","Micky van de Ven|CB:82","Pedro Porro|RB:80,LB:76","James Maddison|CM:82,LW:78,RW:78,ST:76","Pierre-Emile Højbjerg|CM:80","Harry Kane|ST:93,LW:88,RW:88,CM:85","Son Heung-min|LW:89,ST:87,RW:86,CM:85","Dejan Kulusevski|RW:81,LW:78,ST:78,CM:77"]
    }},
    NEW: { name: "Newcastle", color: "#241F20", eras: {
      "90s": ["Shaka Hislop|GK:77","Pavel Srníček|GK:76","Philippe Albert|CB:80","Steve Howey|CB:77","Warren Barton|RB:75,LB:71","David Ginola|LW:84,RW:81,ST:81,CM:80","Rob Lee|CM:82","David Batty|CM:80","Alan Shearer|ST:92,LW:87,RW:87","Andy Cole|ST:89,LW:84,RW:84","Les Ferdinand|ST:87,LW:82,RW:82","Peter Beardsley|ST:86,CM:82,LW:81,RW:81"],
      "00s": ["Shay Given|GK:85","Jonathan Woodgate|CB:81","Aaron Hughes|CB:76","Gary Speed|CM:81","Kieron Dyer|RW:79,LW:76,ST:76,CM:75","Laurent Robert|LW:79,RW:76,ST:76,CM:75","Alan Shearer|ST:89,LW:84,RW:84","Craig Bellamy|ST:82,RW:80,LW:77","Michael Owen|ST:80,LW:75,RW:75"],
      "10s": ["Tim Krul|GK:79","Fabricio Coloccini|CB:81","Jamaal Lascelles|CB:76","Yohan Cabaye|CM:83","Hatem Ben Arfa|RW:82,LW:79,ST:79,CM:78","Cheick Tioté|CM:79","Demba Ba|ST:81,LW:76,RW:76","Papiss Cissé|ST:80,LW:75,RW:75"],
      "20s": ["Nick Pope|GK:83","Sven Botman|CB:83","Kieran Trippier|RB:83,LB:79","Fabian Schär|CB:81","Bruno Guimarães|CM:87","Sandro Tonali|CM:82","Alexander Isak|ST:89,LW:84,RW:84","Anthony Gordon|LW:83,RW:80,ST:80","Callum Wilson|ST:80,LW:75,RW:75"]
    }},
    EVE: { name: "Everton", color: "#003399", eras: {
      "90s": ["Neville Southall|GK:86","Dave Watson|CB:78","Andy Hinchcliffe|LB:77,RB:73","David Unsworth|CB:76","Andrei Kanchelskis|RW:84,LW:81,ST:81,CM:80","Joe Parkinson|CM:76","Duncan Ferguson|ST:80,LW:75,RW:75","Paul Rideout|ST:76,LW:71,RW:71"],
      "00s": ["Tim Howard|GK:83","Leighton Baines|LB:83,RB:79","Phil Jagielka|CB:81","Joleon Lescott|CB:81","Mikel Arteta|CM:84","Tim Cahill|CM:83,LW:79,RW:79,ST:77","Steven Pienaar|LW:80,RW:77,ST:77,CM:76","Yakubu|ST:80,LW:75,RW:75","Wayne Rooney|ST:78,CM:75,LW:73,RW:73"],
      "10s": ["Jordan Pickford|GK:81","Tim Howard|GK:81","Leighton Baines|LB:84,RB:80","Seamus Coleman|RB:82,LB:78","Phil Jagielka|CB:80","Marouane Fellaini|CM:81,LW:77,RW:77,ST:75","Ross Barkley|CM:80,LW:76,RW:76,ST:74","Romelu Lukaku|ST:86,LW:81,RW:81","Richarlison|LW:80,RW:77,ST:77"],
      "20s": ["Jordan Pickford|GK:84","Jarrad Branthwaite|CB:81","James Tarkowski|CB:80","James Rodríguez|CM:80","Idrissa Gueye|CM:79","Abdoulaye Doucouré|CM:77","Dominic Calvert-Lewin|ST:81,LW:76,RW:76","Dwight McNeil|LW:76,RW:73,ST:73,CM:72"]
    }},
    AVL: { name: "Aston Villa", color: "#670E36", eras: {
      "90s": ["Mark Bosnich|GK:82","Paul McGrath|CB:85","Ugo Ehiogu|CB:81","Gareth Southgate|CB:80,CM:77","Andy Townsend|CM:79","Dwight Yorke|ST:84,LW:79,RW:79","Dean Saunders|ST:80,LW:75,RW:75","Savo Milošević|ST:77,LW:72,RW:72"],
      "00s": ["Brad Friedel|GK:81","Thomas Sørensen|GK:78","Olof Mellberg|CB:81","Martin Laursen|CB:80","Gareth Barry|CM:84","Ashley Young|LW:82,RW:79,ST:79,CM:78","James Milner|CM:82,RB:79,LB:78,RW:78,CB:77","John Carew|ST:80,LW:75,RW:75","Gabriel Agbonlahor|ST:79,LW:74,RW:74","Juan Pablo Ángel|ST:79,LW:74,RW:74"],
      "10s": ["Brad Guzan|GK:76","Richard Dunne|CB:78","Ron Vlaar|CB:76","Stewart Downing|LW:80,RW:77,ST:77,CM:76","Jack Grealish|LW:80,RW:77,ST:77,CM:76","Fabian Delph|CM:76","Christian Benteke|ST:84,LW:79,RW:79","Darren Bent|ST:80,LW:75,RW:75"],
      "20s": ["Emiliano Martínez|GK:88","Pau Torres|CB:82","Ezri Konsa|CB:81","Matty Cash|RB:78,LB:74","Jack Grealish|LW:84,RW:81,ST:81,CM:80","Douglas Luiz|CM:83","John McGinn|CM:81","Youri Tielemans|CM:81","Ollie Watkins|ST:85,LW:80,RW:80","Leon Bailey|RW:79,LW:76,ST:76,CM:75"]
    }},
    WHU: { name: "West Ham", color: "#7A263A", eras: {
      "90s": ["Luděk Mikloško|GK:79","Shaka Hislop|GK:78","Rio Ferdinand|CB:82","Julian Dicks|LB:79,RB:75","Frank Lampard|CM:80","Trevor Sinclair|RW:79,LW:76,ST:76,CM:75","Paolo Di Canio|ST:86,LW:84,RW:81","John Hartson|ST:80,LW:75,RW:75","Tony Cottee|ST:77,LW:72,RW:72"],
      "00s": ["Robert Green|GK:79","David James|GK:78","Rio Ferdinand|CB:83","Matthew Upson|CB:78","Joe Cole|CM:82,LW:78,RW:78,ST:76","Scott Parker|CM:82","Michael Carrick|CM:80,CB:76","Paolo Di Canio|ST:87,LW:85,RW:82","Carlos Tevez|ST:83,LW:78,RW:78","Frédéric Kanouté|ST:81,LW:76,RW:76"],
      "10s": ["Łukasz Fabiański|GK:81","Adrián|GK:76","Winston Reid|CB:77","Aaron Cresswell|LB:76,RB:72","Dimitri Payet|CM:86,LW:82,RW:82,ST:80","Mark Noble|CM:79","Manuel Lanzini|CM:79,LW:75,RW:75,ST:73","Marko Arnautović|ST:81,LW:79,RW:76","Andy Carroll|ST:76,LW:71,RW:71"],
      "20s": ["Łukasz Fabiański|GK:80","Alphonse Areola|GK:78","Kurt Zouma|CB:79","Vladimír Coufal|RB:77,LB:73","Declan Rice|CM:87","Lucas Paquetá|CM:83,LW:79,RW:79,ST:77","Tomáš Souček|CM:80","Jarrod Bowen|RW:83,LW:80,ST:80","Mohammed Kudus|RW:81,LW:78,ST:78,CM:77","Michail Antonio|ST:78,LW:73,RW:73"]
    }},
    LEE: { name: "Leeds United", color: "#FFCD00", eras: {
      "90s": ["Nigel Martyn|GK:83","John Lukic|GK:76","Lucas Radebe|CB:81","Gary Kelly|RB:77,LB:73","Gary McAllister|CM:84","Gary Speed|CM:81","Lee Bowyer|CM:80","Tony Yeboah|ST:84,LW:79,RW:79","Jimmy Floyd Hasselbaink|ST:84,LW:79,RW:79","Harry Kewell|LW:82,RW:79,ST:79,CM:78","Tomas Brolin|RW:68,LW:65,ST:65"],
      "00s": ["Nigel Martyn|GK:83","Paul Robinson|GK:78","Rio Ferdinand|CB:87","Jonathan Woodgate|CB:83","Ian Harte|LB:79,RB:75","Lee Bowyer|CM:82","David Batty|CM:79","Mark Viduka|ST:85,LW:80,RW:80","Harry Kewell|LW:84,RW:81,ST:81,CM:80","Alan Smith|ST:79,LW:74,RW:74"],
      "20s": ["Illan Meslier|GK:76","Liam Cooper|CB:75","Pascal Struijk|CB:75","Kalvin Phillips|CM:82","Stuart Dallas|CM:78,LB:76,RB:76,CB:73","Raphinha|RW:84,LW:81,ST:81","Patrick Bamford|ST:79,LW:74,RW:74","Jack Harrison|LW:77,RW:74,ST:74,CM:73"]
    }},
    BLB: { name: "Blackburn", color: "#009EE0", eras: {
      "90s": ["Tim Flowers|GK:83","Colin Hendry|CB:83","Graeme Le Saux|LB:81,LW:78,RB:77,CM:77","Henning Berg|CB:80","Tim Sherwood|CM:80","Jason Wilcox|LW:77,RW:74,ST:74,CM:73","Stuart Ripley|RW:76,LW:73,ST:73,CM:72","Alan Shearer|ST:94,LW:89,RW:89","Chris Sutton|ST:84,LW:79,RW:79"],
      "00s": ["Brad Friedel|GK:84","Ryan Nelsen|CB:79","Christopher Samba|CB:78","Stephen Warnock|LB:76,RB:72","David Bentley|RW:78,LW:75,ST:75,CM:74","Morten Gamst Pedersen|LW:78,RW:75,ST:75,CM:74","Robbie Savage|CM:76","Benni McCarthy|ST:80,LW:75,RW:75","Roque Santa Cruz|ST:80,LW:75,RW:75","Andy Cole|ST:80,LW:75,RW:75"]
    }},
    LEI: { name: "Leicester", color: "#003090", eras: {
      "10s": ["Kasper Schmeichel|GK:84","Harry Maguire|CB:80","Wes Morgan|CB:79","Robert Huth|CB:79","N'Golo Kanté|CM:88","Danny Drinkwater|CM:79","Riyad Mahrez|RW:88,LW:85,ST:85,CM:84","Jamie Vardy|ST:88,LW:83,RW:83"],
      "20s": ["Kasper Schmeichel|GK:82","Wesley Fofana|CB:80","Çağlar Söyüncü|CB:78","Timothy Castagne|RB:78,LB:74","James Maddison|CM:84,LW:80,RW:80,ST:78","Youri Tielemans|CM:83","Wilfred Ndidi|CM:82","Jamie Vardy|ST:84,LW:79,RW:79","Harvey Barnes|LW:80,RW:77,ST:77,CM:76"]
    }}
  }
};
if (typeof module !== "undefined") module.exports = DATA;

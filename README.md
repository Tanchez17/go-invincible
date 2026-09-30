# Go Invincible

**Arsenal went a whole season unbeaten in 2003–04. Can your eleven?**

Go Invincible is a browser game inspired by the viral NBA game [82-0](https://www.82-0.com), rebuilt for the Premier League. Spin a random club and era, sign one player, and repeat until you have a full 4-3-3. Then your team plays a simulated 38-game season. Zero losses makes you Invincible. 38-0-0 is perfection.

## How to play

1. **Spin.** Each spin lands on a club and an era, for example Chelsea 2000–09.
2. **Sign a player** who fits one of your open positions. Players line up in their natural position. If it is taken, many can cover another spot at a lower rating (Salah is 94 at RW, 91 at ST or LW).
3. **Re-spins.** You get two club re-spins and two era re-spins for the whole draft.
4. **Play the season.** After 11 signings your team plays 38 matches against 19 opponents, home and away.

There are two modes. **Classic** shows ratings and stats. **Ball Knowledge** hides them until the season is over.

## How the season is simulated

- **Team strength.** Each player's rating at the position he plays is grouped into goalkeeper, defence, midfield and attack.
  - Attack = 55% forwards + 35% midfield + 10% defence
  - Defence = 50% defenders + 25% goalkeeper + 25% midfield
  - If your weakest player is rated below 80, both values drop, so one weak link costs more than its share of the average.
- **Matches.** Expected goals for each side come from the gap between your attack and the opponent's strength, and between the opponent and your defence. Home advantage and a random match-day form swing are added, and the actual scores are drawn from a Poisson distribution.
- **Difficulty.** The engine is calibrated with simulated drafts. A strong draft goes unbeaten in about 3% of seasons, and a team averaging 90 in about 25%.

## Where the ratings come from

The ratings are a hybrid of hand-set estimates and real Premier League stats.

1. `tools/manual-ratings.js` holds a baseline 1–99 rating per player, club and era, with ratings for secondary positions.
2. `tools/build_ratings.py` matches each player to his real Premier League seasons for that club and era, using Transfermarkt data from [salimt/football-datasets](https://github.com/salimt/football-datasets). 383 of 452 entries are matched.
3. The script computes a stat score per group:
   - **Attackers:** goals and assists per match
   - **Midfielders:** goals and assists per match
   - **Goalkeepers:** clean sheets and goals conceded per match
4. Each score uses the player's best two seasons plus longevity. It is mapped onto the rating scale and blended with the baseline.
5. Some limits apply:
   - Changes are capped at −3 and +4.
   - Midfielders can only move up, because goal stats miss defensive work.
   - Defenders keep their baseline, because the data has little on them.
   - Players the dataset lacks keep their baseline. These are mostly 1990s names such as Shearer, Cantona and Bergkamp.

In Classic mode each player shows his totals for that club and era, for example "183 apps, 112 goals, 59 assists".

## Tech

- **Stack:** plain HTML, CSS and JavaScript. No framework or build step, so it runs straight from GitHub Pages.
- **Data pipeline:** Python with pandas and numpy.

```
index.html              page markup
css/style.css           styles (red and white, Playfair Display + Barlow)
js/data.js              generated player database (clubs, eras, ratings, stats)
js/engine.js            team strength and season simulation
js/app.js               UI: spins, draft, position choice, pitch, results
tools/manual-ratings.js hand-set baseline ratings
tools/build_ratings.py  blends the baseline with real stats and writes js/data.js
```

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Rebuild the ratings

Download two files from [salimt/football-datasets](https://github.com/salimt/football-datasets) into the repo root:

- `datalake/transfermarkt/player_performances/player_performances.csv` (Git LFS, about 160 MB)
- `datalake/transfermarkt/player_profiles/player_profiles.csv`

Both are listed in `.gitignore`. Then run:

```bash
pip install pandas numpy
python3 tools/build_ratings.py --perf player_performances.csv --profiles player_profiles.csv
```

## Ideas for next steps

- A daily challenge where everyone gets the same spins, with a leaderboard
- More clubs and eras
- Formation choice (4-4-2, 3-5-2)
- Chemistry bonuses for players from the same club or era

## Credits

- Game concept inspired by [82-0](https://www.82-0.com) by Roy Saar
- Player stats: Transfermarkt data via [salimt/football-datasets](https://github.com/salimt/football-datasets)
- Not affiliated with the Premier League or any club. Club names are used for identification only, and no logos are used.

Built by Texas Wistam ([@Tanchez17](https://github.com/Tanchez17)).

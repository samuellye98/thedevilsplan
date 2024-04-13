# The Devil's Plan
A series of board games based on the Netflix show. See the [full list of games](https://www.dexerto.com/tv-movies/the-devils-plan-games-explained-2310672/).

WIP:
- Four Players Three in a Row
![Four Players Three in a Row preview](/documentation/preview/four_players_three_in_a_row.gif)

TBD:
- Secret chamber game
- High Low Poker
- Nine Men's Morris

## Running the sample

1. Install dependencies for the server

~~~
cd server && pip3 install -r requirements.txt

OR

cd server && conda env create -f environment.yml
~~~

2. Run the server

~~~
export FLASK_APP=server.py
python3 -m flask run --port=3001
~~~

3. Install dependencies for the client

~~~
yarn
~~~

4. Run the client app

~~~
yarn dev
~~~

5. Go to [http://localhost:3000](http://localhost:3000)